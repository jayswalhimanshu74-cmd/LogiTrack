package com.example.sales.Inventory.Management.System.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategoryStockDto {
    private String category;
    private Long productCount;
    private Long totalStock;
}
