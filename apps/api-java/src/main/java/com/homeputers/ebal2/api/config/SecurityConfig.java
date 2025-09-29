package com.homeputers.ebal2.api.config;

import com.homeputers.ebal2.api.security.ApiAccessDeniedHandler;
import com.homeputers.ebal2.api.security.ApiAuthenticationEntryPoint;
import com.homeputers.ebal2.api.security.JwtAuthenticationConverter;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationTrustResolver;
import org.springframework.security.authentication.AuthenticationTrustResolverImpl;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.oauth2.server.resource.OAuth2ResourceServerConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

@Configuration
@EnableWebSecurity
@EnableConfigurationProperties(SecurityProperties.class)
public class SecurityConfig {

    private static final String[] AUTH_PUBLIC_ENDPOINTS = {
            "/api/v1/auth/login",
            "/api/v1/auth/refresh",
            "/api/v1/auth/forgot-password",
            "/api/v1/auth/reset-password"
    };

    private static final String[] PUBLIC_GET_ENDPOINTS = {
            "/api/v1/health",
            "/api/v1/storage/health",
            "/api/v1/services/ical",
            "/api/v1/meta/git"
    };

    private static final String[] SWAGGER_ENDPOINTS = {
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html"
    };

    private static final String[] DOMAIN_ENDPOINTS = {
            "/api/v1/members/**",
            "/api/v1/groups/**",
            "/api/v1/songs/**",
            "/api/v1/services/**",
            "/api/v1/song-sets/**",
            "/api/v1/song-set-items/**",
            "/api/v1/service-plan-items/**",
            "/api/v1/search"
    };

    private static final String[] SELF_SERVICE_ENDPOINTS = {
            "/api/v1/me/**"
    };

    private static final String[] SELF_SERVICE_PUBLIC_POST_ENDPOINTS = {
            "/api/v1/me/confirm-email"
    };

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http,
                                            SecurityProperties properties,
                                            ApiAuthenticationEntryPoint authenticationEntryPoint,
                                            ApiAccessDeniedHandler accessDeniedHandler,
                                            JwtAuthenticationConverter jwtAuthenticationConverter,
                                            CorsConfigurationSource corsConfigurationSource) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        if (!properties.isEnabled()) {
            http.oauth2ResourceServer(OAuth2ResourceServerConfigurer::disable)
                    .authorizeHttpRequests(authorize -> authorize.anyRequest().permitAll());
            return http.build();
        }

        http.authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(SWAGGER_ENDPOINTS).permitAll()
                        .requestMatchers(AUTH_PUBLIC_ENDPOINTS).permitAll()
                        .requestMatchers(HttpMethod.GET, PUBLIC_GET_ENDPOINTS).permitAll()
                        .requestMatchers("/api/v1/auth/change-password", "/api/v1/auth/me").authenticated()
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, SELF_SERVICE_ENDPOINTS)
                        .hasAnyRole("ADMIN", "PLANNER", "MUSICIAN", "VIEWER")
                        .requestMatchers(HttpMethod.POST, SELF_SERVICE_PUBLIC_POST_ENDPOINTS).permitAll()
                        .requestMatchers(HttpMethod.POST, SELF_SERVICE_ENDPOINTS)
                        .hasAnyRole("ADMIN", "PLANNER", "MUSICIAN", "VIEWER")
                        .requestMatchers(HttpMethod.PATCH, SELF_SERVICE_ENDPOINTS)
                        .hasAnyRole("ADMIN", "PLANNER", "MUSICIAN", "VIEWER")
                        .requestMatchers(HttpMethod.DELETE, SELF_SERVICE_ENDPOINTS)
                        .hasAnyRole("ADMIN", "PLANNER", "MUSICIAN", "VIEWER")
                        .requestMatchers(HttpMethod.GET, DOMAIN_ENDPOINTS)
                        .hasAnyRole("ADMIN", "PLANNER", "MUSICIAN", "VIEWER")
                        .requestMatchers(HttpMethod.POST, DOMAIN_ENDPOINTS)
                        .hasAnyRole("ADMIN", "PLANNER")
                        .requestMatchers(HttpMethod.PUT, DOMAIN_ENDPOINTS)
                        .hasAnyRole("ADMIN", "PLANNER")
                        .requestMatchers(HttpMethod.PATCH, DOMAIN_ENDPOINTS)
                        .hasAnyRole("ADMIN", "PLANNER")
                        .requestMatchers(HttpMethod.DELETE, DOMAIN_ENDPOINTS)
                        .hasAnyRole("ADMIN", "PLANNER")
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth -> oauth
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter))
                        .authenticationEntryPoint(authenticationEntryPoint))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler));

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(SecurityProperties properties) {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> allowedOrigins = properties.getCors().getAllowedOrigins();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(Duration.ofHours(1));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    JwtDecoder jwtDecoder(SecurityProperties properties) {
        SecretKey secretKey = secretKey(properties);
        return NimbusJwtDecoder.withSecretKey(secretKey)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();
    }

    @Bean
    JwtEncoder jwtEncoder(SecurityProperties properties) {
        SecretKey secretKey = secretKey(properties);
        return new NimbusJwtEncoder(new ImmutableSecret<>(secretKey));
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        return new JwtAuthenticationConverter();
    }

    @Bean
    AuthenticationTrustResolver authenticationTrustResolver() {
        return new AuthenticationTrustResolverImpl();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    private SecretKey secretKey(SecurityProperties properties) {
        byte[] keyBytes = properties.getJwt().getSecret().getBytes(StandardCharsets.UTF_8);
        return new SecretKeySpec(keyBytes, "HmacSHA512");
    }
}
