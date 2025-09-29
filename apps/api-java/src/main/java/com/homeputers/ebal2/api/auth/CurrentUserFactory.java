package com.homeputers.ebal2.api.auth;

import com.homeputers.ebal2.api.domain.user.UserMapper;
import com.homeputers.ebal2.api.domain.user.UserRoleMapper;
import com.homeputers.ebal2.api.generated.model.Role;
import com.homeputers.ebal2.api.generated.model.User;
import org.springframework.lang.Nullable;
import org.springframework.security.authentication.AuthenticationTrustResolver;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import static java.util.stream.Collectors.toCollection;

/**
 * Builds {@link User} payloads from the Spring Security context.
 */
@Component
public class CurrentUserFactory {

    static final String ANONYMOUS_SUBJECT = "anonymous";

    private final AuthenticationTrustResolver trustResolver;
    private final UserMapper userMapper;
    private final UserRoleMapper userRoleMapper;

    public CurrentUserFactory(AuthenticationTrustResolver trustResolver,
                              UserMapper userMapper,
                              UserRoleMapper userRoleMapper) {
        this.trustResolver = trustResolver;
        this.userMapper = userMapper;
        this.userRoleMapper = userRoleMapper;
    }

    public Optional<User> create(@Nullable Authentication authentication) {
        if (!isAuthenticated(authentication)) {
            return Optional.empty();
        }

        UUID userId = resolveId(authentication);
        com.homeputers.ebal2.api.domain.user.User domainUser = userMapper.findById(userId);

        User user = new User();
        user.setId(userId);
        user.setEmail(resolveEmail(authentication, domainUser));
        user.setDisplayName(resolveDisplayName(authentication, domainUser));
        user.setAvatarUrl(domainUser != null && domainUser.avatarUrl() != null
                ? URI.create(domainUser.avatarUrl())
                : null);
        user.setRoles(resolveRoles(authentication, userId, domainUser));
        user.setIsActive(domainUser != null ? domainUser.isActive() : Boolean.TRUE);
        if (domainUser != null) {
            user.setCreatedAt(domainUser.createdAt());
            user.setUpdatedAt(domainUser.updatedAt());
        } else {
            OffsetDateTime now = OffsetDateTime.now();
            user.setCreatedAt(now);
            user.setUpdatedAt(now);
        }
        return Optional.of(user);
    }

    private boolean isAuthenticated(@Nullable Authentication authentication) {
        return authentication != null
                && authentication.isAuthenticated()
                && !trustResolver.isAnonymous(authentication);
    }

    private UUID resolveId(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuthenticationToken) {
            String subject = jwtAuthenticationToken.getToken().getSubject();
            if (subject != null) {
                try {
                    return UUID.fromString(subject);
                } catch (IllegalArgumentException ignored) {
                    // fall back to hashed identifier below
                }
            }
        }
        String identifier = Objects.requireNonNullElse(authentication.getName(), ANONYMOUS_SUBJECT);
        return UUID.nameUUIDFromBytes(identifier.getBytes(StandardCharsets.UTF_8));
    }

    private String resolveEmail(Authentication authentication,
                                @Nullable com.homeputers.ebal2.api.domain.user.User domainUser) {
        if (domainUser != null && domainUser.email() != null) {
            return domainUser.email();
        }
        return resolveEmail(authentication);
    }

    private String resolveDisplayName(Authentication authentication,
                                      @Nullable com.homeputers.ebal2.api.domain.user.User domainUser) {
        if (domainUser != null && domainUser.displayName() != null && !domainUser.displayName().isBlank()) {
            return domainUser.displayName();
        }
        return resolveDisplayName(authentication);
    }

    private List<Role> resolveRoles(Authentication authentication,
                                    UUID userId,
                                    @Nullable com.homeputers.ebal2.api.domain.user.User domainUser) {
        if (domainUser != null) {
            List<String> assignedRoles = userRoleMapper.findRolesByUserId(userId);
            if (assignedRoles != null && !assignedRoles.isEmpty()) {
                List<Role> mapped = assignedRoles.stream()
                        .map(this::mapStringToRole)
                        .filter(Objects::nonNull)
                        .collect(toCollection(ArrayList::new));
                if (!mapped.isEmpty()) {
                    return mapped;
                }
            }
        }
        return resolveRolesFromAuthorities(authentication);
    }

    private List<Role> resolveRolesFromAuthorities(Authentication authentication) {
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

    private Role mapStringToRole(String value) {
        if (value == null) {
            return null;
        }
        try {
            return Role.fromValue(value);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private String resolveDisplayName(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuthenticationToken) {
            String emailClaim = jwtAuthenticationToken.getToken().getClaimAsString("email");
            if (emailClaim != null && !emailClaim.isBlank()) {
                return emailClaim;
            }
        }
        return authentication.getName();
    }

    private String resolveEmail(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuthenticationToken) {
            String email = jwtAuthenticationToken.getToken().getClaimAsString("email");
            if (email != null && !email.isBlank()) {
                return email;
            }
        }
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
