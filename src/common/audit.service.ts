import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(
    action: string,
    userId: string,
    userEmail: string,
    details?: string,
  ) {
    await this.prisma.auditLog.create({
      data: { action, userId, userEmail, details },
    });
  }
}
