package com.example.sales.Inventory.Management.System.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    private String password;
    private String passwordHash;

    @NotBlank(message = "Phone number is required")
    private String phone;

    private String role;

    public String getEffectivePassword() {
        return password != null ? password : passwordHash;
    }
}
