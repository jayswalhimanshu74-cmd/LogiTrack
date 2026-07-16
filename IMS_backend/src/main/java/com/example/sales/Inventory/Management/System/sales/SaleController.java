package com.example.sales.Inventory.Management.System.sales;

import com.example.sales.Inventory.Management.System.sales.dto.SaleRequest;
import com.example.sales.Inventory.Management.System.sales.dto.SaleResponse;
import com.example.sales.Inventory.Management.System.sales.dto.SalesStatisticsResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Tag(name = "Sales Orders",
        description = "Sales order management: create customer orders, track fulfillment and payment status, "
                + "view statistics and recent activity. Stock is auto-decremented on order creation. "
                + "Requires JWT authentication.")
@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;

    @Operation(
            summary = "Create a new sales order",
            description = """
                    Creates a new sales order. Upon creation, inventory stock is automatically
                    decremented for each line item. An `InsufficientStockException` (HTTP 400)
                    is thrown if any product does not have sufficient quantity.
                    
                    **Status values:** `PENDING` | `CONFIRMED` | `SHIPPED` | `DELIVERED` | `CANCELLED`
                    
                    **Payment status values:** `PENDING` | `PAID` | `CANCELLED`
                    
                    **Payment method values:** `CASH` | `UPI` | `CARD` | `BANK_TRANSFER`
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Sales order created — stock decremented",
                    content = @Content(schema = @Schema(implementation = SaleResponse.class),
                            examples = @ExampleObject(value = """
                                    {
                                      "id": 501,
                                      "saleNo": "SO-2025-501",
                                      "customerName": "Rohan Mehta",
                                      "customerPhone": "+91-9123456789",
                                      "customerEmail": "rohan@gmail.com",
                                      "status": "CONFIRMED",
                                      "paymentStatus": "PAID",
                                      "paymentMethod": "UPI",
                                      "saleDate": "2025-07-15",
                                      "totalAmount": 7998.00,
                                      "items": [
                                        { "productId": 42, "productName": "Premium Headphones", "quantity": 2, "unitPrice": 3999.00, "totalPrice": 7998.00 }
                                      ]
                                    }"""))),
            @ApiResponse(responseCode = "400", description = "Validation error or insufficient stock"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "One or more product IDs not found"),
            @ApiResponse(responseCode = "409", description = "Sale number already exists")
    })
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping
    public ResponseEntity<SaleResponse> createSale(@Valid @RequestBody SaleRequest request) {
        SaleResponse response = saleService.createSale(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "List and filter sales orders",
            description = """
                    Returns a paginated list of sales orders with optional combined filters.
                    
                    **Filter parameters:**
                    - `search` — matches sale number or customer name
                    - `status` — `PENDING` | `CONFIRMED` | `SHIPPED` | `DELIVERED` | `CANCELLED`
                    - `paymentStatus` — `PENDING` | `PAID` | `CANCELLED`
                    - `startDate` / `endDate` — ISO date range (`yyyy-MM-dd`)
                    
                    **Pagination:** `?page=0&size=20&sort=saleDate,desc`
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Paginated sales order list"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping
    public ResponseEntity<Page<SaleResponse>> getFilteredSales(
            @Parameter(description = "Search by SO number or customer name") @RequestParam(required = false) String search,
            @Parameter(description = "Order status: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED") @RequestParam(required = false) String status,
            @Parameter(description = "Payment status: PENDING, PAID, CANCELLED") @RequestParam(required = false) String paymentStatus,
            @Parameter(description = "Range start date (yyyy-MM-dd)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "Range end date (yyyy-MM-dd)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        Page<SaleResponse> response = saleService.getFilteredSales(search, status, paymentStatus, startDate, endDate, pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Search sales orders",
            description = "Alias endpoint for the main filter — same parameters and behavior."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Search results returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/search")
    public ResponseEntity<Page<SaleResponse>> searchSales(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        Page<SaleResponse> response = saleService.getFilteredSales(search, status, paymentStatus, startDate, endDate, pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get sales statistics",
            description = """
                    Returns aggregate revenue and order KPIs:
                    - Total number of orders and total revenue
                    - Revenue and order count by status
                    - Payment method breakdown
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Statistics returned",
                    content = @Content(schema = @Schema(implementation = SalesStatisticsResponse.class))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/statistics")
    public ResponseEntity<SalesStatisticsResponse> getSalesStatistics() {
        SalesStatisticsResponse stats = saleService.getSalesStatistics();
        return ResponseEntity.ok(stats);
    }

    @Operation(
            summary = "Get recent sales orders",
            description = "Returns the 10 most recent sales orders. Used for dashboard and sidebar widgets."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Recent sales list returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/recent")
    public ResponseEntity<List<SaleResponse>> getRecentSales() {
        List<SaleResponse> response = saleService.getRecentSales();
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get a sales order by ID",
            description = "Retrieves the full details of a single sales order, including all line items."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Sales order found",
                    content = @Content(schema = @Schema(implementation = SaleResponse.class))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Sales order not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<SaleResponse> getSaleById(
            @Parameter(description = "Sales order ID", required = true, example = "501")
            @PathVariable Long id) {
        SaleResponse response = saleService.getSaleById(id);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Update a sales order",
            description = """
                    Updates all fields of a sales order. Cancelling a confirmed order (`CANCELLED` status)
                    automatically restores the stock quantities for all line items.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Sales order updated",
                    content = @Content(schema = @Schema(implementation = SaleResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation error"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Sales order not found")
    })
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<SaleResponse> updateSale(
            @Parameter(description = "Sales order ID", required = true, example = "501")
            @PathVariable Long id,
            @Valid @RequestBody SaleRequest request) {
        SaleResponse response = saleService.updateSale(id, request);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Delete a sales order",
            description = "Permanently deletes a sales order. Stock quantities are **not** automatically restored on delete."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Sales order deleted",
                    content = @Content(examples = @ExampleObject(value = """
                            { "message": "Deleted Sales Order with id: 501" }"""))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Sales order not found")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteSale(
            @Parameter(description = "Sales order ID to delete", required = true, example = "501")
            @PathVariable Long id) {
        saleService.deleteSale(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Deleted Sales Order with id: " + id);
        return ResponseEntity.ok(response);
    }
}
