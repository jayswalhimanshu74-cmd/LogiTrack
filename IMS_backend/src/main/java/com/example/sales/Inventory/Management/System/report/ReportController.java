package com.example.sales.Inventory.Management.System.report;

import com.example.sales.Inventory.Management.System.audit.Audit;
import com.example.sales.Inventory.Management.System.report.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@Tag(name = "Reports & Analytics",
        description = "Business intelligence and analytics reports: sales performance, purchase analysis, "
                + "inventory valuation, invoice aging, financial summary, chart data, "
                + "low-stock intelligence, demand forecasting, and ABC (Pareto) analysis. "
                + "All report endpoints are audit-logged. Requires JWT + ADMIN or MANAGER role.")
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
public class ReportController {

    private final ReportService reportService;
    private final IntelligenceService intelligenceService;

    @Operation(
            summary = "Sales report",
            description = """
                    Returns a comprehensive sales report with summary metrics and paginated order data.
                    
                    **Includes:**
                    - Total revenue, order count, average order value
                    - Revenue breakdown by status and payment method
                    - Paginated filtered order list for export
                    
                    All filter combinations are supported. Access is audit-logged.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Sales report returned",
                    content = @Content(schema = @Schema(implementation = SalesReportResponse.class))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/sales")
    @Audit(action = "REPORT_GENERATED", entityName = "REPORT", description = "Generated sales report")
    public ResponseEntity<SalesReportResponse> getSalesReport(
            @Parameter(description = "Search by customer name or SO number") @RequestParam(required = false) String search,
            @Parameter(description = "Order status filter") @RequestParam(required = false) String status,
            @Parameter(description = "Payment status filter") @RequestParam(required = false) String paymentStatus,
            @Parameter(description = "Range start date (yyyy-MM-dd)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "Range end date (yyyy-MM-dd)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        SalesReportResponse response = reportService.getSalesReport(search, status, paymentStatus, startDate, endDate, pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Purchase report",
            description = """
                    Returns purchase analysis report with spend metrics and paginated order data.
                    
                    **Includes:**
                    - Total spend, order count, top suppliers by spend
                    - Breakdown by payment method and status
                    - Paginated purchase order list for drill-down
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Purchase report returned",
                    content = @Content(schema = @Schema(implementation = PurchaseReportResponse.class))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/purchases")
    @Audit(action = "REPORT_GENERATED", entityName = "REPORT", description = "Generated purchases report")
    public ResponseEntity<PurchaseReportResponse> getPurchaseReport(
            @Parameter(description = "Search by supplier name or PO number") @RequestParam(required = false) String search,
            @Parameter(description = "Order status filter") @RequestParam(required = false) String status,
            @Parameter(description = "Payment status filter") @RequestParam(required = false) String paymentStatus,
            @Parameter(description = "Range start date (yyyy-MM-dd)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "Range end date (yyyy-MM-dd)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        PurchaseReportResponse response = reportService.getPurchaseReport(search, status, paymentStatus, startDate, endDate, pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Inventory report",
            description = """
                    Returns the current inventory valuation report.
                    
                    **Includes:**
                    - Total stock value at cost and at selling price
                    - Potential profit margin
                    - Breakdown by category
                    - Paginated product list with stock levels and status
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Inventory report returned",
                    content = @Content(schema = @Schema(implementation = InventoryReportResponse.class))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/inventory")
    @Audit(action = "REPORT_GENERATED", entityName = "REPORT", description = "Generated inventory report")
    public ResponseEntity<InventoryReportResponse> getInventoryReport(
            @Parameter(description = "Search by product name or SKU") @RequestParam(required = false) String search,
            @Parameter(description = "Filter by category") @RequestParam(required = false) String category,
            @Parameter(description = "Filter by status: ACTIVE or INACTIVE") @RequestParam(required = false) String status,
            Pageable pageable) {
        InventoryReportResponse response = reportService.getInventoryReport(search, category, status, pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Invoice report",
            description = """
                    Returns invoice aging and collection performance report.
                    
                    **Includes:**
                    - Total invoiced, collected, and outstanding amounts
                    - Overdue invoice count and amount
                    - Paginated invoice list with status breakdown
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Invoice report returned",
                    content = @Content(schema = @Schema(implementation = InvoiceReportResponse.class))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/invoices")
    @Audit(action = "REPORT_GENERATED", entityName = "REPORT", description = "Generated invoice report")
    public ResponseEntity<InvoiceReportResponse> getInvoiceReport(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        InvoiceReportResponse response = reportService.getInvoiceReport(search, status, paymentStatus, startDate, endDate, pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Financial summary",
            description = """
                    Returns an overall financial health summary combining sales revenue, purchase spend,
                    gross profit, and net cash flow. No filters — returns total lifetime metrics.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Financial summary returned",
                    content = @Content(schema = @Schema(implementation = FinancialSummaryResponse.class))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/financial-summary")
    public ResponseEntity<FinancialSummaryResponse> getFinancialSummary() {
        FinancialSummaryResponse response = reportService.getFinancialSummary();
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Chart data",
            description = """
                    Returns aggregated time-series data for dashboard charts:
                    - Monthly revenue trend (last 12 months)
                    - Purchase spend trend
                    - Top 5 products by revenue
                    - Category distribution
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Chart data returned",
                    content = @Content(schema = @Schema(implementation = ChartDataResponse.class))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/charts")
    public ResponseEntity<ChartDataResponse> getChartData() {
        ChartDataResponse response = reportService.getChartData();
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Low-stock intelligence report",
            description = """
                    Returns products at or below their reorder threshold, enriched with demand intelligence.
                    
                    **Includes per product:**
                    - Current stock vs reorder level
                    - Average daily sales velocity
                    - Estimated days until stockout
                    - Recommended reorder quantity
                    - Priority classification: `CRITICAL` | `HIGH` | `MEDIUM`
                    
                    Filter by `priority` to focus on the most urgent items first.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Low-stock report returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/low-stock")
    @Audit(action = "REPORT_GENERATED", entityName = "REPORT", description = "Generated low stock report")
    public ResponseEntity<Page<LowStockReportDto>> getLowStockReport(
            @Parameter(description = "Search by product name or SKU") @RequestParam(required = false) String search,
            @Parameter(description = "Priority filter: CRITICAL, HIGH, MEDIUM") @RequestParam(required = false) String priority,
            Pageable pageable) {
        Page<LowStockReportDto> response = intelligenceService.getLowStockReport(search, priority, pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Inventory demand forecasting report",
            description = """
                    AI-powered demand forecasting for inventory replenishment planning.
                    
                    **Includes per product:**
                    - 30-day demand forecast based on historical sales velocity
                    - Recommended reorder quantity
                    - Safety stock calculation
                    - Stock health status: `ADEQUATE` | `LOW` | `CRITICAL` | `OVERSTOCKED`
                    
                    Filter by `status` to prioritize urgent reorder actions.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Forecasting report returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/forecast")
    @Audit(action = "REPORT_GENERATED", entityName = "REPORT", description = "Generated inventory forecast report")
    public ResponseEntity<Page<InventoryForecastDto>> getForecastingReport(
            @Parameter(description = "Search by product name or SKU") @RequestParam(required = false) String search,
            @Parameter(description = "Status filter: ADEQUATE, LOW, CRITICAL, OVERSTOCKED") @RequestParam(required = false) String status,
            Pageable pageable) {
        Page<InventoryForecastDto> response = intelligenceService.getForecastingReport(search, status, pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "ABC analysis report",
            description = """
                    Pareto (ABC) analysis classifying products by revenue contribution:
                    - **Class A** — Top 80% of revenue (high-value, ~20% of SKUs)
                    - **Class B** — Next 15% of revenue (medium-value)
                    - **Class C** — Remaining 5% of revenue (low-value, ~80% of SKUs)
                    
                    Use this report to prioritize inventory investment and procurement strategy.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "ABC analysis report returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/abc")
    @Audit(action = "REPORT_GENERATED", entityName = "REPORT", description = "Generated ABC analysis report")
    public ResponseEntity<Page<AbcAnalysisDto>> getAbcReport(
            @Parameter(description = "Search by product name or SKU") @RequestParam(required = false) String search,
            @Parameter(description = "Filter by category") @RequestParam(required = false) String category,
            Pageable pageable) {
        Page<AbcAnalysisDto> response = intelligenceService.getAbcReport(search, category, pageable);
        return ResponseEntity.ok(response);
    }
}
