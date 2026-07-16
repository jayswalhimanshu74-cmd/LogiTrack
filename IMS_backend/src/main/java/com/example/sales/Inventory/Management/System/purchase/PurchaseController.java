package com.example.sales.Inventory.Management.System.purchase;

import com.example.sales.Inventory.Management.System.purchase.dto.PurchaseRequest;
import com.example.sales.Inventory.Management.System.purchase.dto.PurchaseResponse;
import com.example.sales.Inventory.Management.System.purchase.dto.PurchaseStatisticsResponse;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Tag(name = "Purchases",
        description = "Purchase order lifecycle management: create orders from suppliers, update status and payment, "
                + "view statistics and recent orders. Requires JWT authentication.")
@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
public class PurchaseController {

    private final PurchaseService purchaseService;

    @Operation(
            summary = "Create a new purchase order",
            description = """
                    Creates a new purchase order with one or more line items.
                    
                    **Status values:** `PENDING` | `RECEIVED` | `CANCELLED`
                    
                    **Payment status values:** `PENDING` | `PAID` | `CANCELLED`
                    
                    **Payment method values:** `CASH` | `UPI` | `CARD` | `BANK_TRANSFER`
                    
                    Stock levels are automatically updated when status is set to `RECEIVED`.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Purchase order created",
                    content = @Content(schema = @Schema(implementation = PurchaseResponse.class),
                            examples = @ExampleObject(value = """
                                    {
                                      "id": 101,
                                      "purchaseNo": "PO-2025-001",
                                      "supplierName": "TechSupply India Pvt Ltd",
                                      "supplierPhone": "+91-9876543210",
                                      "supplierEmail": "orders@techsupply.in",
                                      "status": "PENDING",
                                      "paymentStatus": "PENDING",
                                      "paymentMethod": "BANK_TRANSFER",
                                      "purchaseDate": "2025-07-15",
                                      "totalAmount": 125000.00,
                                      "items": [
                                        { "productId": 42, "productName": "Premium Headphones", "quantity": 50, "unitPrice": 2500.00, "totalPrice": 125000.00 }
                                      ]
                                    }"""))),
            @ApiResponse(responseCode = "400", description = "Validation error — missing required fields or invalid item data"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "One or more referenced product IDs not found"),
            @ApiResponse(responseCode = "409", description = "Purchase number already exists")
    })
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping
    public ResponseEntity<PurchaseResponse> createPurchase(@Valid @RequestBody PurchaseRequest request) {
        PurchaseResponse response = purchaseService.createPurchase(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "List and filter purchase orders",
            description = """
                    Returns a paginated, filterable list of purchase orders.
                    
                    **Filter parameters (all optional):**
                    - `search` — matches purchase number or supplier name
                    - `status` — `PENDING` | `RECEIVED` | `CANCELLED`
                    - `paymentStatus` — `PENDING` | `PAID` | `CANCELLED`
                    - `startDate` / `endDate` — ISO date range (`yyyy-MM-dd`)
                    
                    **Pagination:** `?page=0&size=20&sort=purchaseDate,desc`
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Paginated purchase order list returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping
    public ResponseEntity<Page<PurchaseResponse>> getFilteredPurchases(
            @Parameter(description = "Search by PO number or supplier name") @RequestParam(required = false) String search,
            @Parameter(description = "Order status filter: PENDING, RECEIVED, CANCELLED") @RequestParam(required = false) String status,
            @Parameter(description = "Payment status filter: PENDING, PAID, CANCELLED") @RequestParam(required = false) String paymentStatus,
            @Parameter(description = "Range start date (yyyy-MM-dd)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "Range end date (yyyy-MM-dd)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        Page<PurchaseResponse> response = purchaseService.getFilteredPurchases(search, status, paymentStatus, startDate, endDate, pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Search purchase orders",
            description = "Alias for the main filter endpoint — same parameters and behavior. Included for compatibility with UI search components."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Search results returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/search")
    public ResponseEntity<Page<PurchaseResponse>> searchPurchases(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        Page<PurchaseResponse> response = purchaseService.getFilteredPurchases(search, status, paymentStatus, startDate, endDate, pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get purchase order statistics",
            description = """
                    Returns aggregate KPIs for the purchases module:
                    - Total number of purchase orders
                    - Total spend
                    - Count by status (pending, received, cancelled)
                    - Count by payment status
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Statistics returned",
                    content = @Content(schema = @Schema(implementation = PurchaseStatisticsResponse.class))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/statistics")
    public ResponseEntity<PurchaseStatisticsResponse> getPurchaseStatistics() {
        PurchaseStatisticsResponse stats = purchaseService.getPurchaseStatistics();
        return ResponseEntity.ok(stats);
    }

    @Operation(
            summary = "Get recent purchase orders",
            description = "Returns the 10 most recent purchase orders (by purchase date, descending). "
                    + "Used to populate the dashboard and sidebar widgets."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Recent purchase list returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/recent")
    public ResponseEntity<List<PurchaseResponse>> getRecentPurchases() {
        List<PurchaseResponse> response = purchaseService.getRecentPurchases();
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get a purchase order by ID",
            description = "Retrieves the full details of a single purchase order, including all line items."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Purchase order found",
                    content = @Content(schema = @Schema(implementation = PurchaseResponse.class))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Purchase order not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<PurchaseResponse> getPurchaseById(
            @Parameter(description = "Purchase order ID", required = true, example = "101")
            @PathVariable Long id) {
        PurchaseResponse response = purchaseService.getPurchaseById(id);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Update a purchase order",
            description = """
                    Updates all fields of a purchase order. Changing status from `PENDING` to `RECEIVED`
                    triggers a stock-in event — product quantities are incremented accordingly and a
                    stock movement record is created.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Purchase order updated",
                    content = @Content(schema = @Schema(implementation = PurchaseResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation error"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Purchase order not found")
    })
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<PurchaseResponse> updatePurchase(
            @Parameter(description = "Purchase order ID", required = true, example = "101")
            @PathVariable Long id,
            @Valid @RequestBody PurchaseRequest request) {
        PurchaseResponse response = purchaseService.updatePurchase(id, request);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Delete a purchase order",
            description = """
                    Permanently deletes a purchase order.
                    **Warning:** If the order was `RECEIVED`, the associated stock increment is **not** reversed.
                    Use manual stock adjustment to correct inventory if needed.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Purchase order deleted",
                    content = @Content(examples = @ExampleObject(value = """
                            { "message": "Deleted Purchase Order with id: 101" }"""))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Purchase order not found")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deletePurchase(
            @Parameter(description = "Purchase order ID to delete", required = true, example = "101")
            @PathVariable Long id) {
        purchaseService.deletePurchase(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Deleted Purchase Order with id: " + id);
        return ResponseEntity.ok(response);
    }
}
