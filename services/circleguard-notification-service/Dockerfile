FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY gradlew settings.gradle.kts build.gradle.kts ./
COPY gradle ./gradle
COPY services/circleguard-notification-service ./services/circleguard-notification-service
RUN chmod +x gradlew && ./gradlew :services:circleguard-notification-service:bootJar -x test --no-daemon

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S circleguard && adduser -S circleguard -G circleguard
COPY --from=build /app/services/circleguard-notification-service/build/libs/*.jar app.jar
USER circleguard
EXPOSE 8082
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD wget -qO- http://localhost:8082/actuator/health/liveness || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
