# NutriFit

Aplicación web para organizar **entrenamiento** y **nutrición**: rutinas con ejercicios, plan semanal, registro de cargas, comidas con cálculo de macros, comidas ideales por momento del día y catálogo de alimentos (globales y personales).

---

## Tabla de contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos previos](#requisitos-previos)
- [Configuración](#configuración)
- [Cómo ejecutar el proyecto](#cómo-ejecutar-el-proyecto)
- [Modelo de datos y reglas de negocio](#modelo-de-datos-y-reglas-de-negocio)
- [API (resumen)](#api-resumen)
- [Desarrollo](#desarrollo)

---

## Características

### Entrenamiento

| Área | Descripción |
|------|-------------|
| **Rutinas** | Crear, editar y listar rutinas propias; rutinas **globales** incluidas para todos los usuarios. |
| **Ejercicios** | Ejercicios globales y propios; al “eliminar” uno global solo se **oculta** para tu usuario. |
| **Plan semanal** | Asignar rutinas a días de la semana (`/rutinas/semana`). |
| **Registros** | Guardar último peso máximo por ejercicio (`/api/registros/ejercicios`). |

### Nutrición

| Área | Descripción |
|------|-------------|
| **Alimentos** | Macros por 100 g; alimentos **globales** (`usuario_id` nulo) y **propios**. Eliminar uno global lo **oculta** para vos. |
| **Comidas** | Plantillas base: **4 comidas globales** (Desayuno, Almuerzo, Merienda, Cena) más las que crees. Editar una global crea **tu copia** y oculta la plantilla (misma idea que rutinas). |
| **Comidas ideales** | Hasta **4 ideales** por usuario (uno por `tipo_comida` 1–4), solo visibles para el dueño; **sin** plantillas globales ni “ocultar”. |
| **Macros** | Cálculo por cantidad en gramos; totales por comida e ítems. |

### Autenticación

- **Registro:** `POST /api/usuarios`
- **Login:** `POST /api/auth/login` — devuelve datos del usuario y deja el **JWT** en cookie HTTP-only `auth_token`
- **Sesión:** `GET /api/auth/me`
- **Logout:** `POST /api/auth/logout`
- Rutas protegidas en el frontend; Spring Security + filtro JWT según tu `SecurityConfig`.

---

## Arquitectura

```text
┌─────────────────┐     HTTP (JWT)      ┌─────────────────┐
│  React (Vite)   │ ◄─────────────────► │ Spring Boot 4   │
│  React Router   │     localhost:8080    │  REST + JPA     │
└─────────────────┘                       └────────┬────────┘
                                                   │
                                          ┌────────▼────────┐
                                          │   PostgreSQL    │
                                          └─────────────────┘
```

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 19, Vite 8, React Router 7, Axios |
| **Backend** | Java 21, Spring Boot 4.0.x, Spring Data JPA, Spring Security |
| **Auth** | JWT (jjwt) |
| **Base de datos** | PostgreSQL |
| **Build** | Maven (backend), npm (frontend) |

---

## Estructura del repositorio

```text
nutrifit/
├── backend/                 # API Spring Boot
│   ├── src/main/java/com/example/
│   │   ├── alimentos/       # CRUD + visibilidad global/oculto
│   │   ├── comidas/         # Comidas + ComidaOculta + DTOs
│   │   ├── comidas/ideales/ # Comidas ideales solo por usuario
│   │   ├── ejercicios/
│   │   ├── rutinas/         # Rutinas, RutinaOculta, plan semanal
│   │   ├── registros/       # RegistroEjercicio
│   │   ├── usuarios/
│   │   ├── security/        # JWT
│   │   ├── seed/            # Datos globales (rutinas, alimentos, comidas base)
│   │   └── ...
│   └── src/main/resources/application.properties
│
├── frontend/                # SPA React
│   ├── src/
│   │   ├── api/             # Cliente Axios + endpoints
│   │   ├── app/             # Router, rutas protegidas
│   │   ├── auth/
│   │   └── pages/           # Home, rutinas, plan, comidas, ideales, login…
│   └── package.json
│
└── README.md
```

---

## Requisitos previos

- **JDK 21** (según `pom.xml`; versiones superiores suelen funcionar si Maven está alineado).
- **Maven 3.9+**
- **Node.js 20+** y **npm**
- **PostgreSQL** accesible (local o remoto)

---

## Configuración

### Base de datos

Creá una base de datos para el proyecto, por ejemplo:

```sql
CREATE DATABASE nutrifit;
```

### Variables de entorno (backend)

El archivo `backend/src/main/resources/application.properties` espera:

| Variable | Descripción |
|----------|-------------|
| `DB_URL` | JDBC URL, p. ej. `jdbc:postgresql://localhost:5432/nutrifit` |
| `DB_USERNAME` | Usuario PostgreSQL |
| `DB_PASSWORD` | Contraseña |
| `JWT_SECRET` | Secreto suficientemente largo para firmar tokens |

#### Ejemplo (PowerShell, sesión actual)

```powershell
$env:DB_URL = "jdbc:postgresql://localhost:5432/nutrifit"
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "tu_password"
$env:JWT_SECRET = "cambiar-por-un-secreto-largo-y-aleatorio-en-produccion"
```

#### Ejemplo (Linux / macOS)

```bash
export DB_URL=jdbc:postgresql://localhost:5432/nutrifit
export DB_USERNAME=postgres
export DB_PASSWORD=tu_password
export JWT_SECRET=cambiar-por-un-secreto-largo-y-aleatorio-en-produccion
```

> [!NOTE]
> `spring.jpa.hibernate.ddl-auto=update` genera/actualiza tablas al arrancar. En producción conviene usar migraciones (Flyway/Liquibase) y revisar políticas de esquema.

### Frontend

En `frontend/src/api/axiosConfig.js` la **`baseURL`** apunta por defecto a `http://localhost:8080`. Cambiala si el backend corre en otro host o puerto.

---

## Cómo ejecutar el proyecto

### 1. Backend

Desde la carpeta `backend`:

```bash
mvn spring-boot:run
```

La API queda en **`http://localhost:8080`**.

Al iniciar, los *seeders* pueden cargar:

- Usuario sistema **`GLOBAL`** (dueño de rutinas/comidas globales).
- Ejercicios y rutinas de ejemplo.
- Alimentos globales y las **4 comidas base** (Desayuno → Cena).

### 2. Frontend

Desde la carpeta `frontend`:

```bash
npm install
npm run dev
```

Según Vite, la app suele estar en **`http://localhost:5173`**.

### Build de producción (frontend)

```bash
npm run build
npm run preview   # opcional: servir el build localmente
```

---

## Modelo de datos y reglas de negocio

### Usuario `GLOBAL`

Es un usuario interno (nombre `GLOBAL`) que **posee** en base de datos las rutinas y comidas marcadas como “globales”. No sustituye el patrón de ejercicios/alimentos cuyo `usuario_id` es `NULL` (globales por nulidad).

### Tablas de “ocultos”

Cuando un usuario “elimina” un recurso **global** que no debe borrarse del sistema, se inserta una fila de ocultamiento:

| Entidad global | Tabla / concepto |
|----------------|------------------|
| Rutina | `rutinas_ocultas` |
| Ejercicio | `ejercicios_ocultos` |
| Alimento | `alimentos_ocultos` |
| Comida (plantilla) | `comidas_ocultas` |

Las **comidas ideales** no usan este patrón: son siempre del usuario y se borran de forma física.

### Comidas vs comidas ideales

| Concepto | ¿Globales? | Eliminar | Editar global |
|----------|------------|----------|----------------|
| **Comida** | Sí (4 bases) | Global → ocultar; propia → delete | Copia propia + ocultar original |
| **Comida ideal** | No | Delete físico | PUT sobre tu propio registro |

### Tipos de comida (`tipo_comida`)

Valores **1–4**: Desayuno, Almuerzo, Merienda, Cena.

---

## API (resumen)

Prefijo típico: `/api`. La mayoría de rutas requieren autenticación (JWT según configuración del filtro).

<details>
<summary><strong>Autenticación y usuarios</strong></summary>

| Método | Ruta | Uso |
|--------|------|-----|
| `POST` | `/api/usuarios` | Registro |
| `POST` | `/api/auth/login` | Login (cookie `auth_token`) |
| `GET` | `/api/auth/me` | Usuario actual |
| `POST` | `/api/auth/logout` | Cierra sesión (borra cookie) |
| `GET` | `/api/usuarios` | Listado (según permisos del proyecto) |

</details>

<details>
<summary><strong>Rutinas y plan</strong></summary>

- `GET/POST/PUT/DELETE /api/rutinas`
- `GET/POST/DELETE /api/rutina-plan` — asignación por día de semana

</details>

<details>
<summary><strong>Ejercicios</strong></summary>

- `GET/POST/PUT/DELETE /api/ejercicios`

</details>

<details>
<summary><strong>Registros de ejercicio</strong></summary>

- `GET /api/registros/ejercicios`
- `PUT /api/registros/ejercicios/{ejercicioId}`

</details>

<details>
<summary><strong>Alimentos</strong></summary>

- `GET/POST/PUT/DELETE /api/alimentos` — listado filtrado por visibilidad del usuario

</details>

<details>
<summary><strong>Comidas</strong></summary>

- `GET /api/comidas` — globales visibles + propias
- `POST /api/comidas` — crea comida del usuario
- `PUT /api/comidas/{id}` — propia o fork desde global
- `DELETE /api/comidas/{id}`
- `POST /api/comidas/calcular` — macros sin persistir

</details>

<details>
<summary><strong>Comidas ideales</strong></summary>

- `GET/POST/PUT/DELETE /api/comidas-ideales` — solo datos del usuario autenticado

</details>

> Para el contrato exacto (campos JSON), revisá los `*Controller` y los records `*Request` / `*Response` en el paquete `com.example`.

---

## Desarrollo

- **SQL en consola**: `spring.jpa.show-sql=true` en desarrollo puede ayudar; desactivalo o bajá el nivel de log en producción.
- **CORS / cookies**: el cliente Axios usa `withCredentials: true`; si cambiás dominios o el modo de envío del token, revisá `SecurityConfig` y el filtro JWT.
- **Calidad de código**: en frontend, `npm run lint`.

---

## Licencia

Este repositorio es un proyecto personal / educativo. Añadí aquí la licencia que corresponda (por ejemplo MIT, Apache-2.0) si publicás el código como open source.

---

<p align="center">
  <b>NutriFit</b> — entrenamiento y nutrición en un solo lugar.
</p>
