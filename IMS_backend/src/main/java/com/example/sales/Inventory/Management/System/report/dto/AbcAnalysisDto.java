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
public class AbcAnalysisDto {
    private Long productId;
    private String productName;
    private String sku;
    private BigDecimal revenue;
    private Long totalSold;
    private String category; // A, B, C
    private Double percentageContribution; // percentage of total revenue
}
