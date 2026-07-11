package com.example.sales.Inventory.Management.System.report.dto;

import com.example.sales.Inventory.Management.System.sales.dto.SaleResponse;
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
public class SalesReportResponse {
    private long totalSalesCount;
    private BigDecimal totalSalesRevenue;
    private List<StatusDistributionDto> statusDistribution;
    private List<StatusDistributionDto> paymentStatusDistribution;
    private List<ProductPerformanceDto> topProducts;
    private Page<SaleResponse> sales;
}
