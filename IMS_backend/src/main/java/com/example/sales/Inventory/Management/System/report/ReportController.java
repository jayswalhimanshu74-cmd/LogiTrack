package com.example.sales.Inventory.Management.System.report;

import com.example.sales.Inventory.Management.System.audit.Audit;
import com.example.sales.Inventory.Management.System.report.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/sales")
    @Audit(action = "REPORT_GENERATED", entityName = "REPORT", description = "Generated sales report")
    public ResponseEntity<SalesReportResponse> getSalesReport(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        SalesReportResponse response = reportService.getSalesReport(search, status, paymentStatus, startDate, endDate, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/purchases")
    @Audit(action = "REPORT_GENERATED", entityName = "REPORT", description = "Generated purchases report")
    public ResponseEntity<PurchaseReportResponse> getPurchaseReport(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        PurchaseReportResponse response = reportService.getPurchaseReport(search, status, paymentStatus, startDate, endDate, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/inventory")
    @Audit(action = "REPORT_GENERATED", entityName = "REPORT", description = "Generated inventory report")
    public ResponseEntity<InventoryReportResponse> getInventoryReport(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        InventoryReportResponse response = reportService.getInventoryReport(search, category, status, pageable);
        return ResponseEntity.ok(response);
    }

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

    @GetMapping("/financial-summary")
    public ResponseEntity<FinancialSummaryResponse> getFinancialSummary() {
        FinancialSummaryResponse response = reportService.getFinancialSummary();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/charts")
    public ResponseEntity<ChartDataResponse> getChartData() {
        ChartDataResponse response = reportService.getChartData();
        return ResponseEntity.ok(response);
    }
}
