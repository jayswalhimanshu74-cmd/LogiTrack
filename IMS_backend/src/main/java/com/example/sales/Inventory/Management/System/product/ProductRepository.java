package com.example.sales.Inventory.Management.System.product;

import com.example.sales.Inventory.Management.System.dashboard.dto.CategoryStockDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    Optional<Product> findBySku(String sku);
    
    boolean existsBySku(String sku);
    
    boolean existsBySkuAndIdNot(String sku, Long id);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.quantityInStock <= p.reorderLevel")
    long countLowStockProducts();

    @Query("SELECT new com.example.sales.Inventory.Management.System.dashboard.dto.CategoryStockDto(p.category, COUNT(p), COALESCE(SUM(p.quantityInStock), 0)) FROM Product p GROUP BY p.category")
    List<CategoryStockDto> getCategoryStockBreakdown();
}
