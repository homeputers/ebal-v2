package com.homeputers.ebal2.api.config;

import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.SpanKind;
import io.opentelemetry.api.trace.StatusCode;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.context.Scope;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerMapping;

import java.io.IOException;

class WebMvcTracingFilter extends OncePerRequestFilter {

    private static final AttributeKey<String> HTTP_METHOD = AttributeKey.stringKey("http.method");
    private static final AttributeKey<String> HTTP_ROUTE = AttributeKey.stringKey("http.route");
    private static final AttributeKey<String> URL_SCHEME = AttributeKey.stringKey("url.scheme");
    private static final AttributeKey<String> HTTP_TARGET = AttributeKey.stringKey("http.target");
    private static final AttributeKey<String> HTTP_HOST = AttributeKey.stringKey("http.host");
    private static final AttributeKey<String> HTTP_USER_AGENT = AttributeKey.stringKey("http.user_agent");
    private static final AttributeKey<Long> HTTP_STATUS_CODE = AttributeKey.longKey("http.status_code");

    private final Tracer tracer;

    WebMvcTracingFilter(Tracer tracer) {
        this.tracer = tracer;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String spanName = "%s %s".formatted(request.getMethod(), request.getRequestURI());
        Span span = tracer.spanBuilder(spanName)
                .setSpanKind(SpanKind.SERVER)
                .startSpan();

        span.setAttribute(HTTP_METHOD, request.getMethod());
        String target = request.getRequestURI();
        String queryString = request.getQueryString();
        if (queryString != null && !queryString.isBlank()) {
            target = target + "?" + queryString;
        }
        span.setAttribute(HTTP_TARGET, target);
        span.setAttribute(URL_SCHEME, request.getScheme());
        String host = request.getHeader("Host");
        if (host == null || host.isBlank()) {
            host = request.getServerName();
            int port = request.getServerPort();
            if (port > 0) {
                host = host + ":" + port;
            }
        }
        span.setAttribute(HTTP_HOST, host);
        String userAgent = request.getHeader("User-Agent");
        if (userAgent != null && !userAgent.isBlank()) {
            span.setAttribute(HTTP_USER_AGENT, userAgent);
        }
        try (Scope ignored = span.makeCurrent()) {
            filterChain.doFilter(request, response);
            span.setAttribute(HTTP_STATUS_CODE, (long) response.getStatus());
            if (response.getStatus() >= 500) {
                span.setStatus(StatusCode.ERROR);
            } else {
                span.setStatus(StatusCode.OK);
            }
        } catch (Exception ex) {
            span.recordException(ex);
            span.setStatus(StatusCode.ERROR);
            span.setAttribute(HTTP_STATUS_CODE, 500L);
            throw ex;
        } finally {
            String route = (String) request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
            if (route != null && !route.isBlank()) {
                span.setAttribute(HTTP_ROUTE, route);
            }
            span.end();
        }
    }
}
