package com.homeputers.ebal2.api.profile;

import com.homeputers.ebal2.api.generated.ProfileApi;
import com.homeputers.ebal2.api.generated.model.ChangeMyEmailRequest;
import com.homeputers.ebal2.api.generated.model.ChangePasswordRequest;
import com.homeputers.ebal2.api.generated.model.ConfirmMyEmailRequest;
import com.homeputers.ebal2.api.generated.model.MyProfile;
import com.homeputers.ebal2.api.generated.model.UpdateMyProfileRequest;
import com.homeputers.ebal2.api.generated.model.UploadAvatarResponse;
import com.homeputers.ebal2.api.profile.MyProfileView;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class SelfServiceController implements ProfileApi {

    private final SelfServiceService selfServiceService;

    public SelfServiceController(SelfServiceService selfServiceService) {
        this.selfServiceService = selfServiceService;
    }

    @Override
    public ResponseEntity<MyProfile> getMyProfile() {
        return resolveUserId()
                .map(userId -> ResponseEntity.ok(MyProfileDtoMapper.toDto(selfServiceService.getMyProfile(userId))))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).<MyProfile>build());
    }

    @Override
    public ResponseEntity<MyProfile> updateMyProfile(UpdateMyProfileRequest updateMyProfileRequest) {
        return resolveUserId()
                .map(userId -> {
                    MyProfileView view = selfServiceService.updateMyProfile(userId, updateMyProfileRequest);
                    return ResponseEntity.ok(MyProfileDtoMapper.toDto(view));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).<MyProfile>build());
    }

    @Override
    public ResponseEntity<UploadAvatarResponse> uploadMyAvatar(MultipartFile file) {
        return resolveUserId()
                .map(userId -> ResponseEntity.ok(selfServiceService.uploadAvatar(userId, file)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).<UploadAvatarResponse>build());
    }

    @Override
    public ResponseEntity<Void> deleteMyAvatar() {
        return resolveUserId()
                .map(userId -> {
                    selfServiceService.removeAvatar(userId);
                    return ResponseEntity.noContent().build();
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).<Void>build());
    }

    @Override
    public ResponseEntity<Void> changeMyPassword(ChangePasswordRequest changePasswordRequest) {
        return resolveUserId()
                .map(userId -> {
                    selfServiceService.changePassword(userId, changePasswordRequest);
                    return ResponseEntity.noContent().build();
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).<Void>build());
    }

    @Override
    public ResponseEntity<Void> requestMyEmailChange(ChangeMyEmailRequest changeMyEmailRequest) {
        return resolveUserId()
                .map(userId -> {
                    selfServiceService.initiateEmailChange(userId, changeMyEmailRequest);
                    return ResponseEntity.noContent().build();
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).<Void>build());
    }

    @Override
    public ResponseEntity<Void> confirmMyEmail(ConfirmMyEmailRequest confirmMyEmailRequest) {
        return resolveUserId()
                .map(userId -> {
                    selfServiceService.confirmEmailChange(confirmMyEmailRequest.getToken());
                    return ResponseEntity.noContent().build();
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).<Void>build());
    }

    private Optional<UUID> resolveUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication instanceof JwtAuthenticationToken jwt) || !jwt.isAuthenticated()) {
            return Optional.empty();
        }
        try {
            return Optional.of(UUID.fromString(jwt.getName()));
        } catch (IllegalArgumentException ex) {
            return Optional.empty();
        }
    }
}
