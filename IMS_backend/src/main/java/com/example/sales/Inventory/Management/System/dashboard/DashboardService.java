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

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;
    private final PurchaseRepository purchaseRepository;

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

        return new DashboardStatsResponse(
                totalSalesRevenue,
                totalPurchaseExpense,
                totalProductsCount,
                lowStockAlertCount,
                categoryStockBreakdown,
                recentTransactions
        );
    }
}
