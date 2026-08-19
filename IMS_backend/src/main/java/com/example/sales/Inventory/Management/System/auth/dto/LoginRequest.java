package com.example.sales.Inventory.Management.System.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Schema(name = "LoginRequest",
        description = "Credentials for user authentication. Returns a JWT Bearer token on success.")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest {

    @Schema(description = "Registered email address", example = "jane@logitrack.io",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Email is required")
    private String email;

    @Schema(description = "Account password", example = "SecurePass@2025",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Password is required")
    private String password;
}
