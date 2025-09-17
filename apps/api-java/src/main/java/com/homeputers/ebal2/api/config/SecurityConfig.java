package com.homeputers.ebal2.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationTrustResolver;
import org.springframework.security.authentication.AuthenticationTrustResolverImpl;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.DelegatingSecurityContextRepository;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.RequestAttributeSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final String[] PUBLIC_ENDPOINTS = {"/api/**", "/actuator/**"};

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, SecurityContextRepository securityContextRepository)
            throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .securityContext(context -> context.securityContextRepository(securityContextRepository))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        .anyRequest().permitAll())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        // When the security flag is enabled we can require authentication by swapping the authorizations
        // above for authenticated() and adjusting the session policy. For OIDC, call oauth2Login() and
        // provide a ClientRegistrationRepository bean.
        return http.build();
    }

    @Bean
    SecurityContextRepository securityContextRepository() {
        // Delegating repository keeps request-scoped auth today and allows flipping to HttpSession-based
        // persistence without rewriting the filter chain once session authentication is enabled.
        return new DelegatingSecurityContextRepository(
                new RequestAttributeSecurityContextRepository(),
                new HttpSessionSecurityContextRepository());
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        // Expose AuthenticationManager so session logins or an OAuth2 login controller can inject it later.
        return configuration.getAuthenticationManager();
    }

    @Bean
    AuthenticationTrustResolver authenticationTrustResolver() {
        // Allows collaborators like CurrentUserFactory to detect anonymous tokens while keeping the bean overrideable
        // for future OIDC-specific trust resolvers.
        return new AuthenticationTrustResolverImpl();
    }
}
