package com.example.sales.Inventory.Management.System.notification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT COUNT(n) FROM Notification n WHERE (n.recipient.id = :userId OR n.recipient IS NULL) AND n.read = false")
    long countUnreadByRecipient(@Param("userId") Long userId);

    @Query("SELECT n FROM Notification n WHERE (n.recipient.id = :userId OR n.recipient IS NULL) " +
           "AND (:isRead IS NULL OR n.read = :isRead) " +
           "AND (:severity IS NULL OR n.severity = :severity) " +
           "AND (:priority IS NULL OR n.priority = :priority) " +
           "ORDER BY n.createdAt DESC")
    Page<Notification> findFilteredByRecipient(
            @Param("userId") Long userId,
            @Param("isRead") Boolean isRead,
            @Param("severity") String severity,
            @Param("priority") String priority,
            Pageable pageable
    );

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE (n.recipient.id = :userId OR n.recipient IS NULL) AND n.read = false")
    void markAllAsReadByRecipient(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.recipient.id = :userId")
    void deleteAllByRecipientId(@Param("userId") Long userId);

    boolean existsByTypeAndReferenceIdAndReferenceType(String type, Long referenceId, String referenceType);
}
