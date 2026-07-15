package com.example.sales.Inventory.Management.System.notification;

import com.example.sales.Inventory.Management.System.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "message", nullable = false, length = 1000)
    private String message;

    @Column(name = "notification_type", nullable = false, length = 50)
    private String type; // LOW_STOCK, OUT_OF_STOCK, PURCHASE_COMPLETED, SALE_COMPLETED, INVOICE_GENERATED, INVOICE_PAID, PASSWORD_CHANGED, EMAIL_VERIFIED, NEW_USER, PROFILE_UPDATED, FAILED_LOGIN, SYSTEM_ALERTS

    @Column(name = "severity", nullable = false, length = 20)
    private String severity; // INFO, WARNING, ERROR, SUCCESS

    @Column(name = "priority", nullable = false, length = 20)
    private String priority; // HIGH, MEDIUM, LOW

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id")
    private User recipient; // null for system-wide / global alerts

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "reference_type", length = 50)
    private String referenceType;

    @Column(name = "metadata", length = 2000)
    private String metadata;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
