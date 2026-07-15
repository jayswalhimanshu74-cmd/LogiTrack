package com.example.sales.Inventory.Management.System.report;

import com.example.sales.Inventory.Management.System.product.Product;
import com.example.sales.Inventory.Management.System.product.ProductRepository;
import com.example.sales.Inventory.Management.System.sales.SaleRepository;
import com.example.sales.Inventory.Management.System.report.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IntelligenceService {

    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;

    @Transactional(readOnly = true)
    public List<InventoryForecastDto> calculateForecasting() {
        List<Product> products = productRepository.findAll();
        List<ProductSalesStatsDto> stats = saleRepository.getProductSalesStats();
        Map<Long, ProductSalesStatsDto> statsMap = stats.stream()
                .collect(Collectors.toMap(ProductSalesStatsDto::getProductId, s -> s));

        LocalDate today = LocalDate.now();
        List<InventoryForecastDto> forecasts = new ArrayList<>();

        for (Product product : products) {
            ProductSalesStatsDto stat = statsMap.get(product.getId());
            InventoryForecastDto dto = new InventoryForecastDto();
            dto.setProductId(product.getId());
            dto.setProductName(product.getName());
            dto.setSku(product.getSku());
            dto.setCurrentStock(product.getQuantityInStock());

            if (stat == null || stat.getTotalQuantitySold() == 0 || stat.getFirstSaleDate() == null) {
                dto.setAverageDailySales(0.0);
                dto.setDaysRemaining(null);
                dto.setStatus("No Forecast");
            } else {
                long sellingDays = java.time.temporal.ChronoUnit.DAYS.between(stat.getFirstSaleDate(), today) + 1;
                if (sellingDays <= 0) {
                    sellingDays = 1;
                }
                double avgDailySales = (double) stat.getTotalQuantitySold() / sellingDays;
                dto.setAverageDailySales(avgDailySales);

                if (avgDailySales == 0) {
                    dto.setDaysRemaining(null);
                    dto.setStatus("No Forecast");
                } else {
                    double daysRemaining = (double) product.getQuantityInStock() / avgDailySales;
                    dto.setDaysRemaining(daysRemaining);

                    if (daysRemaining > 30) {
                        dto.setStatus("GREEN");
                    } else if (daysRemaining >= 15) {
                        dto.setStatus("AMBER");
                    } else {
                        dto.setStatus("RED");
                    }
                }
            }
            forecasts.add(dto);
        }
        return forecasts;
    }

    @Transactional(readOnly = true)
    public Page<InventoryForecastDto> getForecastingReport(String search, String status, Pageable pageable) {
        List<InventoryForecastDto> list = calculateForecasting();

        // Filter by Search
        if (search != null && !search.trim().isEmpty()) {
            String q = search.toLowerCase().trim();
            list = list.stream()
                    .filter(f -> f.getProductName().toLowerCase().contains(q) || f.getSku().toLowerCase().contains(q))
                    .collect(Collectors.toList());
        }

        // Filter by Status
        if (status != null && !status.trim().isEmpty()) {
            String s = status.toUpperCase().trim();
            list = list.stream()
                    .filter(f -> f.getStatus().equals(s))
                    .collect(Collectors.toList());
        }

        return paginateList(list, pageable);
    }

    @Transactional(readOnly = true)
    public List<AbcAnalysisDto> calculateAbcAnalysis() {
        List<Product> products = productRepository.findAll();
        List<ProductSalesStatsDto> stats = saleRepository.getProductSalesStats();
        Map<Long, ProductSalesStatsDto> statsMap = stats.stream()
                .collect(Collectors.toMap(ProductSalesStatsDto::getProductId, s -> s));

        List<AbcAnalysisDto> abcList = new ArrayList<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;

        for (Product product : products) {
            ProductSalesStatsDto stat = statsMap.get(product.getId());
            long soldQty = stat != null ? stat.getTotalQuantitySold() : 0;
            BigDecimal revenue = BigDecimal.valueOf(soldQty).multiply(product.getSellingPrice());

            AbcAnalysisDto dto = new AbcAnalysisDto();
            dto.setProductId(product.getId());
            dto.setProductName(product.getName());
            dto.setSku(product.getSku());
            dto.setRevenue(revenue);
            dto.setTotalSold(soldQty);

            totalRevenue = totalRevenue.add(revenue);
            abcList.add(dto);
        }

        // Sort descending by revenue
        abcList.sort((d1, d2) -> d2.getRevenue().compareTo(d1.getRevenue()));

        int size = abcList.size();
        for (int i = 0; i < size; i++) {
            AbcAnalysisDto dto = abcList.get(i);

            // Calculate percentage contribution
            if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
                double pct = dto.getRevenue().multiply(BigDecimal.valueOf(100))
                        .divide(totalRevenue, 4, RoundingMode.HALF_UP).doubleValue();
                dto.setPercentageContribution(pct);
            } else {
                dto.setPercentageContribution(0.0);
            }

            // Categorize by index percentile
            // Top 20% (A), Next 30% (B), Remaining 50% (C)
            if (size > 0) {
                double percentile = (double) (i + 1) / size;
                if (percentile <= 0.20) {
                    dto.setCategory("A");
                } else if (percentile <= 0.50) {
                    dto.setCategory("B");
                } else {
                    dto.setCategory("C");
                }
            } else {
                dto.setCategory("C");
            }
        }

        return abcList;
    }

    @Transactional(readOnly = true)
    public Page<AbcAnalysisDto> getAbcReport(String search, String category, Pageable pageable) {
        List<AbcAnalysisDto> list = calculateAbcAnalysis();

        // Filter by Search
        if (search != null && !search.trim().isEmpty()) {
            String q = search.toLowerCase().trim();
            list = list.stream()
                    .filter(a -> a.getProductName().toLowerCase().contains(q) || a.getSku().toLowerCase().contains(q))
                    .collect(Collectors.toList());
        }

        // Filter by Category
        if (category != null && !category.trim().isEmpty()) {
            String c = category.toUpperCase().trim();
            list = list.stream()
                    .filter(a -> a.getCategory().equals(c))
                    .collect(Collectors.toList());
        }

        return paginateList(list, pageable);
    }

    @Transactional(readOnly = true)
    public Page<LowStockReportDto> getLowStockReport(String search, String priority, Pageable pageable) {
        return productRepository.findLowStockFiltered(search, priority, pageable)
                .map(p -> {
                    int reorder = p.getReorderLevel() != null ? p.getReorderLevel() : 10;
                    int qty = p.getQuantityInStock();
                    String prio;
                    if (qty <= reorder * 0.2) {
                        prio = "CRITICAL";
                    } else if (qty <= reorder) {
                        prio = "HIGH";
                    } else {
                        prio = "NORMAL";
                    }
                    return new LowStockReportDto(
                            p.getId(),
                            p.getSku(),
                            p.getName(),
                            p.getCategory(),
                            qty,
                            reorder,
                            prio,
                            p.getUpdatedAt() != null ? p.getUpdatedAt() : p.getCreatedAt()
                    );
                });
    }

    private <T> Page<T> paginateList(List<T> list, Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), list.size());
        if (start > list.size()) {
            return new PageImpl<>(new ArrayList<>(), pageable, list.size());
        }
        return new PageImpl<>(list.subList(start, end), pageable, list.size());
    }
}
