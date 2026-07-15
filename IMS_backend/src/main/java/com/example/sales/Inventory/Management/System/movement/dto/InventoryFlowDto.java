package com.example.sales.Inventory.Management.System.movement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryFlowDto {
    private String movementType;
    private Long count;
    private Long totalDifference;
}
