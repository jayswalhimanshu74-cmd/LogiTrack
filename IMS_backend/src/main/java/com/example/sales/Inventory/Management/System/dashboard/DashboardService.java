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

        return new DashboardStatsResponse(
                totalSalesRevenue,
                totalPurchaseExpense,
                totalProductsCount,
                lowStockAlertCount,
                categoryStockBreakdown
        );
    }
}
