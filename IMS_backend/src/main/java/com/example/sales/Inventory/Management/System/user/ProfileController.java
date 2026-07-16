package com.example.sales.Inventory.Management.System.user;

import com.example.sales.Inventory.Management.System.user.dto.ChangePasswordRequest;
import com.example.sales.Inventory.Management.System.user.dto.UserProfileRequest;
import com.example.sales.Inventory.Management.System.user.dto.UserProfileResponse;
import com.example.sales.Inventory.Management.System.user.dto.UserSecurityResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Tag(name = "Profile",
        description = "Authenticated user profile operations: view and update personal info, "
                + "upload profile avatar, change password, and view account security details. "
                + "All endpoints operate on the currently authenticated user's account. "
                + "Requires JWT authentication.")
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @Operation(
            summary = "Get current user profile",
            description = """
                    Returns the full profile of the currently authenticated user.
                    Includes personal info, avatar URL, account status, and role.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Profile returned",
                    content = @Content(schema = @Schema(implementation = UserProfileResponse.class),
                            examples = @ExampleObject(value = """
                                    {
                                      "id": 1,
                                      "fullName": "Jane Smith",
                                      "email": "jane@logitrack.io",
                                      "phone": "+91-9876543210",
                                      "role": "ADMIN",
                                      "avatarUrl": "http://localhost:8080/uploads/avatars/avatar_1.jpg",
                                      "emailVerified": true,
                                      "createdAt": "2025-01-15T09:30:00"
                                    }"""))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping
    public ResponseEntity<UserProfileResponse> getProfile() {
        User user = getAuthenticatedUser();
        UserProfileResponse response = profileService.getProfile(user);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Update current user profile",
            description = """
                    Updates the profile of the currently authenticated user.
                    
                    **Updatable fields:** fullName, phone
                    
                    Email address cannot be changed via this endpoint for security reasons.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Profile updated",
                    content = @Content(schema = @Schema(implementation = UserProfileResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation error — invalid field values"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @PutMapping
    public ResponseEntity<UserProfileResponse> updateProfile(@Valid @RequestBody UserProfileRequest request) {
        User user = getAuthenticatedUser();
        UserProfileResponse response = profileService.updateProfile(user, request);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Upload profile avatar",
            description = """
                    Uploads a profile picture for the currently authenticated user.
                    
                    **Accepted formats:** JPEG, PNG, WEBP
                    
                    **Max file size:** 5 MB (configured in `spring.servlet.multipart.max-file-size`)
                    
                    The avatar is stored in the `/uploads/avatars/` directory and the URL is
                    returned in the response and accessible publicly at `/uploads/**`.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Avatar uploaded — updated profile returned",
                    content = @Content(schema = @Schema(implementation = UserProfileResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid file type or file too large"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @PostMapping(value = "/avatar", consumes = "multipart/form-data")
    public ResponseEntity<UserProfileResponse> uploadAvatar(
            @io.swagger.v3.oas.annotations.Parameter(description = "Avatar image file (JPEG, PNG, WEBP, max 5MB)", required = true)
            @RequestParam("file") MultipartFile file) {
        User user = getAuthenticatedUser();
        UserProfileResponse response = profileService.uploadAvatar(user, file);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Change account password",
            description = """
                    Changes the password of the currently authenticated user.
                    
                    **Requires:**
                    - `currentPassword` — the user's current password for verification
                    - `newPassword` — the desired new password
                    - `confirmPassword` — must match `newPassword`
                    
                    Returns HTTP 204 No Content on success. The existing JWT token remains valid
                    until its natural expiry — the user does not need to re-login immediately.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Password changed successfully"),
            @ApiResponse(responseCode = "400", description = "Current password incorrect or new passwords don't match"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        User user = getAuthenticatedUser();
        profileService.changePassword(user, request);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Get account security information",
            description = """
                    Returns security-related account metadata:
                    - Email verification status
                    - Account creation date
                    - Last login timestamp
                    - Password last changed date
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Security info returned",
                    content = @Content(schema = @Schema(implementation = UserSecurityResponse.class))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/security")
    public ResponseEntity<UserSecurityResponse> getSecurity() {
        User user = getAuthenticatedUser();
        UserSecurityResponse response = profileService.getSecurity(user);
        return ResponseEntity.ok(response);
    }
}
