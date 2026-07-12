package com.example.sales.Inventory.Management.System.invoice;

import com.example.sales.Inventory.Management.System.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InvoicePdfService {

    private static final Logger log = LoggerFactory.getLogger(InvoicePdfService.class);

    private final InvoiceRepository invoiceRepository;

    public InvoicePdfService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    @Transactional(readOnly = true)
    public byte[] generateInvoicePdf(Long invoiceId) {
        log.info("Generating PDF for invoice ID: {}", invoiceId);

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + invoiceId));

        try {
            return InvoiceTemplateBuilder.buildPdf(invoice);
        } catch (Exception e) {
            log.error("Error building PDF for invoice ID {}: {}", invoiceId, e.getMessage(), e);
            throw new RuntimeException("Failed to generate PDF invoice", e);
        }
    }
}
