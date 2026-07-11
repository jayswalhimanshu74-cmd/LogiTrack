package com.example.sales.Inventory.Management.System.invoice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceStatisticsResponse {
    private long totalInvoicesCount;
    private long todayInvoicesCount;
    private long monthlyInvoicesCount;
    private long pendingPaymentsCount;
    private long paidInvoicesCount;
    private long cancelledInvoicesCount;
    private BigDecimal totalRevenue;
    private BigDecimal averageInvoiceValue;
}
