package com.example.sales.Inventory.Management.System.notification.event;

import com.example.sales.Inventory.Management.System.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationService notificationService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleNotificationEvent(NotificationEvent event) {
        try {
            notificationService.sendNotification(
                    event.getTitle(),
                    event.getMessage(),
                    event.getType(),
                    event.getSeverity(),
                    event.getPriority(),
                    event.getRecipient(),
                    event.getReferenceId(),
                    event.getReferenceType(),
                    event.getMetadata()
            );
        } catch (Exception e) {
            System.err.println("Failed to process notification event: " + e.getMessage());
        }
    }
}
