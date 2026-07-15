package com.example.sales.Inventory.Management.System.movement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MovementSummaryResponse {
    private List<MostAdjustedProductDto> mostAdjustedProducts;
    private List<InventoryFlowDto> inventoryFlow;
    private List<StockAgingDto> stockAging;
    private Long totalIncoming;
    private Long totalOutgoing;
}
