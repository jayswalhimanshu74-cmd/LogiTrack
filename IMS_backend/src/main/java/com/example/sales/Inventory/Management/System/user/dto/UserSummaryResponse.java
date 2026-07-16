package com.example.sales.Inventory.Management.System.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** Response DTO for the User Management screen (ADMIN only). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryResponse {
    private Long          id;
    private String        fullName;
    private String        email;
    private String        phone;
    private String        role;
    private boolean       active;
    private boolean       verified;
    private String        profileImageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
