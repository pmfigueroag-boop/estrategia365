# Variables de Entorno - Estrategia 365

Este documento detalla todas las variables de entorno necesarias para ejecutar el sistema en diferentes ambientes (Local, Pruebas y GCP Producción).

## 1. Backend (FastAPI)

| Variable | Descripción | Valor Local (Dummy) | Valor Producción (GCP) |
| :--- | :--- | :--- | :--- |
| `ENVIRONMENT` | Entorno de ejecución (`dev`, `staging`, `prod`) | `dev` | `prod` |
| `DEV_MODE` | Desactiva Autenticación (¡Peligro!) | `true` | `false` |
| `JWT_SECRET_KEY` | Llave simétrica para firmar Tokens JWT | `secret-dummy-key-12345` | *(Inyectado vía Secret Manager)* |
| `DATABASE_URL` | Cadena de conexión PostgreSQL (SQLAlchemy) | `postgresql://postgres:admin@localhost/estrategia365` | `postgresql+psycopg2://...` *(Inyectado vía Secret Manager y UNIX socket)* |
| `REDIS_URL` | Conexión al caché / Rate Limit | `redis://localhost:6379` | `redis://10.x.x.x:6379` |
| `GCS_DOCUMENTS_BUCKET`| Bucket privado para documentos de usuarios | *(Vacío en local o emulador)* | `[PROJECT_ID]-documents-prod` |
| `GCS_ASSETS_BUCKET` | Bucket público para assets estáticos | *(Vacío en local o emulador)* | `[PROJECT_ID]-assets-prod` |
| `DOCTRINAL_GATE_MODE`| Rigidez de las reglas de negocio DDD | `RELAXED` | `STRICT` |
| `LOG_LEVEL` | Nivel de registro de eventos | `DEBUG` | `INFO` |

## 2. Frontend (Next.js)

| Variable | Descripción | Valor Local (Dummy) | Valor Producción (GCP) |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | URL base del Backend API | `http://localhost:8000/v1` | `https://estrategia365-backend-[hash]-uc.a.run.app/v1` |
| `NEXT_PUBLIC_APP_ENV` | Entorno visible para el usuario | `development` | `production` |

---

> [!WARNING]
> **Nunca incluyas `JWT_SECRET_KEY` o contraseñas de Base de Datos en el código fuente.** 
> En producción, estas variables deben configurarse exclusivamente usando **Google Secret Manager** e inyectarse en tiempo de ejecución en Cloud Run. Terraform se encarga de esto en el módulo `security`.
