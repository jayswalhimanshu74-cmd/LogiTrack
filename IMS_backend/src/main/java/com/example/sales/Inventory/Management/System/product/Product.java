package com.example.sales.Inventory.Management.System.product;
import com.example.sales.Inventory.Management.System.utill.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
public class Product extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 80)
    private String category;

    @Column(length = 20)
    private String unit = "pcs";

    @Column(name = "purchase_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal purchasePrice = BigDecimal.ZERO;

    @Column(name = "selling_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal sellingPrice = BigDecimal.ZERO;

    @Column(name = "quantity_in_stock", nullable = false)
    private Integer quantityInStock = 0;

    @Column(name = "reorder_level")
    private Integer reorderLevel = 10;
}
