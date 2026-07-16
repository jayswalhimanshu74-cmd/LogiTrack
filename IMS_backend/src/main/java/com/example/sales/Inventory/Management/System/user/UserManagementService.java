package com.example.sales.Inventory.Management.System.user;

import com.example.sales.Inventory.Management.System.audit.AuditEvent;
import com.example.sales.Inventory.Management.System.audit.AuditLogService;
import com.example.sales.Inventory.Management.System.exception.ResourceNotFoundException;
import com.example.sales.Inventory.Management.System.user.dto.ChangeRoleRequest;
import com.example.sales.Inventory.Management.System.user.dto.UserSummaryResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * User Management Service — ADMIN-only operations.
 *
 * Security rules enforced at service layer:
 *  1. Admin cannot remove their own ADMIN role.
 *  2. Cannot delete the last ADMIN account.
 *  3. Cannot disable the last ADMIN account.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final UserRepository    userRepository;
    private final PasswordEncoder   passwordEncoder;
    private final AuditLogService   auditLogService;

    // ── Query ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<UserSummaryResponse> getUsers(String search, String roleFilter,
                                              Boolean active, Pageable pageable) {
        Role role = null;
        if (roleFilter != null && !roleFilter.isBlank()) {
            try { role = Role.valueOf(roleFilter.toUpperCase()); }
            catch (IllegalArgumentException ignored) { /* invalid role string — ignore */ }
        }
        return userRepository.findWithFilters(search, role, active, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public UserSummaryResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    // ── Role Change ────────────────────────────────────────────────────────────

    @Transactional
    public UserSummaryResponse changeRole(Long targetId, ChangeRoleRequest request) {
        String callerEmail = currentEmail();
        User caller = userRepository.findByEmail(callerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));

        User target = findOrThrow(targetId);

        // Guard: admin cannot demote their own account
        if (caller.getId().equals(target.getId())) {
            throw new AccessDeniedException("You cannot change your own role.");
        }

        Role newRole;
        try {
            newRole = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + request.getRole());
        }

        // Guard: don't remove last admin
        if (target.getRole() == Role.ADMIN && newRole != Role.ADMIN) {
            long adminCount = userRepository.countByRole(Role.ADMIN);
            if (adminCount <= 1) {
                throw new AccessDeniedException("Cannot demote the last ADMIN account.");
            }
        }

        String oldRole = target.getRole().name();
        target.setRole(newRole);
        userRepository.save(target);

        auditLogService.saveEvent(AuditEvent.builder()
                .userId(caller.getId())
                .userName(caller.getFullName())
                .userEmail(callerEmail)
                .role(caller.getRole().name())
                .action("ROLE_CHANGE")
                .entityName("USER")
                .entityId(targetId)
                .description(String.format("Changed role of %s from %s to %s",
                        target.getEmail(), oldRole, newRole))
                .oldValue(oldRole)
                .newValue(newRole.name())
                .status("SUCCESS")
                .build());

        log.info("ROLE_CHANGE: {} → {} by {}", target.getEmail(), newRole, callerEmail);
        return toResponse(target);
    }

    // ── Enable / Disable ───────────────────────────────────────────────────────

    @Transactional
    public UserSummaryResponse setActive(Long targetId, boolean enable) {
        String callerEmail = currentEmail();
        User caller = userRepository.findByEmail(callerEmail).orElseThrow();
        User target = findOrThrow(targetId);

        // Guard: can't disable last admin
        if (!enable && target.getRole() == Role.ADMIN) {
            long adminCount = userRepository.countByRole(Role.ADMIN);
            if (adminCount <= 1) {
                throw new AccessDeniedException("Cannot disable the last ADMIN account.");
            }
        }

        target.setActive(enable);
        userRepository.save(target);

        String action = enable ? "USER_ENABLED" : "USER_DISABLED";
        auditLogService.saveEvent(AuditEvent.builder()
                .userId(caller.getId())
                .userName(caller.getFullName())
                .userEmail(callerEmail)
                .role(caller.getRole().name())
                .action(action)
                .entityName("USER")
                .entityId(targetId)
                .description((enable ? "Enabled" : "Disabled") + " user: " + target.getEmail())
                .status("SUCCESS")
                .build());

        return toResponse(target);
    }

    // ── Delete ─────────────────────────────────────────────────────────────────

    @Transactional
    public void deleteUser(Long targetId) {
        String callerEmail = currentEmail();
        User caller = userRepository.findByEmail(callerEmail).orElseThrow();
        User target = findOrThrow(targetId);

        // Guard: cannot delete self
        if (caller.getId().equals(target.getId())) {
            throw new AccessDeniedException("You cannot delete your own account.");
        }

        // Guard: cannot delete last admin
        if (target.getRole() == Role.ADMIN) {
            long adminCount = userRepository.countByRole(Role.ADMIN);
            if (adminCount <= 1) {
                throw new AccessDeniedException("Cannot delete the last ADMIN account.");
            }
        }

        auditLogService.saveEvent(AuditEvent.builder()
                .userId(caller.getId())
                .userName(caller.getFullName())
                .userEmail(callerEmail)
                .role(caller.getRole().name())
                .action("USER_DELETED")
                .entityName("USER")
                .entityId(targetId)
                .description("Deleted user: " + target.getEmail() + " (" + target.getRole() + ")")
                .status("SUCCESS")
                .build());

        userRepository.delete(target);
        log.info("USER_DELETED: {} by {}", target.getEmail(), callerEmail);
    }

    // ── Reset Password ─────────────────────────────────────────────────────────

    @Transactional
    public String resetPassword(Long targetId) {
        String callerEmail = currentEmail();
        User caller = userRepository.findByEmail(callerEmail).orElseThrow();
        User target = findOrThrow(targetId);

        // Generate a one-time temporary password
        String tempPassword = "Temp@" + UUID.randomUUID().toString().substring(0, 8);
        target.setPasswordHash(passwordEncoder.encode(tempPassword));
        userRepository.save(target);

        auditLogService.saveEvent(AuditEvent.builder()
                .userId(caller.getId())
                .userName(caller.getFullName())
                .userEmail(callerEmail)
                .role(caller.getRole().name())
                .action("PASSWORD_RESET")
                .entityName("USER")
                .entityId(targetId)
                .description("Admin reset password for: " + target.getEmail())
                .status("SUCCESS")
                .build());

        return tempPassword;
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private User findOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    private String currentEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private UserSummaryResponse toResponse(User u) {
        return UserSummaryResponse.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .role(u.getRole().name())
                .active(u.isActive())
                .verified(u.isVerified())
                .profileImageUrl(u.getProfileImageUrl())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();
    }
}
