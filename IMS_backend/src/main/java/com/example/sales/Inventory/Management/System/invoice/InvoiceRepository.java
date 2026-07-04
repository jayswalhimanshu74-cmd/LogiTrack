package com.example.sales.Inventory.Management.System.invoice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    boolean existsByInvoiceNo(String invoiceNo);

    Optional<Invoice> findByInvoiceNo(String invoiceNo);
}
