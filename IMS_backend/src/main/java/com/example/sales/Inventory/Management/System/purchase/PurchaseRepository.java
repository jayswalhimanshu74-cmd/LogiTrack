package com.example.sales.Inventory.Management.System.purchase;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    
    boolean existsByPurchaseNo(String purchaseNo);
    
    Optional<Purchase> findByPurchaseNo(String purchaseNo);

    List<Purchase> findTop5ByOrderByIdDesc();

    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM Purchase p WHERE p.status <> 'CANCELLED'")
    BigDecimal sumTotalPurchases();

    @Query("SELECT p FROM Purchase p WHERE " +
           "(:search IS NULL OR :search = '' " +
           "OR LOWER(p.purchaseNo) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(p.supplierName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(p.supplierEmail) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(p.supplierPhone) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(p.invoiceNo) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR :status = '' OR p.status = :status) " +
           "AND (:paymentStatus IS NULL OR :paymentStatus = '' OR p.paymentStatus = :paymentStatus) " +
           "AND (CAST(:startDate AS date) IS NULL OR p.purchaseDate >= :startDate) " +
           "AND (CAST(:endDate AS date) IS NULL OR p.purchaseDate <= :endDate)")
    Page<Purchase> findPurchasesFiltered(
            @Param("search") String search,
            @Param("status") String status,
            @Param("paymentStatus") String paymentStatus,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable
    );

    @Query("SELECT COUNT(p) FROM Purchase p")
    long countAllPurchases();

    @Query("SELECT COUNT(p) FROM Purchase p WHERE p.status = 'PENDING'")
    long countPendingPurchases();

    @Query("SELECT COUNT(p) FROM Purchase p WHERE p.status = 'RECEIVED'")
    long countReceivedPurchases();

    @Query("SELECT COUNT(p) FROM Purchase p WHERE p.status = 'CANCELLED'")
    long countCancelledPurchases();

    @Query("SELECT COUNT(p) FROM Purchase p WHERE p.purchaseDate = :today")
    long countTodayPurchases(@Param("today") LocalDate today);

    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM Purchase p WHERE p.purchaseDate = :today AND p.status <> 'CANCELLED'")
    BigDecimal sumTodayExpense(@Param("today") LocalDate today);

    @Query("SELECT COUNT(p) FROM Purchase p WHERE p.purchaseDate >= :startOfMonth AND p.purchaseDate <= :endOfMonth")
    long countMonthlyPurchases(@Param("startOfMonth") LocalDate startOfMonth, @Param("endOfMonth") LocalDate endOfMonth);

    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM Purchase p WHERE p.purchaseDate >= :startOfMonth AND p.purchaseDate <= :endOfMonth AND p.status <> 'CANCELLED'")
    BigDecimal sumMonthlyExpense(@Param("startOfMonth") LocalDate startOfMonth, @Param("endOfMonth") LocalDate endOfMonth);

    @Query("SELECT new com.example.sales.Inventory.Management.System.report.dto.MonthlyTrendDto(YEAR(p.purchaseDate), MONTH(p.purchaseDate), SUM(p.totalAmount)) " +
           "FROM Purchase p WHERE p.status <> 'CANCELLED' " +
           "GROUP BY YEAR(p.purchaseDate), MONTH(p.purchaseDate) " +
           "ORDER BY YEAR(p.purchaseDate) ASC, MONTH(p.purchaseDate) ASC")
    List<com.example.sales.Inventory.Management.System.report.dto.MonthlyTrendDto> getMonthlyPurchasesTrend();

    @Query("SELECT new com.example.sales.Inventory.Management.System.report.dto.StatusDistributionDto(p.status, COUNT(p)) " +
           "FROM Purchase p GROUP BY p.status")
    List<com.example.sales.Inventory.Management.System.report.dto.StatusDistributionDto> getPurchaseStatusDistribution();

    @Query("SELECT new com.example.sales.Inventory.Management.System.report.dto.StatusDistributionDto(p.paymentStatus, COUNT(p)) " +
           "FROM Purchase p GROUP BY p.paymentStatus")
    List<com.example.sales.Inventory.Management.System.report.dto.StatusDistributionDto> getPurchasePaymentStatusDistribution();

    @Query("SELECT new com.example.sales.Inventory.Management.System.report.dto.SupplierPerformanceDto(p.supplierName, p.supplierEmail, COUNT(p), SUM(p.totalAmount)) " +
           "FROM Purchase p WHERE p.status <> 'CANCELLED' " +
           "GROUP BY p.supplierName, p.supplierEmail ORDER BY SUM(p.totalAmount) DESC")
    List<com.example.sales.Inventory.Management.System.report.dto.SupplierPerformanceDto> findTopSuppliers(org.springframework.data.domain.Pageable pageable);
}
