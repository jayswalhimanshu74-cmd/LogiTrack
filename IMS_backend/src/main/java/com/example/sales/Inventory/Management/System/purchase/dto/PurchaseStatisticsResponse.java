package com.example.sales.Inventory.Management.System.purchase.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseStatisticsResponse {
    private long totalPurchasesCount;
    private BigDecimal totalExpense;
    private long todayPurchasesCount;
    private BigDecimal todayExpense;
    private long monthlyPurchasesCount;
    private BigDecimal monthlyExpense;
    private long pendingPurchasesCount;
    private long receivedPurchasesCount;
    private long cancelledPurchasesCount;
}
