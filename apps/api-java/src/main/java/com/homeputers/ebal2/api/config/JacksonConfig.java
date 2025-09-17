package com.homeputers.ebal2.api.config;

import org.openapitools.jackson.nullable.JsonNullableModule;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configures Jackson to understand OpenAPI's {@link org.openapitools.jackson.nullable.JsonNullable} wrapper.
 */
@Configuration
public class JacksonConfig {

    @Bean
    Jackson2ObjectMapperBuilderCustomizer jsonNullableModule() {
        // Register JsonNullable support so Spring MVC and the TestRestTemplate can deserialize responses
        // generated from the OpenAPI models that expose nullable string fields.
        return builder -> builder.modulesToInstall(new JsonNullableModule());
    }
}
