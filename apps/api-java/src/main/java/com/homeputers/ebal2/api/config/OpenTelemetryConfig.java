package com.homeputers.ebal2.api.config;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.baggage.propagation.W3CBaggagePropagator;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.api.trace.propagation.W3CTraceContextPropagator;
import io.opentelemetry.context.propagation.ContextPropagators;
import io.opentelemetry.context.propagation.TextMapPropagator;
import io.opentelemetry.exporter.otlp.trace.OtlpGrpcSpanExporter;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.resources.Resource;
import io.opentelemetry.sdk.trace.SdkTracerProvider;
import io.opentelemetry.sdk.trace.export.BatchSpanProcessor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.util.StringUtils;

@Configuration
@ConditionalOnProperty(prefix = "ebal.otel", name = "enabled", havingValue = "true")
public class OpenTelemetryConfig {

    @Bean
    OtlpGrpcSpanExporter otlpGrpcSpanExporter(
            @Value("${ebal.otel.exporter.otlp.endpoint:}") String endpoint
    ) {
        var builder = OtlpGrpcSpanExporter.builder();
        if (StringUtils.hasText(endpoint)) {
            builder.setEndpoint(endpoint);
        }
        return builder.build();
    }

    @Bean(destroyMethod = "close")
    OpenTelemetry openTelemetry(OtlpGrpcSpanExporter spanExporter) {
        Resource resource = Resource.getDefault().merge(Resource.builder()
                .put(AttributeKey.stringKey("service.name"), "ebal-api")
                .build());

        SdkTracerProvider tracerProvider = SdkTracerProvider.builder()
                .setResource(resource)
                .addSpanProcessor(BatchSpanProcessor.builder(spanExporter).build())
                .build();

        TextMapPropagator propagator = TextMapPropagator.composite(
                W3CTraceContextPropagator.getInstance(),
                W3CBaggagePropagator.getInstance()
        );

        return OpenTelemetrySdk.builder()
                .setTracerProvider(tracerProvider)
                .setPropagators(ContextPropagators.create(propagator))
                .build();
    }

    @Bean
    Tracer tracer(OpenTelemetry openTelemetry) {
        return openTelemetry.getTracer("com.homeputers.ebal2.api");
    }

    @Bean
    WebMvcTracingFilter webMvcTracingFilter(Tracer tracer) {
        return new WebMvcTracingFilter(tracer);
    }

    @Bean
    FilterRegistrationBean<WebMvcTracingFilter> webMvcTracingFilterRegistration(WebMvcTracingFilter filter) {
        FilterRegistrationBean<WebMvcTracingFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setName("otelWebMvcTracingFilter");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE + 20);
        return registration;
    }
}
