#!/bin/bash

export JAVA_HOME="/nix/store/2ds1jrzlmx4n08sp7flga5sxf000l2sl-zulu-ca-jdk-21.0.4"
export PATH="$JAVA_HOME/bin:$PATH"

JDBC_URL=$(echo "$DATABASE_URL" | sed -E 's|^postgresql://[^@]+@|jdbc:postgresql://|')

export SPRING_DATASOURCE_URL="$JDBC_URL"
export SPRING_DATASOURCE_USERNAME="$PGUSER"
export SPRING_DATASOURCE_PASSWORD="$PGPASSWORD"

export EBAL_SEED_ENABLED=true
export EBAL_SEED_ADMIN_EMAIL=admin@example.com
export EBAL_SEED_ADMIN_PASSWORD=ChangeMe123!

export EBAL_WEB_ORIGIN_DEV="https://$REPLIT_DEV_DOMAIN"

cd apps/api-java

./mvnw spring-boot:run
