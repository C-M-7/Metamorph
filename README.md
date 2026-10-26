# Metamorph

Metamorph is a modular backend service built with **Spring Boot 4.1.1** on **Java 25**, backed by **MySQL 8.4** and **Flyway** for database migrations.

The project is deployed across isolated containers orchestrated via Docker Compose:
- **Frontend Web Client (`web`)**: Single Page Application built with React 18, Vite, and TypeScript, served on port 3000.
- **API Server (`app`)**: Exposes REST endpoints on port 8080, handles user authentication, JWT management, and executes Flyway migrations.
- **Background Worker (`worker`)**: Runs background tasks and scheduled cron jobs (e.g., token cleanup) without exposing web ports.
- **Database (`mysql`)**: MySQL 8.4 database service with healthchecks and persistent storage.

> For an in-depth breakdown of all technologies, libraries, and frameworks bifurcated by containers and components, see [TECH_STACK.md](TECH_STACK.md).

---

## Architecture Overview

```
                      ┌──────────────────────┐
                      │    metamorph-web     │
                      │(React 18 + Vite + TS)│
                      │     Port: :3000      │
                      └──────────┬───────────┘
                                 │ HTTP / API Proxy
                                 ▼
                      ┌──────────────────────┐
                      │    metamorph-app     │
                      │ (AppApplication.java)│
                      │  Profile: 'app'      │
                      │     Port: :8080      │
                      └──────────┬───────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         │                                               │
         ▼                                               ▼
┌──────────────────┐                           ┌──────────────────┐
│ metamorph-mysql  │◀──────────────────────────│ metamorph-worker │
│   (MySQL 8.4)    │                           │(WorkerApplication│
│   Port: :3306    │                           │ Profile: 'worker'│
└──────────────────┘                           └──────────────────┘
```

### Module Structure
```
metamorph/
├── web/                            # Frontend Web Application (React 18 + Vite + TypeScript)
│   ├── Dockerfile                  # Multi-stage Docker build (Node.js -> Nginx)
│   ├── nginx.conf                  # Nginx configuration (port 3000, SPA routing, API proxy)
│   ├── src/                        # React components, styles, and TypeScript logic
│   └── package.json                # Frontend dependencies and Vite scripts
└── src/main/java/com/example/metamorph/  # Backend Services (Spring Boot & Java 25)
    ├── AppApplication.java         # Entrypoint for REST API container (scans common, app)
    ├── WorkerApplication.java      # Entrypoint for Worker container (scans common, worker)
    ├── MetamorphApplication.java   # Default application entrypoint
    ├── app/                        # REST API, Security & Controllers
    │   ├── controller/             # AuthController (/api/auth)
    │   ├── dto/                    # AuthRequest, AuthResponse
    │   ├── security/               # JwtService, JwtAuthFilter, SecurityConfig, UserDetailsService
    │   └── service/                # AuthService (registration, login, refresh, logout)
    ├── common/                     # Shared models, repositories, and business logic
    │   ├── entity/                 # User, Role, RefreshToken, Job, JobStatus
    │   ├── repository/             # UserRepository, RefreshTokenRepository, JobRepository
    │   └── service/                # JobService (status transition validation)
    └── worker/                     # Scheduled jobs & worker infrastructure
        ├── config/                 # SchedulerConfig (@EnableScheduling)
        └── cron/                   # RefreshTokenCleanupCron (automated token purger)
```

---

## Current Features & Status

### 1. Authentication & Security
- **Stateless JWT**: Access tokens (sent in response body) with short expiration.
- **Refresh Token Rotation**: Refresh tokens stored in HTTP-only, SameSite=Strict cookies.
- **Token Families & Reuse Detection**: Refresh tokens are stored as SHA-256 hashes with UUID family tracking. If a revoked token is reused, the entire token family is immediately invalidated to prevent session hijacking.
- **BCrypt Password Hashing**: Passwords hashed with BCrypt (strength 12).
- **Role-Based Access Control**: `USER` and `ADMIN` role support configured via Spring Security.

