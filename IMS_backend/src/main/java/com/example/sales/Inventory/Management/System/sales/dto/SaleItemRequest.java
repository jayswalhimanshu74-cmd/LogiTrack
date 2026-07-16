package com.example.sales.Inventory.Management.System.sales.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Schema(name = "SaleItemRequest",
        description = "A single line item within a sales order — specifies which product, how many units, and at what selling price.")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SaleItemRequest {

    @Schema(description = "Database ID of the product being sold",
            example = "1",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Product ID is required")
    private Long productId;

    @Schema(description = "Number of units being sold (minimum 1)",
            example = "2",
            minimum = "1",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @Schema(description = "Selling price per unit charged to the customer",
            example = "3999.00",
            minimum = "0.00",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.00", message = "Unit price cannot be negative")
    private BigDecimal unitPrice;
}
