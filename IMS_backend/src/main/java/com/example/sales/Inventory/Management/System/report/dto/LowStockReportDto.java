package com.example.sales.Inventory.Management.System.report.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LowStockReportDto {
    private Long id;
    private String sku;
    private String name;
    private String category;
    private Integer quantityInStock;
    private Integer reorderLevel;
    private String priority; // CRITICAL, HIGH, NORMAL
    private LocalDateTime timestamp;
}
