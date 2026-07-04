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

    @NotNull(message = "Sale date is required")
    private LocalDate saleDate;

    @NotEmpty(message = "Sale items list cannot be empty")
    @Valid
    private List<SaleItemRequest> items;
}
