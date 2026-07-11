package com.example.sales.Inventory.Management.System.purchase.dto;

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
public class PurchaseResponse {

    private Long id;
    private String purchaseNo;
    private String supplierName;
    private String supplierPhone;
    private String supplierEmail;
    private String status;
    private String paymentStatus;
    private String paymentMethod;
    private String invoiceNo;
    private String notes;
    private LocalDate purchaseDate;
    private BigDecimal totalAmount;
    private Long createdById;
    private String createdByFullName;
    private String createdByEmail;
    private List<PurchaseItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
