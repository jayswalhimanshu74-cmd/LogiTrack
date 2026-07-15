package com.example.sales.Inventory.Management.System.movement;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long>, JpaSpecificationExecutor<StockMovement> {

    @Query("SELECT COUNT(sm) FROM StockMovement sm")
    long countAllMovements();

    @Query("SELECT sm FROM StockMovement sm WHERE " +
           "(:productId IS NULL OR sm.product.id = :productId) " +
           "AND (:movementType IS NULL OR sm.movementType = :movementType) " +
           "AND (:performedById IS NULL OR sm.performedBy.id = :performedById) " +
           "AND (CAST(:startDate AS timestamp) IS NULL OR sm.timestamp >= :startDate) " +
           "AND (CAST(:endDate AS timestamp) IS NULL OR sm.timestamp <= :endDate) " +
           "AND (:search IS NULL OR :search = '' " +
           "OR LOWER(sm.movementNo) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(sm.referenceNo) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(sm.product.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(sm.product.sku) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(sm.performedBy.fullName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<StockMovement> findFiltered(
            @Param("productId") Long productId,
            @Param("movementType") MovementType movementType,
            @Param("performedById") Long performedById,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT new com.example.sales.Inventory.Management.System.movement.dto.MostAdjustedProductDto(sm.product.sku, sm.product.name, COUNT(sm), SUM(CASE WHEN sm.difference < 0 THEN -sm.difference ELSE sm.difference END)) " +
           "FROM StockMovement sm WHERE sm.movementType IN (com.example.sales.Inventory.Management.System.movement.MovementType.ADJUSTMENT, com.example.sales.Inventory.Management.System.movement.MovementType.MANUAL_CORRECTION, com.example.sales.Inventory.Management.System.movement.MovementType.DAMAGED, com.example.sales.Inventory.Management.System.movement.MovementType.EXPIRED) " +
           "GROUP BY sm.product.sku, sm.product.name ORDER BY COUNT(sm) DESC")
    java.util.List<com.example.sales.Inventory.Management.System.movement.dto.MostAdjustedProductDto> findMostAdjustedProducts(Pageable pageable);

    @Query("SELECT sm.movementType, COUNT(sm), SUM(CAST(sm.difference AS long)) FROM StockMovement sm GROUP BY sm.movementType")
    java.util.List<Object[]> getRawInventoryFlow();

    @Query("SELECT sm.product.sku, sm.product.name, sm.product.quantityInStock, MAX(sm.timestamp) " +
           "FROM StockMovement sm GROUP BY sm.product.sku, sm.product.name, sm.product.quantityInStock ORDER BY MAX(sm.timestamp) ASC")
    java.util.List<Object[]> getRawStockAging(Pageable pageable);

    @Query("SELECT COALESCE(SUM(sm.difference), 0) FROM StockMovement sm WHERE sm.difference > 0")
    long sumTotalIncoming();

    @Query("SELECT COALESCE(SUM(sm.difference), 0) FROM StockMovement sm WHERE sm.difference < 0")
    long sumTotalOutgoing();
}
