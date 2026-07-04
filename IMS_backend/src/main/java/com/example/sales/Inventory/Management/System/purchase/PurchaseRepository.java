package com.example.sales.Inventory.Management.System.purchase;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    
    boolean existsByPurchaseNo(String purchaseNo);
    
    Optional<Purchase> findByPurchaseNo(String purchaseNo);

    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM Purchase p")
    BigDecimal sumTotalPurchases();
}
