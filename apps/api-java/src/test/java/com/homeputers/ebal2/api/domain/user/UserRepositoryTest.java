package com.homeputers.ebal2.api.domain.user;

import com.homeputers.ebal2.api.AbstractIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class UserRepositoryTest extends AbstractIntegrationTest {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private UserRoleMapper userRoleMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private OffsetDateTime now;

    @BeforeEach
    void setUp() {
        now = OffsetDateTime.now().minusMinutes(1);
    }

    @Test
    void insertEnforcesCaseInsensitiveUniqueEmail() {
        String password = passwordEncoder.encode("Secret123!");
        UUID userId = UUID.randomUUID();
        userMapper.insert(userId, "unique@example.com", "Unique", null, password, true, now, now, 0);

        assertThatThrownBy(() -> userMapper.insert(UUID.randomUUID(), "UNIQUE@example.com", "Other", null, password,
                true, now, now, 0))
                .isInstanceOf(DuplicateKeyException.class);
    }

    @Test
    void persistsAndLoadsRoles() {
        UUID userId = UUID.randomUUID();
        userMapper.insert(userId, "roles@example.com", "Roles", null, passwordEncoder.encode("Secret123!"), true, now, now, 0);

        userRoleMapper.insert(userId, "ADMIN", now);
        userRoleMapper.insert(userId, "PLANNER", now);

        List<String> roles = userRoleMapper.findRolesByUserId(userId);
        assertThat(roles).containsExactlyInAnyOrder("ADMIN", "PLANNER");
    }

    @Test
    void searchAppliesFilters() {
        UUID activeAdminId = UUID.randomUUID();
        userMapper.insert(activeAdminId, "alice@example.com", "Alice", null, passwordEncoder.encode("Pass123!"), true, now, now, 0);
        userRoleMapper.insert(activeAdminId, "ADMIN", now);

        UUID inactivePlannerId = UUID.randomUUID();
        userMapper.insert(inactivePlannerId, "bob@example.com", "Bob", null, passwordEncoder.encode("Pass123!"), false, now, now, 0);
        userRoleMapper.insert(inactivePlannerId, "PLANNER", now);

        UUID activeViewerId = UUID.randomUUID();
        userMapper.insert(activeViewerId, "carol@example.com", "Carol", null, passwordEncoder.encode("Pass123!"), true, now, now, 0);
        userRoleMapper.insert(activeViewerId, "VIEWER", now);

        PageRequest pageable = PageRequest.of(0, 10);

        List<User> byQuery = userMapper.search("car", null, null, pageable.getPageSize(), (int) pageable.getOffset());
        assertThat(byQuery).hasSize(1);
        assertThat(byQuery.get(0).email()).isEqualTo("carol@example.com");

        List<User> byRole = userMapper.search(null, "ADMIN", null, pageable.getPageSize(), (int) pageable.getOffset());
        assertThat(byRole).hasSize(1);
        assertThat(byRole.get(0).email()).isEqualTo("alice@example.com");

        List<User> byActive = userMapper.search(null, null, false, pageable.getPageSize(), (int) pageable.getOffset());
        assertThat(byActive).hasSize(1);
        assertThat(byActive.get(0).email()).isEqualTo("bob@example.com");

        int count = userMapper.countSearch(null, null, true);
        assertThat(count).isEqualTo(2);
    }

    @Test
    void updateHonorsOptimisticLocking() {
        UUID userId = UUID.randomUUID();
        userMapper.insert(userId, "lock@example.com", "Lock", null, passwordEncoder.encode("Secret123!"), true, now, now, 0);

        User existing = userMapper.findById(userId);
        int updated = userMapper.updateUser(userId, "New Lock", false, OffsetDateTime.now(), existing.version());
        assertThat(updated).isEqualTo(1);

        int failed = userMapper.updateUser(userId, "Another", true, OffsetDateTime.now(), existing.version());
        assertThat(failed).isZero();
    }
}
