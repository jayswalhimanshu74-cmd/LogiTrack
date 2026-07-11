package com.example.sales.Inventory.Management.System.report.dto;

import com.example.sales.Inventory.Management.System.invoice.dto.InvoiceResponse;
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
public class InvoiceReportResponse {
    private long totalInvoicesCount;
    private long paidInvoicesCount;
    private long pendingInvoicesCount;
    private long draftInvoicesCount;
    private BigDecimal totalRevenue;
    private BigDecimal averageInvoiceValue;
    private List<StatusDistributionDto> statusDistribution;
    private List<StatusDistributionDto> paymentStatusDistribution;
    private Page<InvoiceResponse> invoices;
}
