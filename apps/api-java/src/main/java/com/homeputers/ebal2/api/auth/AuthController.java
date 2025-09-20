package com.homeputers.ebal2.api.auth;

import com.homeputers.ebal2.api.generated.AuthApi;
import com.homeputers.ebal2.api.generated.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class AuthController implements AuthApi {

    private final CurrentUserFactory currentUserFactory;

    public AuthController(CurrentUserFactory currentUserFactory) {
        this.currentUserFactory = currentUserFactory;
    }

    @Override
    public ResponseEntity<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return currentUserFactory.create(authentication)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }
}
