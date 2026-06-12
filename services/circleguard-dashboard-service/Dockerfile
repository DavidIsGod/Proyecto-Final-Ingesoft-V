FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY gradlew settings.gradle.kts build.gradle.kts ./
COPY gradle ./gradle
COPY services/circleguard-dashboard-service ./services/circleguard-dashboard-service
RUN chmod +x gradlew && ./gradlew :services:circleguard-dashboard-service:bootJar -x test --no-daemon

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S circleguard && adduser -S circleguard -G circleguard
COPY --from=build /app/services/circleguard-dashboard-service/build/libs/*.jar app.jar
USER circleguard
EXPOSE 8084
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD wget -qO- http://localhost:8084/actuator/health/liveness || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
