package com.example.sales.Inventory.Management.System.invoice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Schema(name = "InvoiceRequest",
        description = "Request payload for creating or updating an invoice manually. "
                + "If invoiceNo is omitted, it is auto-generated as INV-YYYY-NNN. "
                + "Alternatively, use POST /api/invoices/generate/{saleId} to auto-create from a sale.")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceRequest {

    @Schema(description = "Invoice number — auto-generated if left blank",
            example = "INV-2025-201", maxLength = 30)
    @Size(max = 30, message = "Invoice number must not exceed 30 characters")
    private String invoiceNo;

    @Schema(description = "Customer's full name",
            example = "Rohan Mehta", maxLength = 150)
    @Size(max = 150, message = "Customer name must not exceed 150 characters")
    private String customerName;

    @Schema(description = "Customer contact phone number",
            example = "+91-9123456789", maxLength = 20)
    @Size(max = 20, message = "Customer phone must not exceed 20 characters")
    private String customerPhone;

    @Schema(description = "Customer email for invoice delivery",
            example = "rohan@gmail.com", maxLength = 100)
    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Customer email must not exceed 100 characters")
    private String customerEmail;

    @Schema(description = "Customer billing address",
            example = "42, MG Road, Bangalore - 560001", maxLength = 500)
    @Size(max = 500, message = "Billing address must not exceed 500 characters")
    private String billingAddress;

    @Schema(description = "Payment method",
            example = "BANK_TRANSFER",
            allowableValues = {"CASH", "UPI", "CARD", "BANK_TRANSFER"})
    private String paymentMethod;

    @Schema(description = "Payment collection status",
            example = "PENDING",
            allowableValues = {"PENDING", "PAID", "PARTIALLY_PAID", "REFUNDED"})
    private String paymentStatus;

    @Schema(description = "Invoice lifecycle status",
            example = "DRAFT",
            allowableValues = {"DRAFT", "ISSUED", "PAID", "OVERDUE", "CANCELLED"})
    private String status;

    @Schema(description = "Additional notes for the invoice",
            example = "Net 30 payment terms", maxLength = 1000)
    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    @Schema(description = "Tax amount applied to the invoice subtotal (e.g. GST)",
            example = "18.00", minimum = "0.0", defaultValue = "0.00")
    @DecimalMin(value = "0.0", message = "Tax must be greater than or equal to 0")
    private BigDecimal tax = BigDecimal.ZERO;

    @Schema(description = "Discount amount deducted from the invoice subtotal",
            example = "500.00", minimum = "0.0", defaultValue = "0.00")
    @DecimalMin(value = "0.0", message = "Discount must be greater than or equal to 0")
    private BigDecimal discount = BigDecimal.ZERO;

    @Schema(description = "Invoice issue date (ISO date: yyyy-MM-dd) — defaults to today if omitted",
            example = "2025-07-15")
    private LocalDate invoiceDate;

    @Schema(description = "ID of the associated sales order (if this invoice links to a sale)",
            example = "501")
    private Long saleId;

    @Schema(description = "Line items to include on the invoice — required for manual invoices")
    @Valid
    private List<InvoiceItemRequest> items;
}
