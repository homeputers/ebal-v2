package com.homeputers.ebal2.api.auth;

import com.homeputers.ebal2.api.generated.model.Role;
import com.homeputers.ebal2.api.generated.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationTrustResolverImpl;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class CurrentUserFactoryTest {

    private final CurrentUserFactory factory = new CurrentUserFactory(new AuthenticationTrustResolverImpl());

    @Test
    void returnsEmptyWhenAuthenticationMissing() {
        Optional<User> currentUser = factory.create(null);

        assertThat(currentUser).isEmpty();
    }

    @Test
    void treatsAnonymousAuthenticationTokenAsUnauthenticated() {
        AnonymousAuthenticationToken authentication = new AnonymousAuthenticationToken(
                "key", "guest", AuthorityUtils.createAuthorityList("ROLE_ANONYMOUS"));

        Optional<User> currentUser = factory.create(authentication);

        assertThat(currentUser).isEmpty();
    }

    @Test
    void createsAuthenticatedUserDetails() {
        TestingAuthenticationToken authentication = new TestingAuthenticationToken(
                "alice@example.com", "password", List.of(
                        new SimpleGrantedAuthority("ROLE_ADMIN"),
                        new SimpleGrantedAuthority("ROLE_IGNORED")));
        authentication.setAuthenticated(true);

        Optional<User> currentUser = factory.create(authentication);

        assertThat(currentUser).isPresent();
        User user = currentUser.get();
        assertThat(user.getId()).isNotNull();
        assertThat(user.getEmail()).isEqualTo("alice@example.com");
        assertThat(user.getDisplayName()).isEqualTo("alice@example.com");
        assertThat(user.getRoles()).containsExactly(Role.ADMIN);
        assertThat(user.getIsActive()).isTrue();
        assertThat(user.getCreatedAt()).isNotNull();
        assertThat(user.getUpdatedAt()).isNotNull();
    }

    @Test
    void extractsEmailFromJwtAuthenticationToken() {
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .subject("3fa85f64-5717-4562-b3fc-2c963f66afa6")
                .claim("email", "jwt-user@example.com")
                .claim("roles", List.of("PLANNER"))
                .build();
        JwtAuthenticationToken authentication = new JwtAuthenticationToken(jwt, AuthorityUtils.createAuthorityList("ROLE_PLANNER"));

        Optional<User> currentUser = factory.create(authentication);

        assertThat(currentUser).isPresent();
        assertThat(currentUser.get().getEmail()).isEqualTo("jwt-user@example.com");
    }
}
