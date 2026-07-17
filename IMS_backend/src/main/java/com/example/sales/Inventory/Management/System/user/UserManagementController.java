package com.example.sales.Inventory.Management.System.user;

import com.example.sales.Inventory.Management.System.user.dto.ChangeRoleRequest;
import com.example.sales.Inventory.Management.System.user.dto.UserSummaryResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "User Management", description = "Admin-only operations for managing system users, changing roles, disabling accounts, and resetting passwords.")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserManagementController {

    private final UserManagementService userManagementService;

    @Operation(summary = "Get paginated user list with filters")
    @GetMapping
    public ResponseEntity<Page<UserSummaryResponse>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean active,
            Pageable pageable) {
        return ResponseEntity.ok(userManagementService.getUsers(search, role, active, pageable));
    }

    @Operation(summary = "Get detailed user by ID")
    @GetMapping("/{id}")
    public ResponseEntity<UserSummaryResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userManagementService.getById(id));
    }

    @Operation(summary = "Update user role (ADMIN, MANAGER, STAFF)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Role successfully updated"),
            @ApiResponse(responseCode = "400", description = "Invalid role value"),
            @ApiResponse(responseCode = "403", description = "Unauthorized or trying to demote the last ADMIN")
    })
    @PatchMapping("/{id}/role")
    public ResponseEntity<UserSummaryResponse> changeRole(
            @PathVariable Long id,
            @Valid @RequestBody ChangeRoleRequest request) {
        return ResponseEntity.ok(userManagementService.changeRole(id, request));
    }

    @Operation(summary = "Toggle user active status (Enable / Disable)")
    @PatchMapping("/{id}/status")
    public ResponseEntity<UserSummaryResponse> toggleStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        return ResponseEntity.ok(userManagementService.setActive(id, active));
    }

    @Operation(summary = "Admin reset user password (one-time temp password)")
    @PatchMapping("/{id}/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@PathVariable Long id) {
        String tempPassword = userManagementService.resetPassword(id);
        return ResponseEntity.ok(Map.of(
                "message", "Password reset successfully",
                "temporaryPassword", tempPassword
        ));
    }

    @Operation(summary = "Delete user account")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        userManagementService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}
