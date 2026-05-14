import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  Param,
  UseGuards,
  Put,
  Query,
  NotFoundException,
} from '@nestjs/common';

import type { Response } from 'express';

import { PrescriptionsService } from './prescriptions.service';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

import { RolesGuard } from '../common/guards/roles.guard';

import { Roles } from '../common/decorators/roles.decorator';

import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescriptionsController {
  constructor(
    private prescriptionsService: PrescriptionsService,
    private prisma: PrismaService,
  ) {}

  @Public()
  @Get('public/verify/:id')
  async publicVerify(@Param('id') id: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        items: true,
        patient: { include: { user: { select: { name: true } } } },
        author: { include: { user: { select: { name: true } } } },
      },
    });
    if (!prescription) throw new NotFoundException();
    return prescription;
  }

  @Post()
  @Roles('doctor', 'admin')
  create(@Body() dto: CreatePrescriptionDto, @Req() req: any) {
    return this.prescriptionsService.create(dto, req.user.sub);
  }

  @Get('my-prescriptions')
  @Roles('patient')
  async getMyPrescriptions(@Req() req: any) {
    return this.prescriptionsService.findByPatient(req.user.sub);
  }

  @Get()
  @Roles('doctor', 'admin')
  findAll(@Query() query: { skip?: number; take?: number; status?: string }) {
    return this.prescriptionsService.findAll(query);
  }

  @Get(':id')
  @Roles('doctor', 'admin')
  findOne(@Param('id') id: string) {
    return this.prescriptionsService.findOne(id);
  }

  @Get(':id/pdf')
  @Roles('doctor', 'patient', 'admin')
  async downloadPDF(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: any,
  ) {
    const buffer = await this.prescriptionsService.generatePDF(
      id,
      req.user.sub,
      req.user.role,
      req.user.email,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=prescripcion-${id}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Put(':id/consume')
  @Roles('patient')
  async consume(@Param('id') id: string, @Req() req: any) {
    return this.prescriptionsService.consume(id, req.user.sub);
  }
}
