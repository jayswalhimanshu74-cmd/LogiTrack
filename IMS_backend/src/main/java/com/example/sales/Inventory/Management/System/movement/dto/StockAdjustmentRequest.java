package com.example.sales.Inventory.Management.System.movement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Schema(name = "StockAdjustmentRequest",
        description = "Request payload for performing a manual stock adjustment. "
                + "Positive difference increases stock; negative difference decreases it.")
@Getter
@Setter
@NoArgsConstructor
public class StockAdjustmentRequest {

    @Schema(description = "ID of the product to adjust stock for",
            example = "42",
            requiredMode = Schema.RequiredMode.REQUIRED)
    private Long productId;

    @Schema(description = "Quantity change — positive to add stock, negative to remove stock",
            example = "-5")
    private Integer difference;

    @Schema(description = "Type of movement to record",
            example = "ADJUSTMENT",
            allowableValues = {"ADJUSTMENT", "DAMAGED", "EXPIRED", "MANUAL_CORRECTION", "TRANSFER", "RETURN"})
    private String type;

    @Schema(description = "Reason or notes for this adjustment",
            example = "5 units found damaged in warehouse inspection")
    private String remarks;
}
