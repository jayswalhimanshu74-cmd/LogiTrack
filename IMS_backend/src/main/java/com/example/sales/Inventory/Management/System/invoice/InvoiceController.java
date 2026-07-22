package com.example.sales.Inventory.Management.System.invoice;

import com.example.sales.Inventory.Management.System.invoice.dto.InvoiceRequest;
import com.example.sales.Inventory.Management.System.invoice.dto.InvoiceResponse;
import com.example.sales.Inventory.Management.System.invoice.dto.InvoiceStatisticsResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Tag(name = "Invoices",
        description = "Invoice lifecycle management: generate from sales orders or create manually, "
                + "update status, send via email, and retrieve statistics. "
                + "Use the Invoice PDF tag for binary PDF operations. Requires JWT authentication.")
@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @Operation(
            summary = "Create a manual invoice",
            description = """
                    Creates an invoice manually — use this when the invoice is not linked to a sales order.
                    For invoice generation from an existing sale, use `POST /api/invoices/generate/{saleId}`.
                    
                    **Invoice status values:** `DRAFT` | `SENT` | `PAID` | `OVERDUE` | `CANCELLED`
                    
                    **Payment status values:** `PENDING` | `PAID` | `CANCELLED`
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Invoice created",
                    content = @Content(schema = @Schema(implementation = InvoiceResponse.class),
                            examples = @ExampleObject(value = """
                                    {
                                      "id": 201,
                                      "invoiceNo": "INV-2025-201",
                                      "customerName": "Rohan Mehta",
                                      "customerEmail": "rohan@gmail.com",
                                      "status": "DRAFT",
                                      "paymentStatus": "PENDING",
                                      "invoiceDate": "2025-07-15",
                                      "dueDate": "2025-08-14",
                                      "totalAmount": 7998.00,
                                      "saleId": null
                                    }"""))),
            @ApiResponse(responseCode = "400", description = "Validation error"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "409", description = "Invoice number already exists")
    })
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping
    public ResponseEntity<InvoiceResponse> createInvoice(@Valid @RequestBody InvoiceRequest request) {
        InvoiceResponse response = invoiceService.createInvoice(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "Generate invoice from a sales order",
            description = """
                    Automatically generates a structured invoice from an existing sales order.
                    All line items, customer data, totals, and tax calculations are populated
                    directly from the sale record.
                    
                    The invoice number is auto-generated in the format `INV-YYYY-NNN`.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Invoice generated from sale",
                    content = @Content(schema = @Schema(implementation = InvoiceResponse.class))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Sales order not found with provided ID"),
            @ApiResponse(responseCode = "409", description = "Invoice already exists for this sale")
    })
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping("/generate/{saleId}")
    public ResponseEntity<InvoiceResponse> generateInvoiceFromSale(
            @Parameter(description = "ID of the sales order to generate the invoice from", required = true, example = "501")
            @PathVariable Long saleId) {
        InvoiceResponse response = invoiceService.generateInvoiceFromSale(saleId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "List and filter invoices",
            description = """
                    Returns a paginated, filterable list of invoices.
                    
                    **Filter parameters:**
                    - `search` — matches invoice number or customer name
                    - `status` — `DRAFT` | `SENT` | `PAID` | `OVERDUE` | `CANCELLED`
                    - `paymentStatus` — `PENDING` | `PAID` | `CANCELLED`
                    - `startDate` / `endDate` — invoice date range (`yyyy-MM-dd`)
                    
                    **Pagination:** `?page=0&size=20&sort=invoiceDate,desc`
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Paginated invoice list returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping
    public ResponseEntity<Page<InvoiceResponse>> getFilteredInvoices(
            @Parameter(description = "Search by invoice number or customer name") @RequestParam(required = false) String search,
            @Parameter(description = "Invoice status: DRAFT, SENT, PAID, OVERDUE, CANCELLED") @RequestParam(required = false) String status,
            @Parameter(description = "Payment status: PENDING, PAID, CANCELLED") @RequestParam(required = false) String paymentStatus,
            @Parameter(description = "Range start date (yyyy-MM-dd)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "Range end date (yyyy-MM-dd)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        Page<InvoiceResponse> response = invoiceService.getFilteredInvoices(search, status, paymentStatus, startDate, endDate, pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Search invoices",
            description = "Alias endpoint for the main filter — same parameters and behavior."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Search results returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/search")
    public ResponseEntity<Page<InvoiceResponse>> searchInvoices(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        Page<InvoiceResponse> response = invoiceService.getFilteredInvoices(search, status, paymentStatus, startDate, endDate, pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get invoice statistics",
            description = "Returns aggregate invoice KPIs: total count, total value, count by status, overdue amount."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Statistics returned",
                    content = @Content(schema = @Schema(implementation = InvoiceStatisticsResponse.class))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/statistics")
    public ResponseEntity<InvoiceStatisticsResponse> getInvoiceStatistics() {
        InvoiceStatisticsResponse stats = invoiceService.getInvoiceStatistics();
        return ResponseEntity.ok(stats);
    }

    @Operation(
            summary = "Get recent invoices",
            description = "Returns the 10 most recent invoices sorted by invoice date descending."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Recent invoice list returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/recent")
    public ResponseEntity<List<InvoiceResponse>> getRecentInvoices() {
        List<InvoiceResponse> response = invoiceService.getRecentInvoices();
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get an invoice by ID",
            description = "Retrieves full invoice details including all line items, tax breakdown, and linked sale reference."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Invoice found",
                    content = @Content(schema = @Schema(implementation = InvoiceResponse.class))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Invoice not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getInvoiceById(
            @Parameter(description = "Invoice ID", required = true, example = "201")
            @PathVariable Long id) {
        InvoiceResponse response = invoiceService.getInvoiceById(id);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Update an invoice",
            description = "Updates all invoice fields. Full replacement — provide all fields even if unchanged."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Invoice updated",
                    content = @Content(schema = @Schema(implementation = InvoiceResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation error"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Invoice not found")
    })
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<InvoiceResponse> updateInvoice(
            @Parameter(description = "Invoice ID to update", required = true, example = "201")
            @PathVariable Long id,
            @Valid @RequestBody InvoiceRequest request) {
        InvoiceResponse response = invoiceService.updateInvoice(id, request);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Update invoice status only",
            description = """
                    Lightweight status update — only changes the invoice status field without a full update payload.
                    
                    **Valid transitions:** `DRAFT → SENT → PAID` | `* → CANCELLED`
                    
                    Changing status to `OVERDUE` is also supported for manual overdue marking.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Status updated",
                    content = @Content(schema = @Schema(implementation = InvoiceResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid status value"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Invoice not found")
    })
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PutMapping("/{id}/status")
    public ResponseEntity<InvoiceResponse> updateInvoiceStatus(
            @Parameter(description = "Invoice ID", required = true, example = "201")
            @PathVariable Long id,
            @Parameter(description = "New status: DRAFT, SENT, PAID, OVERDUE, CANCELLED", required = true, example = "SENT")
            @RequestParam String status) {
        InvoiceResponse response = invoiceService.updateInvoiceStatus(id, status);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Delete an invoice",
            description = "Permanently deletes an invoice. This action cannot be undone."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Invoice deleted",
                    content = @Content(examples = @ExampleObject(value = """
                            { "message": "Deleted Invoice with id: 201" }"""))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Invoice not found")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteInvoice(
            @Parameter(description = "Invoice ID to delete", required = true, example = "201")
            @PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Deleted Invoice with id: " + id);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Email invoice to customer",
            description = """
                    Sends the invoice as a **PDF email attachment** to the customer's registered email address.
                    The email includes a professional invoice template with the StockMAster branding.
                    Invoice status is updated to `SENT` after successful dispatch.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Invoice email sent",
                    content = @Content(examples = @ExampleObject(value = """
                            { "message": "Invoice email sent successfully." }"""))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Invoice not found"),
            @ApiResponse(responseCode = "500", description = "Mail server error — email delivery failed")
    })
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping("/{id}/send")
    public ResponseEntity<Map<String, String>> sendInvoiceEmail(
            @Parameter(description = "Invoice ID to email", required = true, example = "201")
            @PathVariable Long id) {
        invoiceService.sendInvoiceEmail(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Invoice email sent successfully.");
        return ResponseEntity.ok(response);
    }
}
