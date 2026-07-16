package com.example.sales.Inventory.Management.System.sales;

import com.example.sales.Inventory.Management.System.exception.DuplicateResourceException;
import com.example.sales.Inventory.Management.System.exception.InsufficientStockException;
import com.example.sales.Inventory.Management.System.exception.ResourceNotFoundException;
import com.example.sales.Inventory.Management.System.product.Product;
import com.example.sales.Inventory.Management.System.product.ProductRepository;
import com.example.sales.Inventory.Management.System.sales.dto.SaleItemRequest;
import com.example.sales.Inventory.Management.System.sales.dto.SaleItemResponse;
import com.example.sales.Inventory.Management.System.sales.dto.SaleRequest;
import com.example.sales.Inventory.Management.System.sales.dto.SaleResponse;
import com.example.sales.Inventory.Management.System.user.User;
import com.example.sales.Inventory.Management.System.user.UserRepository;
import com.example.sales.Inventory.Management.System.audit.Audit;
import com.example.sales.Inventory.Management.System.movement.StockMovementService;
import com.example.sales.Inventory.Management.System.movement.MovementType;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.example.sales.Inventory.Management.System.sales.dto.SalesStatisticsResponse;
import org.springframework.context.ApplicationEventPublisher;
import com.example.sales.Inventory.Management.System.notification.event.NotificationEvent;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import com.example.sales.Inventory.Management.System.user.Role;

