package com.example.sales.Inventory.Management.System.purchase.dto;

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
public class PurchaseRequest {

    @NotBlank(message = "Purchase number is required")
    @Size(max = 30, message = "Purchase number must not exceed 30 characters")
    private String purchaseNo;

    @NotBlank(message = "Supplier name is required")
    @Size(max = 150, message = "Supplier name must not exceed 150 characters")
    private String supplierName;

    @NotBlank(message = "Supplier phone is required")
    @Size(max = 20, message = "Supplier phone must not exceed 20 characters")
    private String supplierPhone;

    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Supplier email must not exceed 100 characters")
    private String supplierEmail;

    @NotBlank(message = "Purchase status is required")
    private String status; // PENDING, RECEIVED, CANCELLED

    @NotBlank(message = "Payment status is required")
    private String paymentStatus; // PENDING, PAID, CANCELLED

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // CASH, UPI, CARD, BANK_TRANSFER

    @Size(max = 50, message = "Invoice number must not exceed 50 characters")
    private String invoiceNo;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    @NotNull(message = "Purchase date is required")
    private LocalDate purchaseDate;

    @NotEmpty(message = "Purchase items list cannot be empty")
    @Valid
    private List<PurchaseItemRequest> items;
}
