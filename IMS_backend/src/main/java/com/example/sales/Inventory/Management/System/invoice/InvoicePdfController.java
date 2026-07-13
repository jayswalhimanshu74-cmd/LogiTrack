package com.example.sales.Inventory.Management.System.invoice;

import com.example.sales.Inventory.Management.System.audit.Audit;
import com.example.sales.Inventory.Management.System.exception.ResourceNotFoundException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/invoices")
public class InvoicePdfController {

    private final InvoicePdfService invoicePdfService;
    private final InvoiceRepository invoiceRepository;

    public InvoicePdfController(InvoicePdfService invoicePdfService,
                                InvoiceRepository invoiceRepository) {
        this.invoicePdfService = invoicePdfService;
        this.invoiceRepository = invoiceRepository;
    }

    @GetMapping("/{id}/pdf")
    @Audit(action = "INVOICE_DOWNLOADED", entityName = "INVOICE", description = "Invoice PDF viewed inline")
    public ResponseEntity<byte[]> getInvoicePdfInline(@PathVariable Long id) {
        byte[] pdfBytes = invoicePdfService.generateInvoicePdf(id);
        
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));

        String filename = "invoice-" + invoice.getInvoiceNo() + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/{id}/download")
    @Audit(action = "INVOICE_DOWNLOADED", entityName = "INVOICE", description = "Invoice PDF downloaded")
    public ResponseEntity<byte[]> downloadInvoicePdf(@PathVariable Long id) {
        byte[] pdfBytes = invoicePdfService.generateInvoicePdf(id);

        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));

        String filename = "invoice-" + invoice.getInvoiceNo() + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
