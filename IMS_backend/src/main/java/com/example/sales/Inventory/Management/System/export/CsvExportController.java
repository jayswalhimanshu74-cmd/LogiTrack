package com.example.sales.Inventory.Management.System.export;

import com.example.sales.Inventory.Management.System.audit.Audit;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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

@Tag(name = "CSV Exports",
        description = "Bulk data export endpoints. All endpoints return UTF-8 encoded `.csv` files "
                + "with appropriate Content-Disposition: attachment headers. "
                + "Supports the same filter parameters as the corresponding list endpoints. "
                + "All exports are audit-logged. Requires JWT authentication.")
@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class CsvExportController {

    private final CsvExportService csvExportService;

    private boolean isNotAuthenticated() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal());
    }

    @Operation(
            summary = "Export products to CSV",
            description = """
                    Exports the product catalog to a CSV file with the same filter options as the products list.
                    
                    **CSV columns:** SKU, Name, Category, Unit, Purchase Price, Selling Price, Stock, Reorder Level, Status
                    
                    **Filename format:** `products_YYYY-MM-DD.csv`
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "CSV file returned as download",
                    content = @Content(mediaType = "text/csv")),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/products")
    @Audit(action = "EXPORT_CSV", entityName = "PRODUCT", description = "Exported product inventory list to CSV")
    public ResponseEntity<byte[]> exportProducts(
            @Parameter(description = "Search term") @RequestParam(required = false) String search,
            @Parameter(description = "Category filter") @RequestParam(required = false) String category,
            @Parameter(description = "Status filter: ACTIVE or INACTIVE") @RequestParam(required = false) String status,
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

    @Operation(
            summary = "Export sales orders to CSV",
            description = """
                    Exports sales orders to a CSV file with the same filter options as the sales list.
                    
                    **CSV columns:** Sale No, Customer, Phone, Email, Status, Payment Status, Payment Method, Date, Total Amount
                    
                    **Filename format:** `sales_YYYY-MM-DD.csv`
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "CSV file returned",
                    content = @Content(mediaType = "text/csv")),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
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

    @Operation(
            summary = "Export purchase orders to CSV",
            description = """
                    Exports purchase orders to a CSV file.
                    
                    **CSV columns:** PO Number, Supplier, Phone, Email, Status, Payment Status, Payment Method, Date, Total Amount
                    
                    **Filename format:** `purchases_YYYY-MM-DD.csv`
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "CSV file returned",
                    content = @Content(mediaType = "text/csv")),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
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

    @Operation(
            summary = "Export invoices to CSV",
            description = """
                    Exports invoices to a CSV file.
                    
                    **CSV columns:** Invoice No, Customer, Email, Status, Payment Status, Invoice Date, Due Date, Total Amount
                    
                    **Filename format:** `invoices_YYYY-MM-DD.csv`
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "CSV file returned",
                    content = @Content(mediaType = "text/csv")),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
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

    @Operation(
            summary = "Export financial summary report to CSV",
            description = """
                    Exports the overall financial summary metrics to a CSV file.
                    No filter parameters — exports lifetime metrics.
                    
                    **Filename format:** `report_YYYY-MM-DD.csv`
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "CSV file returned",
                    content = @Content(mediaType = "text/csv")),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
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

    @Operation(
            summary = "Export low-stock report to CSV",
            description = """
                    Exports the low-stock intelligence report to CSV.
                    
                    **CSV columns:** SKU, Name, Category, Current Stock, Reorder Level, Avg Daily Sales, Days Until Stockout, Priority
                    
                    **Filename format:** `low_stock_report_YYYY-MM-DD.csv`
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "CSV file returned",
                    content = @Content(mediaType = "text/csv")),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/low-stock")
    @Audit(action = "EXPORT_CSV", entityName = "REPORT", description = "Exported low stock report to CSV")
    public ResponseEntity<byte[]> exportLowStock(
            @Parameter(description = "Search by product name or SKU") @RequestParam(required = false) String search,
            @Parameter(description = "Priority filter: CRITICAL, HIGH, MEDIUM") @RequestParam(required = false) String priority) {

        if (isNotAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        byte[] csvData = csvExportService.exportLowStock(search, priority);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("low_stock_report_" + LocalDate.now() + ".csv", StandardCharsets.UTF_8)
                .build());

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
    }

    @Operation(
            summary = "Export demand forecast report to CSV",
            description = """
                    Exports the inventory demand forecasting report to CSV.
                    
                    **CSV columns:** SKU, Name, Current Stock, 30-Day Forecast, Safety Stock, Recommended Reorder Qty, Status
                    
                    **Filename format:** `inventory_forecast_YYYY-MM-DD.csv`
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "CSV file returned",
                    content = @Content(mediaType = "text/csv")),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/forecast")
    @Audit(action = "EXPORT_CSV", entityName = "REPORT", description = "Exported inventory forecast report to CSV")
    public ResponseEntity<byte[]> exportForecast(
            @Parameter(description = "Search by product name or SKU") @RequestParam(required = false) String search,
            @Parameter(description = "Status filter: ADEQUATE, LOW, CRITICAL, OVERSTOCKED") @RequestParam(required = false) String status) {

        if (isNotAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        byte[] csvData = csvExportService.exportForecast(search, status);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("inventory_forecast_" + LocalDate.now() + ".csv", StandardCharsets.UTF_8)
                .build());

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
    }

    @Operation(
            summary = "Export ABC analysis report to CSV",
            description = """
                    Exports the Pareto (ABC) analysis to CSV.
                    
                    **CSV columns:** SKU, Name, Category, Total Revenue, Revenue %, Cumulative %, ABC Class
                    
                    **Filename format:** `abc_analysis_YYYY-MM-DD.csv`
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "CSV file returned",
                    content = @Content(mediaType = "text/csv")),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/abc")
    @Audit(action = "EXPORT_CSV", entityName = "REPORT", description = "Exported ABC analysis report to CSV")
    public ResponseEntity<byte[]> exportAbc(
            @Parameter(description = "Search by product name or SKU") @RequestParam(required = false) String search,
            @Parameter(description = "Category filter") @RequestParam(required = false) String category) {

        if (isNotAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        byte[] csvData = csvExportService.exportAbc(search, category);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("abc_analysis_" + LocalDate.now() + ".csv", StandardCharsets.UTF_8)
                .build());

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
    }
}
