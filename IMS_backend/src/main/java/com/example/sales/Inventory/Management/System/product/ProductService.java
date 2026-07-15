package com.example.sales.Inventory.Management.System.product;

import com.example.sales.Inventory.Management.System.exception.DuplicateResourceException;
import com.example.sales.Inventory.Management.System.exception.ResourceNotFoundException;
import com.example.sales.Inventory.Management.System.product.dto.ProductRequest;
import com.example.sales.Inventory.Management.System.product.dto.ProductResponse;
import com.example.sales.Inventory.Management.System.audit.Audit;
import com.example.sales.Inventory.Management.System.movement.StockMovementService;
import com.example.sales.Inventory.Management.System.movement.MovementType;
import com.example.sales.Inventory.Management.System.user.User;
import com.example.sales.Inventory.Management.System.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.context.ApplicationEventPublisher;
import com.example.sales.Inventory.Management.System.notification.event.NotificationEvent;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final StockMovementService stockMovementService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    @Audit(action = "PRODUCT_CREATED", entityName = "PRODUCT", description = "Product created successfully")
    public ProductResponse createProduct(ProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new DuplicateResourceException("Product with SKU '" + request.getSku() + "' already exists");
        }

        Product product = new Product();
        mapRequestToEntity(request, product);

        Product savedProduct = productRepository.save(product);

        eventPublisher.publishEvent(NotificationEvent.builder()
                .title("Product Added")
                .message(String.format("Product %s (%s) has been added to the catalog.", savedProduct.getName(), savedProduct.getSku()))
                .type("SYSTEM_ALERT")
                .severity("INFO")
                .priority("LOW")
                .referenceId(savedProduct.getId())
                .referenceType("PRODUCT")
                .build());

        if (savedProduct.getQuantityInStock() != null && savedProduct.getQuantityInStock() >= 0) {
            User user = getAuthenticatedUser();
            stockMovementService.recordMovement(
                savedProduct, 
                0, 
                savedProduct.getQuantityInStock(), 
                MovementType.MANUAL_CORRECTION, 
                "INIT-" + savedProduct.getSku(), 
                user, 
                "Initial stock on creation"
            );
        }

        return mapEntityToResponse(savedProduct);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapEntityToResponse(product);
    }

    @Transactional
    @Audit(action = "PRODUCT_UPDATED", entityName = "PRODUCT", description = "Product updated successfully")
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (productRepository.existsBySkuAndIdNot(request.getSku(), id)) {
            throw new DuplicateResourceException("Product with SKU '" + request.getSku() + "' already exists");
        }

        int oldQty = product.getQuantityInStock() != null ? product.getQuantityInStock() : 0;
        int newQty = request.getQuantityInStock() != null ? request.getQuantityInStock() : 0;

        mapRequestToEntity(request, product);
        Product updatedProduct = productRepository.save(product);

        eventPublisher.publishEvent(NotificationEvent.builder()
                .title("Product Updated")
                .message(String.format("Product %s (%s) has been updated.", updatedProduct.getName(), updatedProduct.getSku()))
                .type("SYSTEM_ALERT")
                .severity("INFO")
                .priority("LOW")
                .referenceId(updatedProduct.getId())
                .referenceType("PRODUCT")
                .build());

        if (oldQty != newQty) {
            User user = getAuthenticatedUser();
            stockMovementService.recordMovement(
                updatedProduct,
                oldQty,
                newQty,
                MovementType.ADJUSTMENT,
                "UPD-" + updatedProduct.getSku(),
                user,
                "Manual adjustment via product edit"
            );
        }

        return mapEntityToResponse(updatedProduct);
    }

    @Transactional
    @Audit(action = "PRODUCT_DELETED", entityName = "PRODUCT", description = "Product deleted successfully")
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        String sku = product.getSku();
        String name = product.getName();
        
        productRepository.delete(product);

        eventPublisher.publishEvent(NotificationEvent.builder()
                .title("Product Deleted")
                .message(String.format("Product %s (%s) has been deleted from the catalog.", name, sku))
                .type("SYSTEM_ALERT")
                .severity("WARNING")
                .priority("LOW")
                .referenceId(id)
                .referenceType("PRODUCT")
                .build());
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getFilteredProducts(String search, String category, String status, Pageable pageable) {
        return productRepository.findProductsFiltered(search, category, status, pageable)
                .map(this::mapEntityToResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getLowStockProducts(Pageable pageable) {
        return productRepository.findLowStockProducts(pageable)
                .map(this::mapEntityToResponse);
    }

    @Transactional(readOnly = true)
    public List<String> getDistinctCategories() {
        return productRepository.findDistinctCategories();
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return userRepository.findByEmail(auth.getName()).orElse(null);
        }
        return null;
    }

    private void mapRequestToEntity(ProductRequest request, Product product) {
        product.setSku(request.getSku());
        product.setName(request.getName());
        product.setCategory(request.getCategory());
        product.setUnit(request.getUnit());
        product.setPurchasePrice(request.getPurchasePrice());
        product.setSellingPrice(request.getSellingPrice());
        product.setQuantityInStock(request.getQuantityInStock());
        product.setReorderLevel(request.getReorderLevel());
    }

    private ProductResponse mapEntityToResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setSku(product.getSku());
        response.setName(product.getName());
        response.setCategory(product.getCategory());
        response.setUnit(product.getUnit());
        response.setPurchasePrice(product.getPurchasePrice());
        response.setSellingPrice(product.getSellingPrice());
        response.setQuantityInStock(product.getQuantityInStock());
        response.setReorderLevel(product.getReorderLevel());

        int qty = product.getQuantityInStock() != null ? product.getQuantityInStock() : 0;
        int reorder = product.getReorderLevel() != null ? product.getReorderLevel() : 0;
        if (qty <= 0) {
            response.setStatus("OUT_OF_STOCK");
        } else if (qty <= reorder) {
            response.setStatus("LOW_STOCK");
        } else {
            response.setStatus("IN_STOCK");
        }

        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());
        return response;
    }
}
