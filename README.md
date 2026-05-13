# 🏥 Sistema de Gestión de Prescripciones Médicas

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

Backend robusto desarrollado como prueba técnica, enfocado en la seguridad, trazabilidad y automatización de procesos médicos.

---

## 🚀 Características Principales

- **Autenticación y Autorización:** Control de acceso basado en roles (**RBAC**) mediante JWT.
- **Generación de PDF con QR:** Creación dinámica de prescripciones con código QR para validación de seguridad.
- **Auditoría Completa:** Registro automático de acciones críticas en la base de datos para cumplimiento normativo.
- **Métricas en Tiempo Real:** Dashboard de estadísticas para el perfil administrador.
- **Seguridad:** Implementación de validaciones de propiedad de datos para garantizar la privacidad del paciente.

## 🛠️ Tecnologías Utilizadas

- **Framework:** [NestJS](https://nestjs.com/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Base de Datos:** PostgreSQL
- **Documentación:** PDFKit
- **Seguridad:** Passport.js, JWT, Helmet, bcrypt

---

## 📂 Estructura del Proyecto

```text
src/
├── admin/          # Métricas y reportes para administradores
├── auth/           # Estrategias JWT y Guards de roles
├── common/         # Auditoría (AuditLog) y utilidades globales
├── prescriptions/  # Lógica central: creación, consumo y PDF
├── prisma/         # Esquemas de base de datos y Seeds
└── users/          # Perfiles de Médicos y Pacientes

🔧 Instalación y Configuración
Clonar el repositorio e instalar dependencias:

Bash
npm install
Configurar Variables de Entorno:
Crea un archivo .env en la raíz con lo siguiente:

Fragmento de código
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB"
JWT_SECRET="tu_secreto_super_seguro"
PORT=3001
Preparar la Base de Datos:

Bash
npx prisma migrate dev
npx prisma db seed
Ejecutar en Desarrollo:

Bash
npm run start:dev


👥 Usuarios de Prueba (Seed)

Rol,Email,Password
Administrador,admin@test.com,admin123
Médico,dr@test.com,dr123456
Paciente,patient@test.com,patient123456

📁 Endpoints del API
🔐 Autenticación
POST /api/auth/login - Login y generación de JWT.

GET /api/auth/profile - Ver información del usuario autenticado.

📜 Prescripciones
POST /api/prescriptions - Crear nueva receta (Médicos).

GET /api/prescriptions/my-prescriptions - Listado personal (Pacientes).

GET /api/prescriptions - Listado con paginación (Admin/Médico).

GET /api/prescriptions/:id/pdf - Descarga de PDF con QR (Acceso Restringido).

PUT /api/prescriptions/:id/consume - Marcar receta como usada (Pacientes).

📊 Administración
GET /api/admin/metrics - Estadísticas y conteos globales del sistema.

Desarrollado con ❤️ para prueba técnica - 2026.
```
