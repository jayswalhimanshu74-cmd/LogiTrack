package com.example.sales.Inventory.Management.System.report.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChartDataResponse {
    private List<MonthlyTrendDto> monthlySales;
    private List<MonthlyTrendDto> monthlyPurchases;
    private List<MonthlyTrendDto> monthlyRevenue;
    private List<CategoryDistributionDto> categoryDistribution;
    private List<StatusDistributionDto> salesStatus;
    private List<StatusDistributionDto> paymentStatus;
    private List<CategoryDistributionDto> lowStockTrend;
    private List<ProductPerformanceDto> topProducts;
}
