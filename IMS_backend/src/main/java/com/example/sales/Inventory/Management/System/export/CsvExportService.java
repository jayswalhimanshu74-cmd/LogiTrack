package com.example.sales.Inventory.Management.System.export;

import com.example.sales.Inventory.Management.System.invoice.InvoiceService;
import com.example.sales.Inventory.Management.System.invoice.dto.InvoiceResponse;
import com.example.sales.Inventory.Management.System.product.ProductService;
import com.example.sales.Inventory.Management.System.product.dto.ProductResponse;
import com.example.sales.Inventory.Management.System.purchase.PurchaseService;
import com.example.sales.Inventory.Management.System.purchase.dto.PurchaseItemResponse;
import com.example.sales.Inventory.Management.System.purchase.dto.PurchaseResponse;
import com.example.sales.Inventory.Management.System.report.ReportService;
import com.example.sales.Inventory.Management.System.report.IntelligenceService;
import com.example.sales.Inventory.Management.System.report.dto.*;
import com.example.sales.Inventory.Management.System.sales.SaleService;
import com.example.sales.Inventory.Management.System.sales.dto.SaleItemResponse;
import com.example.sales.Inventory.Management.System.sales.dto.SaleResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.sales.Inventory.Management.System.user.UserRepository;
import com.example.sales.Inventory.Management.System.user.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.context.ApplicationEventPublisher;
import com.example.sales.Inventory.Management.System.notification.event.NotificationEvent;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CsvExportService {

    private final ProductService productService;
    private final SaleService saleService;
    private final PurchaseService purchaseService;
    private final InvoiceService invoiceService;
    private final ReportService reportService;
    private final IntelligenceService intelligenceService;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return userRepository.findByEmail(auth.getName()).orElse(null);
        }
        return null;
    }

    // Helper to escape values for CSV safety and prevent injection/formatting breaks
    private String escapeCsvValue(String value) {
        if (value == null) {
            return "";
        }
        String cleanValue = value.replace("\r", "").replace("\n", " ");
        if (cleanValue.contains(",") || cleanValue.contains("\"")) {
            return "\"" + cleanValue.replace("\"", "\"\"") + "\"";
        }
        return cleanValue;
    }

    public byte[] exportProducts(String search, String category, String status, Sort sort) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, false, StandardCharsets.UTF_8)) {
            // Write BOM for UTF-8 Excel compatibility
            writer.write('\ufeff');

            // Headers
            writer.println("SKU,Name,Category,Purchase Price,Selling Price,Stock,Reorder Level,Status,Created Date");

            Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE, sort != null && sort.isSorted() ? sort : Sort.by(Sort.Direction.DESC, "id"));
            List<ProductResponse> products = productService.getFilteredProducts(search, category, status, pageable).getContent();

            for (ProductResponse p : products) {
                writer.printf("%s,%s,%s,%s,%s,%d,%d,%s,%s\n",
                        escapeCsvValue(p.getSku()),
                        escapeCsvValue(p.getName()),
                        escapeCsvValue(p.getCategory()),
                        p.getPurchasePrice() != null ? p.getPurchasePrice().toString() : "0.00",
                        p.getSellingPrice() != null ? p.getSellingPrice().toString() : "0.00",
                        p.getQuantityInStock(),
                        p.getReorderLevel(),
                        escapeCsvValue(p.getStatus()),
                        p.getCreatedAt() != null ? p.getCreatedAt().toLocalDate().toString() : ""
                );
            }
            writer.flush();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export products to CSV", e);
        }

        eventPublisher.publishEvent(NotificationEvent.builder()
                .title("CSV Export Success")
                .message("Your product inventory list has been successfully compiled and exported as a CSV document.")
                .type("CSV_EXPORT")
                .severity("INFO")
                .priority("LOW")
                .recipient(getAuthenticatedUser())
                .build());

        return out.toByteArray();
    }

    public byte[] exportSales(String search, String status, String paymentStatus, LocalDate startDate, LocalDate endDate, Sort sort) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, false, StandardCharsets.UTF_8)) {
            writer.write('\ufeff');
            writer.println("Order Number,Customer,Product,Quantity,Unit Price,Total,Status,Payment Status,Order Date");

            Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE, sort != null && sort.isSorted() ? sort : Sort.by(Sort.Direction.DESC, "id"));
            List<SaleResponse> sales = saleService.getFilteredSales(search, status, paymentStatus, startDate, endDate, pageable).getContent();

            for (SaleResponse s : sales) {
                if (s.getItems() != null && !s.getItems().isEmpty()) {
                    for (SaleItemResponse item : s.getItems()) {
                        writer.printf("%s,%s,%s,%d,%s,%s,%s,%s,%s\n",
                                escapeCsvValue(s.getSaleNo()),
                                escapeCsvValue(s.getCustomerName()),
                                escapeCsvValue(item.getProductName()),
                                item.getQuantity(),
                                item.getUnitPrice().toString(),
                                item.getLineTotal().toString(),
                                escapeCsvValue(s.getStatus()),
                                escapeCsvValue(s.getPaymentStatus()),
                                s.getSaleDate() != null ? s.getSaleDate().toString() : ""
                        );
                    }
                } else {
                    writer.printf("%s,%s,%s,%d,%s,%s,%s,%s,%s\n",
                            escapeCsvValue(s.getSaleNo()),
                            escapeCsvValue(s.getCustomerName()),
                            "",
                            0,
                            "0.00",
                            s.getTotalAmount() != null ? s.getTotalAmount().toString() : "0.00",
                            escapeCsvValue(s.getStatus()),
                            escapeCsvValue(s.getPaymentStatus()),
                            s.getSaleDate() != null ? s.getSaleDate().toString() : ""
                    );
                }
            }
            writer.flush();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export sales to CSV", e);
        }

        eventPublisher.publishEvent(NotificationEvent.builder()
                .title("CSV Export Success")
                .message("Your sales orders list has been successfully compiled and exported as a CSV document.")
                .type("CSV_EXPORT")
                .severity("INFO")
                .priority("LOW")
                .recipient(getAuthenticatedUser())
                .build());

        return out.toByteArray();
    }

    public byte[] exportPurchases(String search, String status, String paymentStatus, LocalDate startDate, LocalDate endDate, Sort sort) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, false, StandardCharsets.UTF_8)) {
            writer.write('\ufeff');
            writer.println("Purchase Number,Supplier,Product,Quantity,Purchase Price,Total Cost,Status,Purchase Date");

            Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE, sort != null && sort.isSorted() ? sort : Sort.by(Sort.Direction.DESC, "id"));
            List<PurchaseResponse> purchases = purchaseService.getFilteredPurchases(search, status, paymentStatus, startDate, endDate, pageable).getContent();

            for (PurchaseResponse p : purchases) {
                if (p.getItems() != null && !p.getItems().isEmpty()) {
                    for (PurchaseItemResponse item : p.getItems()) {
                        writer.printf("%s,%s,%s,%d,%s,%s,%s,%s\n",
                                escapeCsvValue(p.getPurchaseNo()),
                                escapeCsvValue(p.getSupplierName()),
                                escapeCsvValue(item.getProductName()),
                                item.getQuantity(),
                                item.getUnitPrice().toString(),
                                item.getLineTotal().toString(),
                                escapeCsvValue(p.getStatus()),
                                p.getPurchaseDate() != null ? p.getPurchaseDate().toString() : ""
                        );
                    }
                } else {
                    writer.printf("%s,%s,%s,%d,%s,%s,%s,%s\n",
                            escapeCsvValue(p.getPurchaseNo()),
                            escapeCsvValue(p.getSupplierName()),
                            "",
                            0,
                            "0.00",
                            p.getTotalAmount() != null ? p.getTotalAmount().toString() : "0.00",
                            escapeCsvValue(p.getStatus()),
                            p.getPurchaseDate() != null ? p.getPurchaseDate().toString() : ""
                    );
                }
            }
            writer.flush();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export purchases to CSV", e);
        }

        eventPublisher.publishEvent(NotificationEvent.builder()
                .title("CSV Export Success")
                .message("Your purchase orders list has been successfully compiled and exported as a CSV document.")
                .type("CSV_EXPORT")
                .severity("INFO")
                .priority("LOW")
                .recipient(getAuthenticatedUser())
                .build());

        return out.toByteArray();
    }

    public byte[] exportInvoices(String search, String status, String paymentStatus, LocalDate startDate, LocalDate endDate, Sort sort) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, false, StandardCharsets.UTF_8)) {
            writer.write('\ufeff');
            writer.println("Invoice Number,Customer,Total,Tax,Discount,Grand Total,Payment Status,Invoice Status,Invoice Date");

            Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE, sort != null && sort.isSorted() ? sort : Sort.by(Sort.Direction.DESC, "id"));
            List<InvoiceResponse> invoices = invoiceService.getFilteredInvoices(search, status, paymentStatus, startDate, endDate, pageable).getContent();

            for (InvoiceResponse inv : invoices) {
                writer.printf("%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                        escapeCsvValue(inv.getInvoiceNo()),
                        escapeCsvValue(inv.getCustomerName()),
                        inv.getSubtotal() != null ? inv.getSubtotal().toString() : "0.00",
                        inv.getTax() != null ? inv.getTax().toString() : "0.00",
                        inv.getDiscount() != null ? inv.getDiscount().toString() : "0.00",
                        inv.getGrandTotal() != null ? inv.getGrandTotal().toString() : "0.00",
                        escapeCsvValue(inv.getPaymentStatus()),
                        escapeCsvValue(inv.getStatus()),
                        inv.getInvoiceDate() != null ? inv.getInvoiceDate().toString() : ""
                );
            }
            writer.flush();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export invoices to CSV", e);
        }

        eventPublisher.publishEvent(NotificationEvent.builder()
                .title("CSV Export Success")
                .message("Your invoices list has been successfully compiled and exported as a CSV document.")
                .type("CSV_EXPORT")
                .severity("INFO")
                .priority("LOW")
                .recipient(getAuthenticatedUser())
                .build());

        return out.toByteArray();
    }

    public byte[] exportReports() {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, false, StandardCharsets.UTF_8)) {
            writer.write('\ufeff');

            // 1. Title Block
            writer.println("STOCKMASTER ENTERPRISE REPORT SUMMARY");
            writer.println("Date Generated: " + LocalDate.now());
            writer.println();

            // 2. Financial Summary KPIs
            FinancialSummaryResponse summary = reportService.getFinancialSummary();
            writer.println("FINANCIAL SUMMARY METRICS");
            writer.println("Metric,Value");
            writer.printf("Total Revenue,%s\n", summary.getTotalRevenue() != null ? summary.getTotalRevenue().toString() : "0.00");
            writer.printf("Total Purchase Cost,%s\n", summary.getTotalPurchaseCost() != null ? summary.getTotalPurchaseCost().toString() : "0.00");
            writer.printf("Estimated Profit,%s\n", summary.getEstimatedProfit() != null ? summary.getEstimatedProfit().toString() : "0.00");
            writer.printf("Profit Margin,%s%%\n", summary.getEstimatedProfitMargin() != null ? summary.getEstimatedProfitMargin().toString() : "0.00");
            writer.printf("Today Revenue,%s\n", summary.getTodayRevenue() != null ? summary.getTodayRevenue().toString() : "0.00");
            writer.printf("Monthly Revenue,%s\n", summary.getMonthlyRevenue() != null ? summary.getMonthlyRevenue().toString() : "0.00");
            writer.printf("Yearly Revenue,%s\n", summary.getYearlyRevenue() != null ? summary.getYearlyRevenue().toString() : "0.00");
            writer.println();

            // 3. Monthly historical trends
            ChartDataResponse charts = reportService.getChartData();
            writer.println("MONTHLY HISTORICAL TRENDS");
            writer.println("Year,Month,Monthly Sales,Monthly Purchases,Monthly Revenue");
            int size = charts.getMonthlySales() != null ? charts.getMonthlySales().size() : 0;
            for (int i = 0; i < size; i++) {
                var sale = charts.getMonthlySales().get(i);
                var purchase = (charts.getMonthlyPurchases() != null && charts.getMonthlyPurchases().size() > i) 
                        ? charts.getMonthlyPurchases().get(i) : null;
                var revenue = (charts.getMonthlyRevenue() != null && charts.getMonthlyRevenue().size() > i) 
                        ? charts.getMonthlyRevenue().get(i) : null;

                writer.printf("%d,%d,%s,%s,%s\n",
                        sale.getYear(),
                        sale.getMonth(),
                        sale.getAmount() != null ? sale.getAmount().toString() : "0.00",
                        (purchase != null && purchase.getAmount() != null) ? purchase.getAmount().toString() : "0.00",
                        (revenue != null && revenue.getAmount() != null) ? revenue.getAmount().toString() : "0.00"
                );
            }
            writer.println();

            // 4. Category Stock distribution
            writer.println("CATEGORY STOCK DISTRIBUTION");
            writer.println("Category,Product Count");
            if (charts.getCategoryDistribution() != null) {
                for (var dist : charts.getCategoryDistribution()) {
                    writer.printf("%s,%d\n", escapeCsvValue(dist.getCategory()), dist.getCount());
                }
            }
            writer.flush();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export reports summary to CSV", e);
        }

        eventPublisher.publishEvent(NotificationEvent.builder()
                .title("CSV Export Success")
                .message("Your financial report summary has been successfully compiled and exported as a CSV document.")
                .type("CSV_EXPORT")
                .severity("INFO")
                .priority("LOW")
                .recipient(getAuthenticatedUser())
                .build());

        return out.toByteArray();
    }

    public byte[] exportLowStock(String search, String priority) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, false, java.nio.charset.StandardCharsets.UTF_8)) {
            writer.write('\ufeff');
            writer.println("SKU,Name,Category,Current Stock,Reorder Level,Priority,Last Updated");

            Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE);
            List<LowStockReportDto> list = intelligenceService.getLowStockReport(search, priority, pageable).getContent();

            for (LowStockReportDto item : list) {
                writer.printf("%s,%s,%s,%d,%d,%s,%s\n",
                        escapeCsvValue(item.getSku()),
                        escapeCsvValue(item.getName()),
                        escapeCsvValue(item.getCategory()),
                        item.getQuantityInStock(),
                        item.getReorderLevel(),
                        item.getPriority(),
                        item.getTimestamp() != null ? item.getTimestamp().toString() : ""
                );
            }
            writer.flush();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export low stock report to CSV", e);
        }

        eventPublisher.publishEvent(NotificationEvent.builder()
                .title("CSV Export Success")
                .message("Your low stock report has been successfully compiled and exported as a CSV document.")
                .type("CSV_EXPORT")
                .severity("INFO")
                .priority("LOW")
                .recipient(getAuthenticatedUser())
                .build());

        return out.toByteArray();
    }

    public byte[] exportForecast(String search, String status) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, false, java.nio.charset.StandardCharsets.UTF_8)) {
            writer.write('\ufeff');
            writer.println("SKU,Name,Current Stock,Average Daily Sales,Days Remaining,Status");

            Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE);
            List<InventoryForecastDto> list = intelligenceService.getForecastingReport(search, status, pageable).getContent();

            for (InventoryForecastDto item : list) {
                writer.printf("%s,%s,%d,%.2f,%s,%s\n",
                        escapeCsvValue(item.getSku()),
                        escapeCsvValue(item.getProductName()),
                        item.getCurrentStock(),
                        item.getAverageDailySales(),
                        item.getDaysRemaining() != null ? String.format("%.2f", item.getDaysRemaining()) : "N/A",
                        item.getStatus()
                );
            }
            writer.flush();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export inventory forecast report to CSV", e);
        }

        eventPublisher.publishEvent(NotificationEvent.builder()
                .title("CSV Export Success")
                .message("Your inventory forecasting report has been successfully compiled and exported as a CSV document.")
                .type("CSV_EXPORT")
                .severity("INFO")
                .priority("LOW")
                .recipient(getAuthenticatedUser())
                .build());

        return out.toByteArray();
    }

    public byte[] exportAbc(String search, String category) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, false, java.nio.charset.StandardCharsets.UTF_8)) {
            writer.write('\ufeff');
            writer.println("SKU,Name,Total Sold,Revenue,Category,Percentage Contribution");

            Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE);
            List<AbcAnalysisDto> list = intelligenceService.getAbcReport(search, category, pageable).getContent();

            for (AbcAnalysisDto item : list) {
                writer.printf("%s,%s,%d,%s,%s,%.2f%%\n",
                        escapeCsvValue(item.getSku()),
                        escapeCsvValue(item.getProductName()),
                        item.getTotalSold(),
                        item.getRevenue().toString(),
                        item.getCategory(),
                        item.getPercentageContribution() != null ? item.getPercentageContribution() : 0.0
                );
            }
            writer.flush();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export ABC analysis report to CSV", e);
        }

        eventPublisher.publishEvent(NotificationEvent.builder()
                .title("CSV Export Success")
                .message("Your ABC analysis report has been successfully compiled and exported as a CSV document.")
                .type("CSV_EXPORT")
                .severity("INFO")
                .priority("LOW")
                .recipient(getAuthenticatedUser())
                .build());

        return out.toByteArray();
    }
}
