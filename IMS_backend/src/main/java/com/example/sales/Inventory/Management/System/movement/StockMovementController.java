package com.example.sales.Inventory.Management.System.movement;

import com.example.sales.Inventory.Management.System.movement.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/movements")
@RequiredArgsConstructor
public class StockMovementController {

    private final StockMovementService stockMovementService;

    @GetMapping
    public ResponseEntity<Page<StockMovementResponse>> getMovements(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) String movementType,
            @RequestParam(required = false) Long performedById,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        Page<StockMovementResponse> movements = stockMovementService.getFilteredMovements(
                productId, movementType, performedById, startDate, endDate, search, pageable);
        return ResponseEntity.ok(movements);
    }

    @GetMapping("/summary")
    public ResponseEntity<MovementSummaryResponse> getSummary() {
        return ResponseEntity.ok(stockMovementService.getMovementSummary());
    }

    @PostMapping("/adjust")
    public ResponseEntity<StockMovementResponse> adjustStock(@RequestBody StockAdjustmentRequest request) {
        return ResponseEntity.ok(stockMovementService.adjustStock(request));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<StockMovementResponse>> getProductTimeline(
            @PathVariable Long productId,
            Pageable pageable) {
        return ResponseEntity.ok(stockMovementService.getProductTimeline(productId, pageable));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<StockMovementResponse>> getUserTimeline(
            @PathVariable Long userId,
            Pageable pageable) {
        return ResponseEntity.ok(stockMovementService.getUserTimeline(userId, pageable));
    }
}
