package com.example.sales.Inventory.Management.System.report;

import com.example.sales.Inventory.Management.System.invoice.InvoiceRepository;
import com.example.sales.Inventory.Management.System.invoice.dto.InvoiceResponse;
import com.example.sales.Inventory.Management.System.product.ProductRepository;
import com.example.sales.Inventory.Management.System.product.dto.ProductResponse;
import com.example.sales.Inventory.Management.System.purchase.PurchaseRepository;
import com.example.sales.Inventory.Management.System.purchase.dto.PurchaseResponse;
import com.example.sales.Inventory.Management.System.report.dto.*;
import com.example.sales.Inventory.Management.System.sales.SaleRepository;
import com.example.sales.Inventory.Management.System.sales.dto.SaleResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

        private final ProductRepository productRepository;
        private final SaleRepository saleRepository;
        private final PurchaseRepository purchaseRepository;
        private final InvoiceRepository invoiceRepository;

        @Transactional(readOnly = true)
        public SalesReportResponse getSalesReport(String search, String status, String paymentStatus,
                        LocalDate startDate, LocalDate endDate, Pageable pageable) {
                Page<SaleResponse> sales = saleRepository
                                .findSalesFiltered(search, status, paymentStatus, startDate, endDate, pageable)
                                .map(sale -> new SaleResponse(
                                                sale.getId(),
                                                sale.getSaleNo(),
                                                sale.getCustomerName(),
                                                sale.getCustomerPhone(),
                                                sale.getCustomerEmail(),
                                                sale.getStatus(),
                                                sale.getPaymentStatus(),
                                                sale.getPaymentMethod(),
                                                sale.getNotes(),
                                                sale.getSaleDate(),
                                                sale.getTotalAmount(),
                                                sale.getCreatedBy() != null ? sale.getCreatedBy().getId() : null,
                                                sale.getCreatedBy() != null ? sale.getCreatedBy().getFullName() : null,
                                                sale.getCreatedBy() != null ? sale.getCreatedBy().getEmail() : null,
                                                sale.getItems().stream().map(
                                                                item -> new com.example.sales.Inventory.Management.System.sales.dto.SaleItemResponse(
                                                                                item.getId(),
                                                                                item.getProduct().getId(),
                                                                                item.getProduct().getName(),
                                                                                item.getProduct().getSku(),
                                                                                item.getQuantity(),
                                                                                item.getUnitPrice(),
                                                                                item.getLineTotal()))
                                                                .collect(Collectors.toList()),
                                                sale.getCreatedAt(),
                                                sale.getUpdatedAt()));

                long totalCount = saleRepository.countAllSales();
                BigDecimal totalRevenue = saleRepository.sumTotalSales();
                List<StatusDistributionDto> statusDist = saleRepository.getSalesStatusDistribution();
                List<StatusDistributionDto> paymentDist = saleRepository.getSalesPaymentStatusDistribution();
                List<ProductPerformanceDto> topProducts = saleRepository.findTopSellingProducts(PageRequest.of(0, 5));

                return new SalesReportResponse(
                                totalCount,
                                totalRevenue,
                                statusDist,
                                paymentDist,
                                topProducts,
                                sales);
        }

        @Transactional(readOnly = true)
        public PurchaseReportResponse getPurchaseReport(String search, String status, String paymentStatus,
                        LocalDate startDate, LocalDate endDate, Pageable pageable) {
                Page<PurchaseResponse> purchases = purchaseRepository
                                .findPurchasesFiltered(search, status, paymentStatus, startDate, endDate, pageable)
                                .map(p -> new PurchaseResponse(
                                                p.getId(),
                                                p.getPurchaseNo(),
                                                p.getSupplierName(),
                                                p.getSupplierPhone(),
                                                p.getSupplierEmail(),
                                                p.getStatus(),
                                                p.getPaymentStatus(),
                                                p.getPaymentMethod(),
                                                p.getInvoiceNo(),
                                                p.getNotes(),
                                                p.getPurchaseDate(),
                                                p.getTotalAmount(),
                                                p.getCreatedBy() != null ? p.getCreatedBy().getId() : null,
                                                p.getCreatedBy() != null ? p.getCreatedBy().getFullName() : null,
                                                p.getCreatedBy() != null ? p.getCreatedBy().getEmail() : null,
                                                p.getItems().stream().map(
                                                                item -> new com.example.sales.Inventory.Management.System.purchase.dto.PurchaseItemResponse(
                                                                                item.getId(),
                                                                                item.getProduct().getId(),
                                                                                item.getProduct().getName(),
                                                                                item.getProduct().getSku(),
                                                                                item.getQuantity(),
                                                                                item.getUnitPrice(),
                                                                                item.getLineTotal()))
                                                                .collect(Collectors.toList()),
                                                p.getCreatedAt(),
                                                p.getUpdatedAt()));

                long totalCount = purchaseRepository.countAllPurchases();
                BigDecimal totalCost = purchaseRepository.sumTotalPurchases();
                List<StatusDistributionDto> statusDist = purchaseRepository.getPurchaseStatusDistribution();
                List<StatusDistributionDto> paymentDist = purchaseRepository.getPurchasePaymentStatusDistribution();

                return new PurchaseReportResponse(
                                totalCount,
                                totalCost,
                                statusDist,
                                paymentDist,
                                purchases);
        }

        @Transactional(readOnly = true)
        public InventoryReportResponse getInventoryReport(String search, String category, String status,
                        Pageable pageable) {
                Page<ProductResponse> products = productRepository
                                .findProductsFiltered(search, category, status, pageable)
                                .map(p -> {
                                        String prodStatus = p.getQuantityInStock() == 0 ? "OUT_OF_STOCK"
                                                        : (p.getQuantityInStock() <= p.getReorderLevel() ? "LOW_STOCK"
                                                                        : "IN_STOCK");
                                        return new ProductResponse(
                                                        p.getId(),
                                                        p.getSku(),
                                                        p.getName(),
                                                        p.getCategory(),
                                                        p.getUnit(),
                                                        p.getPurchasePrice(),
                                                        p.getSellingPrice(),
                                                        p.getQuantityInStock(),
                                                        p.getReorderLevel(),
                                                        prodStatus,
                                                        p.getCreatedAt(),
                                                        p.getUpdatedAt());
                                });

                long totalCount = productRepository.count();
                BigDecimal totalValue = productRepository.sumTotalInventoryValue();
                long lowStock = productRepository.countLowStockProducts();
                long outOfStock = productRepository.countOutOfStockProducts();

                List<CategoryDistributionDto> categoryDist = productRepository.getCategoryStockBreakdown().stream()
                                .map(c -> new CategoryDistributionDto(c.getCategory(), c.getProductCount()))
                                .collect(Collectors.toList());

                return new InventoryReportResponse(
                                totalCount,
                                totalValue,
                                lowStock,
                                outOfStock,
                                categoryDist,
                                products);
        }

        @Transactional(readOnly = true)
        public InvoiceReportResponse getInvoiceReport(String search, String status, String paymentStatus,
                        LocalDate startDate, LocalDate endDate, Pageable pageable) {
                Page<InvoiceResponse> invoices = invoiceRepository
                                .findInvoicesFiltered(search, status, paymentStatus, startDate, endDate, pageable)
                                .map(i -> new InvoiceResponse(
                                                i.getId(),
                                                i.getInvoiceNo(),
                                                i.getCustomerName(),
                                                i.getCustomerPhone(),
                                                i.getCustomerEmail(),
                                                i.getBillingAddress(),
                                                i.getPaymentMethod(),
                                                i.getPaymentStatus(),
                                                i.getStatus(),
                                                i.getNotes(),
                                                i.getSubtotal(),
                                                i.getTax(),
                                                i.getDiscount(),
                                                i.getGrandTotal(),
                                                i.getInvoiceDate(),
                                                i.getSale() != null ? i.getSale().getId() : null,
                                                i.getSale() != null ? i.getSale().getSaleNo() : null,
                                                i.getCreatedBy() != null ? i.getCreatedBy().getId() : null,
                                                i.getCreatedBy() != null ? i.getCreatedBy().getFullName() : null,
                                                i.getCreatedBy() != null ? i.getCreatedBy().getEmail() : null,
                                                i.getItems().stream().map(
                                                                item -> new com.example.sales.Inventory.Management.System.invoice.dto.InvoiceItemResponse(
                                                                                item.getId(),
                                                                                item.getProduct().getId(),
                                                                                item.getProduct().getName(),
                                                                                item.getProduct().getSku(),
                                                                                item.getQuantity(),
                                                                                item.getUnitPrice(),
                                                                                item.getLineTotal()))
                                                                .collect(Collectors.toList()),
                                                i.getCreatedAt(),
                                                i.getUpdatedAt()));

                long totalCount = invoiceRepository.countAllInvoices();
                long paidCount = invoiceRepository.countPaidInvoices();
                long pendingCount = invoiceRepository.countPendingPayments();
                long draftCount = invoiceRepository.countCancelledInvoices(); // Draft count fallback using cancelled or
                                                                              // similar
                BigDecimal totalRevenue = invoiceRepository.sumTotalRevenue();
                BigDecimal avgValue = invoiceRepository.averageInvoiceValue();

                List<StatusDistributionDto> statusDist = invoiceRepository.getInvoiceStatusDistribution();
                List<StatusDistributionDto> paymentDist = invoiceRepository.getInvoicePaymentStatusDistribution();

                return new InvoiceReportResponse(
                                totalCount,
                                paidCount,
                                pendingCount,
                                draftCount,
                                totalRevenue,
                                avgValue,
                                statusDist,
                                paymentDist,
                                invoices);
        }

        @Transactional(readOnly = true)
        public FinancialSummaryResponse getFinancialSummary() {
                BigDecimal revenue = saleRepository.sumTotalSales();
                BigDecimal cost = purchaseRepository.sumTotalPurchases();
                BigDecimal profit = revenue.subtract(cost);
                BigDecimal margin = BigDecimal.ZERO;

                if (revenue.compareTo(BigDecimal.ZERO) > 0) {
                        margin = profit.multiply(BigDecimal.valueOf(100)).divide(revenue, 2, RoundingMode.HALF_UP);
                }

                LocalDate today = LocalDate.now();
                LocalDate startOfMonth = today.withDayOfMonth(1);
                LocalDate endOfMonth = today.with(java.time.temporal.TemporalAdjusters.lastDayOfMonth());
                LocalDate startOfYear = today.withDayOfYear(1);
                LocalDate endOfYear = today.with(java.time.temporal.TemporalAdjusters.lastDayOfYear());

                BigDecimal todayRev = saleRepository.sumTodayRevenue(today);
                BigDecimal monthlyRev = saleRepository.sumMonthlyRevenue(startOfMonth, endOfMonth);
                BigDecimal yearlyRev = saleRepository.sumMonthlyRevenue(startOfYear, endOfYear); // reuse monthly helper
                                                                                                 // spanning entire year
                                                                                                 // range

                return new FinancialSummaryResponse(
                                revenue,
                                cost,
                                profit,
                                margin,
                                todayRev,
                                monthlyRev,
                                yearlyRev);
        }

        @Transactional(readOnly = true)
        public ChartDataResponse getChartData() {
                List<MonthlyTrendDto> salesTrend = saleRepository.getMonthlySalesTrend();
                List<MonthlyTrendDto> purchaseTrend = purchaseRepository.getMonthlyPurchasesTrend();
                List<MonthlyTrendDto> invoiceTrend = invoiceRepository.getMonthlyInvoicesTrend();

                List<CategoryDistributionDto> categoryDist = productRepository.getCategoryStockBreakdown().stream()
                                .map(c -> new CategoryDistributionDto(c.getCategory(), c.getProductCount()))
                                .collect(Collectors.toList());

                List<StatusDistributionDto> salesStatus = saleRepository.getSalesStatusDistribution();
                List<StatusDistributionDto> paymentStatus = saleRepository.getSalesPaymentStatusDistribution();
                List<CategoryDistributionDto> lowStockTrend = productRepository.getLowStockTrend();
                List<ProductPerformanceDto> topProducts = saleRepository.findTopSellingProducts(PageRequest.of(0, 5));
                List<CustomerPerformanceDto> topCustomers = saleRepository.findTopCustomers(PageRequest.of(0, 5));
                List<SupplierPerformanceDto> topSuppliers = purchaseRepository.findTopSuppliers(PageRequest.of(0, 5));

                return new ChartDataResponse(
                                salesTrend,
                                purchaseTrend,
                                invoiceTrend,
                                categoryDist,
                                salesStatus,
                                paymentStatus,
                                lowStockTrend,
                                topProducts,
                                topCustomers,
                                topSuppliers);
        }
}
