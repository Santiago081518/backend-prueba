# 🏥 Sistema de Gestión de Prescripciones Médicas

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

Backend robusto desarrollado como prueba técnica, enfocado en la **seguridad**, **trazabilidad** y **automatización** de procesos médicos. Permite a médicos emitir prescripciones digitales con validación QR, y a pacientes consultarlas y consumirlas de forma controlada.

---

## ✨ Características Principales

| Característica            | Descripción                                                          |
| ------------------------- | -------------------------------------------------------------------- |
| 🔐 **Autenticación RBAC** | Control de acceso por roles (Admin, Médico, Paciente) mediante JWT   |
| 📄 **PDF con QR**         | Generación dinámica de prescripciones con código QR para validación  |
| 🗂️ **Auditoría**          | Registro automático de acciones críticas para cumplimiento normativo |
| 📊 **Métricas**           | Dashboard de estadísticas en tiempo real para administradores        |
| 🛡️ **Privacidad**         | Validaciones de propiedad de datos por paciente                      |

---

## 🛠️ Stack Tecnológico

- **Framework:** [NestJS](https://nestjs.com/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Base de datos:** PostgreSQL
- **Generación de PDF:** PDFKit
- **Seguridad:** Passport.js · JWT · Helmet · bcrypt

---

## 📂 Estructura del Proyecto

```text
src/
├── admin/          # Métricas y reportes para administradores
├── auth/           # Estrategias JWT y Guards de roles
├── common/         # Auditoría (AuditLog) y utilidades globales
├── prescriptions/  # Lógica central: creación, consumo y PDF
├── prisma/         # Esquemas y seeds de base de datos
└── users/          # Perfiles de médicos y pacientes
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js >= 18
- PostgreSQL en ejecución
- npm

### 1. Clonar e instalar dependencias

```bash
git clone <repo-url>
cd <nombre-del-proyecto>
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB"
JWT_SECRET="cambia_esto_por_un_secreto_seguro_en_produccion"
PORT=3001
```

> ⚠️ Nunca subas el archivo `.env` al repositorio. Asegúrate de que esté en `.gitignore`.

### 3. Migrar y poblar la base de datos

```bash
npx prisma migrate dev
npx prisma db seed
```

### 4. Iniciar en modo desarrollo

```bash
npm run start:dev
```

La API estará disponible en `http://localhost:3001`.

---

## 👥 Usuarios de Prueba (Seed)

| Rol           | Email            | Contraseña    |
| ------------- | ---------------- | ------------- |
| Administrador | admin@test.com   | admin123      |
| Médico        | dr@test.com      | dr123456      |
| Paciente      | patient@test.com | patient123456 |

> ⚠️ Estas credenciales son solo para entorno de desarrollo.

---

## 📡 Endpoints del API

### 🔐 Autenticación

| Método | Endpoint            | Descripción                    | Acceso      |
| ------ | ------------------- | ------------------------------ | ----------- |
| `POST` | `/api/auth/login`   | Login y generación de JWT      | Público     |
| `GET`  | `/api/auth/profile` | Perfil del usuario autenticado | Autenticado |

### 📜 Prescripciones

| Método | Endpoint                              | Descripción                    | Acceso         |
| ------ | ------------------------------------- | ------------------------------ | -------------- |
| `POST` | `/api/prescriptions`                  | Crear nueva prescripción       | Médico         |
| `GET`  | `/api/prescriptions`                  | Listado con paginación         | Admin / Médico |
| `GET`  | `/api/prescriptions/my-prescriptions` | Prescripciones propias         | Paciente       |
| `GET`  | `/api/prescriptions/:id/pdf`          | Descargar PDF con QR           | Restringido    |
| `PUT`  | `/api/prescriptions/:id/consume`      | Marcar prescripción como usada | Paciente       |

### 📊 Administración

| Método | Endpoint             | Descripción                       | Acceso |
| ------ | -------------------- | --------------------------------- | ------ |
| `GET`  | `/api/admin/metrics` | Estadísticas globales del sistema | Admin  |

---

_Desarrollado con ❤️ como prueba técnica — 2026_
