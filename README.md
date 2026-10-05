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

# Run the Spring Boot application
cd demo
./mvnw spring-boot:run
```