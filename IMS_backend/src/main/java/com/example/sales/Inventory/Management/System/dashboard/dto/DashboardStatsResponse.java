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
}

