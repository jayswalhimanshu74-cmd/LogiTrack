package com.example.sales.Inventory.Management.System.movement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MostAdjustedProductDto {
    private String sku;
    private String name;
    private Long adjustmentCount;
    private Long totalQuantityAdjusted;
}
