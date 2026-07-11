package com.example.sales.Inventory.Management.System.report.dto;

import com.example.sales.Inventory.Management.System.purchase.dto.PurchaseResponse;
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
public class PurchaseReportResponse {
    private long totalPurchasesCount;
    private BigDecimal totalPurchasesCost;
    private List<StatusDistributionDto> statusDistribution;
    private List<StatusDistributionDto> paymentStatusDistribution;
    private Page<PurchaseResponse> purchases;
}
