package com.example.sales.Inventory.Management.System.product;

import com.example.sales.Inventory.Management.System.dashboard.dto.CategoryStockDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    Optional<Product> findBySku(String sku);
    
    boolean existsBySku(String sku);
    
    boolean existsBySkuAndIdNot(String sku, Long id);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.quantityInStock <= p.reorderLevel")
    long countLowStockProducts();

    @Query("SELECT new com.example.sales.Inventory.Management.System.dashboard.dto.CategoryStockDto(p.category, COUNT(p), COALESCE(SUM(p.quantityInStock), 0)) FROM Product p GROUP BY p.category")
    List<CategoryStockDto> getCategoryStockBreakdown();

    @Query("SELECT p FROM Product p WHERE " +
           "(:search IS NULL OR :search = '' " +
           "OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(p.category) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:category IS NULL OR :category = '' OR p.category = :category) " +
           "AND (:status IS NULL OR :status = '' OR " +
           "(:status = 'OUT_OF_STOCK' AND p.quantityInStock = 0) OR " +
           "(:status = 'LOW_STOCK' AND p.quantityInStock > 0 AND p.quantityInStock <= p.reorderLevel) OR " +
           "(:status = 'IN_STOCK' AND p.quantityInStock > p.reorderLevel))")
    Page<Product> findProductsFiltered(
            @Param("search") String search,
            @Param("category") String category,
            @Param("status") String status,
            Pageable pageable
    );

    @Query("SELECT p FROM Product p WHERE p.quantityInStock <= p.reorderLevel")
    Page<Product> findLowStockProducts(Pageable pageable);

    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.category IS NOT NULL AND p.category <> '' ORDER BY p.category ASC")
    List<String> findDistinctCategories();

    @Query("SELECT COALESCE(SUM(p.quantityInStock * p.purchasePrice), 0) FROM Product p")
    java.math.BigDecimal sumTotalInventoryValue();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.quantityInStock = 0")
    long countOutOfStockProducts();

    @Query("SELECT p FROM Product p WHERE p.quantityInStock > 0 ORDER BY (p.quantityInStock * p.purchasePrice) DESC")
    Page<Product> findHighestValueProducts(Pageable pageable);

    @Query("SELECT new com.example.sales.Inventory.Management.System.report.dto.CategoryDistributionDto(p.category, COUNT(p)) FROM Product p WHERE p.quantityInStock <= p.reorderLevel GROUP BY p.category")
    List<com.example.sales.Inventory.Management.System.report.dto.CategoryDistributionDto> getLowStockTrend();
}
