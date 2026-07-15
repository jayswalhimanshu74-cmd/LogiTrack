package com.example.sales.Inventory.Management.System.scheduler;

import com.example.sales.Inventory.Management.System.invoice.Invoice;
import com.example.sales.Inventory.Management.System.invoice.InvoiceRepository;
import com.example.sales.Inventory.Management.System.notification.NotificationRepository;
import com.example.sales.Inventory.Management.System.notification.event.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class InvoiceOverdueChecker {

    private final InvoiceRepository invoiceRepository;
    private final NotificationRepository notificationRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Scheduled(fixedRateString = "${app.scheduler.overdue-check-rate-ms:60000}")
    @Transactional
    public void checkOverdueInvoices() {
        log.info("Running overdue invoice background checker job...");
        
        LocalDate overdueThreshold = LocalDate.now().minusDays(14);
        List<Invoice> unpaidInvoices = invoiceRepository.findAll().stream()
                .filter(inv -> !"PAID".equalsIgnoreCase(inv.getStatus()) 
                        && !"PAID".equalsIgnoreCase(inv.getPaymentStatus())
                        && !"CANCELLED".equalsIgnoreCase(inv.getStatus()))
                .filter(inv -> inv.getInvoiceDate() != null && inv.getInvoiceDate().isBefore(overdueThreshold))
                .toList();

        for (Invoice invoice : unpaidInvoices) {
            boolean alreadyNotified = notificationRepository.existsByTypeAndReferenceIdAndReferenceType(
                    "INVOICE_OVERDUE", invoice.getId(), "INVOICE");

            if (!alreadyNotified) {
                log.warn("Overdue invoice detected: {}. Date: {}, Customer: {}", 
                        invoice.getInvoiceNo(), invoice.getInvoiceDate(), invoice.getCustomerName());

                eventPublisher.publishEvent(NotificationEvent.builder()
                        .title("Invoice Overdue: " + invoice.getInvoiceNo())
                        .message(String.format("Invoice %s for customer %s is overdue. Total: $%s", 
                                invoice.getInvoiceNo(), invoice.getCustomerName(), invoice.getGrandTotal()))
                        .type("INVOICE_OVERDUE")
                        .severity("ERROR")
                        .priority("HIGH")
                        .recipient(invoice.getCreatedBy())
                        .referenceId(invoice.getId())
                        .referenceType("INVOICE")
                        .build());
            }
        }
    }
}
