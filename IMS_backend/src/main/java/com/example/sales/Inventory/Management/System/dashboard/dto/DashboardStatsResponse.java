package com.example.sales.Inventory.Management.System.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private BigDecimal totalSalesRevenue;
    private BigDecimal totalPurchaseExpense;
    private Long totalProductsCount;
    private Long lowStockAlertCount;
    private List<CategoryStockDto> categoryStockBreakdown;
    private List<RecentTransactionDto> recentTransactions;

    // Phase 1: Low Stock Alert widgets
    private List<com.example.sales.Inventory.Management.System.report.dto.LowStockReportDto> criticalItems;
    private List<com.example.sales.Inventory.Management.System.report.dto.LowStockReportDto> highPriorityItems;

    // Phase 2: Inventory Forecast widget
    private List<com.example.sales.Inventory.Management.System.report.dto.InventoryForecastDto> forecastItems;

    // Phase 3: ABC Analysis widget
    private Long aProductsCount;
    private Long bProductsCount;
    private Long cProductsCount;
    private BigDecimal aProductsRevenue;
    private BigDecimal bProductsRevenue;
    private BigDecimal cProductsRevenue;
}

