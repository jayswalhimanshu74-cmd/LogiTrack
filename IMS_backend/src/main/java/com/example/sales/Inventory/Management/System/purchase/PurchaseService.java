package com.example.sales.Inventory.Management.System.purchase;

import com.example.sales.Inventory.Management.System.exception.DuplicateResourceException;
import com.example.sales.Inventory.Management.System.exception.ResourceNotFoundException;
import com.example.sales.Inventory.Management.System.product.Product;
import com.example.sales.Inventory.Management.System.product.ProductRepository;
import com.example.sales.Inventory.Management.System.purchase.dto.PurchaseItemRequest;
import com.example.sales.Inventory.Management.System.purchase.dto.PurchaseItemResponse;
import com.example.sales.Inventory.Management.System.purchase.dto.PurchaseRequest;
import com.example.sales.Inventory.Management.System.purchase.dto.PurchaseResponse;
import com.example.sales.Inventory.Management.System.user.User;
import com.example.sales.Inventory.Management.System.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public PurchaseResponse createPurchase(PurchaseRequest request) {
        if (purchaseRepository.existsByPurchaseNo(request.getPurchaseNo())) {
            throw new DuplicateResourceException("Purchase with number '" + request.getPurchaseNo() + "' already exists");
        }

        Purchase purchase = new Purchase();
        purchase.setPurchaseNo(request.getPurchaseNo());
        purchase.setSupplierName(request.getSupplierName());
        purchase.setPurchaseDate(request.getPurchaseDate());

        // Resolve authenticated creator if present
        User creator = getAuthenticatedUser();
        purchase.setCreatedBy(creator);

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (PurchaseItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemRequest.getProductId()));

            // Update product stock
            product.setQuantityInStock(product.getQuantityInStock() + itemRequest.getQuantity());
            productRepository.save(product);

            // Compute line total
            BigDecimal lineTotal = itemRequest.getUnitPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

            PurchaseItem purchaseItem = new PurchaseItem();
            purchaseItem.setProduct(product);
            purchaseItem.setQuantity(itemRequest.getQuantity());
            purchaseItem.setUnitPrice(itemRequest.getUnitPrice());
            purchaseItem.setLineTotal(lineTotal);

            purchase.addItem(purchaseItem);
            totalAmount = totalAmount.add(lineTotal);
        }

        purchase.setTotalAmount(totalAmount);
        Purchase savedPurchase = purchaseRepository.save(purchase);
        return mapEntityToResponse(savedPurchase);
    }

    @Transactional(readOnly = true)
    public List<PurchaseResponse> getAllPurchases() {
        return purchaseRepository.findAll().stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PurchaseResponse getPurchaseById(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with id: " + id));
        return mapEntityToResponse(purchase);
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return userRepository.findByEmail(auth.getName()).orElse(null);
        }
        return null;
    }

    private PurchaseResponse mapEntityToResponse(Purchase purchase) {
        PurchaseResponse response = new PurchaseResponse();
        response.setId(purchase.getId());
        response.setPurchaseNo(purchase.getPurchaseNo());
        response.setSupplierName(purchase.getSupplierName());
        response.setPurchaseDate(purchase.getPurchaseDate());
        response.setTotalAmount(purchase.getTotalAmount());
        response.setCreatedAt(purchase.getCreatedAt());
        response.setUpdatedAt(purchase.getUpdatedAt());

        if (purchase.getCreatedBy() != null) {
            response.setCreatedById(purchase.getCreatedBy().getId());
            response.setCreatedByFullName(purchase.getCreatedBy().getFullName());
            response.setCreatedByEmail(purchase.getCreatedBy().getEmail());
        }

        List<PurchaseItemResponse> itemResponses = purchase.getItems().stream()
                .map(item -> new PurchaseItemResponse(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getProduct().getSku(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getLineTotal()
                ))
                .collect(Collectors.toList());

        response.setItems(itemResponses);
        return response;
    }
}
