package com.example.sales.Inventory.Management.System.invoice;

import com.example.sales.Inventory.Management.System.audit.Audit;
import com.example.sales.Inventory.Management.System.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Invoice PDF",
        description = "Binary PDF operations for invoices: view inline in the browser or download as a file. "
                + "Both endpoints return `application/pdf`. Requires JWT authentication.")
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

    @Operation(
            summary = "View invoice PDF inline",
            description = """
                    Generates and streams the invoice as a PDF for **inline browser rendering**
                    (the browser opens the PDF in a viewer tab rather than downloading it).
                    
                    The PDF is generated on-the-fly using OpenPDF with the StockMAster invoice template.
                    No file is persisted on the server.
                    
                    **Content-Disposition:** `inline; filename="invoice-INV-2025-201.pdf"`
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "PDF binary stream returned",
                    content = @Content(mediaType = "application/pdf")),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Invoice not found")
    })
    @GetMapping("/{id}/pdf")
    @Audit(action = "INVOICE_DOWNLOADED", entityName = "INVOICE", description = "Invoice PDF viewed inline")
    public ResponseEntity<byte[]> getInvoicePdfInline(
            @Parameter(description = "Invoice ID", required = true, example = "201")
            @PathVariable Long id) {
        byte[] pdfBytes = invoicePdfService.generateInvoicePdf(id);
        
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));

        String filename = "invoice-" + invoice.getInvoiceNo() + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @Operation(
            summary = "Download invoice PDF",
            description = """
                    Generates the invoice PDF and prompts the browser to **download** the file
                    rather than rendering it inline.
                    
                    **Content-Disposition:** `attachment; filename="invoice-INV-2025-201.pdf"`
                    
                    Identical to the `/pdf` endpoint except for the Content-Disposition header.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "PDF file download triggered",
                    content = @Content(mediaType = "application/pdf")),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Invoice not found")
    })
    @GetMapping("/{id}/download")
    @Audit(action = "INVOICE_DOWNLOADED", entityName = "INVOICE", description = "Invoice PDF downloaded")
    public ResponseEntity<byte[]> downloadInvoicePdf(
            @Parameter(description = "Invoice ID", required = true, example = "201")
            @PathVariable Long id) {
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
