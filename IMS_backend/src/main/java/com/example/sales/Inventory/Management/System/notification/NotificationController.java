package com.example.sales.Inventory.Management.System.notification;

import com.example.sales.Inventory.Management.System.notification.dto.NotificationResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Notifications",
        description = "Real-time notification center for the authenticated user. "
                + "Notifications are generated automatically by system events (low stock alerts, overdue invoices, etc.). "
                + "Supports filtering, individual/bulk mark-as-read, and deletion. Requires JWT authentication.")
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(
            summary = "List notifications",
            description = """
                    Returns a paginated list of notifications for the authenticated user.
                    
                    **Filter parameters (all optional):**
                    - `isRead` — `true` for read-only, `false` for unread-only, omit for all
                    - `severity` — `INFO` | `WARNING` | `CRITICAL`
                    - `priority` — `LOW` | `MEDIUM` | `HIGH` | `URGENT`
                    
                    **Pagination:** `?page=0&size=20&sort=createdAt,desc`
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Paginated notification list returned",
                    content = @Content(schema = @Schema(implementation = NotificationResponse.class),
                            examples = @ExampleObject(value = """
                                    {
                                      "content": [
                                        {
                                          "id": 3001,
                                          "title": "Low Stock Alert",
                                          "message": "Premium Headphones has only 5 units remaining (reorder level: 20)",
                                          "severity": "CRITICAL",
                                          "priority": "HIGH",
                                          "isRead": false,
                                          "createdAt": "2025-07-15T09:00:00"
                                        }
                                      ],
                                      "totalElements": 12,
                                      "unreadCount": 5
                                    }"""))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getNotifications(
            @Parameter(description = "Filter by read status: true (read only) | false (unread only)") @RequestParam(required = false) Boolean isRead,
            @Parameter(description = "Severity filter: INFO, WARNING, CRITICAL") @RequestParam(required = false) String severity,
            @Parameter(description = "Priority filter: LOW, MEDIUM, HIGH, URGENT") @RequestParam(required = false) String priority,
            Pageable pageable) {
        Page<NotificationResponse> list = notificationService.getNotifications(isRead, severity, priority, pageable);
        return ResponseEntity.ok(list);
    }

    @Operation(
            summary = "Get unread notification count",
            description = "Returns the total count of unread notifications for the authenticated user. "
                    + "Use this to display the notification badge count in the UI."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Unread count returned",
                    content = @Content(examples = @ExampleObject(value = "5"))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        return ResponseEntity.ok(notificationService.getUnreadCount());
    }

    @Operation(
            summary = "Mark a notification as read",
            description = "Marks a single notification as read. Returns the updated notification object."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Notification marked as read",
                    content = @Content(schema = @Schema(implementation = NotificationResponse.class))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Notification not found")
    })
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @Parameter(description = "Notification ID", required = true, example = "3001")
            @PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @Operation(
            summary = "Mark all notifications as read",
            description = "Bulk operation — marks all unread notifications for the authenticated user as read."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "All notifications marked as read",
                    content = @Content(examples = @ExampleObject(value = "\"All notifications marked as read\""))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @PutMapping("/read-all")
    public ResponseEntity<String> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok("All notifications marked as read");
    }

    @Operation(
            summary = "Delete a notification",
            description = "Permanently deletes a single notification."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Notification deleted",
                    content = @Content(examples = @ExampleObject(value = "\"Notification deleted\""))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Notification not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNotification(
            @Parameter(description = "Notification ID to delete", required = true, example = "3001")
            @PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok("Notification deleted");
    }

    @Operation(
            summary = "Clear all notifications",
            description = "Permanently deletes **all** notifications for the authenticated user. This action cannot be undone."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "All notifications cleared",
                    content = @Content(examples = @ExampleObject(value = "\"All notifications cleared\""))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @DeleteMapping("/clear")
    public ResponseEntity<String> clearNotifications() {
        notificationService.clearAllNotifications();
        return ResponseEntity.ok("All notifications cleared");
    }
}
