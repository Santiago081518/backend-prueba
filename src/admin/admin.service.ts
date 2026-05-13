import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getMetrics() {
    // Ejecutamos varias consultas en paralelo para optimizar rendimiento
    const [doctors, patients, prescriptions, statusGroups, dailyGroups] =
      await Promise.all([
        this.prisma.doctor.count(), // Total de médicos [cite: 204]
        this.prisma.patient.count(), // Total de pacientes [cite: 204]
        this.prisma.prescription.count(), // Total de prescripciones [cite: 204]

        // Conteo agrupado por estado (pending/consumed) [cite: 208]
        this.prisma.prescription.groupBy({
          by: ['status'],
          _count: { id: true },
        }),

        // Conteo agrupado por fecha de creación (para la serie por día) [cite: 209]
        this.prisma.prescription.groupBy({
          by: ['createdAt'],
          _count: { id: true },
          orderBy: { createdAt: 'asc' },
          take: 30, // Últimos 30 días como sugiere el PDF [cite: 232]
        }),
      ]);

    // Formateamos la respuesta según el contrato del PDF [cite: 203, 208, 209]
    return {
      totals: {
        doctors,
        patients,
        prescriptions,
      },
      byStatus: {
        pending:
          statusGroups.find((g) => g.status === 'pending')?._count.id || 0,
        consumed:
          statusGroups.find((g) => g.status === 'consumed')?._count.id || 0,
      },
      byDay: dailyGroups.map((group) => ({
        date: group.createdAt.toISOString().split('T')[0],
        count: group._count.id,
      })),
    };
  }
}
