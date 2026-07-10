package com.example.sales.Inventory.Management.System.sales.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SalesStatisticsResponse {
    private long totalSalesCount;
    private BigDecimal totalRevenue;
    private long todaySalesCount;
    private BigDecimal todayRevenue;
    private long monthlySalesCount;
    private BigDecimal monthlyRevenue;
    private long pendingOrdersCount;
    private long completedOrdersCount;
    private long cancelledOrdersCount;
}
