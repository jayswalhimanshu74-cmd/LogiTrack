package com.example.sales.Inventory.Management.System.invoice.dto;

import com.example.sales.Inventory.Management.System.invoice.Invoice.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {

    private Long id;
    private String invoiceNo;
    private String customerName;
    private Long saleId;
    private LocalDate invoiceDate;
    private BigDecimal totalAmount;
    private InvoiceStatus status;
    private Long createdById;
    private String createdByFullName;
    private String createdByEmail;
    private List<InvoiceItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
