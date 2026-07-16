package com.example.sales.Inventory.Management.System.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** Request body to change a user's role. */
@Data
public class ChangeRoleRequest {

    /** One of: ADMIN, MANAGER, STAFF */
    @NotBlank(message = "Role is required")
    private String role;
}
