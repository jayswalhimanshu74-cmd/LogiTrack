package com.example.sales.Inventory.Management.System.invoice;

import com.example.sales.Inventory.Management.System.product.Product;
import com.example.sales.Inventory.Management.System.sales.Sale;
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
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
public class Invoice extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_no", nullable = false, unique = true, length = 30)
    private String invoiceNo;

    @Column(name = "customer_name", nullable = false, length = 150)
    private String customerName;

    // Optional link — an invoice can be generated from an existing sale,
    // or created standalone (this stays null in that case)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_id")
    private Sale sale;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate = LocalDate.now();

    @Column(name = "total_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InvoiceStatus status = InvoiceStatus.UNPAID;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvoiceItem> items = new ArrayList<>();

    public void addItem(InvoiceItem item) {
        items.add(item);
        item.setInvoice(this);
    }

    public enum InvoiceStatus {
        UNPAID,
        PAID,
        CANCELLED
    }
}