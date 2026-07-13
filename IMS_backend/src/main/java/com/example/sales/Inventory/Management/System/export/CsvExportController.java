package com.example.sales.Inventory.Management.System.export;

import com.example.sales.Inventory.Management.System.audit.Audit;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class CsvExportController {

    private final CsvExportService csvExportService;

    // Helper to validate JWT authorization context explicitly
    private boolean isNotAuthenticated() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal());
    }

    @GetMapping("/products")
    @Audit(action = "EXPORT_CSV", entityName = "PRODUCT", description = "Exported product inventory list to CSV")
    public ResponseEntity<byte[]> exportProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            Sort sort) {
        
        if (isNotAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        byte[] csvData = csvExportService.exportProducts(search, category, status, sort);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("products_" + LocalDate.now() + ".csv", StandardCharsets.UTF_8)
                .build());

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
    }

    @GetMapping("/sales")
    @Audit(action = "EXPORT_CSV", entityName = "SALE", description = "Exported sales orders list to CSV")
    public ResponseEntity<byte[]> exportSales(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Sort sort) {

        if (isNotAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        byte[] csvData = csvExportService.exportSales(search, status, paymentStatus, startDate, endDate, sort);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("sales_" + LocalDate.now() + ".csv", StandardCharsets.UTF_8)
                .build());

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
    }

    @GetMapping("/purchases")
    @Audit(action = "EXPORT_CSV", entityName = "PURCHASE", description = "Exported purchase orders list to CSV")
    public ResponseEntity<byte[]> exportPurchases(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Sort sort) {

        if (isNotAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        byte[] csvData = csvExportService.exportPurchases(search, status, paymentStatus, startDate, endDate, sort);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("purchases_" + LocalDate.now() + ".csv", StandardCharsets.UTF_8)
                .build());

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
    }

    @GetMapping("/invoices")
    @Audit(action = "EXPORT_CSV", entityName = "INVOICE", description = "Exported invoices list to CSV")
    public ResponseEntity<byte[]> exportInvoices(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Sort sort) {

        if (isNotAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        byte[] csvData = csvExportService.exportInvoices(search, status, paymentStatus, startDate, endDate, sort);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("invoices_" + LocalDate.now() + ".csv", StandardCharsets.UTF_8)
                .build());

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
    }

    @GetMapping("/reports")
    @Audit(action = "EXPORT_CSV", entityName = "REPORT", description = "Exported report statistics to CSV")
    public ResponseEntity<byte[]> exportReports() {

        if (isNotAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        byte[] csvData = csvExportService.exportReports();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("report_" + LocalDate.now() + ".csv", StandardCharsets.UTF_8)
                .build());

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
    }
}
