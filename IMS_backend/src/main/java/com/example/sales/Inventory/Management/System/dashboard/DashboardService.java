package com.example.sales.Inventory.Management.System.dashboard;

import com.example.sales.Inventory.Management.System.dashboard.dto.CategoryStockDto;
import com.example.sales.Inventory.Management.System.dashboard.dto.DashboardStatsResponse;
import com.example.sales.Inventory.Management.System.product.ProductRepository;
import com.example.sales.Inventory.Management.System.purchase.PurchaseRepository;
import com.example.sales.Inventory.Management.System.sales.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;

import com.example.sales.Inventory.Management.System.report.IntelligenceService;
import com.example.sales.Inventory.Management.System.report.dto.LowStockReportDto;
import com.example.sales.Inventory.Management.System.report.dto.InventoryForecastDto;
import com.example.sales.Inventory.Management.System.report.dto.AbcAnalysisDto;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;
    private final PurchaseRepository purchaseRepository;
    private final IntelligenceService intelligenceService;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        BigDecimal totalSalesRevenue = saleRepository.sumTotalSales();
        BigDecimal totalPurchaseExpense = purchaseRepository.sumTotalPurchases();
        long totalProductsCount = productRepository.count();
        long lowStockAlertCount = productRepository.countLowStockProducts();
        List<CategoryStockDto> categoryStockBreakdown = productRepository.getCategoryStockBreakdown();

        List<com.example.sales.Inventory.Management.System.sales.Sale> recentSales = saleRepository.findTop5ByOrderByIdDesc();
        List<com.example.sales.Inventory.Management.System.purchase.Purchase> recentPurchases = purchaseRepository.findTop5ByOrderByIdDesc();

        List<com.example.sales.Inventory.Management.System.dashboard.dto.RecentTransactionDto> recentTransactions = new java.util.ArrayList<>();
        for (com.example.sales.Inventory.Management.System.sales.Sale sale : recentSales) {
            recentTransactions.add(new com.example.sales.Inventory.Management.System.dashboard.dto.RecentTransactionDto(
                    sale.getSaleNo(),
                    "Sale",
                    sale.getTotalAmount(),
                    sale.getStatus(),
                    sale.getSaleDate().toString()
            ));
        }
        for (com.example.sales.Inventory.Management.System.purchase.Purchase purchase : recentPurchases) {
            recentTransactions.add(new com.example.sales.Inventory.Management.System.dashboard.dto.RecentTransactionDto(
                    purchase.getPurchaseNo(),
                    "Purchase",
                    purchase.getTotalAmount(),
                    purchase.getStatus(),
                    purchase.getPurchaseDate().toString()
            ));
        }

        // Sort by date descending
        recentTransactions.sort((t1, t2) -> {
            int dateCompare = t2.getDate().compareTo(t1.getDate());
            if (dateCompare != 0) {
                return dateCompare;
            }
            return t2.getId().compareTo(t1.getId());
        });

        if (recentTransactions.size() > 5) {
            recentTransactions = recentTransactions.subList(0, 5);
        }

        List<LowStockReportDto> criticalItems = intelligenceService.getLowStockReport(null, "CRITICAL", PageRequest.of(0, 5)).getContent();
        List<LowStockReportDto> highPriorityItems = intelligenceService.getLowStockReport(null, "HIGH", PageRequest.of(0, 5)).getContent();

        List<InventoryForecastDto> forecastItems = intelligenceService.calculateForecasting().stream()
                .filter(f -> f.getDaysRemaining() != null)
                .sorted((f1, f2) -> f1.getDaysRemaining().compareTo(f2.getDaysRemaining()))
                .limit(5)
                .collect(Collectors.toList());

        List<AbcAnalysisDto> abcList = intelligenceService.calculateAbcAnalysis();
        long aCount = 0;
        long bCount = 0;
        long cCount = 0;
        BigDecimal aRevenue = BigDecimal.ZERO;
        BigDecimal bRevenue = BigDecimal.ZERO;
        BigDecimal cRevenue = BigDecimal.ZERO;

        for (AbcAnalysisDto abc : abcList) {
            if ("A".equals(abc.getCategory())) {
                aCount++;
                aRevenue = aRevenue.add(abc.getRevenue());
            } else if ("B".equals(abc.getCategory())) {
                bCount++;
                bRevenue = bRevenue.add(abc.getRevenue());
            } else if ("C".equals(abc.getCategory())) {
                cCount++;
                cRevenue = cRevenue.add(abc.getRevenue());
            }
        }

        return new DashboardStatsResponse(
                totalSalesRevenue,
                totalPurchaseExpense,
                totalProductsCount,
                lowStockAlertCount,
                categoryStockBreakdown,
                recentTransactions,
                criticalItems,
                highPriorityItems,
                forecastItems,
                aCount,
                bCount,
                cCount,
                aRevenue,
                bRevenue,
                cRevenue
        );
    }
}
