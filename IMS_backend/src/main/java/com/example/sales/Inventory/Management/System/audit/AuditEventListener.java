package com.example.sales.Inventory.Management.System.audit;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuditEventListener {

    private final AuditLogService auditLogService;

    @Async
    @EventListener
    public void handleAuditEvent(AuditEvent event) {
        try {
            auditLogService.saveEvent(event);
        } catch (Exception e) {
            // Log failure but prevent system crash on async thread
            System.err.println("Async audit log event processing failed: " + e.getMessage());
        }
    }
}
