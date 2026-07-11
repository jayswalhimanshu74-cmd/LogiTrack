package com.example.sales.Inventory.Management.System.purchase;

import com.example.sales.Inventory.Management.System.exception.DuplicateResourceException;
import com.example.sales.Inventory.Management.System.exception.InsufficientStockException;
import com.example.sales.Inventory.Management.System.exception.ResourceNotFoundException;
import com.example.sales.Inventory.Management.System.product.Product;
import com.example.sales.Inventory.Management.System.product.ProductRepository;
import com.example.sales.Inventory.Management.System.purchase.dto.*;
import com.example.sales.Inventory.Management.System.user.User;
import com.example.sales.Inventory.Management.System.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
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
        purchase.setSupplierPhone(request.getSupplierPhone());
        purchase.setSupplierEmail(request.getSupplierEmail());
        purchase.setStatus(request.getStatus().toUpperCase());
        purchase.setPaymentStatus(request.getPaymentStatus().toUpperCase());
        purchase.setPaymentMethod(request.getPaymentMethod().toUpperCase());
        purchase.setInvoiceNo(request.getInvoiceNo());
        purchase.setNotes(request.getNotes());
        purchase.setPurchaseDate(request.getPurchaseDate());

        User creator = getAuthenticatedUser();
        purchase.setCreatedBy(creator);

        BigDecimal totalAmount = BigDecimal.ZERO;
        boolean addStock = !"CANCELLED".equals(purchase.getStatus());

        for (PurchaseItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemRequest.getProductId()));

            // Update product stock
            if (addStock) {
                product.setQuantityInStock(product.getQuantityInStock() + itemRequest.getQuantity());
                productRepository.save(product);
            }

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

    @Transactional
    public PurchaseResponse updatePurchase(Long id, PurchaseRequest request) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with id: " + id));

        if (!purchase.getPurchaseNo().equals(request.getPurchaseNo()) && purchaseRepository.existsByPurchaseNo(request.getPurchaseNo())) {
            throw new DuplicateResourceException("Purchase with number '" + request.getPurchaseNo() + "' already exists");
        }

        String oldStatus = purchase.getStatus();
        String newStatus = request.getStatus().toUpperCase();

        // 1. Temporarily group original items by product
        java.util.Map<Long, Integer> oldQuantities = new java.util.HashMap<>();
        for (PurchaseItem item : purchase.getItems()) {
            oldQuantities.put(item.getProduct().getId(), item.getQuantity());
        }

        // 2. Enforce stock reversals and adjustments
        if (!"CANCELLED".equals(oldStatus) && "CANCELLED".equals(newStatus)) {
            // RECEIVED/PENDING -> CANCELLED: Reverse the stock increase (subtract quantities)
            // Validate first to protect against negative stock
            for (PurchaseItem item : purchase.getItems()) {
                Product product = item.getProduct();
                if (product.getQuantityInStock() < item.getQuantity()) {
                    throw new InsufficientStockException("Cannot cancel purchase. Product '" + product.getName() 
                            + "' stock would drop below zero. Available: " + product.getQuantityInStock() + ", Reversal qty: " + item.getQuantity());
                }
                product.setQuantityInStock(product.getQuantityInStock() - item.getQuantity());
                productRepository.save(product);
            }
        } else if ("CANCELLED".equals(oldStatus) && !"CANCELLED".equals(newStatus)) {
            // CANCELLED -> RECEIVED/PENDING: Re-apply purchase (add new quantities to stock)
            for (PurchaseItemRequest itemReq : request.getItems()) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemReq.getProductId()));
                product.setQuantityInStock(product.getQuantityInStock() + itemReq.getQuantity());
                productRepository.save(product);
            }
        } else if (!"CANCELLED".equals(oldStatus) && !"CANCELLED".equals(newStatus)) {
            // Non-cancelled -> Non-cancelled: Deduct old stock first (checking for negative values), then apply new stock
            for (PurchaseItem item : purchase.getItems()) {
                Product product = item.getProduct();
                if (product.getQuantityInStock() < item.getQuantity()) {
                    throw new InsufficientStockException("Cannot update purchase. Product '" + product.getName()
                            + "' stock would drop below zero during modification. Available: " + product.getQuantityInStock() + ", Required to revert: " + item.getQuantity());
                }
                product.setQuantityInStock(product.getQuantityInStock() - item.getQuantity());
                productRepository.save(product);
            }

            for (PurchaseItemRequest itemReq : request.getItems()) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemReq.getProductId()));
                product.setQuantityInStock(product.getQuantityInStock() + itemReq.getQuantity());
                productRepository.save(product);
            }
        }

        // Apply new values
        purchase.setPurchaseNo(request.getPurchaseNo());
        purchase.setSupplierName(request.getSupplierName());
        purchase.setSupplierPhone(request.getSupplierPhone());
        purchase.setSupplierEmail(request.getSupplierEmail());
        purchase.setStatus(newStatus);
        purchase.setPaymentStatus(request.getPaymentStatus().toUpperCase());
        purchase.setPaymentMethod(request.getPaymentMethod().toUpperCase());
        purchase.setInvoiceNo(request.getInvoiceNo());
        purchase.setNotes(request.getNotes());
        purchase.setPurchaseDate(request.getPurchaseDate());

        // Rebuild items list
        purchase.getItems().clear();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (PurchaseItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemRequest.getProductId()));

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

    @Transactional
    public void deletePurchase(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with id: " + id));

        // Reverse stock increase if purchase was active (received/pending)
        if (!"CANCELLED".equals(purchase.getStatus())) {
            for (PurchaseItem item : purchase.getItems()) {
                Product product = item.getProduct();
                if (product.getQuantityInStock() < item.getQuantity()) {
                    throw new InsufficientStockException("Cannot delete purchase. Product '" + product.getName() 
                            + "' stock would drop below zero. Available: " + product.getQuantityInStock() + ", Reversal qty: " + item.getQuantity());
                }
                product.setQuantityInStock(product.getQuantityInStock() - item.getQuantity());
                productRepository.save(product);
            }
        }

        purchaseRepository.delete(purchase);
    }

    @Transactional(readOnly = true)
    public Page<PurchaseResponse> getFilteredPurchases(String search, String status, String paymentStatus, 
                                                      LocalDate startDate, LocalDate endDate, Pageable pageable) {
        String uStatus = (status != null && !status.isEmpty()) ? status.toUpperCase() : null;
        String uPaymentStatus = (paymentStatus != null && !paymentStatus.isEmpty()) ? paymentStatus.toUpperCase() : null;

        return purchaseRepository.findPurchasesFiltered(search, uStatus, uPaymentStatus, startDate, endDate, pageable)
                .map(this::mapEntityToResponse);
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

    @Transactional(readOnly = true)
    public List<PurchaseResponse> getRecentPurchases() {
        org.springframework.data.domain.PageRequest pageRequest = 
                org.springframework.data.domain.PageRequest.of(0, 5, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        return purchaseRepository.findAll(pageRequest).getContent().stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PurchaseStatisticsResponse getPurchaseStatistics() {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.with(java.time.temporal.TemporalAdjusters.lastDayOfMonth());

        long totalPurchasesCount = purchaseRepository.countAllPurchases();
        BigDecimal totalExpense = purchaseRepository.sumTotalPurchases();
        
        long pendingCount = purchaseRepository.countPendingPurchases();
        long receivedCount = purchaseRepository.countReceivedPurchases();
        long cancelledCount = purchaseRepository.countCancelledPurchases();

        long todayCount = purchaseRepository.countTodayPurchases(today);
        BigDecimal todayExpense = purchaseRepository.sumTodayExpense(today);

        long monthlyCount = purchaseRepository.countMonthlyPurchases(startOfMonth, endOfMonth);
        BigDecimal monthlyExpense = purchaseRepository.sumMonthlyExpense(startOfMonth, endOfMonth);

        return new PurchaseStatisticsResponse(
                totalPurchasesCount,
                totalExpense,
                todayCount,
                todayExpense,
                monthlyCount,
                monthlyExpense,
                pendingCount,
                receivedCount,
                cancelledCount
        );
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
        response.setSupplierPhone(purchase.getSupplierPhone());
        response.setSupplierEmail(purchase.getSupplierEmail());
        response.setStatus(purchase.getStatus());
        response.setPaymentStatus(purchase.getPaymentStatus());
        response.setPaymentMethod(purchase.getPaymentMethod());
        response.setInvoiceNo(purchase.getInvoiceNo());
        response.setNotes(purchase.getNotes());
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
