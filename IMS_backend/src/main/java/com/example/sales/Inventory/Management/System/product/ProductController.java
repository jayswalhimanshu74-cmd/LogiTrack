package com.example.sales.Inventory.Management.System.product;

import com.example.sales.Inventory.Management.System.product.dto.ProductRequest;
import com.example.sales.Inventory.Management.System.product.dto.ProductResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Tag(name = "Products",
        description = "Full product catalog management: create, search, paginate, update, and delete products. "
                + "Includes low-stock alerts and category management. Requires JWT authentication.")
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @Operation(
            summary = "Create a new product",
            description = """
                    Creates a new product in the inventory catalog.
                    
                    **Validation rules:**
                    - `sku` must be unique and ≤ 50 characters
                    - `name` ≤ 150 characters
                    - `purchasePrice` must be > 0
                    - `sellingPrice` must be > `purchasePrice`
                    - `quantityInStock` and `reorderLevel` must be ≥ 0
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Product created successfully",
                    content = @Content(schema = @Schema(implementation = ProductResponse.class),
                            examples = @ExampleObject(value = """
                                    {
                                      "id": 42,
                                      "sku": "PROD-0042",
                                      "name": "Premium Wireless Headphones",
                                      "category": "Electronics",
                                      "unit": "pcs",
                                      "purchasePrice": 2500.00,
                                      "sellingPrice": 3999.00,
                                      "quantityInStock": 150,
                                      "reorderLevel": 20,
                                      "status": "ACTIVE"
                                    }"""))),
            @ApiResponse(responseCode = "400", description = "Validation error — invalid field values"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "409", description = "SKU already exists")
    })
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "List and filter products",
            description = """
                    Returns a paginated list of products. Supports combined filtering by:
                    - `search` — matches SKU, name, or category (partial, case-insensitive)
                    - `category` — exact category filter
                    - `status` — `ACTIVE` or `INACTIVE`
                    
                    **Pagination:** Pass `page`, `size`, and `sort` query parameters (Spring Pageable).
                    Example: `?page=0&size=20&sort=name,asc`
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Paginated product list returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @Parameter(description = "Search term matching SKU, name, or category")
            @RequestParam(required = false) String search,
            @Parameter(description = "Exact category filter, e.g. 'Electronics'")
            @RequestParam(required = false) String category,
            @Parameter(description = "Product status: ACTIVE or INACTIVE")
            @RequestParam(required = false) String status,
            Pageable pageable) {
        Page<ProductResponse> response = productService.getFilteredProducts(search, category, status, pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Search products by keyword",
            description = "Full-text search across SKU, product name, and category. Returns a paginated result set."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Search results returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/search")
    public ResponseEntity<Page<ProductResponse>> searchProducts(
            @Parameter(description = "Search term (matches SKU, name, category)", required = true, example = "wireless")
            @RequestParam String query,
            Pageable pageable) {
        Page<ProductResponse> response = productService.getFilteredProducts(query, null, null, pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get low-stock products",
            description = """
                    Returns products where `quantityInStock` ≤ `reorderLevel`.
                    Use this endpoint to drive reorder alerts and purchase order creation.
                    Results are paginated and sorted by urgency (most critical first).
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Low-stock product list returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/low-stock")
    public ResponseEntity<Page<ProductResponse>> getLowStockProducts(Pageable pageable) {
        Page<ProductResponse> response = productService.getLowStockProducts(pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get all distinct product categories",
            description = "Returns a flat list of all unique category names present in the product catalog. "
                    + "Use to populate category filter dropdowns in the UI."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Category list returned",
                    content = @Content(examples = @ExampleObject(value = """
                            ["Electronics", "Clothing", "Food & Beverages", "Office Supplies"]"""))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        List<String> response = productService.getDistinctCategories();
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get a product by ID",
            description = "Retrieves the full details of a single product by its unique database ID."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product found and returned",
                    content = @Content(schema = @Schema(implementation = ProductResponse.class))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(
            @Parameter(description = "Product ID", required = true, example = "42")
            @PathVariable Long id) {
        ProductResponse response = productService.getProductById(id);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Update an existing product",
            description = """
                    Updates all fields of a product. Full replacement — send all fields, even unchanged ones.
                    SKU conflicts (duplicate on another product) return HTTP 409.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product updated successfully",
                    content = @Content(schema = @Schema(implementation = ProductResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation error"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Product not found"),
            @ApiResponse(responseCode = "409", description = "SKU conflict with another product")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @Parameter(description = "Product ID to update", required = true, example = "42")
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Delete a product",
            description = """
                    Permanently deletes a product from the catalog.
                    **Warning:** This operation cannot be undone. Stock movement records for this
                    product will be retained in the audit ledger for compliance purposes.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product deleted successfully",
                    content = @Content(examples = @ExampleObject(value = "\"Deleted Product with id: 42\""))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(
            @Parameter(description = "Product ID to delete", required = true, example = "42")
            @PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.status(HttpStatus.OK).body("Deleted Product with id: " + id);
    }
}
