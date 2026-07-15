package com.example.sales.Inventory.Management.System.notification.event;

import com.example.sales.Inventory.Management.System.user.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationEvent {
    private final String title;
    private final String message;
    private final String type;
    private final String severity;
    private final String priority;
    private final User recipient;
    private final Long referenceId;
    private final String referenceType;
    private final String metadata;
}
