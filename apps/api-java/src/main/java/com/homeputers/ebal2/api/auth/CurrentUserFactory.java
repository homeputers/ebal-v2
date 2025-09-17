package com.homeputers.ebal2.api.auth;

import com.homeputers.ebal2.api.generated.model.CurrentUser;
import org.springframework.lang.Nullable;
import org.springframework.security.authentication.AuthenticationTrustResolver;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Builds {@link CurrentUser} payloads from the Spring Security context.
 */
@Component
public class CurrentUserFactory {

    static final String ANONYMOUS_SUBJECT = "anonymous";
    static final String ANONYMOUS_DISPLAY_NAME = "Anonymous";

    private final AuthenticationTrustResolver trustResolver;

    public CurrentUserFactory(AuthenticationTrustResolver trustResolver) {
        this.trustResolver = trustResolver;
    }

    public CurrentUser create(@Nullable Authentication authentication) {
        if (!isAuthenticated(authentication)) {
            return anonymousUser();
        }

        CurrentUser user = new CurrentUser();
        user.setSubject(authentication.getName());
        user.setDisplayName(resolveDisplayName(authentication));
        user.setAnonymous(Boolean.FALSE);
        user.setRoles(resolveRoles(authentication));
        user.setProvider(resolveProvider(authentication));
        return user;
    }

    private boolean isAuthenticated(@Nullable Authentication authentication) {
        return authentication != null
                && authentication.isAuthenticated()
                && !trustResolver.isAnonymous(authentication);
    }

    private CurrentUser anonymousUser() {
        CurrentUser user = new CurrentUser();
        user.setSubject(ANONYMOUS_SUBJECT);
        user.setDisplayName(ANONYMOUS_DISPLAY_NAME);
        user.setAnonymous(Boolean.TRUE);
        user.setRoles(Collections.emptyList());
        user.setProvider(null);
        return user;
    }

    private List<String> resolveRoles(Authentication authentication) {
        if (authentication.getAuthorities() == null) {
            return Collections.emptyList();
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private String resolveDisplayName(Authentication authentication) {
        // Once OIDC is wired we can pull friendly names from the user info claims.
        return authentication.getName();
    }

    private String resolveProvider(Authentication authentication) {
        // For session logins this can remain null; for OIDC we'll expose the registration id.
        return null;
    }
}
