package com.example.sales.Inventory.Management.System.invoice;

import com.example.sales.Inventory.Management.System.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.context.ApplicationEventPublisher;
import com.example.sales.Inventory.Management.System.notification.event.NotificationEvent;

@Service
public class InvoicePdfService {

    private static final Logger log = LoggerFactory.getLogger(InvoicePdfService.class);

    private final InvoiceRepository invoiceRepository;
    private final ApplicationEventPublisher eventPublisher;

    public InvoicePdfService(InvoiceRepository invoiceRepository, ApplicationEventPublisher eventPublisher) {
        this.invoiceRepository = invoiceRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(readOnly = true)
    public byte[] generateInvoicePdf(Long invoiceId) {
        log.info("Generating PDF for invoice ID: {}", invoiceId);

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + invoiceId));

        try {
            byte[] pdfBytes = InvoiceTemplateBuilder.buildPdf(invoice);

            eventPublisher.publishEvent(NotificationEvent.builder()
                    .title("Invoice PDF Generated")
                    .message(String.format("PDF document for Invoice %s has been compiled.", invoice.getInvoiceNo()))
                    .type("REPORT_READY")
                    .severity("INFO")
                    .priority("LOW")
                    .referenceId(invoiceId)
                    .referenceType("INVOICE")
                    .build());

            return pdfBytes;
        } catch (Exception e) {
            log.error("Error building PDF for invoice ID {}: {}", invoiceId, e.getMessage(), e);
            throw new RuntimeException("Failed to generate PDF invoice", e);
        }
    }
}
