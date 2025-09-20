package com.homeputers.ebal2.api.auth;

import com.homeputers.ebal2.api.generated.model.Role;
import com.homeputers.ebal2.api.generated.model.User;
import org.springframework.lang.Nullable;
import org.springframework.security.authentication.AuthenticationTrustResolver;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/**
 * Builds {@link User} payloads from the Spring Security context.
 */
@Component
public class CurrentUserFactory {

    static final String ANONYMOUS_SUBJECT = "anonymous";

    private final AuthenticationTrustResolver trustResolver;

    public CurrentUserFactory(AuthenticationTrustResolver trustResolver) {
        this.trustResolver = trustResolver;
    }

    public Optional<User> create(@Nullable Authentication authentication) {
        if (!isAuthenticated(authentication)) {
            return Optional.empty();
        }

        User user = new User();
        user.setId(resolveId(authentication));
        user.setEmail(resolveEmail(authentication));
        user.setDisplayName(resolveDisplayName(authentication));
        user.setRoles(resolveRoles(authentication));
        user.setIsActive(Boolean.TRUE);
        OffsetDateTime now = OffsetDateTime.now();
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        return Optional.of(user);
    }

    private boolean isAuthenticated(@Nullable Authentication authentication) {
        return authentication != null
                && authentication.isAuthenticated()
                && !trustResolver.isAnonymous(authentication);
    }

    private UUID resolveId(Authentication authentication) {
        String identifier = Objects.requireNonNullElse(authentication.getName(), ANONYMOUS_SUBJECT);
        return UUID.nameUUIDFromBytes(identifier.getBytes(StandardCharsets.UTF_8));
    }

    private List<Role> resolveRoles(Authentication authentication) {
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        if (authorities == null) {
            return List.of();
        }
        List<Role> roles = new ArrayList<>();
        for (GrantedAuthority authority : authorities) {
            Optional<Role> role = mapAuthorityToRole(authority);
            role.ifPresent(roles::add);
        }
        return roles;
    }

    private String resolveDisplayName(Authentication authentication) {
        // Once OIDC is wired we can pull friendly names from the user info claims.
        return authentication.getName();
    }

    private String resolveEmail(Authentication authentication) {
        String name = authentication.getName();
        if (name == null || name.isBlank()) {
            return ANONYMOUS_SUBJECT + "@example.com";
        }
        return name;
    }

    private Optional<Role> mapAuthorityToRole(GrantedAuthority authority) {
        if (authority == null || authority.getAuthority() == null) {
            return Optional.empty();
        }
        String value = authority.getAuthority();
        if (value.startsWith("ROLE_")) {
            value = value.substring("ROLE_".length());
        }
        try {
            return Optional.of(Role.fromValue(value));
        } catch (IllegalArgumentException ex) {
            return Optional.empty();
        }
    }
}
