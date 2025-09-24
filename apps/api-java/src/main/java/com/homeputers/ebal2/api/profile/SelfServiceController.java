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
        Optional<UUID> userId = resolveUserId();
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).<MyProfile>build();
        }

        MyProfileView view = selfServiceService.getMyProfile(userId.get());
        return ResponseEntity.ok(MyProfileDtoMapper.toDto(view));
    }

    @Override
    public ResponseEntity<MyProfile> updateMyProfile(UpdateMyProfileRequest updateMyProfileRequest) {
        Optional<UUID> userId = resolveUserId();
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).<MyProfile>build();
        }

        MyProfileView view = selfServiceService.updateMyProfile(userId.get(), updateMyProfileRequest);
        return ResponseEntity.ok(MyProfileDtoMapper.toDto(view));
    }

    @Override
    public ResponseEntity<UploadAvatarResponse> uploadMyAvatar(MultipartFile file) {
        Optional<UUID> userId = resolveUserId();
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).<UploadAvatarResponse>build();
        }

        return ResponseEntity.ok(selfServiceService.uploadAvatar(userId.get(), file));
    }

    @Override
    public ResponseEntity<Void> deleteMyAvatar() {
        Optional<UUID> userId = resolveUserId();
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).<Void>build();
        }

        selfServiceService.removeAvatar(userId.get());
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<Void> changeMyPassword(ChangePasswordRequest changePasswordRequest) {
        Optional<UUID> userId = resolveUserId();
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).<Void>build();
        }

        selfServiceService.changePassword(userId.get(), changePasswordRequest);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<Void> requestMyEmailChange(ChangeMyEmailRequest changeMyEmailRequest) {
        Optional<UUID> userId = resolveUserId();
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).<Void>build();
        }

        selfServiceService.initiateEmailChange(userId.get(), changeMyEmailRequest);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<Void> confirmMyEmail(ConfirmMyEmailRequest confirmMyEmailRequest) {
        selfServiceService.confirmEmailChange(confirmMyEmailRequest.getToken());
        return ResponseEntity.noContent().build();
    }

    private Optional<UUID> resolveUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication instanceof JwtAuthenticationToken jwt) || !jwt.isAuthenticated()) {
            return Optional.empty();
        }
        try {
            String subject = jwt.getToken().getSubject();
            if (subject == null || subject.isBlank()) {
                return Optional.empty();
            }
            return Optional.of(UUID.fromString(subject));
        } catch (IllegalArgumentException ex) {
            return Optional.empty();
        }
    }
}
