package com.example.sales.Inventory.Management.System.notification;

import com.example.sales.Inventory.Management.System.exception.ResourceNotFoundException;
import com.example.sales.Inventory.Management.System.notification.dto.NotificationResponse;
import com.example.sales.Inventory.Management.System.user.User;
import com.example.sales.Inventory.Management.System.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public NotificationResponse sendNotification(String title, String message, String type, 
                                                 String severity, String priority, User recipient) {
        return sendNotification(title, message, type, severity, priority, recipient, null, null, null);
    }

    @Transactional
    public NotificationResponse sendNotification(String title, String message, String type, 
                                                 String severity, String priority, User recipient,
                                                 Long referenceId, String referenceType, String metadata) {
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setSeverity(severity);
        notification.setPriority(priority);
        notification.setRecipient(recipient);
        notification.setReferenceId(referenceId);
        notification.setReferenceType(referenceType);
        notification.setMetadata(metadata);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);

        Notification saved = notificationRepository.save(notification);
        return mapToResponse(saved);
    }

    @Transactional
    public NotificationResponse sendSystemAlert(String title, String message, String type, 
                                                String severity, String priority) {
        return sendNotification(title, message, type, severity, priority, null, null, null, null);
    }

    @Transactional
    public NotificationResponse sendSystemAlert(String title, String message, String type, 
                                                String severity, String priority,
                                                Long referenceId, String referenceType, String metadata) {
        return sendNotification(title, message, type, severity, priority, null, referenceId, referenceType, metadata);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(Boolean isRead, String severity, String priority, Pageable pageable) {
        User currentUser = getAuthenticatedUser();
        Long userId = currentUser != null ? currentUser.getId() : null;

        return notificationRepository.findFilteredByRecipient(userId, isRead, severity, priority, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return 0;
        }
        return notificationRepository.countUnreadByRecipient(currentUser.getId());
    }

    @Transactional
    public NotificationResponse markAsRead(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        n.setRead(true);
        Notification saved = notificationRepository.save(n);
        return mapToResponse(saved);
    }

    @Transactional
    public void markAllAsRead() {
        User currentUser = getAuthenticatedUser();
        if (currentUser != null) {
            notificationRepository.markAllAsReadByRecipient(currentUser.getId());
        }
    }

    @Transactional
    public void deleteNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notification not found with id: " + id);
        }
        notificationRepository.deleteById(id);
    }

    @Transactional
    public void clearAllNotifications() {
        User currentUser = getAuthenticatedUser();
        if (currentUser != null) {
            notificationRepository.deleteAllByRecipientId(currentUser.getId());
        }
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return userRepository.findByEmail(auth.getName()).orElse(null);
        }
        return null;
    }

    private NotificationResponse mapToResponse(Notification n) {
        NotificationResponse res = new NotificationResponse();
        res.setId(n.getId());
        res.setTitle(n.getTitle());
        res.setMessage(n.getMessage());
        res.setType(n.getType());
        res.setSeverity(n.getSeverity());
        res.setPriority(n.getPriority());
        res.setRead(n.isRead());
        res.setRecipientId(n.getRecipient() != null ? n.getRecipient().getId() : null);
        res.setRecipientFullName(n.getRecipient() != null ? n.getRecipient().getFullName() : "All Users");
        res.setReferenceId(n.getReferenceId());
        res.setReferenceType(n.getReferenceType());
        res.setMetadata(n.getMetadata());
        res.setCreatedAt(n.getCreatedAt());
        return res;
    }
}
