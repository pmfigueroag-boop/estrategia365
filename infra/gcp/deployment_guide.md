# Guía de Despliegue en GCP - Estrategia 365

Esta guía detalla los pasos para desplegar la infraestructura base (vía Terraform) y configurar el pipeline de CI/CD para la plataforma Estrategia 365.

## Requisitos Previos

1. Instalar [Terraform](https://developer.hashicorp.com/terraform/downloads) (>= 1.5.0)
2. Instalar [Google Cloud CLI (`gcloud`)](https://cloud.google.com/sdk/docs/install)
3. Tener una cuenta en GCP con permisos de `Owner` (Propietario) sobre el proyecto de destino.
4. El proyecto GCP debe tener la facturación (Billing) activada.

## 1. Inicializar GCP y Autenticación

Autentícate en Google Cloud y configura tu proyecto por defecto:

```bash
gcloud auth login
gcloud auth application-default login
gcloud config set project [TU_PROJECT_ID]
```

Habilita las APIs principales requeridas por el sistema:

```bash
gcloud services enable \
  compute.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  redis.googleapis.com \
  vpcaccess.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com
```

## 2. Aprovisionar Infraestructura (Terraform)

Navega a la carpeta de Terraform:

```bash
cd infra/gcp
```

Crea un archivo llamado `terraform.tfvars` para definir tus secretos y variables (este archivo NO debe subirse al repositorio Git):

```hcl
project_id     = "tu-project-id"
region         = "us-central1"
environment    = "prod"
db_password    = "SuperSecretPassword123!"
jwt_secret_key = "OtraLlaveSecretaMuyLargaYSegura"
```

Inicializa Terraform:

```bash
terraform init
```

Revisa los cambios que se van a aplicar (Dry-Run):

```bash
terraform plan
```

Aplica los cambios (Aprovisionamiento):

```bash
terraform apply
```

> **Nota:** La creación de la base de datos de Cloud SQL y el clúster de Redis puede tomar alrededor de 15 a 20 minutos. El primer despliegue fallará en levantar Cloud Run porque los contenedores Docker no existen aún. Esto es normal. El despliegue real de la app ocurre en Cloud Build.

## 3. Configurar CI/CD (Cloud Build)

### Artifact Registry
Terraform asume que existe un repositorio Docker. Créalo manualmente si no lo hiciste en Terraform:
```bash
gcloud artifacts repositories create estrategia365 \
    --repository-format=docker \
    --location=us-central1
```

### Ejecutar Pipeline
En la raíz del proyecto, ejecuta Cloud Build usando el archivo `cloudbuild.yaml` que generamos:

```bash
gcloud builds submit --config cloudbuild.yaml .
```

Cloud Build se encargará de:
1. Validar / Testear el código.
2. Construir la imagen de Docker del Frontend y del Backend.
3. Subir las imágenes a Artifact Registry.
4. Desplegar los servicios en Cloud Run automáticamente.

## 4. Validar el Sistema y Observabilidad

### Verificar Logs
Los logs estructurados se envían automáticamente a **Cloud Logging**. Puedes buscarlos en la consola de GCP:
- Ir a: **Logging > Explorador de Registros**.
- Filtrar por: `resource.type="cloud_run_revision"` y `resource.labels.service_name="estrategia365-backend-prod"`.

### Verificar Trazas
- Ir a: **Trace > Descripción general**.
- Observa la latencia entre peticiones del router a la base de datos (S2S latency).

### Base de Datos (Cloud SQL)
Debido a que Cloud SQL está en una red privada, la forma recomendada de conectarse para depuración es usar el **Cloud SQL Auth Proxy** o lanzar un contenedor de utilidad dentro de la VPC.

## 5. Rollback y Versiones

Cloud Run mantiene un historial inmutable de las versiones (Revisiones). Si un despliegue falla en producción:
1. Ir a **Cloud Run** en la Consola de GCP.
2. Seleccionar el servicio (ej. `estrategia365-backend-prod`).
3. Ir a la pestaña **Revisiones**.
4. Seleccionar la revisión anterior estable.
5. Clic en **Administrar tráfico** y enrutar el 100% del tráfico a esa revisión.

Esto garantiza un *rollback* en menos de 10 segundos.
