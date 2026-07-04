package com.example.sales.Inventory.Management.System.utill;


import com.example.sales.Inventory.Management.System.product.Product;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_ledger")
@Getter
@Setter
@NoArgsConstructor
public class StockLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;



    @Enumerated(EnumType.STRING)
    @Column(name = "change_type", nullable = false, length = 20)
    private ChangeType changeType;

    @Column(nullable = false)
    private Integer quantity; // positive for stock in, negative for stock out

    @Column(name = "reference_id")
    private Long referenceId; // sale_id or purchase_id

    @Enumerated(EnumType.STRING)
    @Column(name = "reference_type", length = 20)
    private ReferenceType referenceType;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum ChangeType {
        PURCHASE_IN,
        SALE_OUT,
        ADJUSTMENT
    }

    public enum ReferenceType {
        SALE,
        PURCHASE
    }
}