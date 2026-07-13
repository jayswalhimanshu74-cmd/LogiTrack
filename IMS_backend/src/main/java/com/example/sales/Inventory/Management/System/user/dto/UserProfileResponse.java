package com.example.sales.Inventory.Management.System.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private boolean verified;
    private boolean active;
    private String profileImageUrl;
    private String oauthProvider;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
