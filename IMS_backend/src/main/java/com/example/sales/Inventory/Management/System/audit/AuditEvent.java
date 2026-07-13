package com.example.sales.Inventory.Management.System.audit;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Builder
@ToString
public class AuditEvent {
    private final Long userId;
    private final String userName;
    private final String userEmail;
    private final String role;
    private final String action;
    private final String entityName;
    private final Long entityId;
    private final String description;
    private final String oldValue;
    private final String newValue;
    private final String ipAddress;
    private final String userAgent;
    private final String requestMethod;
    private final String requestUri;
    private final String status;
    private final LocalDateTime timestamp;
}
