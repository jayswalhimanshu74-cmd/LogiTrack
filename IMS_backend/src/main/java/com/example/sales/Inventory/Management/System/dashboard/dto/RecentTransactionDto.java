package com.example.sales.Inventory.Management.System.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecentTransactionDto {
    private String id;
    private String type; // "Sale" or "Purchase"
    private BigDecimal amount;
    private String status;
    private String date; // "YYYY-MM-DD"
}
