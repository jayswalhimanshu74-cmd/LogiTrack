package com.example.sales.Inventory.Management.System.movement;

import com.example.sales.Inventory.Management.System.audit.AuditEvent;
import com.example.sales.Inventory.Management.System.exception.ResourceNotFoundException;
import com.example.sales.Inventory.Management.System.movement.dto.*;
import com.example.sales.Inventory.Management.System.product.Product;
import com.example.sales.Inventory.Management.System.product.ProductRepository;
import com.example.sales.Inventory.Management.System.user.User;
import com.example.sales.Inventory.Management.System.user.UserRepository;
import com.example.sales.Inventory.Management.System.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockMovementService {

    private final StockMovementRepository stockMovementRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final NotificationService notificationService;

    @Transactional
    public StockMovement recordMovement(Product product, Integer previousQty, Integer newQty, 
                                        MovementType type, String referenceNo, User user, String remarks) {
        StockMovement movement = new StockMovement();
        movement.setMovementNo("SM-" + System.nanoTime() % 100000000000L);
        movement.setReferenceNo(referenceNo);
        movement.setProduct(product);
        movement.setPreviousQuantity(previousQty);
        movement.setNewQuantity(newQty);
        movement.setDifference(newQty - previousQty);
        movement.setMovementType(type);
        movement.setPerformedBy(user);
        movement.setRemarks(remarks);
        movement.setTimestamp(LocalDateTime.now());

        StockMovement saved = stockMovementRepository.save(movement);

        // Audit Integration
        publishAuditEvent(saved, user);

        // Automated Notification Checks on Stock Transitions
        checkStockAlerts(product, previousQty, newQty);

        return saved;
    }

    private void checkStockAlerts(Product product, int previousQty, int newQty) {
        int reorder = product.getReorderLevel() != null ? product.getReorderLevel() : 10;
        double normalThreshold = reorder * 1.2;
        boolean isLowStock = newQty <= normalThreshold;
        Boolean alertSent = product.getLowStockAlertSent();
        if (alertSent == null) {
            alertSent = false;
        }

        if (isLowStock) {
            if (!alertSent) {
                String priority;
                String severity;
                if (newQty <= reorder * 0.2) {
                    priority = "CRITICAL";
                    severity = "ERROR";
                } else if (newQty <= reorder) {
                    priority = "HIGH";
                    severity = "WARNING";
                } else {
                    priority = "NORMAL";
                    severity = "INFO";
                }

                String title = "Low Stock Alert: " + product.getName();
                String message = String.format("Product '%s' (SKU: %s) has low stock. Current Stock: %d, Reorder Level: %d. Priority: %s at %s",
                        product.getName(), product.getSku(), newQty, reorder, priority, 
                        java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").format(LocalDateTime.now()));

                notificationService.sendSystemAlert(
                        title,
                        message,
                        "LOW_STOCK",
                        severity,
                        priority
                );

                product.setLowStockAlertSent(true);
                productRepository.save(product);
            }
        } else {
            if (alertSent) {
                product.setLowStockAlertSent(false);
                productRepository.save(product);
            }
        }
    }

    private void publishAuditEvent(StockMovement movement, User user) {
        String description = String.format("Stock movement registered: %s for product '%s' (%s). Qty diff: %d (New total: %d)",
                movement.getMovementType(), movement.getProduct().getName(), movement.getProduct().getSku(),
                movement.getDifference(), movement.getNewQuantity());

        AuditEvent event = AuditEvent.builder()
                .userId(user != null ? user.getId() : null)
                .userName(user != null ? user.getFullName() : "System")
                .userEmail(user != null ? user.getEmail() : "system@logitrack.com")
                .role(user != null ? user.getRole().name() : "SYSTEM")
                .action("STOCK_MOVEMENT_LOGGED")
                .entityName("STOCK_MOVEMENT")
                .entityId(movement.getId())
                .description(description)
                .oldValue(String.valueOf(movement.getPreviousQuantity()))
                .newValue(String.valueOf(movement.getNewQuantity()))
                .ipAddress("127.0.0.1")
                .userAgent("System Interceptor")
                .requestMethod("INTERNAL")
                .requestUri("/internal/stock-movement")
                .status("SUCCESS")
                .timestamp(LocalDateTime.now())
                .build();

        eventPublisher.publishEvent(event);
    }

    @Transactional
    public StockMovementResponse adjustStock(StockAdjustmentRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        User user = getAuthenticatedUser();
        int previousQty = product.getQuantityInStock();
        int newQty = previousQty + request.getDifference();

        if (newQty < 0) {
            throw new IllegalArgumentException("Target quantity cannot be negative");
        }

        product.setQuantityInStock(newQty);
        productRepository.save(product);

        MovementType mType = MovementType.valueOf(request.getType().toUpperCase());
        StockMovement movement = recordMovement(product, previousQty, newQty, mType, "ADJ-" + System.currentTimeMillis() % 100000L, user, request.getRemarks());

        return mapToResponse(movement);
    }

    @Transactional(readOnly = true)
    public Page<StockMovementResponse> getFilteredMovements(Long productId, String movementType, Long performedById,
                                                            LocalDateTime startDate, LocalDateTime endDate, String search, Pageable pageable) {
        MovementType type = (movementType != null && !movementType.trim().isEmpty()) ? MovementType.valueOf(movementType.toUpperCase()) : null;
        return stockMovementRepository.findFiltered(productId, type, performedById, startDate, endDate, search, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<StockMovementResponse> getProductTimeline(Long productId, Pageable pageable) {
        return stockMovementRepository.findFiltered(productId, null, null, null, null, null, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<StockMovementResponse> getUserTimeline(Long userId, Pageable pageable) {
        return stockMovementRepository.findFiltered(null, null, userId, null, null, null, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public MovementSummaryResponse getMovementSummary() {
        List<MostAdjustedProductDto> mostAdjusted = stockMovementRepository.findMostAdjustedProducts(PageRequest.of(0, 5));
        
        List<InventoryFlowDto> flow = stockMovementRepository.getRawInventoryFlow().stream()
                .map(row -> new InventoryFlowDto(
                        row[0].toString(),
                        ((Number) row[1]).longValue(),
                        ((Number) row[2]).longValue()
                )).collect(Collectors.toList());

        List<StockAgingDto> aging = stockMovementRepository.getRawStockAging(PageRequest.of(0, 5)).stream()
                .map(row -> new StockAgingDto(
                        row[0].toString(),
                        row[1].toString(),
                        ((Number) row[2]).intValue(),
                        (LocalDateTime) row[3]
                )).collect(Collectors.toList());

        long totalIncoming = stockMovementRepository.sumTotalIncoming();
        long totalOutgoing = Math.abs(stockMovementRepository.sumTotalOutgoing());

        return new MovementSummaryResponse(mostAdjusted, flow, aging, totalIncoming, totalOutgoing);
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return userRepository.findByEmail(auth.getName()).orElse(null);
        }
        return null;
    }

    public StockMovementResponse mapToResponse(StockMovement sm) {
        return new StockMovementResponse(
                sm.getId(),
                sm.getMovementNo(),
                sm.getReferenceNo(),
                sm.getProduct().getId(),
                sm.getProduct().getName(),
                sm.getProduct().getSku(),
                sm.getPreviousQuantity(),
                sm.getNewQuantity(),
                sm.getDifference(),
                sm.getMovementType().name(),
                sm.getPerformedBy() != null ? sm.getPerformedBy().getId() : null,
                sm.getPerformedBy() != null ? sm.getPerformedBy().getFullName() : "System",
                sm.getTimestamp(),
                sm.getRemarks()
        );
    }
}
