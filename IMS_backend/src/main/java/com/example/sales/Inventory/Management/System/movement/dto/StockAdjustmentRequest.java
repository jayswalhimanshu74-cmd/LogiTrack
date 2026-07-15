package com.example.sales.Inventory.Management.System.movement.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class StockAdjustmentRequest {
    private Long productId;
    private Integer difference; // can be positive or negative
    private String type; // ADJUSTMENT, DAMAGED, EXPIRED, MANUAL_CORRECTION, TRANSFER, RETURN
    private String remarks;
}
