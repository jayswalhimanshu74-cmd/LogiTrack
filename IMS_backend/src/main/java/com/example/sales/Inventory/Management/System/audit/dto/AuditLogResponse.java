package com.example.sales.Inventory.Management.System.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String role;
    private String action;
    private String entityName;
    private Long entityId;
    private String description;
    private String oldValue;
    private String newValue;
    private String ipAddress;
    private String userAgent;
    private String requestMethod;
    private String requestUri;
    private String status;
    private LocalDateTime timestamp;
    private LocalDateTime createdAt;
}
