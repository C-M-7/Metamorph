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
# Stage 2: Runtime (App)
# ─────────────────────────────────────────────
FROM eclipse-temurin:25-jre-noble
WORKDIR /app

RUN groupadd -r spring && useradd -r -g spring spring
USER spring:spring

COPY --from=builder --chown=spring:spring /workspace/target/*.jar app.jar

EXPOSE 8080

# PropertiesLauncher lets us pick AppApplication as the main class
# without changing the JAR — worker uses the same JAR with WorkerApplication
ENTRYPOINT ["java", \
  "-Dloader.main=com.example.metamorph.app.AppApplication", \
  "-Dspring.profiles.active=app", \
  "-cp", "app.jar", \
  "org.springframework.boot.loader.launch.PropertiesLauncher"]
