# syntax=docker/dockerfile:1

FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /workspace/apps/api-java

# Copy Maven wrapper, pom, and configuration first for better caching
COPY apps/api-java/mvnw ./mvnw
COPY apps/api-java/.mvn ./.mvn
COPY apps/api-java/pom.xml ./pom.xml
COPY spec /workspace/spec

RUN chmod +x mvnw
RUN ./mvnw -B -ntp dependency:go-offline

# Copy source after dependencies to leverage Docker layer caching
COPY apps/api-java/src ./src

RUN ./mvnw -B -ntp -DskipTests package

FROM gcr.io/distroless/java21
WORKDIR /app
COPY --from=build /workspace/apps/api-java/target/api-0.1.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
