package com.example.sales.Inventory.Management.System.invoice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    boolean existsByInvoiceNo(String invoiceNo);

    Optional<Invoice> findByInvoiceNo(String invoiceNo);

    @Query("SELECT MAX(i.invoiceNo) FROM Invoice i WHERE i.invoiceNo LIKE CONCAT(:yearPrefix, '%')")
    String findMaxInvoiceNoForYear(@Param("yearPrefix") String yearPrefix);

    @Query("SELECT i FROM Invoice i WHERE " +
           "(:search IS NULL OR :search = '' " +
           "OR LOWER(i.invoiceNo) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(i.customerName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(i.customerPhone) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(i.customerEmail) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(i.sale.saleNo) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR :status = '' OR i.status = :status) " +
           "AND (:paymentStatus IS NULL OR :paymentStatus = '' OR i.paymentStatus = :paymentStatus) " +
           "AND (CAST(:startDate AS date) IS NULL OR i.invoiceDate >= :startDate) " +
           "AND (CAST(:endDate AS date) IS NULL OR i.invoiceDate <= :endDate)")
    Page<Invoice> findInvoicesFiltered(
            @Param("search") String search,
            @Param("status") String status,
            @Param("paymentStatus") String paymentStatus,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable
    );

    @Query("SELECT COUNT(i) FROM Invoice i")
    long countAllInvoices();

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.invoiceDate = :today")
    long countTodayInvoices(@Param("today") LocalDate today);

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.invoiceDate >= :startOfMonth AND i.invoiceDate <= :endOfMonth")
    long countMonthlyInvoices(@Param("startOfMonth") LocalDate startOfMonth, @Param("endOfMonth") LocalDate endOfMonth);

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.paymentStatus = 'PENDING'")
    long countPendingPayments();

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.status = 'PAID'")
    long countPaidInvoices();

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.status = 'CANCELLED'")
    long countCancelledInvoices();

    @Query("SELECT COALESCE(SUM(i.grandTotal), 0) FROM Invoice i WHERE i.status <> 'CANCELLED'")
    BigDecimal sumTotalRevenue();

    @Query("SELECT COALESCE(AVG(i.grandTotal), 0) FROM Invoice i WHERE i.status <> 'CANCELLED'")
    BigDecimal averageInvoiceValue();

    @Query("SELECT new com.example.sales.Inventory.Management.System.report.dto.MonthlyTrendDto(YEAR(i.invoiceDate), MONTH(i.invoiceDate), SUM(i.grandTotal)) " +
           "FROM Invoice i WHERE i.status = 'PAID' " +
           "GROUP BY YEAR(i.invoiceDate), MONTH(i.invoiceDate) " +
           "ORDER BY YEAR(i.invoiceDate) ASC, MONTH(i.invoiceDate) ASC")
    List<com.example.sales.Inventory.Management.System.report.dto.MonthlyTrendDto> getMonthlyInvoicesTrend();

    @Query("SELECT new com.example.sales.Inventory.Management.System.report.dto.StatusDistributionDto(i.status, COUNT(i)) " +
           "FROM Invoice i GROUP BY i.status")
    List<com.example.sales.Inventory.Management.System.report.dto.StatusDistributionDto> getInvoiceStatusDistribution();

    @Query("SELECT new com.example.sales.Inventory.Management.System.report.dto.StatusDistributionDto(i.paymentStatus, COUNT(i)) " +
           "FROM Invoice i GROUP BY i.paymentStatus")
    List<com.example.sales.Inventory.Management.System.report.dto.StatusDistributionDto> getInvoicePaymentStatusDistribution();
}
