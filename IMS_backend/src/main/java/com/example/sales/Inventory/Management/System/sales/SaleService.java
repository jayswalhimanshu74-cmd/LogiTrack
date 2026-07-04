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
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public SaleResponse createSale(SaleRequest request) {
        if (saleRepository.existsBySaleNo(request.getSaleNo())) {
            throw new DuplicateResourceException("Sale with number '" + request.getSaleNo() + "' already exists");
        }

        Sale sale = new Sale();
        sale.setSaleNo(request.getSaleNo());
        sale.setCustomerName(request.getCustomerName());
        sale.setSaleDate(request.getSaleDate());

        // Resolve authenticated creator if present
        User creator = getAuthenticatedUser();
        sale.setCreatedBy(creator);

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (SaleItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemRequest.getProductId()));

            // Check if there is enough stock
            if (product.getQuantityInStock() < itemRequest.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock for product '" + product.getName() 
                        + "'. Available: " + product.getQuantityInStock() + ", Requested: " + itemRequest.getQuantity());
            }

            // Decrement product stock
            product.setQuantityInStock(product.getQuantityInStock() - itemRequest.getQuantity());
            productRepository.save(product);

            // Compute line total
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
        return mapEntityToResponse(savedSale);
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
