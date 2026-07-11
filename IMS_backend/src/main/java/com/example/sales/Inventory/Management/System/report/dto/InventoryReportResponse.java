package com.example.sales.Inventory.Management.System.report.dto;

import com.example.sales.Inventory.Management.System.product.dto.ProductResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryReportResponse {
    private long totalProductsCount;
    private BigDecimal totalInventoryValue;
    private long lowStockCount;
    private long outOfStockCount;
    private List<CategoryDistributionDto> categoryDistribution;
    private Page<ProductResponse> products;
}