### 2. Scheduled Worker
- **Expired Token Cleanup**: Cron job (`RefreshTokenCleanupCron`) periodically purges expired refresh tokens from the database and logs execution with Indian Standard Time (IST) timestamps.

### 3. Asynchronous Job Processing (In Progress)
- Database schema and entity models for `Job` (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`) tracking input/output S3 keys.
- State machine transition validation implemented in `JobService`.

### 4. Database Migrations (Flyway)
Managed automatically by the `app` container on startup:
- `V1__create_test_connection_table.sql`: Initial connection test schema.
- `V2__create_users_table.sql`: Users table (`email`, `password_hash`).
- `V3__create_jobs_table.sql`: Jobs table for processing workflows.
- `V4__create_refresh_tokens_table.sql`: Refresh token management with token hashes, families, and expiry.
- `V5__add_role_to_users_table.sql`: Role column on users table.

---

## Getting Started with Docker Compose

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Docker Compose v2+)

### 1. Environment Configuration
Create your `.env` file from the example template:
```bash
cp .env.example .env
```

Ensure you set strong base64-encoded secrets for JWT:
```env
PORT=8080
DB_HOST=mysql
MYSQL_PORT=3306
MYSQL_DATABASE=metamorph_db
MYSQL_USER=metamorph_user
MYSQL_PASSWORD=metamorph_password
MYSQL_ROOT_PASSWORD=root

JWT_ACCESS_SECRET=your_jwt_access_secret_key_base64
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_base64
JWT_ACCESS_EXPIRY_MS=900000        # 15 minutes
JWT_REFRESH_EXPIRY_MS=604800000    # 7 days

CLIENT_URL=http://localhost:3000
COOKIE_SECURE=false
```

### 2. Run the Services
Start MySQL, the API application, and the background worker:
```bash
docker compose up --build
```
Or in detached (background) mode:
```bash
docker compose up -d --build
```

### 3. Service Endpoints
- **Web Frontend**: `http://localhost:3000`
- **API Server**: `http://localhost:8080`
- **MySQL Database**: `localhost:3306` (`metamorph_db`)

### 4. Stopping Services
```bash
docker compose down
```
To also remove persistent database volumes:
```bash
docker compose down -v
```

---

## Local Development (Without Docker for Spring Boot)

To run MySQL in Docker while running the Spring Boot services locally:

1. **Start only MySQL**:
   ```bash
   docker compose up -d mysql
   ```

2. **Run the API Application**:
   ```bash
   # Windows PowerShell
   .\mvnw.cmd spring-boot:run -Dspring-boot.run.main-class=com.example.metamorph.AppApplication -Dspring-boot.run.profiles=app

   # Linux / macOS
   ./mvnw spring-boot:run -Dspring-boot.run.main-class=com.example.metamorph.AppApplication -Dspring-boot.run.profiles=app
   ```

3. **Run the Worker Application** (in a separate terminal):
   ```bash
   # Windows PowerShell
   .\mvnw.cmd spring-boot:run -Dspring-boot.run.main-class=com.example.metamorph.WorkerApplication -Dspring-boot.run.profiles=worker

   # Linux / macOS
   ./mvnw spring-boot:run -Dspring-boot.run.main-class=com.example.metamorph.WorkerApplication -Dspring-boot.run.profiles=worker
   ```

---

## API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user (`email`, `password`) | No |
| `POST` | `/api/auth/login` | Authenticate user; returns access token and sets refresh cookie | No |
| `POST` | `/api/auth/refresh` | Rotate refresh token cookie and receive new access token | No (Cookie) |
| `POST` | `/api/auth/logout` | Revoke token family and clear refresh cookie | No (Cookie) |

---

## Database & Migrations

Flyway runs automatically when the `app` container starts.

### Inspecting Database
Connect to the running container:
```bash
docker exec -it metamorph-mysql mysql -u metamorph_user -pmetamorph_password -D metamorph_db
```

Useful SQL commands:
```sql
-- View migration history
SELECT * FROM flyway_schema_history;

-- View registered users
SELECT id, email, role, created_at FROM users;

-- View active refresh token records
SELECT id, user_id, family, revoked, expires_at FROM refresh_tokens;
```