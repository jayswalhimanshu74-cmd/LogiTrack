package com.example.sales.Inventory.Management.System.user;

import com.example.sales.Inventory.Management.System.user.dto.ChangePasswordRequest;
import com.example.sales.Inventory.Management.System.user.dto.UserProfileRequest;
import com.example.sales.Inventory.Management.System.user.dto.UserProfileResponse;
import com.example.sales.Inventory.Management.System.user.dto.UserSecurityResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.example.sales.Inventory.Management.System.audit.Audit;
import org.springframework.context.ApplicationEventPublisher;
import com.example.sales.Inventory.Management.System.notification.event.NotificationEvent;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList("image/jpeg", "image/png", "image/webp");
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "webp");

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(User user) {
        return mapToProfileResponse(user);
    }

    @Transactional
    @Audit(action = "PROFILE_UPDATE", entityName = "USER", description = "Updated user profile details")
    public UserProfileResponse updateProfile(User user, UserProfileRequest request) {
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        User updated = userRepository.save(user);

        eventPublisher.publishEvent(NotificationEvent.builder()
                .title("Profile Updated")
                .message("Your profile contact details have been updated successfully.")
                .type("SYSTEM_ALERT")
                .severity("INFO")
                .priority("LOW")
                .recipient(updated)
                .build());

        return mapToProfileResponse(updated);
    }

    @Transactional
    @Audit(action = "PROFILE_UPDATE", entityName = "USER", description = "Uploaded user avatar image")
    public UserProfileResponse uploadAvatar(User user, MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File exceeds maximum size of 5 MB");
        }

        String mimeType = file.getContentType();
        if (mimeType == null || !ALLOWED_MIME_TYPES.contains(mimeType.toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file format. Supported: JPG, JPEG, PNG, WEBP");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.contains("..")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid filename content");
        }

        String extension = getFileExtension(originalFilename);
        if (extension == null || !ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file extension");
        }

        // Delete previous avatar file if exists on disk
        String oldUrl = user.getProfileImageUrl();
        if (oldUrl != null && oldUrl.startsWith("/uploads/")) {
            try {
                Path oldPath = Paths.get("." + oldUrl);
                Files.deleteIfExists(oldPath);
            } catch (IOException e) {
                // log warning but do not fail
                System.err.println("Failed to delete old avatar: " + e.getMessage());
            }
        }

        // Save new avatar
        try {
            Path uploadDir = Paths.get("./uploads/avatars");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String newFilename = UUID.randomUUID().toString() + "." + extension.toLowerCase();
            Path targetPath = uploadDir.resolve(newFilename);
            Files.copy(file.getInputStream(), targetPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            user.setProfileImageUrl("/uploads/avatars/" + newFilename);
            User updated = userRepository.save(user);

            eventPublisher.publishEvent(NotificationEvent.builder()
                    .title("Avatar Uploaded")
                    .message("Your profile image has been updated successfully.")
                    .type("SYSTEM_ALERT")
                    .severity("INFO")
                    .priority("LOW")
                    .recipient(updated)
                    .build());

            return mapToProfileResponse(updated);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store image file on server");
        }
    }

    @Transactional
    @Audit(action = "PASSWORD_CHANGE", entityName = "USER", description = "Manual password change successful")
    public void changePassword(User user, ChangePasswordRequest request) {
        if ("GOOGLE".equals(user.getOauthProvider()) || "GITHUB".equals(user.getOauthProvider())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OAuth users cannot change passwords locally");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password does not match");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password and password confirmation do not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setLastPasswordChanged(LocalDateTime.now());
        userRepository.save(user);

        // Invalidate active reset tokens
        List<PasswordResetToken> activeTokens = passwordResetTokenRepository.findByUserAndUsedFalse(user);
        for (PasswordResetToken token : activeTokens) {
            token.setUsed(true);
        }
        passwordResetTokenRepository.saveAll(activeTokens);

        eventPublisher.publishEvent(NotificationEvent.builder()
                .title("Password Changed")
                .message("Your account password has been changed successfully.")
                .type("PASSWORD_CHANGED")
                .severity("INFO")
                .priority("HIGH")
                .recipient(user)
                .build());
    }

    @Transactional(readOnly = true)
    public UserSecurityResponse getSecurity(User user) {
        String provider = user.getOauthProvider() != null ? user.getOauthProvider() : "LOCAL";
        return new UserSecurityResponse(
                user.getEmail(),
                user.isVerified(),
                provider,
                user.getLastPasswordChanged(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    private UserProfileResponse mapToProfileResponse(User user) {
        String provider = user.getOauthProvider() != null ? user.getOauthProvider() : "LOCAL";
        return new UserProfileResponse(
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name(),
                user.isVerified(),
                user.isActive(),
                user.getProfileImageUrl(),
                provider,
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    private String getFileExtension(String filename) {
        int lastIndex = filename.lastIndexOf('.');
        if (lastIndex == -1) {
            return null;
        }
        return filename.substring(lastIndex + 1);
    }
}
