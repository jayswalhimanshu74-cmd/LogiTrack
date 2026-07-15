package com.example.sales.Inventory.Management.System.report.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SupplierPerformanceDto {
    private String supplierName;
    private String supplierEmail;
    private Long orderCount;
    private BigDecimal totalSpent;
}
