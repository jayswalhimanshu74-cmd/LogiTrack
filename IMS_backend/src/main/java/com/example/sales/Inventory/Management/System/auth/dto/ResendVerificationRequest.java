package com.example.sales.Inventory.Management.System.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Schema(name = "ResendVerificationRequest",
        description = "Request to resend the email verification link to an unverified account.")
@Getter
@Setter
@NoArgsConstructor
public class ResendVerificationRequest {

    @Schema(description = "Email address of the unverified account",
            example = "jane@logitrack.io",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
}
