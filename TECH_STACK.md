# Metamorph — Tech Stack & Tooling Architecture

This document catalogs all technologies, frameworks, libraries, runtime environments, and developer tools used across the Metamorph codebase. It is bifurcated by **containers** (infrastructure runtime units) and **components** (logical application modules).

---

## 1. Bifurcation by Containers (Runtime & Infrastructure)

Metamorph runs as a multi-container environment orchestrated via **Docker Compose (`docker-compose.yml`)**.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              Docker Host / Bridge Network                              │
│                                  (metamorph-network)                                   │
│                                                                                        │
│  ┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────────┐  │
│  │    metamorph-web     │    │    metamorph-app     │    │     metamorph-worker     │  │
│  │ (React 18 + Vite TS) │───▶│(REST API & Migration)│    │  (Async & Cron Worker)   │  │
│  │ Port: 3000 (exposed) │    │ Port: 8080 (exposed) │    │   No exposed web ports   │  │
│  └──────────────────────┘    └──────────┬───────────┘    └─────────────┬────────────┘  │
│                                         │                              │               │
│                                         │    ┌─────────────────────┐   │               │
│                                         └───▶│   metamorph-mysql   │◀──┘               │
│                                              │     (MySQL 8.4)     │                   │
│                                              │  Port: 3306 (host)  │                   │
│                                              │ Volume: mysql_data  │                   │
│                                              └─────────────────────┘                   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.1 `metamorph-web` (Frontend Web Client Container)
- **Role**: Client-facing Single Page Application (SPA) providing dashboard, user interface, authentication flows, and real-time system monitoring.
- **Base Image**:
  - *Build stage*: `node:20-alpine` (Node.js LTS runtime for npm install & Vite build)
  - *Runtime stage*: `nginx:alpine` (Ultra-lightweight web server serving static assets)
- **Exposed Ports**: `3000` (mapped to host `${WEB_PORT:-3000}`)
- **Reverse Proxy**: Nginx proxies `/api/` directly to `http://app:8080/api/` inside the Docker bridge network to streamline CORS.
- **Key Container Responsibilities**:
  - Serves compiled React 18 production bundle with gzip compression.
  - Handles client-side SPA routing (`try_files $uri $uri/ /index.html`).
  - Seamlessly bridges API requests to the `app` container.

### 1.2 `metamorph-app` (API Server Container)
- **Role**: Primary HTTP REST API server handling user registration, authentication, token lifecycle, business workflows, and executing database migrations on boot.
- **Base Image**:
  - *Build stage*: `eclipse-temurin:25-jdk-noble` (Ubuntu Noble with OpenJDK 25)
  - *Runtime stage*: `eclipse-temurin:25-jre-noble` (Distroless/lightweight JRE 25)
- **Container User**: Non-root `spring:spring`
- **Exposed Ports**: `8080` (mapped to host `${PORT:-8080}`)
- **Launcher**: Spring Boot `PropertiesLauncher` (`-Dloader.main=com.example.metamorph.AppApplication`, `-Dspring.profiles.active=app`)
- **Key Container Responsibilities**:
  - Listens for client HTTP traffic.
  - Controls Flyway schema migration execution (`spring.flyway.enabled=true`).
  - Issues and rotates JWT access and refresh tokens.

### 1.3 `metamorph-worker` (Background Worker Container)
- **Role**: Headless background task worker and scheduled cron job processor.
- **Base Image**:
  - *Build stage*: `eclipse-temurin:25-jdk-noble`
  - *Runtime stage*: `eclipse-temurin:25-jre-noble`
- **Container User**: Non-root `spring:spring`
- **Exposed Ports**: None (headless background daemon)
- **Launcher**: Spring Boot `PropertiesLauncher` (`-Dloader.main=com.example.metamorph.WorkerApplication`, `-Dspring.profiles.active=worker`)
- **Key Container Responsibilities**:
  - Executes scheduled tasks (e.g. `RefreshTokenCleanupCron`).
  - Does not execute schema migrations (`spring.flyway.enabled=false`).
  - Prepared for asynchronous queue workers (e.g. AWS SQS / message queues).

### 1.4 `metamorph-mysql` (Database Container)
- **Image**: `mysql:8.4` (MySQL Innovation / LTS 8.4 Server)
- **Ports**: `3306:3306`
- **Storage Volume**: Named Docker volume `mysql_data` mapped to `/var/lib/mysql`
- **Healthcheck**: `mysqladmin ping -h localhost -u root -p${MYSQL_ROOT_PASSWORD}` (10s interval, 5 retries)
- **Network**: `metamorph-network` (bridge network)

