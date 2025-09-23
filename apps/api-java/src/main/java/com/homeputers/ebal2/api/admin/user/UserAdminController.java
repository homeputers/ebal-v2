package com.homeputers.ebal2.api.admin.user;

import com.homeputers.ebal2.api.generated.AdminUsersApi;
import com.homeputers.ebal2.api.generated.model.CreateUserRequest;
import com.homeputers.ebal2.api.generated.model.PageUserResponse;
import com.homeputers.ebal2.api.generated.model.Role;
import com.homeputers.ebal2.api.generated.model.UpdateUserRequest;
import com.homeputers.ebal2.api.generated.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@PreAuthorize("hasRole('ADMIN')")
public class UserAdminController implements AdminUsersApi {

    private final UserAdminService userAdminService;

    public UserAdminController(UserAdminService userAdminService) {
        this.userAdminService = userAdminService;
    }

    @Override
    public ResponseEntity<PageUserResponse> listUsers(String q, Role role, Boolean isActive, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(resolvePage(page), resolveSize(size));
        Page<AdminUser> users = userAdminService.searchUsers(q, role == null ? null : role.getValue(), isActive, pageable);
        return ResponseEntity.ok(AdminUserDtoMapper.toPage(users));
    }

    @Override
    public ResponseEntity<User> createUser(CreateUserRequest createUserRequest) {
        AdminUser created = userAdminService.createUser(createUserRequest);
        return new ResponseEntity<>(AdminUserDtoMapper.toDto(created), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<User> getUser(UUID id) {
        AdminUser user = userAdminService.getUser(id);
        return ResponseEntity.ok(AdminUserDtoMapper.toDto(user));
    }

    @Override
    public ResponseEntity<User> updateUser(UUID id, UpdateUserRequest updateUserRequest) {
        AdminUser updated = userAdminService.updateUser(id, updateUserRequest);
        return ResponseEntity.ok(AdminUserDtoMapper.toDto(updated));
    }

    @Override
    public ResponseEntity<Void> deleteUser(UUID id) {
        userAdminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<Void> resetUserPassword(UUID id) {
        userAdminService.sendPasswordReset(id);
        return ResponseEntity.noContent().build();
    }

    private int resolvePage(Integer page) {
        if (page == null || page < 0) {
            return 0;
        }
        return page;
    }

    private int resolveSize(Integer size) {
        if (size == null || size <= 0) {
            return 20;
        }
        return size;
    }
}
