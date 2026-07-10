package com.example.sales.Inventory.Management.System.sales.dto;

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

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SaleRequest {

    @NotBlank(message = "Sale number is required")
    @Size(max = 30, message = "Sale number must not exceed 30 characters")
    private String saleNo;

    @NotBlank(message = "Customer name is required")
    @Size(max = 150, message = "Customer name must not exceed 150 characters")
    private String customerName;

    @NotBlank(message = "Customer phone number is required")
    @Size(max = 20, message = "Customer phone must not exceed 20 characters")
    private String customerPhone;

    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Customer email must not exceed 100 characters")
    private String customerEmail;

    @NotBlank(message = "Order status is required")
    private String status; // PENDING, CONFIRMED, COMPLETED, CANCELLED

    @NotBlank(message = "Payment status is required")
    private String paymentStatus; // PENDING, PAID, REFUNDED

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // CASH, UPI, CARD, BANK_TRANSFER

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    @NotNull(message = "Sale date is required")
    private LocalDate saleDate;

    @NotEmpty(message = "Sale items list cannot be empty")
    @Valid
    private List<SaleItemRequest> items;
}
