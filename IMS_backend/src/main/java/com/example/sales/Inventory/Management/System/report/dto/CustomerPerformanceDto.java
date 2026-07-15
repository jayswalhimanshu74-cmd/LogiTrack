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
public class CustomerPerformanceDto {
    private String customerName;
    private String customerEmail;
    private Long orderCount;
    private BigDecimal totalSpent;
}
