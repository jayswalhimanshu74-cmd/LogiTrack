package com.example.sales.Inventory.Management.System.invoice;

import com.example.sales.Inventory.Management.System.exception.DuplicateResourceException;
import com.example.sales.Inventory.Management.System.exception.ResourceNotFoundException;
import com.example.sales.Inventory.Management.System.invoice.dto.*;
import com.example.sales.Inventory.Management.System.product.Product;
import com.example.sales.Inventory.Management.System.product.ProductRepository;
import com.example.sales.Inventory.Management.System.sales.Sale;
import com.example.sales.Inventory.Management.System.sales.SaleRepository;
import com.example.sales.Inventory.Management.System.user.User;
import com.example.sales.Inventory.Management.System.user.UserRepository;
import com.example.sales.Inventory.Management.System.email.EmailService;
import com.example.sales.Inventory.Management.System.audit.Audit;
import com.example.sales.Inventory.Management.System.notification.NotificationService;
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

import org.springframework.context.ApplicationEventPublisher;
import com.example.sales.Inventory.Management.System.notification.event.NotificationEvent;

import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final SaleRepository saleRepository;
    private final InvoicePdfService invoicePdfService;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public synchronized String generateNextInvoiceNumber() {
        int currentYear = LocalDate.now().getYear();
        String yearPrefix = "INV-" + currentYear + "-";
        
        List<String> invoiceNos = invoiceRepository.findInvoiceNosForYear(yearPrefix);
        int maxSeq = 0;
        
        if (invoiceNos != null) {
            for (String num : invoiceNos) {
                if (num != null && num.contains("-")) {
                    try {
                        String seqStr = num.substring(num.lastIndexOf("-") + 1);
                        int seq = Integer.parseInt(seqStr);
                        if (seq > maxSeq) {
                            maxSeq = seq;
                        }
                    } catch (Exception e) {
                        // Ignore malformed invoice numbers
                    }
                }
            }
        }
        
        int nextSeq = maxSeq + 1;
        String nextInvoiceNo = String.format("INV-%d-%06d", currentYear, nextSeq);
        
        while (invoiceRepository.existsByInvoiceNo(nextInvoiceNo)) {
            nextSeq++;
            nextInvoiceNo = String.format("INV-%d-%06d", currentYear, nextSeq);
        }
        
        return nextInvoiceNo;
    }

    @Transactional
    @Audit(action = "INVOICE_GENERATED", entityName = "INVOICE", description = "Invoice generated successfully")
    public InvoiceResponse createInvoice(InvoiceRequest request) {
        String invoiceNo = request.getInvoiceNo();
        if (invoiceNo == null || invoiceNo.trim().isEmpty()) {
            invoiceNo = generateNextInvoiceNumber();
        } else if (invoiceRepository.existsByInvoiceNo(invoiceNo)) {
            throw new DuplicateResourceException("Invoice with number '" + invoiceNo + "' already exists");
        }

        Invoice invoice = new Invoice();
        invoice.setInvoiceNo(invoiceNo);
        invoice.setCustomerName(request.getCustomerName());
        invoice.setCustomerPhone(request.getCustomerPhone() != null ? request.getCustomerPhone() : "");
        invoice.setCustomerEmail(request.getCustomerEmail());
        invoice.setBillingAddress(request.getBillingAddress());
        invoice.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod().toUpperCase() : "CASH");
        invoice.setPaymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus().toUpperCase() : "PENDING");
        invoice.setStatus(request.getStatus() != null ? request.getStatus().toUpperCase() : "DRAFT");
        invoice.setNotes(request.getNotes());
        invoice.setInvoiceDate(request.getInvoiceDate() != null ? request.getInvoiceDate() : LocalDate.now());

        BigDecimal subtotal = BigDecimal.ZERO;
        
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (InvoiceItemRequest itemReq : request.getItems()) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemReq.getProductId()));
                
                BigDecimal lineTotal = itemReq.getUnitPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
                
                InvoiceItem item = new InvoiceItem();
                item.setProduct(product);
                item.setQuantity(itemReq.getQuantity());
                item.setUnitPrice(itemReq.getUnitPrice());
                item.setLineTotal(lineTotal);
                
                invoice.addItem(item);
                subtotal = subtotal.add(lineTotal);
            }
        }

        BigDecimal tax = request.getTax() != null ? request.getTax() : BigDecimal.ZERO;
        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        BigDecimal grandTotal = subtotal.add(tax).subtract(discount);
        
        if (grandTotal.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Grand total cannot be negative");
        }

        invoice.setSubtotal(subtotal);
        invoice.setTax(tax);
        invoice.setDiscount(discount);
        invoice.setGrandTotal(grandTotal);

        User creator = getAuthenticatedUser();
        invoice.setCreatedBy(creator);

        Invoice saved = invoiceRepository.save(invoice);

        // Fire Notification
        eventPublisher.publishEvent(NotificationEvent.builder()
                .title("Invoice Generated")
                .message("Invoice " + saved.getInvoiceNo() + " for customer " + saved.getCustomerName() + " has been generated. Total: $" + saved.getGrandTotal())
                .type("NEW_INVOICE")
                .severity("INFO")
                .priority("LOW")
                .referenceId(saved.getId())
                .referenceType("INVOICE")
                .build());

        if (saved.getCustomerEmail() != null && !saved.getCustomerEmail().isBlank()) {
            try {
                byte[] pdfBytes = InvoiceTemplateBuilder.buildPdf(saved);
                emailService.sendInvoiceEmail(
                        saved.getCustomerEmail(),
                        saved.getCustomerName(),
                        saved.getInvoiceNo(),
                        saved.getInvoiceDate().toString(),
                        saved.getGrandTotal().setScale(2, BigDecimal.ROUND_HALF_UP).toString(),
                        saved.getPaymentStatus(),
                        pdfBytes
                );
                log.info("Auto-sent invoice email successfully for invoice #{}", saved.getInvoiceNo());
            } catch (Exception e) {
                log.error("Failed to auto-send invoice email for invoice #{}. Error: {}", saved.getInvoiceNo(), e.getMessage());
            }
        }

        return mapEntityToResponse(saved);
    }

    @Transactional
    @Audit(action = "INVOICE_GENERATED", entityName = "INVOICE", description = "Invoice generated from Sales Order")
    public InvoiceResponse generateInvoiceFromSale(Long saleId) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new ResourceNotFoundException("Sale order not found with id: " + saleId));

        String invoiceNo = generateNextInvoiceNumber();

        Invoice invoice = new Invoice();
        invoice.setInvoiceNo(invoiceNo);
        invoice.setCustomerName(sale.getCustomerName() != null ? sale.getCustomerName() : "Unknown");
        invoice.setCustomerPhone(sale.getCustomerPhone() != null ? sale.getCustomerPhone() : "");
        invoice.setCustomerEmail(sale.getCustomerEmail());
        invoice.setPaymentMethod(sale.getPaymentMethod() != null ? sale.getPaymentMethod() : "CASH");
        invoice.setPaymentStatus(sale.getPaymentStatus() != null ? sale.getPaymentStatus() : "PENDING");
        invoice.setStatus("ISSUED");
        invoice.setNotes(sale.getNotes());
        invoice.setInvoiceDate(LocalDate.now());
        invoice.setSale(sale);

        BigDecimal subtotal = BigDecimal.ZERO;

        for (var saleItem : sale.getItems()) {
            InvoiceItem item = new InvoiceItem();
            item.setProduct(saleItem.getProduct());
            item.setQuantity(saleItem.getQuantity());
            item.setUnitPrice(saleItem.getUnitPrice());
            item.setLineTotal(saleItem.getLineTotal());
            invoice.addItem(item);
            subtotal = subtotal.add(saleItem.getLineTotal());
        }

        invoice.setSubtotal(subtotal);
        invoice.setTax(BigDecimal.ZERO);
        invoice.setDiscount(BigDecimal.ZERO);
        invoice.setGrandTotal(subtotal);

        User creator = getAuthenticatedUser();
        invoice.setCreatedBy(creator);

        Invoice saved = invoiceRepository.save(invoice);

        // Fire Notification
        eventPublisher.publishEvent(NotificationEvent.builder()
                .title("Invoice Generated")
                .message("Invoice " + saved.getInvoiceNo() + " generated from sale order " + sale.getSaleNo() + ". Total: $" + saved.getGrandTotal())
                .type("NEW_INVOICE")
                .severity("INFO")
                .priority("LOW")
                .referenceId(saved.getId())
                .referenceType("INVOICE")
                .build());

        if (saved.getCustomerEmail() != null && !saved.getCustomerEmail().isBlank()) {
            try {
                byte[] pdfBytes = InvoiceTemplateBuilder.buildPdf(saved);
                emailService.sendInvoiceEmail(
                        saved.getCustomerEmail(),
                        saved.getCustomerName(),
                        saved.getInvoiceNo(),
                        saved.getInvoiceDate().toString(),
                        saved.getGrandTotal().setScale(2, BigDecimal.ROUND_HALF_UP).toString(),
                        saved.getPaymentStatus(),
                        pdfBytes
                );
                log.info("Auto-sent invoice email successfully for sale-based invoice #{}", saved.getInvoiceNo());
            } catch (Exception e) {
                log.error("Failed to auto-send invoice email for sale-based invoice #{}. Error: {}", saved.getInvoiceNo(), e.getMessage());
            }
        }

        return mapEntityToResponse(saved);
    }

    @Transactional
    public InvoiceResponse updateInvoice(Long id, InvoiceRequest request) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));

        if ("PAID".equals(invoice.getStatus())) {
            throw new IllegalStateException("Paid invoices are read-only and cannot be updated");
        }

        String oldPaymentStatus = invoice.getPaymentStatus();
        String newStatus = request.getStatus() != null ? request.getStatus().toUpperCase() : invoice.getStatus();

        if ("DRAFT".equals(invoice.getStatus())) {
            invoice.setCustomerName(request.getCustomerName());
            invoice.setCustomerPhone(request.getCustomerPhone());
            invoice.setCustomerEmail(request.getCustomerEmail());
            invoice.setBillingAddress(request.getBillingAddress());
            invoice.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod().toUpperCase() : invoice.getPaymentMethod());
            invoice.setPaymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus().toUpperCase() : invoice.getPaymentStatus());
            invoice.setStatus(newStatus);
            invoice.setNotes(request.getNotes());
            invoice.setInvoiceDate(request.getInvoiceDate() != null ? request.getInvoiceDate() : invoice.getInvoiceDate());

            if (request.getItems() != null) {
                invoice.getItems().clear();
                BigDecimal subtotal = BigDecimal.ZERO;
                
                for (InvoiceItemRequest itemReq : request.getItems()) {
                    Product product = productRepository.findById(itemReq.getProductId())
                            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemReq.getProductId()));
                    
                    BigDecimal lineTotal = itemReq.getUnitPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
                    
                    InvoiceItem item = new InvoiceItem();
                    item.setProduct(product);
                    item.setQuantity(itemReq.getQuantity());
                    item.setUnitPrice(itemReq.getUnitPrice());
                    item.setLineTotal(lineTotal);
                    
                    invoice.addItem(item);
                    subtotal = subtotal.add(lineTotal);
                }
                invoice.setSubtotal(subtotal);
            }

            BigDecimal tax = request.getTax() != null ? request.getTax() : invoice.getTax();
            BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : invoice.getDiscount();
            BigDecimal grandTotal = invoice.getSubtotal().add(tax).subtract(discount);
            
            if (grandTotal.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Grand total cannot be negative");
            }
            invoice.setTax(tax);
            invoice.setDiscount(discount);
            invoice.setGrandTotal(grandTotal);

        } else {
            invoice.setStatus(newStatus);
            invoice.setPaymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus().toUpperCase() : invoice.getPaymentStatus());
            invoice.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod().toUpperCase() : invoice.getPaymentMethod());
            invoice.setNotes(request.getNotes());
        }

        Invoice saved = invoiceRepository.save(invoice);

        // Fire paid alert if updated to paid
        if (!"PAID".equals(oldPaymentStatus) && "PAID".equals(saved.getPaymentStatus())) {
            eventPublisher.publishEvent(NotificationEvent.builder()
                    .title("Invoice Paid")
                    .message("Invoice " + saved.getInvoiceNo() + " has been paid in full. Amount: $" + saved.getGrandTotal())
                    .type("PAYMENT_RECEIVED")
                    .severity("SUCCESS")
                    .priority("MEDIUM")
                    .referenceId(saved.getId())
                    .referenceType("INVOICE")
                    .build());
        }

        return mapEntityToResponse(saved);
    }

    @Transactional
    public InvoiceResponse updateInvoiceStatus(Long id, String status) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
        
        String oldPaymentStatus = invoice.getPaymentStatus();
        invoice.setStatus(status.toUpperCase());
        if ("PAID".equals(status.toUpperCase())) {
            invoice.setPaymentStatus("PAID");
        }
        
        Invoice saved = invoiceRepository.save(invoice);

        if (!"PAID".equals(oldPaymentStatus) && "PAID".equals(saved.getPaymentStatus())) {
            eventPublisher.publishEvent(NotificationEvent.builder()
                    .title("Invoice Paid")
                    .message("Invoice " + saved.getInvoiceNo() + " has been paid in full. Amount: $" + saved.getGrandTotal())
                    .type("PAYMENT_RECEIVED")
                    .severity("SUCCESS")
                    .priority("MEDIUM")
                    .referenceId(saved.getId())
                    .referenceType("INVOICE")
                    .build());
        }

        return mapEntityToResponse(saved);
    }

    @Transactional
    public void deleteInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));

        if ("PAID".equals(invoice.getStatus())) {
            throw new IllegalStateException("Paid invoices cannot be deleted");
        }

        invoiceRepository.delete(invoice);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> getFilteredInvoices(String search, String status, String paymentStatus, 
                                                    LocalDate startDate, LocalDate endDate, Pageable pageable) {
        String uStatus = (status != null && !status.isEmpty()) ? status.toUpperCase() : null;
        String uPaymentStatus = (paymentStatus != null && !paymentStatus.isEmpty()) ? paymentStatus.toUpperCase() : null;

        return invoiceRepository.findInvoicesFiltered(search, uStatus, uPaymentStatus, startDate, endDate, pageable)
                .map(this::mapEntityToResponse);
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

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getRecentInvoices() {
        org.springframework.data.domain.PageRequest pageRequest = 
                org.springframework.data.domain.PageRequest.of(0, 5, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        return invoiceRepository.findAll(pageRequest).getContent().stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InvoiceStatisticsResponse getInvoiceStatistics() {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.with(java.time.temporal.TemporalAdjusters.lastDayOfMonth());

        long total = invoiceRepository.countAllInvoices();
        long todayCount = invoiceRepository.countTodayInvoices(today);
        long monthlyCount = invoiceRepository.countMonthlyInvoices(startOfMonth, endOfMonth);
        
        long pendingPay = invoiceRepository.countPendingPayments();
        long paidCount = invoiceRepository.countPaidInvoices();
        long cancelledCount = invoiceRepository.countCancelledInvoices();

        BigDecimal totalRevenue = invoiceRepository.sumTotalRevenue();
        BigDecimal avgValue = invoiceRepository.averageInvoiceValue();

        return new InvoiceStatisticsResponse(
                total,
                todayCount,
                monthlyCount,
                pendingPay,
                paidCount,
                cancelledCount,
                totalRevenue,
                avgValue
        );
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
        response.setCustomerPhone(invoice.getCustomerPhone());
        response.setCustomerEmail(invoice.getCustomerEmail());
        response.setBillingAddress(invoice.getBillingAddress());
        response.setPaymentMethod(invoice.getPaymentMethod());
        response.setPaymentStatus(invoice.getPaymentStatus());
        response.setStatus(invoice.getStatus());
        response.setNotes(invoice.getNotes());
        response.setSubtotal(invoice.getSubtotal());
        response.setTax(invoice.getTax());
        response.setDiscount(invoice.getDiscount());
        response.setGrandTotal(invoice.getGrandTotal());
        response.setInvoiceDate(invoice.getInvoiceDate());
        
        if (invoice.getSale() != null) {
            response.setSaleId(invoice.getSale().getId());
            response.setSaleNo(invoice.getSale().getSaleNo());
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
        response.setCreatedAt(invoice.getCreatedAt());
        response.setUpdatedAt(invoice.getUpdatedAt());
        return response;
    }

    @Transactional(readOnly = true)
    @Audit(action = "INVOICE_EMAILED", entityName = "INVOICE", description = "Invoice sent to customer via email")
    public void sendInvoiceEmail(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));

        if (invoice.getCustomerEmail() == null || invoice.getCustomerEmail().isBlank()) {
            throw new IllegalArgumentException("Customer email is missing for this invoice");
        }

        byte[] pdfBytes = invoicePdfService.generateInvoicePdf(id);

        emailService.sendInvoiceEmail(
                invoice.getCustomerEmail(),
                invoice.getCustomerName(),
                invoice.getInvoiceNo(),
                invoice.getInvoiceDate().toString(),
                invoice.getGrandTotal().setScale(2, BigDecimal.ROUND_HALF_UP).toString(),
                invoice.getPaymentStatus(),
                pdfBytes
        );
    }
}
