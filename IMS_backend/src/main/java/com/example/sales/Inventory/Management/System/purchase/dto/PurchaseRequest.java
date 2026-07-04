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

    @NotNull(message = "Purchase date is required")
    private LocalDate purchaseDate;

    @NotEmpty(message = "Purchase items list cannot be empty")
    @Valid
    private List<PurchaseItemRequest> items;
}
