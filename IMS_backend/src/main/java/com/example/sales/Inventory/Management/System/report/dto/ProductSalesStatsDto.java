package com.example.sales.Inventory.Management.System.report.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductSalesStatsDto {
    private Long productId;
    private Long totalQuantitySold;
    private LocalDate firstSaleDate;
}
