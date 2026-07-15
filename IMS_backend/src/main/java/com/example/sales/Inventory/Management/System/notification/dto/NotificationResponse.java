package com.example.sales.Inventory.Management.System.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private String type;
    private String severity;
    private String priority;
    @com.fasterxml.jackson.annotation.JsonProperty("isRead")
    private boolean read;
    private Long recipientId;
    private String recipientFullName;
    private Long referenceId;
    private String referenceType;
    private String metadata;
    private LocalDateTime createdAt;
}
