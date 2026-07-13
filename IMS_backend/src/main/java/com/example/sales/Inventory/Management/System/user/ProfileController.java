package com.example.sales.Inventory.Management.System.user;

import com.example.sales.Inventory.Management.System.user.dto.ChangePasswordRequest;
import com.example.sales.Inventory.Management.System.user.dto.UserProfileRequest;
import com.example.sales.Inventory.Management.System.user.dto.UserProfileResponse;
import com.example.sales.Inventory.Management.System.user.dto.UserSecurityResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

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

    @GetMapping
    public ResponseEntity<UserProfileResponse> getProfile() {
        User user = getAuthenticatedUser();
        UserProfileResponse response = profileService.getProfile(user);
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<UserProfileResponse> updateProfile(@Valid @RequestBody UserProfileRequest request) {
        User user = getAuthenticatedUser();
        UserProfileResponse response = profileService.updateProfile(user, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/avatar")
    public ResponseEntity<UserProfileResponse> uploadAvatar(@RequestParam("file") MultipartFile file) {
        User user = getAuthenticatedUser();
        UserProfileResponse response = profileService.uploadAvatar(user, file);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        User user = getAuthenticatedUser();
        profileService.changePassword(user, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/security")
    public ResponseEntity<UserSecurityResponse> getSecurity() {
        User user = getAuthenticatedUser();
        UserSecurityResponse response = profileService.getSecurity(user);
        return ResponseEntity.ok(response);
    }
}
