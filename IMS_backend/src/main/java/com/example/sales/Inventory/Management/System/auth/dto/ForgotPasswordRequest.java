package com.example.sales.Inventory.Management.System.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Schema(name = "ForgotPasswordRequest",
        description = "Request to initiate the forgot password flow. A reset link is sent to the email if an account exists.")
@Getter
@Setter
@NoArgsConstructor
public class ForgotPasswordRequest {

    @Schema(description = "Registered email address to send the reset link to",
            example = "jane@stockmaster.io",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
}
