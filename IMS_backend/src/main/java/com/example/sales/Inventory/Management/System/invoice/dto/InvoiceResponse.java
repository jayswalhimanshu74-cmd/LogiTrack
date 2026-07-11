package com.example.sales.Inventory.Management.System.invoice.dto;

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
    private String customerPhone;
    private String customerEmail;
    private String billingAddress;
    private String paymentMethod;
    private String paymentStatus;
    private String status; // DRAFT, ISSUED, PAID, CANCELLED
    private String notes;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal discount;
    private BigDecimal grandTotal;
    private LocalDate invoiceDate;
    private Long saleId;
    private String saleNo;
    private Long createdById;
    private String createdByFullName;
    private String createdByEmail;
    private List<InvoiceItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
