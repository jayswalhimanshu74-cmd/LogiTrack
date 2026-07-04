package com.example.sales.Inventory.Management.System.sales;


import com.example.sales.Inventory.Management.System.user.User;
import com.example.sales.Inventory.Management.System.utill.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales")
@Getter
@Setter
@NoArgsConstructor
public class Sale extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sale_no", nullable = false, unique = true, length = 30)
    private String saleNo;

    @Column(name = "customer_name", nullable = false, length = 150)
    private String customerName;

    @Column(name = "sale_date", nullable = false)
    private LocalDate saleDate = LocalDate.now();

    @Column(name = "total_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SaleItem> items = new ArrayList<>();

    public void addItem(SaleItem item) {
        items.add(item);
        item.setSale(this);
    }
}