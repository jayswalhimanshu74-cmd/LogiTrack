package com.example.sales.Inventory.Management.System.movement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementResponse {
    private Long id;
    private String movementNo;
    private String referenceNo;
    private Long productId;
    private String productName;
    private String productSku;
    private Integer previousQuantity;
    private Integer newQuantity;
    private Integer difference;
    private String movementType;
    private Long performedById;
    private String performedByFullName;
    private LocalDateTime timestamp;
    private String remarks;
}
