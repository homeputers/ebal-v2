package com.homeputers.ebal2.api.auth;

import com.homeputers.ebal2.api.generated.MeApi;
import com.homeputers.ebal2.api.generated.model.CurrentUser;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class MeController implements MeApi {

    private final CurrentUserFactory currentUserFactory;

    public MeController(CurrentUserFactory currentUserFactory) {
        this.currentUserFactory = currentUserFactory;
    }

    @Override
    public ResponseEntity<CurrentUser> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CurrentUser currentUser = currentUserFactory.create(authentication);
        return ResponseEntity.ok(currentUser);
    }
}
