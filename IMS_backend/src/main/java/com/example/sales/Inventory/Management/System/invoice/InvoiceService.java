package com.example.sales.Inventory.Management.System.invoice;

import com.example.sales.Inventory.Management.System.exception.DuplicateResourceException;
import com.example.sales.Inventory.Management.System.exception.ResourceNotFoundException;
import com.example.sales.Inventory.Management.System.invoice.Invoice.InvoiceStatus;
import com.example.sales.Inventory.Management.System.invoice.dto.InvoiceItemRequest;
import com.example.sales.Inventory.Management.System.invoice.dto.InvoiceItemResponse;
import com.example.sales.Inventory.Management.System.invoice.dto.InvoiceRequest;
import com.example.sales.Inventory.Management.System.invoice.dto.InvoiceResponse;
import com.example.sales.Inventory.Management.System.product.Product;
import com.example.sales.Inventory.Management.System.product.ProductRepository;
import com.example.sales.Inventory.Management.System.sales.Sale;
import com.example.sales.Inventory.Management.System.sales.SaleRepository;
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
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final SaleRepository saleRepository;

    @Transactional
    public InvoiceResponse createInvoice(InvoiceRequest request) {
        if (invoiceRepository.existsByInvoiceNo(request.getInvoiceNo())) {
            throw new DuplicateResourceException("Invoice with number '" + request.getInvoiceNo() + "' already exists");
        }

        Invoice invoice = new Invoice();
        invoice.setInvoiceNo(request.getInvoiceNo());
        invoice.setInvoiceDate(request.getInvoiceDate());
        invoice.setStatus(request.getStatus() != null ? request.getStatus() : InvoiceStatus.UNPAID);

        // Resolve creator
        User creator = getAuthenticatedUser();
        invoice.setCreatedBy(creator);

        BigDecimal totalAmount = BigDecimal.ZERO;

        if (request.getSaleId() != null) {
            // Create Invoice from an existing Sale
            Sale sale = saleRepository.findById(request.getSaleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + request.getSaleId()));

            invoice.setSale(sale);
            invoice.setCustomerName(sale.getCustomerName());

            sale.getItems().forEach(saleItem -> {
                InvoiceItem invoiceItem = new InvoiceItem();
                invoiceItem.setProduct(saleItem.getProduct());
                invoiceItem.setQuantity(saleItem.getQuantity());
                invoiceItem.setUnitPrice(saleItem.getUnitPrice());
                invoiceItem.setLineTotal(saleItem.getLineTotal());
                invoice.addItem(invoiceItem);
            });

            totalAmount = sale.getTotalAmount();
        } else {
            // Standalone Invoice Creation
            if (request.getCustomerName() == null || request.getCustomerName().trim().isEmpty()) {
                throw new IllegalArgumentException("Customer name is required for standalone invoices");
            }
            if (request.getItems() == null || request.getItems().isEmpty()) {
                throw new IllegalArgumentException("Invoice items are required for standalone invoices");
            }

            invoice.setCustomerName(request.getCustomerName());

            for (InvoiceItemRequest itemRequest : request.getItems()) {
                Product product = productRepository.findById(itemRequest.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemRequest.getProductId()));

                BigDecimal lineTotal = itemRequest.getUnitPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

                InvoiceItem invoiceItem = new InvoiceItem();
                invoiceItem.setProduct(product);
                invoiceItem.setQuantity(itemRequest.getQuantity());
                invoiceItem.setUnitPrice(itemRequest.getUnitPrice());
                invoiceItem.setLineTotal(lineTotal);

                invoice.addItem(invoiceItem);
                totalAmount = totalAmount.add(lineTotal);
            }
        }

        invoice.setTotalAmount(totalAmount);
        Invoice savedInvoice = invoiceRepository.save(invoice);
        return mapEntityToResponse(savedInvoice);
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
        return mapEntityToResponse(invoice);
    }

    @Transactional
    public InvoiceResponse updateInvoiceStatus(Long id, InvoiceStatus status) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
        invoice.setStatus(status);
        Invoice updatedInvoice = invoiceRepository.save(invoice);
        return mapEntityToResponse(updatedInvoice);
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return userRepository.findByEmail(auth.getName()).orElse(null);
        }
        return null;
    }

    private InvoiceResponse mapEntityToResponse(Invoice invoice) {
        InvoiceResponse response = new InvoiceResponse();
        response.setId(invoice.getId());
        response.setInvoiceNo(invoice.getInvoiceNo());
        response.setCustomerName(invoice.getCustomerName());
        response.setInvoiceDate(invoice.getInvoiceDate());
        response.setTotalAmount(invoice.getTotalAmount());
        response.setStatus(invoice.getStatus());
        response.setCreatedAt(invoice.getCreatedAt());
        response.setUpdatedAt(invoice.getUpdatedAt());

        if (invoice.getSale() != null) {
            response.setSaleId(invoice.getSale().getId());
        }

        if (invoice.getCreatedBy() != null) {
            response.setCreatedById(invoice.getCreatedBy().getId());
            response.setCreatedByFullName(invoice.getCreatedBy().getFullName());
            response.setCreatedByEmail(invoice.getCreatedBy().getEmail());
        }

        List<InvoiceItemResponse> itemResponses = invoice.getItems().stream()
                .map(item -> new InvoiceItemResponse(
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
