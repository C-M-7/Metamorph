# Metamorph

Metamorph is a Spring Boot application running on Java 25 with MySQL and Flyway support.

## Getting Started with Docker Compose

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ensure the Docker daemon is running)
- Docker Compose v2+

### 1. Environment Configuration
Copy the sample environment file if you haven't already:
```bash
cp .env.example .env
```

### 2. Run the Stack
Start both the MySQL database and the Spring Boot application:
```bash
docker compose up --build
```
To run in detached (background) mode:
```bash
docker compose up -d --build
```

### 3. Service Endpoints
- **Spring Boot API**: http://localhost:8080
- **MySQL Database**: `localhost:3306` (Database: `metamorph_db`, User: `metamorph_user`)

### 4. Stop Services
```bash
docker compose down
```
To also remove the database volume:
```bash
docker compose down -v
```

## Local Development (Without Docker for App)
To run only MySQL in Docker and run the Spring Boot app directly from your IDE or CLI:
```bash
# Start MySQL only
docker compose up -d mysql

# Run the Spring Boot application (Windows)
cd demo
.\mvnw.cmd spring-boot:run
```

## Database Migrations (Flyway)

Flyway handles database schema versioning automatically on application startup.

### File Location & Naming
- Directory: `demo/src/main/resources/db/migration/`
- Naming convention: `V<version>__<description>.sql` (e.g., `V1__create_test_connection_table.sql`)

### Applying Migrations
- **Docker**: Rebuild and restart the container whenever new migration scripts are added:
  ```bash
  docker compose up --build -d
  ```
- **Local**: Simply restart the Spring Boot app (`.\mvnw.cmd spring-boot:run`).

### Inspecting Database & Migrations
Connect to the running MySQL container:
```bash
docker exec -it metamorph-mysql mysql -u metamorph_user -pmetamorph_password -D metamorph_db
```
Useful verification queries:
```sql
-- Check migration status and history
SELECT * FROM flyway_schema_history;

-- List created tables
SHOW TABLES;
```

### Resetting Migration State
To clear database state and re-run all migrations from scratch:
```bash
docker compose down -v
docker compose up --build -d
```