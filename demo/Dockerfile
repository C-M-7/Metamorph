# Stage 1: Build stage
FROM eclipse-temurin:25-jdk-noble AS builder
WORKDIR /workspace

# Copy Maven wrapper files and pom.xml
COPY .mvn .mvn
COPY mvnw mvnw
COPY pom.xml pom.xml

# Fix potential Windows CRLF line endings on the wrapper script and make it executable
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

# Download dependencies offline to optimize cache
RUN ./mvnw dependency:go-offline -B || true

# Copy source code and build the application JAR
COPY src src
RUN ./mvnw clean package -DskipTests

# Stage 2: Minimal runtime image
FROM eclipse-temurin:25-jre-noble
WORKDIR /app

# Run as a dedicated non-root user
RUN groupadd -r spring && useradd -r -g spring spring
USER spring:spring

# Copy the built jar from builder stage
COPY --from=builder --chown=spring:spring /workspace/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
