package com.example.sales.Inventory.Management.System.purchase.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Schema(name = "PurchaseItemRequest",
        description = "A single line item within a purchase order — specifies which product, how many units, and at what price.")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseItemRequest {

    @Schema(description = "Database ID of the product being purchased",
            example = "42",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Product ID is required")
    private Long productId;

    @Schema(description = "Number of units being ordered (minimum 1)",
            example = "50",
            minimum = "1",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @Schema(description = "Agreed purchase price per unit from the supplier",
            example = "2500.00",
            minimum = "0.00",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.00", message = "Unit price cannot be negative")
    private BigDecimal unitPrice;
}
