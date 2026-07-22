package com.example.sales.Inventory.Management.System.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Schema(name = "AuthResponse",
        description = "Authentication response returned after successful login or registration. "
                + "The token field is a JWT Bearer token — use it in the Authorization header as: Bearer <token>")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    @Schema(description = "JWT Bearer token — valid for 24 hours",
            example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqYW5lQGxvZ2l0cmFjay5pbyIsImlhdCI6MTcyMTAyMDAwMCwiZXhwIjoxNzIxMTA2NDAwfQ.abc123")
    private String token;

    @Schema(description = "User's full name", example = "Jane Smith")
    private String fullName;

    @Schema(description = "User's email address", example = "jane@stockmaster.io")
    private String email;

    @Schema(description = "User's role in the system", example = "ADMIN",
            allowableValues = {"ADMIN", "MANAGER", "STAFF"})
    private String role;
}
