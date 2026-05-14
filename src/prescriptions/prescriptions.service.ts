import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { AuditService } from '../common/audit.service';

import { CreatePrescriptionDto } from './dto/create-prescription.dto';

import PDFDocument from 'pdfkit';

import * as QRCode from 'qrcode';

@Injectable()
export class PrescriptionsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(dto: CreatePrescriptionDto, userId: string) {
    const doctorProfile = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctorProfile) {
      throw new Error('El usuario no tiene un perfil de médico asociado.');
    }

    return this.prisma.prescription.create({
      data: {
        code: `PRE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        notes: dto.notes,
        patientId: dto.patientId,
        authorId: doctorProfile.id,
        items: {
          create: dto.items,
        },
      },
      include: {
        items: true,
        patient: true,
        author: true,
      },
    });
  }

  async findAll(query: { skip?: number; take?: number; status?: string }) {
    const { skip, take, status } = query;

    return this.prisma.prescription.findMany({
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 10,
      where: status ? { status: status as any } : {},
      include: {
        items: true,
        patient: { include: { user: true } },
        author: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        items: true,
        patient: { include: { user: true } },
        author: { include: { user: true } },
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescripción no encontrada');
    }

    return prescription;
  }

  async findByPatient(userId: string) {
    return this.prisma.prescription.findMany({
      where: {
        patient: {
          userId: userId,
        },
      },
      include: {
        items: true,
        author: {
          select: {
            specialty: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async generatePDF(
    id: string,
    userId: string,
    role: string,
    userEmail: string,
  ): Promise<Buffer> {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        items: true,
        patient: { include: { user: true } },
        author: { include: { user: true } },
      },
    });

    if (!prescription)
      throw new NotFoundException('Prescripción no encontrada');
    if (role === 'patient' && prescription.patient.userId !== userId) {
      throw new ForbiddenException('No tienes permiso');
    }

    const frontendUrl = 'https://frontend-prueba-taupe.vercel.app';
    const qrData = `${frontendUrl}/verify/${prescription.id}`;

    // Generamos el QR con un poco más de calidad para que sea fácil de escanear
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      margin: 2,
      scale: 4,
      color: {
        dark: '#004a99', // Color azul oscuro para que haga juego con el PDF
        light: '#ffffff',
      },
    });

    await this.auditService.log(
      'DOWNLOAD_PDF',
      userId,
      userEmail,
      `Receta ID: ${id}`,
    );

    return new Promise((resolve) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(20).text('PRESCRIPCIÓN MÉDICA', { align: 'center' });

      doc.image(qrCodeDataUrl, 430, 20, { width: 100 });

      doc.moveDown();
      doc
        .fontSize(10)
        .text(`Código Único: ${prescription.code}`, { align: 'left' });
      doc.text(`Fecha: ${prescription.createdAt.toLocaleDateString()}`);
      doc.moveDown();

      doc.fontSize(12).text(`Médico: ${prescription.author.user.name}`);
      doc.text(`Especialidad: ${prescription.author.specialty || 'General'}`);
      doc.moveDown(0.5);
      doc.text(`Paciente: ${prescription.patient.user.name}`);
      doc.moveDown();

      doc.rect(50, doc.y, 500, 2).fill('#004a99');
      doc.moveDown();

      doc
        .fillColor('#000')
        .fontSize(14)
        .text('Medicamentos e Instrucciones:', { underline: true });
      doc.moveDown();

      prescription.items.forEach((item, index) => {
        doc
          .fontSize(12)
          .text(`${index + 1}. ${item.name} (${item.quantity} unidades)`);
        doc.fontSize(10).text(`   Dosis: ${item.dosage}`);
        doc.text(`   Instrucciones: ${item.instructions}`);
        doc.moveDown(0.5);
      });

      doc
        .fontSize(8)
        .fillColor('#777')
        .text(
          'Esta es una receta digital válida. El código QR superior permite la validación en sistema.',
          50,
          700,
          { align: 'center' },
        );

      doc.end();
    });
  }

  async consume(id: string, userId: string) {
    const prescription = await this.prisma.prescription.findFirst({
      where: {
        id,
        patient: { userId },
      },
      include: {
        patient: {
          include: { user: true },
        },
      },
    });

    if (!prescription || !prescription.patient.user) {
      throw new NotFoundException('Prescripción o usuario no encontrado');
    }

    const userEmail = prescription.patient.user.email;

    await this.auditService.log(
      'MARK_AS_CONSUMED',
      userId,
      userEmail,
      `Receta ID: ${id} marcada como consumida`,
    );

    return this.prisma.prescription.update({
      where: { id },
      data: {
        status: 'consumed',
        consumedAt: new Date(),
      },
    });
  }
}
