package com.example.sales.Inventory.Management.System.movement;

import com.example.sales.Inventory.Management.System.movement.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
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

import java.time.LocalDateTime;

@Tag(name = "Stock Movements",
        description = "Complete stock ledger: every inventory change (purchase receipt, sale, return, adjustment, "
                + "damage, expiry) is recorded as an immutable movement. Supports filtering by product, user, "
                + "movement type, and date range. Manual adjustments are also supported. Requires JWT authentication.")
@RestController
@RequestMapping("/api/movements")
@RequiredArgsConstructor
public class StockMovementController {

    private final StockMovementService stockMovementService;

    @Operation(
            summary = "List and filter stock movements",
            description = """
                    Returns a paginated stock movement ledger with filtering options.
                    
                    **Movement type values:** `PURCHASE` | `SALE` | `RETURN` | `ADJUSTMENT` | `TRANSFER` | `DAMAGED` | `EXPIRED` | `MANUAL_CORRECTION`
                    
                    **Filter parameters (all optional):**
                    - `productId` — restrict to a specific product
                    - `movementType` — one of the movement type values above
                    - `performedById` — filter by user who performed the movement
                    - `startDate` / `endDate` — ISO datetime range
                    - `search` — free-text search on product name or reference
                    
                    **Pagination:** `?page=0&size=20&sort=createdAt,desc`
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Paginated stock movement ledger returned",
                    content = @Content(schema = @Schema(implementation = StockMovementResponse.class),
                            examples = @ExampleObject(value = """
                                    {
                                      "content": [
                                        {
                                          "id": 5001,
                                          "productId": 42,
                                          "productName": "Premium Headphones",
                                          "movementType": "SALE",
                                          "quantity": -2,
                                          "balanceBefore": 152,
                                          "balanceAfter": 150,
                                          "reference": "SO-2025-501",
                                          "performedBy": "jane@stockmaster.io",
                                          "createdAt": "2025-07-15T10:30:00"
                                        }
                                      ],
                                      "totalElements": 8420,
                                      "totalPages": 421
                                    }"""))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping
    public ResponseEntity<Page<StockMovementResponse>> getMovements(
            @Parameter(description = "Filter by product ID") @RequestParam(required = false) Long productId,
            @Parameter(description = "Movement type: PURCHASE, SALE, RETURN, ADJUSTMENT, TRANSFER, DAMAGED, EXPIRED, MANUAL_CORRECTION") @RequestParam(required = false) String movementType,
            @Parameter(description = "Filter by user ID who performed the movement") @RequestParam(required = false) Long performedById,
            @Parameter(description = "Range start datetime (ISO 8601)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "Range end datetime (ISO 8601)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @Parameter(description = "Search by product name or reference") @RequestParam(required = false) String search,
            Pageable pageable) {
        Page<StockMovementResponse> movements = stockMovementService.getFilteredMovements(
                productId, movementType, performedById, startDate, endDate, search, pageable);
        return ResponseEntity.ok(movements);
    }

    @Operation(
            summary = "Get stock movement summary",
            description = """
                    Returns aggregated movement metrics across the entire ledger:
                    - Total inflow vs outflow quantities
                    - Most-moved products
                    - Movement counts by type
                    - Aging and flow analytics
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Movement summary returned",
                    content = @Content(schema = @Schema(implementation = MovementSummaryResponse.class))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/summary")
    public ResponseEntity<MovementSummaryResponse> getSummary() {
        return ResponseEntity.ok(stockMovementService.getMovementSummary());
    }

    @Operation(
            summary = "Manual stock adjustment",
            description = """
                    Creates a manual `ADJUSTMENT` or `MANUAL_CORRECTION` movement to correct inventory discrepancies.
                    
                    **Use cases:**
                    - Damaged goods write-off
                    - Physical count correction
                    - Return processing
                    - Expired stock removal
                    
                    **Positive quantity** = stock increase (e.g. found extra units)
                    
                    **Negative quantity** = stock decrease (e.g. damaged/written off)
                    
                    A movement record is created and the product's `quantityInStock` is updated immediately.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Adjustment applied — movement record returned",
                    content = @Content(schema = @Schema(implementation = StockMovementResponse.class),
                            examples = @ExampleObject(value = """
                                    {
                                      "id": 5002,
                                      "productId": 42,
                                      "productName": "Premium Headphones",
                                      "movementType": "ADJUSTMENT",
                                      "quantity": -5,
                                      "balanceBefore": 150,
                                      "balanceAfter": 145,
                                      "reference": "DAMAGED-BATCH-001",
                                      "notes": "5 units damaged in transit",
                                      "performedBy": "jane@stockmaster.io",
                                      "createdAt": "2025-07-15T11:00:00"
                                    }"""))),
            @ApiResponse(responseCode = "400", description = "Insufficient stock for negative adjustment"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping("/adjust")
    public ResponseEntity<StockMovementResponse> adjustStock(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Stock adjustment details",
                    content = @Content(schema = @Schema(implementation = StockAdjustmentRequest.class),
                            examples = @ExampleObject(value = """
                                    {
                                      "productId": 42,
                                      "quantity": -5,
                                      "movementType": "ADJUSTMENT",
                                      "reference": "DAMAGED-BATCH-001",
                                      "notes": "5 units damaged in transit"
                                    }""")))
            @RequestBody StockAdjustmentRequest request) {
        return ResponseEntity.ok(stockMovementService.adjustStock(request));
    }

    @Operation(
            summary = "Get stock timeline for a product",
            description = "Returns the complete movement history for a single product, sorted chronologically. "
                    + "Use this to audit inventory changes for a specific item."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product movement timeline returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<StockMovementResponse>> getProductTimeline(
            @Parameter(description = "Product ID", required = true, example = "42")
            @PathVariable Long productId,
            Pageable pageable) {
        return ResponseEntity.ok(stockMovementService.getProductTimeline(productId, pageable));
    }

    @Operation(
            summary = "Get stock movement history by user",
            description = "Returns all stock movements performed by a specific user. "
                    + "Useful for accountability auditing."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User movement history returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<StockMovementResponse>> getUserTimeline(
            @Parameter(description = "User ID", required = true, example = "1")
            @PathVariable Long userId,
            Pageable pageable) {
        return ResponseEntity.ok(stockMovementService.getUserTimeline(userId, pageable));
    }
}
