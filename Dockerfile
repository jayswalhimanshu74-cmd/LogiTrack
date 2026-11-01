# ---------- Build Stage ----------
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

# Copy the backend source files from IMS_backend directory into the container
COPY IMS_backend .

# Ensure line endings are LF and mvnw is executable
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

# Package the application (skip tests for faster deployment build)
RUN ./mvnw clean package -DskipTests

# ---------- Runtime Stage ----------
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy compiled JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

# Use container memory limits (essential for cloud platforms like Render)
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]

