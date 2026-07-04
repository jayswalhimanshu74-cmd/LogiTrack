package com.example.sales.Inventory.Management.System.invoice.dto;

import com.example.sales.Inventory.Management.System.invoice.Invoice.InvoiceStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
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
public class InvoiceRequest {

    @NotBlank(message = "Invoice number is required")
    @Size(max = 30, message = "Invoice number must not exceed 30 characters")
    private String invoiceNo;

    // Optional if saleId is provided, otherwise required (validated in service layer)
    @Size(max = 150, message = "Customer name must not exceed 150 characters")
    private String customerName;

    private Long saleId;

    @NotNull(message = "Invoice date is required")
    private LocalDate invoiceDate;

    // Optional if saleId is provided, otherwise required (validated in service layer)
    @Valid
    private List<InvoiceItemRequest> items;

    private InvoiceStatus status = InvoiceStatus.UNPAID;
}