---

## 2. Bifurcation by Application Components (Codebase Modules)

Metamorph is engineered as a unified JAR with domain separation into `app`, `worker`, and `common` packages:

```
com.example.metamorph
├── AppApplication.java         # API entrypoint (scans com.example.metamorph.common, app)
├── WorkerApplication.java      # Worker entrypoint (scans com.example.metamorph.common, worker)
├── MetamorphApplication.java   # Root Spring Boot application class
├── app/                        # REST Controllers, Security, JWT & Auth services
├── worker/                     # Schedulers, Cron jobs & Background processing
└── common/                     # JPA Entities, Repositories, Domain models & Shared services
```

### 2.1 Web Frontend Component (`web/`)
Client-side Single Page Application (SPA) providing an interactive user interface, real-time metrics, auth management, and job tracking.

| Subsystem / Tool | Library / Technology | Version | Purpose & Details |
|---|---|---|---|
| **UI Library** | React (`react`, `react-dom`) | 18.3.1 | Component-based interactive UI with state management and strict mode. |
| **Component System** | shadcn/ui & Radix UI primitives | Latest | Accessible, headless primitives styled with Tailwind CSS tokens and CVA. |
| **Styling Framework** | Tailwind CSS (`tailwindcss`, `postcss`, `autoprefixer`) | 3.4.17 | Utility-first CSS framework with HSL design tokens, responsive breakpoints, and dark mode. |
| **Iconography** | Lucide React (`lucide-react`) | 1.x | Clean, consistent SVG icon set across all dashboard widgets. |
| **Build & Dev Tool** | Vite (`@vitejs/plugin-react`) | 6.0.7 | Next-generation frontend tooling with instant HMR and Rollup production bundling. |
| **Language** | TypeScript | 5.6.2 | Strongly typed JavaScript with strict type-checking across components and DTOs. |
| **Web Server / Proxy** | Nginx Alpine | 1.27.x (Alpine) | Production web server delivering gzip-compressed assets and dynamic `/api/` reverse proxy. |

### 2.2 API Component (`com.example.metamorph.app`)
Responsible for incoming HTTP client interactions, authentication protocols, and route security.

| Subsystem / Tool | Library / Technology | Version | Purpose & Details |
|---|---|---|---|
| **Web Framework** | `spring-boot-starter-webmvc` | 4.1.1 | Spring MVC for REST controllers, dispatching, and HTTP serialization. |
| **Security Framework** | `spring-boot-starter-security` | 4.1.1 | Role-based authorization, request filtering, and CORS configuration. |
| **Token Engine (JWT)** | `io.jsonwebtoken:jjwt-api`<br>`io.jsonwebtoken:jjwt-impl`<br>`io.jsonwebtoken:jjwt-jackson` | 0.13.0 | HMAC-SHA signing/verification for stateless access & refresh tokens. |
| **Input Validation** | `spring-boot-starter-validation` | 4.1.1 | Jakarta Bean Validation (`@Valid`, `@NotBlank`, `@Email`, `@Size`). |
| **Password Encryption**| Spring Security `BCryptPasswordEncoder` | — | Secure salted hashing (strength 12) for user passwords. |
| **Database Migrations**| `org.flywaydb:flyway-mysql`<br>`spring-boot-starter-flyway` | 4.1.1 | Manages versioned database schema DDL migrations (`V1`–`V5`). |
| **Token Rotation Logic**| Custom `AuthService` & `JwtAuthFilter` | — | Strict SameSite HTTP-only cookies, SHA-256 token hashing, token family reuse detection. |

### 2.3 Worker Component (`com.example.metamorph.worker`)
Responsible for offline background computation, scheduled maintenance, and eventual queue consumers.

| Subsystem / Tool | Library / Technology | Version | Purpose & Details |
|---|---|---|---|
| **Task Scheduling** | Spring Scheduling (`@EnableScheduling`) | 4.1.1 | In-memory cron and fixed-rate task execution without external scheduler overhead. |
| **Token Purge Cron** | `RefreshTokenCleanupCron` | — | Automatically purges expired refresh tokens from MySQL on a schedule. |
| **Timezone Tracking**| `java.time.ZoneId` (`Asia/Kolkata`) | Java 25 | Standardized IST timestamp logging for auditability and cron reports. |
| **Planned Queue Worker**| Message Queue Consumer (SQS / AMQP) | — | Architectural placeholder to consume asynchronous background conversion jobs. |

