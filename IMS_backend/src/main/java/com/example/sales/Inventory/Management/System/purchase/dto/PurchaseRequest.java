package com.example.sales.Inventory.Management.System.purchase.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.Email;

@Schema(name = "PurchaseRequest",
        description = "Request payload for creating or updating a purchase order from a supplier.")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseRequest {

    @Schema(description = "Unique purchase order number",
            example = "PO-2025-001", maxLength = 30,
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Purchase number is required")
    @Size(max = 30, message = "Purchase number must not exceed 30 characters")
    private String purchaseNo;

    @Schema(description = "Full name of the supplying company or individual",
            example = "TechSupply India Pvt Ltd", maxLength = 150,
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Supplier name is required")
    @Size(max = 150, message = "Supplier name must not exceed 150 characters")
    private String supplierName;

    @Schema(description = "Supplier contact phone number",
            example = "+91-9876543210", maxLength = 20,
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Supplier phone is required")
    @Size(max = 20, message = "Supplier phone must not exceed 20 characters")
    private String supplierPhone;

    @Schema(description = "Supplier email address for correspondence",
            example = "orders@techsupply.in", maxLength = 100)
    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Supplier email must not exceed 100 characters")
    private String supplierEmail;

    @Schema(description = "Purchase order status",
            example = "PENDING",
            allowableValues = {"PENDING", "RECEIVED", "CANCELLED"},
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Purchase status is required")
    private String status;

    @Schema(description = "Payment status of this purchase order",
            example = "PENDING",
            allowableValues = {"PENDING", "PAID", "CANCELLED"},
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Payment status is required")
    private String paymentStatus;

    @Schema(description = "Payment method used for this purchase",
            example = "BANK_TRANSFER",
            allowableValues = {"CASH", "UPI", "CARD", "BANK_TRANSFER"},
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Payment method is required")
    private String paymentMethod;

    @Schema(description = "Supplier's invoice reference number (optional)",
            example = "SUPP-INV-2025-101", maxLength = 50)
    @Size(max = 50, message = "Invoice number must not exceed 50 characters")
    private String invoiceNo;

    @Schema(description = "Additional notes or instructions for this order",
            example = "Handle with care — fragile electronics", maxLength = 1000)
    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    @Schema(description = "Date the purchase order was placed (ISO date: yyyy-MM-dd)",
            example = "2025-07-15",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Purchase date is required")
    private LocalDate purchaseDate;

    @Schema(description = "List of products being purchased — must contain at least one item",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotEmpty(message = "Purchase items list cannot be empty")
    @Valid
    private List<PurchaseItemRequest> items;
}
