package com.example.sales.Inventory.Management.System.movement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockAgingDto {
    private String sku;
    private String name;
    private Integer currentQuantity;
    private LocalDateTime lastMovementDate;
}
