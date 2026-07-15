package com.example.sales.Inventory.Management.System.report.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryForecastDto {
    private Long productId;
    private String productName;
    private String sku;
    private Integer currentStock;
    private Double averageDailySales;
    private Double daysRemaining; // can be null/infinity
    private String status; // GREEN, AMBER, RED, or "No Forecast"
}
