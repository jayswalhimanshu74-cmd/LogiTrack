package com.example.sales.Inventory.Management.System.scheduler;

import com.example.sales.Inventory.Management.System.product.Product;
import com.example.sales.Inventory.Management.System.product.ProductRepository;
import com.example.sales.Inventory.Management.System.notification.event.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class LowStockScanner {

    private final ProductRepository productRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Scheduled(fixedRateString = "${app.scheduler.low-stock-rate-ms:60000}")
    @Transactional
    public void scanLowStock() {
        log.info("Running low stock background scanner job...");
        List<Product> products = productRepository.findAll();
        
        for (Product product : products) {
            int currentStock = product.getQuantityInStock() != null ? product.getQuantityInStock() : 0;
            int reorderLevel = product.getReorderLevel() != null ? product.getReorderLevel() : 0;
            boolean alreadySent = product.getLowStockAlertSent() != null && product.getLowStockAlertSent();

            if (currentStock <= reorderLevel) {
                if (!alreadySent) {
                    log.warn("Low stock detected for SKU: {}. Current: {}, Reorder Level: {}", product.getSku(), currentStock, reorderLevel);
                    
                    eventPublisher.publishEvent(NotificationEvent.builder()
                            .title("Low Stock Alert: " + product.getName())
                            .message(String.format("Product %s (SKU: %s) is running low on stock. Current: %d, Reorder Level: %d", 
                                    product.getName(), product.getSku(), currentStock, reorderLevel))
                            .type("LOW_STOCK")
                            .severity("WARNING")
                            .priority("HIGH")
                            .referenceId(product.getId())
                            .referenceType("PRODUCT")
                            .build());

                    product.setLowStockAlertSent(true);
                    productRepository.save(product);
                }
            } else {
                if (alreadySent) {
                    log.info("Stock replenished for SKU: {}. Current: {}, Resetting alert status.", product.getSku(), currentStock);
                    product.setLowStockAlertSent(false);
                    productRepository.save(product);
                }
            }
        }
    }
}
