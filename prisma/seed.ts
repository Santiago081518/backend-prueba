import { PrismaClient, Role, PrescriptionStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);
  const drPassword = await bcrypt.hash('dr123456', 10);
  const patientPassword = await bcrypt.hash('patient123456', 10);

  // 1. Crear Admin
  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password,
      name: 'Admin User',
      role: Role.admin,
    },
  });

  // 2. Crear Médico (User + Perfil Doctor)
  const doctorUser = await prisma.user.upsert({
    where: { email: 'dr@test.com' },
    update: {},
    create: {
      email: 'dr@test.com',
      password: drPassword,
      name: 'Dr. Gregory House',
      role: Role.doctor,
      doctor: {
        create: { specialty: 'Diagnóstico Médico' },
      },
    },
    include: { doctor: true },
  });

  // 3. Crear Paciente (User + Perfil Patient)
  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@test.com' },
    update: {},
    create: {
      email: 'patient@test.com',
      password: patientPassword,
      name: 'John Doe',
      role: Role.patient,
      patient: {
        create: { birthDate: new Date('1990-01-01') },
      },
    },
    include: { patient: true },
  });

  // 4. Crear Prescripciones de ejemplo
  if (doctorUser.doctor && patientUser.patient) {
    await prisma.prescription.create({
      data: {
        code: 'RX-12345',
        status: PrescriptionStatus.pending,
        notes: 'Tomar con abundante agua.',
        authorId: doctorUser.doctor.id, // ID del perfil Doctor, no del User
        patientId: patientUser.patient.id,
        items: {
          create: [
            {
              name: 'Amoxicilina',
              dosage: '500mg',
              quantity: 10,
              instructions: 'Cada 8 horas',
            },
            {
              name: 'Paracetamol',
              dosage: '1g',
              quantity: 5,
              instructions: 'Si hay dolor',
            },
          ],
        },
      },
    });
  }

  console.log(
    '✅ Seed completed: Admin, Doctor, Patient y Prescripción creados.',
  );
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
