package com.example.sales.Inventory.Management.System.product.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Schema(name = "ProductRequest",
        description = "Request payload for creating or updating a product in the inventory catalog.")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {

    @Schema(description = "Stock Keeping Unit — unique product identifier",
            example = "PROD-0042",
            maxLength = 50,
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "SKU is required")
    @Size(max = 50, message = "SKU must not exceed 50 characters")
    private String sku;

    @Schema(description = "Product display name",
            example = "Premium Wireless Headphones",
            maxLength = 150,
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Product name is required")
    @Size(max = 150, message = "Product name must not exceed 150 characters")
    private String name;

    @Schema(description = "Product category for grouping and filtering",
            example = "Electronics",
            maxLength = 80)
    @Size(max = 80, message = "Category must not exceed 80 characters")
    private String category;

    @Schema(description = "Unit of measurement for stock quantity",
            example = "pcs",
            maxLength = 20,
            defaultValue = "pcs")
    @Size(max = 20, message = "Unit must not exceed 20 characters")
    private String unit = "pcs";

    @Schema(description = "Purchase/cost price per unit (must be > 0)",
            example = "2500.00",
            minimum = "0.01",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Purchase price is required")
    @DecimalMin(value = "0.00", message = "Purchase price cannot be negative")
    private BigDecimal purchasePrice;

    @Schema(description = "Selling price per unit (must be > purchasePrice)",
            example = "3999.00",
            minimum = "0.01",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Selling price is required")
    @DecimalMin(value = "0.00", message = "Selling price cannot be negative")
    private BigDecimal sellingPrice;

    @Schema(description = "Current quantity available in stock",
            example = "150",
            minimum = "0",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Quantity in stock is required")
    @Min(value = 0, message = "Quantity in stock cannot be negative")
    private Integer quantityInStock;

    @Schema(description = "Reorder threshold — low-stock alert is triggered when stock falls to or below this level",
            example = "20",
            minimum = "0",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Reorder level is required")
    @Min(value = 0, message = "Reorder level cannot be negative")
    private Integer reorderLevel;

    @jakarta.validation.constraints.AssertTrue(message = "Purchase price must be greater than zero")
    @Schema(hidden = true)
    public boolean isPurchasePriceGreaterThanZero() {
        if (purchasePrice == null) return true;
        return purchasePrice.compareTo(BigDecimal.ZERO) > 0;
    }

    @jakarta.validation.constraints.AssertTrue(message = "Selling price must be greater than purchase price")
    @Schema(hidden = true)
    public boolean isSellingPriceGreaterThanPurchasePrice() {
        if (sellingPrice == null || purchasePrice == null) return true;
        return sellingPrice.compareTo(purchasePrice) > 0;
    }
}
