package com.example.sales.Inventory.Management.System.invoice;

import com.example.sales.Inventory.Management.System.sales.Sale;
import com.example.sales.Inventory.Management.System.user.User;
import com.example.sales.Inventory.Management.System.utill.AuditableEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
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
@AllArgsConstructor
public class Invoice extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_no", nullable = false, unique = true, length = 30)
    private String invoiceNo;

    @Column(name = "customer_name", nullable = false, length = 150)
    private String customerName;

    @Column(name = "customer_phone", nullable = false, length = 20)
    @org.hibernate.annotations.ColumnDefault("''")
    private String customerPhone = "";

    @Column(name = "customer_email", length = 100)
    private String customerEmail;

    @Column(name = "billing_address", length = 500)
    private String billingAddress;

    @Column(name = "payment_method", nullable = false, length = 20)
    @org.hibernate.annotations.ColumnDefault("'CASH'")
    private String paymentMethod = "CASH"; // CASH, UPI, CARD, BANK_TRANSFER

    @Column(name = "payment_status", nullable = false, length = 20)
    @org.hibernate.annotations.ColumnDefault("'PENDING'")
    private String paymentStatus = "PENDING"; // PENDING, PAID, PARTIALLY_PAID, REFUNDED

    @Column(name = "status", nullable = false, length = 20)
    @org.hibernate.annotations.ColumnDefault("'DRAFT'")
    private String status = "DRAFT"; // DRAFT, ISSUED, PAID, CANCELLED

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "subtotal", nullable = false, precision = 14, scale = 2)
    @org.hibernate.annotations.ColumnDefault("0.00")
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "tax", nullable = false, precision = 14, scale = 2)
    @org.hibernate.annotations.ColumnDefault("0.00")
    private BigDecimal tax = BigDecimal.ZERO;

    @Column(name = "discount", nullable = false, precision = 14, scale = 2)
    @org.hibernate.annotations.ColumnDefault("0.00")
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 14, scale = 2)
    @org.hibernate.annotations.ColumnDefault("0.00")
    private BigDecimal grandTotal = BigDecimal.ZERO;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate = LocalDate.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_id")
    private Sale sale;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvoiceItem> items = new ArrayList<>();

    public void addItem(InvoiceItem item) {
        items.add(item);
        item.setInvoice(this);
    }
}