### 2.4 Common / Shared Component (`com.example.metamorph.common`)
Shared domain layer consumed by both `app` and `worker` to avoid duplicate business logic.

| Subsystem / Tool | Library / Technology | Version | Purpose & Details |
|---|---|---|---|
| **ORM / Data Access** | `spring-boot-starter-data-jpa`<br>(Hibernate Core) | 4.1.1 | Entity mapping, lifecycle management, and dynamic repository queries. |
| **Database Driver** | `com.mysql:mysql-connector-j` | 9.x (runtime) | Official Type-4 JDBC driver for MySQL connections. |
| **Connection Pooling**| HikariCP (Spring Boot default) | Default | High-performance JDBC connection pooling. |
| **State Machine** | `JobService` & `JobStatus` | — | Validates legal job state transitions (`PENDING` ➔ `PROCESSING` ➔ `COMPLETED` / `FAILED`). |
| **Domain Entities** | JPA / Jakarta Persistence | — | `User`, `Role`, `RefreshToken`, `Job`, `JobStatus`. |
| **Exception Handling**| `AppException`, `ResourceNotFoundException`, etc. | — | Standardized centralized domain exception definitions. |

---

## 3. Core Platforms, Languages & Build Tools

| Tool / Technology | Version | Description & Usage |
|---|---|---|
| **Java Development Kit** | **Java 25** (OpenJDK / Eclipse Temurin) | Primary backend programming language leveraging modern LTS features. |
| **Spring Boot** | **4.1.1** | Core application framework providing inversion of control and dependency injection. |
| **Node.js** | **20 LTS** (Alpine) | Build-time runtime for frontend dependencies and Vite compilation. |
| **React** | **18.3.1** | Frontend component and declarative state management library. |
| **Vite** | **6.0.7** | High-performance frontend bundler with dev server and Rollup packaging. |
| **TypeScript** | **5.6.2** | Frontend static typing and compile-time correctness checking. |
| **Nginx** | **1.27.x** (Alpine) | Production HTTP server serving SPA assets and proxying `/api/` traffic. |
| **Build Automation** | **Apache Maven** (`mvnw` wrapper included) | Backend dependency management, multi-stage compilation, and packaging. |
| **Boilerplate Reducer** | **Project Lombok** (1.18.x) | Compile-time bytecode generator for getters, setters, builders, and constructors. |
| **JSON Serialization** | **Jackson (FasterXML)** | JSON parser & serializer integrated into Spring Web MVC and JJWT. |
| **Container Engine** | **Docker & Docker Compose** (Compose v2) | Multi-stage image builds and local/production multi-service orchestration. |
| **API Client & Testing** | **Postman** (`metamorph-jwt-auth.postman_collection.json`) | Complete pre-configured Postman collection for registration, login, token refresh, and logout tests. |
| **Unit & Integration Tests**| `spring-boot-starter-test`<br>`spring-boot-starter-security-test`<br>JUnit 5, AssertJ, Mockito | Test automation harness for context loading, controllers, and domain services. |

---

## 4. Configuration Profiles Matrix

| Property / Feature | Shared (`application.properties`) | App Profile (`application-app.properties`) | Worker Profile (`application-worker.properties`) | Web Container (`docker-compose.yml`) |
|---|---|---|---|---|
| **Active Port** | — | `8080` (`${PORT}`) | None (headless) | `3000` (`${WEB_PORT}`) |
| **Flyway Migrations** | Disabled | `enabled=true`, `baseline-on-migrate=true` | `enabled=false` | Not applicable |
| **Database Connection**| MySQL JDBC (Host `${DB_HOST:localhost}`, Port `3306`) | Inherited from shared | Inherited from shared | Not applicable |
| **DDL Auto** | `validate` (Hibernate validates against Flyway) | Inherited from shared | Inherited from shared | Not applicable |
| **JWT Secrets** | — | Access & Refresh secrets, expiration windows | Not applicable | Not applicable |
| **CORS / Cookies** | — | Client URL origin (`${CLIENT_URL}`) and `SameSite`/Secure cookie policies | Not applicable | Direct same-origin `/api/` proxy via Nginx |

---

## 5. Maintenance & Updating This Document

Whenever a new dependency, library, container, or infrastructure component is introduced to the Metamorph project:
1. Update `pom.xml`, `package.json`, or `docker-compose.yml`.
2. Add the component to this `TECH_STACK.md` file under the respective **Container** or **Component** section.
3. Keep versions and purposes aligned with current production configurations.

