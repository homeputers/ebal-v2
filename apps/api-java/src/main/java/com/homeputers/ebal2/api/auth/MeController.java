package com.homeputers.ebal2.api.auth;

import com.homeputers.ebal2.api.generated.MeApi;
import com.homeputers.ebal2.api.generated.model.CurrentUser;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;

@RestController
@RequestMapping("/api/v1")
public class MeController implements MeApi {

    @Override
    public ResponseEntity<CurrentUser> getCurrentUser() {
        CurrentUser currentUser = new CurrentUser();
        currentUser.setSubject("anonymous");
        currentUser.setDisplayName("Anonymous");
        currentUser.setAnonymous(true);
        currentUser.setRoles(Collections.emptyList());
        currentUser.setProvider(null);
        return ResponseEntity.ok(currentUser);
    }
}
