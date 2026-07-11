package com.example.sales.Inventory.Management.System.sales;

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
public interface SaleRepository extends JpaRepository<Sale, Long> {

    boolean existsBySaleNo(String saleNo);

    Optional<Sale> findBySaleNo(String saleNo);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.status <> 'CANCELLED'")
    BigDecimal sumTotalSales();

    @Query("SELECT s FROM Sale s WHERE " +
           "(:search IS NULL OR :search = '' " +
           "OR LOWER(s.saleNo) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(s.customerName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(s.customerEmail) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(s.customerPhone) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR :status = '' OR s.status = :status) " +
           "AND (:paymentStatus IS NULL OR :paymentStatus = '' OR s.paymentStatus = :paymentStatus) " +
           "AND (CAST(:startDate AS date) IS NULL OR s.saleDate >= :startDate) " +
           "AND (CAST(:endDate AS date) IS NULL OR s.saleDate <= :endDate)")
    Page<Sale> findSalesFiltered(
            @Param("search") String search,
            @Param("status") String status,
            @Param("paymentStatus") String paymentStatus,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable
    );

    @Query("SELECT COUNT(s) FROM Sale s")
    long countAllSales();

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.status = 'PENDING'")
    long countPendingSales();

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.status = 'COMPLETED'")
    long countCompletedSales();

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.status = 'CANCELLED'")
    long countCancelledSales();

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.saleDate = :today")
    long countTodaySales(@Param("today") LocalDate today);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.saleDate = :today AND s.status <> 'CANCELLED'")
    BigDecimal sumTodayRevenue(@Param("today") LocalDate today);

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.saleDate >= :startOfMonth AND s.saleDate <= :endOfMonth")
    long countMonthlySales(@Param("startOfMonth") LocalDate startOfMonth, @Param("endOfMonth") LocalDate endOfMonth);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.saleDate >= :startOfMonth AND s.saleDate <= :endOfMonth AND s.status <> 'CANCELLED'")
    BigDecimal sumMonthlyRevenue(@Param("startOfMonth") LocalDate startOfMonth, @Param("endOfMonth") LocalDate endOfMonth);

    @Query("SELECT new com.example.sales.Inventory.Management.System.report.dto.ProductPerformanceDto(si.product.sku, si.product.name, SUM(si.quantity), SUM(si.lineTotal)) " +
           "FROM SaleItem si WHERE si.sale.status <> 'CANCELLED' " +
           "GROUP BY si.product.sku, si.product.name ORDER BY SUM(si.quantity) DESC")
    List<com.example.sales.Inventory.Management.System.report.dto.ProductPerformanceDto> findTopSellingProducts(Pageable pageable);

    @Query("SELECT new com.example.sales.Inventory.Management.System.report.dto.MonthlyTrendDto(YEAR(s.saleDate), MONTH(s.saleDate), SUM(s.totalAmount)) " +
           "FROM Sale s WHERE s.status <> 'CANCELLED' " +
           "GROUP BY YEAR(s.saleDate), MONTH(s.saleDate) " +
           "ORDER BY YEAR(s.saleDate) ASC, MONTH(s.saleDate) ASC")
    List<com.example.sales.Inventory.Management.System.report.dto.MonthlyTrendDto> getMonthlySalesTrend();

    @Query("SELECT new com.example.sales.Inventory.Management.System.report.dto.StatusDistributionDto(s.status, COUNT(s)) " +
           "FROM Sale s GROUP BY s.status")
    List<com.example.sales.Inventory.Management.System.report.dto.StatusDistributionDto> getSalesStatusDistribution();

    @Query("SELECT new com.example.sales.Inventory.Management.System.report.dto.StatusDistributionDto(s.paymentStatus, COUNT(s)) " +
           "FROM Sale s GROUP BY s.paymentStatus")
    List<com.example.sales.Inventory.Management.System.report.dto.StatusDistributionDto> getSalesPaymentStatusDistribution();
}
