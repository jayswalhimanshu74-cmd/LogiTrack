package com.example.sales.Inventory.Management.System.sales.dto;

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
public class SaleResponse {

    private Long id;
    private String saleNo;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String status;
    private String paymentStatus;
    private String paymentMethod;
    private String notes;
    private LocalDate saleDate;
    private BigDecimal totalAmount;
    private Long createdById;
    private String createdByFullName;
    private String createdByEmail;
    private List<SaleItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
