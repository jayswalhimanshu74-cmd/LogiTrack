package com.example.sales.Inventory.Management.System.sales.dto;

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

@Schema(name = "SaleRequest",
        description = "Request payload for creating or updating a sales order. "
                + "Stock is automatically decremented upon creation.")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SaleRequest {

    @Schema(description = "Unique sales order number",
            example = "SO-2025-501", maxLength = 30,
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Sale number is required")
    @Size(max = 30, message = "Sale number must not exceed 30 characters")
    private String saleNo;

    @Schema(description = "Customer's full name",
            example = "Rohan Mehta", maxLength = 150,
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Customer name is required")
    @Size(max = 150, message = "Customer name must not exceed 150 characters")
    private String customerName;

    @Schema(description = "Customer contact phone number",
            example = "+91-9123456789", maxLength = 20,
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Customer phone number is required")
    @Size(max = 20, message = "Customer phone must not exceed 20 characters")
    private String customerPhone;

    @Schema(description = "Customer email for invoice delivery",
            example = "rohan@gmail.com", maxLength = 100)
    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Customer email must not exceed 100 characters")
    private String customerEmail;

    @Schema(description = "Order fulfillment status",
            example = "CONFIRMED",
            allowableValues = {"PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"},
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Order status is required")
    private String status;

    @Schema(description = "Payment collection status",
            example = "PAID",
            allowableValues = {"PENDING", "PAID", "REFUNDED"},
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Payment status is required")
    private String paymentStatus;

    @Schema(description = "Payment method used by the customer",
            example = "UPI",
            allowableValues = {"CASH", "UPI", "CARD", "BANK_TRANSFER"},
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Payment method is required")
    private String paymentMethod;

    @Schema(description = "Additional notes or delivery instructions",
            example = "Deliver between 10am-6pm only", maxLength = 1000)
    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    @Schema(description = "Date the sale was placed (ISO date: yyyy-MM-dd)",
            example = "2025-07-15",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Sale date is required")
    private LocalDate saleDate;

    @Schema(description = "List of products sold — must contain at least one item",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotEmpty(message = "Sale items list cannot be empty")
    @Valid
    private List<SaleItemRequest> items;
}
