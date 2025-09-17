package com.homeputers.ebal2.api.auth;

import com.homeputers.ebal2.api.generated.model.CurrentUser;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationTrustResolverImpl;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CurrentUserFactoryTest {

    private final CurrentUserFactory factory = new CurrentUserFactory(new AuthenticationTrustResolverImpl());

    @Test
    void createsAnonymousUserWhenAuthenticationMissing() {
        CurrentUser currentUser = factory.create(null);

        assertThat(currentUser.getAnonymous()).isTrue();
        assertThat(currentUser.getSubject()).isNotNull();
        assertThat(currentUser.getSubject().isPresent()).isTrue();
        assertThat(currentUser.getSubject().get()).isEqualTo("anonymous");
        assertThat(currentUser.getDisplayName()).isEqualTo("Anonymous");
        assertThat(currentUser.getRoles()).isEmpty();
        assertThat(currentUser.getProvider()).isNotNull();
        assertThat(currentUser.getProvider().isPresent()).isFalse();
    }

    @Test
    void treatsAnonymousAuthenticationTokenAsAnonymous() {
        AnonymousAuthenticationToken authentication = new AnonymousAuthenticationToken(
                "key", "guest", AuthorityUtils.createAuthorityList("ROLE_ANONYMOUS"));

        CurrentUser currentUser = factory.create(authentication);

        assertThat(currentUser.getAnonymous()).isTrue();
        assertThat(currentUser.getRoles()).isEmpty();
    }

    @Test
    void createsAuthenticatedUserDetails() {
        TestingAuthenticationToken authentication = new TestingAuthenticationToken(
                "alice", "password", List.of(new SimpleGrantedAuthority("ROLE_USER")));
        authentication.setAuthenticated(true);

        CurrentUser currentUser = factory.create(authentication);

        assertThat(currentUser.getAnonymous()).isFalse();
        assertThat(currentUser.getSubject()).isNotNull();
        assertThat(currentUser.getSubject().isPresent()).isTrue();
        assertThat(currentUser.getSubject().get()).isEqualTo("alice");
        assertThat(currentUser.getDisplayName()).isEqualTo("alice");
        assertThat(currentUser.getRoles()).containsExactly("ROLE_USER");
        assertThat(currentUser.getProvider()).isNotNull();
        assertThat(currentUser.getProvider().isPresent()).isFalse();
    }
}
