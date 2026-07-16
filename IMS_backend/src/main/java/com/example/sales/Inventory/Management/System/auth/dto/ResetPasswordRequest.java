package com.example.sales.Inventory.Management.System.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Schema(name = "ResetPasswordRequest",
        description = "Request to reset the user's password using the one-time token from the reset email.")
@Getter
@Setter
@NoArgsConstructor
public class ResetPasswordRequest {

    @Schema(description = "One-time reset token received via email (valid for 15 minutes)",
            example = "a8f3d2e1-5b94-4c6e-b7f1-2d3e4f5a6b7c",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Token is required")
    private String token;

    @Schema(description = "The desired new password (minimum 6 characters)",
            example = "NewSecurePass@2025",
            minLength = 6,
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "New password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String newPassword;
}
