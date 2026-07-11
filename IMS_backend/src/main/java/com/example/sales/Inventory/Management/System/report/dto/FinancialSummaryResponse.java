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
public class FinancialSummaryResponse {
    private BigDecimal totalRevenue;
    private BigDecimal totalPurchaseCost;
    private BigDecimal estimatedProfit;
    private BigDecimal estimatedProfitMargin;
    private BigDecimal todayRevenue;
    private BigDecimal monthlyRevenue;
    private BigDecimal yearlyRevenue;
}
