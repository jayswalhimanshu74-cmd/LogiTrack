package com.example.sales.Inventory.Management.System.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Schema(name = "RegisterRequest",
        description = "Request payload for creating a new user account. An email verification link is sent after registration.")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

    @Schema(description = "User's full name", example = "Jane Smith", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Full name is required")
    private String fullName;

    @Schema(description = "User's email address — used as login credential and for notifications",
            example = "jane@logitrack.io", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @Schema(description = "Account password (min 8 characters recommended)",
            example = "SecurePass@2025", requiredMode = Schema.RequiredMode.REQUIRED)
    private String password;

    @Schema(description = "Pre-hashed password (alternative to password field — only one is required)",
            example = "$2a$10$...", hidden = true)
    private String passwordHash;

    @Schema(description = "User's contact phone number",
            example = "+91-9876543210", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Phone number is required")
    private String phone;

    @Schema(description = "User role — defaults to STAFF if not provided",
            example = "ADMIN",
            allowableValues = {"ADMIN", "MANAGER", "STAFF"})
    private String role;

    public String getEffectivePassword() {
        return password != null ? password : passwordHash;
    }
}
