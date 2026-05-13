import { Module, Global } from '@nestjs/common';
import { AuditService } from './audit.service';
import { PrismaModule } from '../prisma/prisma.module'; // Asegúrate de importar Prisma si el AuditService lo usa

@Global() // Esto lo hace disponible en TODA la app sin importarlo en cada módulo
@Module({
  imports: [PrismaModule],
  providers: [AuditService],
  exports: [AuditService], // Muy importante exportarlo
})
export class AuditModule {}
