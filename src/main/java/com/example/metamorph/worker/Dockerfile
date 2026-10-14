# ─────────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────────
FROM eclipse-temurin:25-jdk-noble AS builder
WORKDIR /workspace

# Copy Maven wrapper and POM
COPY .mvn .mvn
COPY mvnw mvnw
COPY pom.xml pom.xml

# Fix Windows CRLF and make executable
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

# Download dependencies (cached layer)
RUN ./mvnw dependency:go-offline -B || true

# Copy source and build
COPY src src
RUN ./mvnw clean package -DskipTests

# ─────────────────────────────────────────────
# Stage 2: Runtime (Worker)
# ─────────────────────────────────────────────
FROM eclipse-temurin:25-jre-noble
WORKDIR /app

RUN groupadd -r spring && useradd -r -g spring spring
USER spring:spring

COPY --from=builder --chown=spring:spring /workspace/target/*.jar app.jar

# Workers don't expose HTTP endpoints
# EXPOSE intentionally omitted

# PropertiesLauncher lets us pick WorkerApplication as the main class
# without changing the JAR — app uses the same JAR with AppApplication
ENTRYPOINT ["java", \
  "-Dloader.main=com.example.metamorph.WorkerApplication", \
  "-Dspring.profiles.active=worker", \
  "-cp", "app.jar", \
  "org.springframework.boot.loader.launch.PropertiesLauncher"]
