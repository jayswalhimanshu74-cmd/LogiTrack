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
public class UserSecurityResponse {
    private String email;
    private boolean verified;
    private String oauthProvider;
    private LocalDateTime lastPasswordChanged;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
