#!/bin/bash

export JAVA_HOME="/nix/store/2ds1jrzlmx4n08sp7flga5sxf000l2sl-zulu-ca-jdk-21.0.4"
export PATH="$JAVA_HOME/bin:$PATH"

JDBC_URL=$(echo "$DATABASE_URL" | sed -E 's|^postgresql://[^@]+@|jdbc:postgresql://|')

export SPRING_DATASOURCE_URL="$JDBC_URL"
export SPRING_DATASOURCE_USERNAME="$PGUSER"
export SPRING_DATASOURCE_PASSWORD="$PGPASSWORD"

cd apps/api-java

./mvnw spring-boot:run
