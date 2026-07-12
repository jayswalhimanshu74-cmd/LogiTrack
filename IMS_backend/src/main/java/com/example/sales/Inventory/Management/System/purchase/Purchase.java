package com.example.sales.Inventory.Management.System.purchase;


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
@Table(name = "purchases")
@Getter
@Setter
@NoArgsConstructor
public class Purchase extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "purchase_no", nullable = false, unique = true, length = 30)
    private String purchaseNo;

    @Column(name = "supplier_name", nullable = false, length = 150)
    private String supplierName;

    @Column(name = "supplier_phone", nullable = false, length = 20)
    @org.hibernate.annotations.ColumnDefault("''")
    private String supplierPhone = "";

    @Column(name = "supplier_email", length = 100)
    private String supplierEmail;

    @Column(name = "status", nullable = false, length = 20)
    @org.hibernate.annotations.ColumnDefault("'PENDING'")
    private String status = "PENDING"; // PENDING, RECEIVED, CANCELLED

    @Column(name = "payment_status", nullable = false, length = 20)
    @org.hibernate.annotations.ColumnDefault("'PENDING'")
    private String paymentStatus = "PENDING"; // PENDING, PAID, CANCELLED

    @Column(name = "payment_method", nullable = false, length = 20)
    @org.hibernate.annotations.ColumnDefault("'CASH'")
    private String paymentMethod = "CASH"; // CASH, UPI, CARD, BANK_TRANSFER

    @Column(name = "invoice_no", length = 50)
    private String invoiceNo;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate = LocalDate.now();

    @Column(name = "total_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(mappedBy = "purchase", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseItem> items = new ArrayList<>();

    // convenience method to keep both sides of the relationship in sync
    public void addItem(PurchaseItem item) {
        items.add(item);
        item.setPurchase(this);

    }
}
