import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getMetrics() {
    const [doctors, patients, prescriptions, statusGroups, dailyGroups] =
      await Promise.all([
        this.prisma.doctor.count(),
        this.prisma.patient.count(),
        this.prisma.prescription.count(),

        this.prisma.prescription.groupBy({
          by: ['status'],
          _count: { id: true },
        }),

        this.prisma.prescription.groupBy({
          by: ['createdAt'],
          _count: { id: true },
          orderBy: { createdAt: 'asc' },
          take: 30,
        }),
      ]);

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
