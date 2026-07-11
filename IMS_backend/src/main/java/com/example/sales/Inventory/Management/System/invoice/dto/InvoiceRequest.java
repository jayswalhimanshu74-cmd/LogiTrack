package com.example.sales.Inventory.Management.System.invoice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceRequest {

    @Size(max = 30, message = "Invoice number must not exceed 30 characters")
    private String invoiceNo; // Generates automatically if blank

    @Size(max = 150, message = "Customer name must not exceed 150 characters")
    private String customerName;

    @Size(max = 20, message = "Customer phone must not exceed 20 characters")
    private String customerPhone;

    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Customer email must not exceed 100 characters")
    private String customerEmail;

    @Size(max = 500, message = "Billing address must not exceed 500 characters")
    private String billingAddress;

    private String paymentMethod; // CASH, UPI, CARD, BANK_TRANSFER

    private String paymentStatus; // PENDING, PAID, PARTIALLY_PAID, REFUNDED

    private String status; // DRAFT, ISSUED, PAID, CANCELLED

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    @DecimalMin(value = "0.0", message = "Tax must be greater than or equal to 0")
    private BigDecimal tax = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Discount must be greater than or equal to 0")
    private BigDecimal discount = BigDecimal.ZERO;

    private LocalDate invoiceDate;

    private Long saleId;

    @Valid
    private List<InvoiceItemRequest> items;
}