import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final StockMovementService stockMovementService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    @Audit(action = "SALE_CREATED", entityName = "SALE", description = "Sales order created successfully")
    public SaleResponse createSale(SaleRequest request) {
        User creator = getAuthenticatedUser();
        if (creator == null || (creator.getRole() != Role.ADMIN && creator.getRole() != Role.MANAGER)) {
            throw new org.springframework.security.access.AccessDeniedException("Insufficient permissions to create sales orders");
        }

        if (saleRepository.existsBySaleNo(request.getSaleNo())) {
            throw new DuplicateResourceException("Sale with number '" + request.getSaleNo() + "' already exists");
        }

        Sale sale = new Sale();
        sale.setSaleNo(request.getSaleNo());
        sale.setCustomerName(request.getCustomerName());
        sale.setCustomerPhone(request.getCustomerPhone());
        sale.setCustomerEmail(request.getCustomerEmail());
        sale.setStatus(request.getStatus().toUpperCase());
        sale.setPaymentStatus(request.getPaymentStatus().toUpperCase());
        sale.setPaymentMethod(request.getPaymentMethod().toUpperCase());
        sale.setNotes(request.getNotes());
        sale.setSaleDate(request.getSaleDate());

        sale.setCreatedBy(creator);

        BigDecimal totalAmount = BigDecimal.ZERO;
        boolean deductStock = !"CANCELLED".equals(sale.getStatus());

        for (SaleItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemRequest.getProductId()));

            int previousQty = product.getQuantityInStock() != null ? product.getQuantityInStock() : 0;

            if (deductStock) {
                if (previousQty < itemRequest.getQuantity()) {
                    throw new InsufficientStockException("Insufficient stock for product '" + product.getName() 
                            + "'. Available: " + previousQty + ", Requested: " + itemRequest.getQuantity());
                }
                int newQty = previousQty - itemRequest.getQuantity();
                product.setQuantityInStock(newQty);
                productRepository.save(product);

                // Record stock movement
                stockMovementService.recordMovement(
                    product, 
                    previousQty, 
                    newQty, 
                    MovementType.SALE, 
                    sale.getSaleNo(), 
                    creator, 
                    "Sales order " + sale.getSaleNo() + " creation deduction"
                );
            }

            BigDecimal lineTotal = itemRequest.getUnitPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

            SaleItem saleItem = new SaleItem();
            saleItem.setProduct(product);
            saleItem.setQuantity(itemRequest.getQuantity());
            saleItem.setUnitPrice(itemRequest.getUnitPrice());
            saleItem.setLineTotal(lineTotal);

            sale.addItem(saleItem);
            totalAmount = totalAmount.add(lineTotal);
        }

        sale.setTotalAmount(totalAmount);
        Sale savedSale = saleRepository.save(sale);

        eventPublisher.publishEvent(NotificationEvent.builder()
                .title("Sales Order Created")
                .message(String.format("Sales Order %s for customer %s has been created for $%s.", savedSale.getSaleNo(), savedSale.getCustomerName(), savedSale.getTotalAmount()))
                .type("SALE_COMPLETED")
                .severity("SUCCESS")
                .priority("MEDIUM")
                .referenceId(savedSale.getId())
                .referenceType("SALE")
                .build());

        return mapEntityToResponse(savedSale);
    }

    @Transactional
    @Audit(action = "SALE_UPDATED", entityName = "SALE", description = "Sales order updated successfully")
    public SaleResponse updateSale(Long id, SaleRequest request) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null || (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.MANAGER)) {
            throw new org.springframework.security.access.AccessDeniedException("Insufficient permissions to update sales orders");
        }

        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sales order not found with id: " + id));

        if (!sale.getSaleNo().equals(request.getSaleNo()) && saleRepository.existsBySaleNo(request.getSaleNo())) {
            throw new DuplicateResourceException("Sale with number '" + request.getSaleNo() + "' already exists");
        }

        String oldStatus = sale.getStatus();
        String newStatus = request.getStatus().toUpperCase();

        // 1. Capture original stock levels for all involved products
        Map<Long, Integer> originalProductStocks = new HashMap<>();
        for (SaleItem item : sale.getItems()) {
            originalProductStocks.put(item.getProduct().getId(), item.getProduct().getQuantityInStock());
        }
        for (SaleItemRequest itemReq : request.getItems()) {
            if (!originalProductStocks.containsKey(itemReq.getProductId())) {
                productRepository.findById(itemReq.getProductId()).ifPresent(p -> {
                    originalProductStocks.put(p.getId(), p.getQuantityInStock());
                });
            }
        }

        // 2. Perform existing stock adjustment logic
        if ("CANCELLED".equals(oldStatus) && !"CANCELLED".equals(newStatus)) {
            for (SaleItemRequest itemReq : request.getItems()) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemReq.getProductId()));
                if (product.getQuantityInStock() < itemReq.getQuantity()) {
                    throw new InsufficientStockException("Insufficient stock for product '" + product.getName()
                            + "'. Available: " + product.getQuantityInStock() + ", Requested: " + itemReq.getQuantity());
                }
                product.setQuantityInStock(product.getQuantityInStock() - itemReq.getQuantity());
                productRepository.save(product);
            }
        } else if (!"CANCELLED".equals(oldStatus) && "CANCELLED".equals(newStatus)) {
            for (SaleItem item : sale.getItems()) {
                Product product = item.getProduct();
                product.setQuantityInStock(product.getQuantityInStock() + item.getQuantity());
                productRepository.save(product);
            }
        } else if (!"CANCELLED".equals(oldStatus) && !"CANCELLED".equals(newStatus)) {
            // Restore all old quantities temporarily
            for (SaleItem item : sale.getItems()) {
                Product product = item.getProduct();
                product.setQuantityInStock(product.getQuantityInStock() + item.getQuantity());
                productRepository.save(product);
            }

            // Validate and deduct new quantities
            for (SaleItemRequest itemReq : request.getItems()) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemReq.getProductId()));
                if (product.getQuantityInStock() < itemReq.getQuantity()) {
                    // Rollback temporary stock restoration
                    for (SaleItem item : sale.getItems()) {
                        Product p = item.getProduct();
                        p.setQuantityInStock(p.getQuantityInStock() - item.getQuantity());
                        productRepository.save(p);
                    }
                    throw new InsufficientStockException("Insufficient stock for product '" + product.getName()
                            + "'. Available: " + product.getQuantityInStock() + ", Requested: " + itemReq.getQuantity());
                }
                product.setQuantityInStock(product.getQuantityInStock() - itemReq.getQuantity());
                productRepository.save(product);
            }
        }

        // Apply new values
        sale.setSaleNo(request.getSaleNo());
        sale.setCustomerName(request.getCustomerName());
        sale.setCustomerPhone(request.getCustomerPhone());
        sale.setCustomerEmail(request.getCustomerEmail());
        sale.setStatus(newStatus);
        sale.setPaymentStatus(request.getPaymentStatus().toUpperCase());
        sale.setPaymentMethod(request.getPaymentMethod().toUpperCase());
        sale.setNotes(request.getNotes());
        sale.setSaleDate(request.getSaleDate());

        sale.getItems().clear();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (SaleItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemRequest.getProductId()));

            BigDecimal lineTotal = itemRequest.getUnitPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

            SaleItem saleItem = new SaleItem();
            saleItem.setProduct(product);
            saleItem.setQuantity(itemRequest.getQuantity());
            saleItem.setUnitPrice(itemRequest.getUnitPrice());
            saleItem.setLineTotal(lineTotal);

            sale.addItem(saleItem);
            totalAmount = totalAmount.add(lineTotal);
        }

        sale.setTotalAmount(totalAmount);
        Sale savedSale = saleRepository.save(sale);

        // 3. Record stock movement for any product whose quantity actually changed
        MovementType mType = "CANCELLED".equals(newStatus) ? MovementType.RETURN : MovementType.SALE;
        String mRemarks = "CANCELLED".equals(newStatus) ? 
                "Sales order " + sale.getSaleNo() + " cancelled, stock returned" :
                "Sales order " + sale.getSaleNo() + " updated";

        for (Map.Entry<Long, Integer> entry : originalProductStocks.entrySet()) {
            Product p = productRepository.findById(entry.getKey()).orElse(null);
            if (p != null) {
                int oldStock = entry.getValue();
                int newStock = p.getQuantityInStock();
                if (oldStock != newStock) {
                    stockMovementService.recordMovement(
                        p, 
                        oldStock, 
                        newStock, 
                        mType, 
                        sale.getSaleNo(), 
                        currentUser, 
                        mRemarks
                    );
                }
            }
        }

        return mapEntityToResponse(savedSale);
    }

    @Transactional
    @Audit(action = "SALE_CANCELLED", entityName = "SALE", description = "Sales order deleted / cancelled")
    public void deleteSale(Long id) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null || currentUser.getRole() != Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Only administrators can delete sales orders");
        }

        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sales order not found with id: " + id));

        // 1. Capture original stocks
        Map<Long, Integer> originalProductStocks = new HashMap<>();
        for (SaleItem item : sale.getItems()) {
            originalProductStocks.put(item.getProduct().getId(), item.getProduct().getQuantityInStock());
        }

        // Restore stock levels if order was not cancelled
        if (!"CANCELLED".equals(sale.getStatus())) {
            for (SaleItem item : sale.getItems()) {
                Product product = item.getProduct();
                product.setQuantityInStock(product.getQuantityInStock() + item.getQuantity());
                productRepository.save(product);
            }
        }

        saleRepository.delete(sale);

        // 2. Record movement for products whose stock levels were restored
        for (Map.Entry<Long, Integer> entry : originalProductStocks.entrySet()) {
            Product p = productRepository.findById(entry.getKey()).orElse(null);
            if (p != null) {
                int oldStock = entry.getValue();
                int newStock = p.getQuantityInStock();
                if (oldStock != newStock) {
                    stockMovementService.recordMovement(
                        p, 
                        oldStock, 
                        newStock, 
                        MovementType.RETURN, 
                        sale.getSaleNo(), 
                        currentUser, 
                        "Sales order " + sale.getSaleNo() + " deleted, stock returned"
                    );
                }
            }
        }
    }

    @Transactional(readOnly = true)
    public Page<SaleResponse> getFilteredSales(String search, String status, String paymentStatus, 
                                              LocalDate startDate, LocalDate endDate, Pageable pageable) {
        String uStatus = (status != null && !status.isEmpty()) ? status.toUpperCase() : null;
        String uPaymentStatus = (paymentStatus != null && !paymentStatus.isEmpty()) ? paymentStatus.toUpperCase() : null;

        return saleRepository.findSalesFiltered(search, uStatus, uPaymentStatus, startDate, endDate, pageable)
                .map(this::mapEntityToResponse);
    }

    @Transactional(readOnly = true)
    public List<SaleResponse> getAllSales() {
        return saleRepository.findAll().stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SaleResponse getSaleById(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sales order not found with id: " + id));
        return mapEntityToResponse(sale);
    }

    @Transactional(readOnly = true)
    public List<SaleResponse> getRecentSales() {
        org.springframework.data.domain.PageRequest pageRequest = 
                org.springframework.data.domain.PageRequest.of(0, 5, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        return saleRepository.findAll(pageRequest).getContent().stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SalesStatisticsResponse getSalesStatistics() {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.with(java.time.temporal.TemporalAdjusters.lastDayOfMonth());

        long totalSalesCount = saleRepository.countAllSales();
        BigDecimal totalRevenue = saleRepository.sumTotalSales();
        
        long pendingCount = saleRepository.countPendingSales();
        long completedCount = saleRepository.countCompletedSales();
        long cancelledCount = saleRepository.countCancelledSales();

        long todayCount = saleRepository.countTodaySales(today);
        BigDecimal todayRevenue = saleRepository.sumTodayRevenue(today);

        long monthlyCount = saleRepository.countMonthlySales(startOfMonth, endOfMonth);
        BigDecimal monthlyRevenue = saleRepository.sumMonthlyRevenue(startOfMonth, endOfMonth);

        return new SalesStatisticsResponse(
                totalSalesCount,
                totalRevenue,
                todayCount,
                todayRevenue,
                monthlyCount,
                monthlyRevenue,
                pendingCount,
                completedCount,
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

    private SaleResponse mapEntityToResponse(Sale sale) {
        SaleResponse response = new SaleResponse();
        response.setId(sale.getId());
        response.setSaleNo(sale.getSaleNo());
        response.setCustomerName(sale.getCustomerName());
        response.setCustomerPhone(sale.getCustomerPhone());
        response.setCustomerEmail(sale.getCustomerEmail());
        response.setStatus(sale.getStatus());
        response.setPaymentStatus(sale.getPaymentStatus());
        response.setPaymentMethod(sale.getPaymentMethod());
        response.setNotes(sale.getNotes());
        response.setSaleDate(sale.getSaleDate());
        response.setTotalAmount(sale.getTotalAmount());
        response.setCreatedAt(sale.getCreatedAt());
        response.setUpdatedAt(sale.getUpdatedAt());

        if (sale.getCreatedBy() != null) {
            response.setCreatedById(sale.getCreatedBy().getId());
            response.setCreatedByFullName(sale.getCreatedBy().getFullName());
            response.setCreatedByEmail(sale.getCreatedBy().getEmail());
        }

        List<SaleItemResponse> itemResponses = sale.getItems().stream()
                .map(item -> new SaleItemResponse(
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
