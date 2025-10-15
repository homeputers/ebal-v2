---
title: "Enable backend telemetry"
description: "Turn on OpenTelemetry tracing and metrics for the Spring Boot API when running with Grafana, Tempo, and the OpenTelemetry Collector."
sidebar:
  label: "Enable backend telemetry"
---

# Enable backend telemetry

This how-to shows how to send EBAL API traces and metrics to an OpenTelemetry Collector when you already run Grafana, VictoriaMetrics, Tempo, and other observability services alongside the application. The example assumes the following containers are running on the same host:

- `otelcol` listening on gRPC port `4317` and HTTP port `4318`.
- `tempo` for trace storage.
- `victoriametrics` (or another Prometheus-compatible database) for metrics.
- `grafana` configured to read from Tempo and VictoriaMetrics.

## 1. Confirm collector endpoints

Make sure the OpenTelemetry Collector is reachable from the EBAL API container. With Docker Compose, publish the OTLP receiver ports on the host and keep the service name available on the internal network, for example:

```yaml
  otelcol:
    image: otel/opentelemetry-collector:${OTELCOL_VERSION}
    command: ["--config=/etc/otelcol-config.yaml"]
    ports:
      - "4317:4317"   # gRPC
      - "4318:4318"   # HTTP
```

When the API container shares the same Docker network, it can reach the collector at `http://otelcol:4318` (HTTP) or `http://otelcol:4317` (gRPC). If you expose the collector on the host only, use the host IP or DNS name instead.

## 2. Enable OpenTelemetry in the API

Set the following environment variables for the `backend` (API) service in your Compose file or `.env`:

```dotenv
EBAL_OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://otelcol:4317
```

- `EBAL_OTEL_ENABLED=true` turns on Spring Boot's OpenTelemetry auto-configuration.
- `OTEL_EXPORTER_OTLP_ENDPOINT` tells the API where to send OTLP data. Use the gRPC endpoint (`4317`) unless your collector expects HTTP.

Restart the API container so the new configuration takes effect. On startup, the application logs will include a confirmation li
ke:

```
INFO  c.h.e.a.config.OpenTelemetryConfig : OpenTelemetry tracing enabled; exporting spans to http://otelcol:4317
```

## 3. Verify data flows

1. Call any EBAL API endpoint (e.g., `GET /actuator/health`) to generate traffic.
2. In Grafana, open the Tempo data source explorer and query for recent traces. You should see spans named after controller methods (for example, `ServiceController#getService`).
3. Check the VictoriaMetrics data source for metrics prefixed with `ebal_` or standard JVM metrics.

If traces do not appear, double-check the collector logs for rejected spans and verify the endpoint/credentials configured in step 2.

## 4. (Optional) Forward traces to Grafana Cloud

When using Grafana Cloud or another managed observability provider, update the collector configuration to forward spans and metrics upstream. Keep the API container pointed at the local collector; only the collector needs cloud credentials.

Refer to your deployment's collector configuration (for example, `/opt/observability/config/otelcol/otelcol-config.yaml`) for the full pipeline definition used in production.
