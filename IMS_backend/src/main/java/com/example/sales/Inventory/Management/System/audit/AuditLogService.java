package com.example.sales.Inventory.Management.System.audit;

import com.example.sales.Inventory.Management.System.audit.dto.AuditLogResponse;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationEventPublisher;
import com.example.sales.Inventory.Management.System.notification.event.NotificationEvent;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void saveEvent(AuditEvent event) {
        AuditLog log = new AuditLog();
        log.setUserId(event.getUserId());
        log.setUserName(event.getUserName());
        log.setUserEmail(event.getUserEmail());
        log.setRole(event.getRole());
        log.setAction(event.getAction());
        log.setEntityName(event.getEntityName());
        log.setEntityId(event.getEntityId());
        log.setDescription(event.getDescription());
        log.setOldValue(event.getOldValue());
        log.setNewValue(event.getNewValue());
        log.setIpAddress(event.getIpAddress());
        log.setUserAgent(event.getUserAgent());
        log.setRequestMethod(event.getRequestMethod());
        log.setRequestUri(event.getRequestUri());
        log.setStatus(event.getStatus());

        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getLogs(
            LocalDateTime startDate,
            LocalDateTime endDate,
            Long userId,
            String action,
            String entityName,
            String status,
            String role,
            String search,
            Pageable pageable) {

        Specification<AuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("timestamp"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("timestamp"), endDate));
            }
            if (userId != null) {
                predicates.add(cb.equal(root.get("userId"), userId));
            }
            if (action != null && !action.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("action")), action.toLowerCase()));
            }
            if (entityName != null && !entityName.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("entityName")), entityName.toLowerCase()));
            }
            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("status")), status.toLowerCase()));
            }
            if (role != null && !role.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("role")), role.toLowerCase()));
            }

            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                Predicate searchPred = cb.or(
                        cb.like(cb.lower(root.get("userName")), searchPattern),
                        cb.like(cb.lower(root.get("userEmail")), searchPattern),
                        cb.like(cb.lower(root.get("description")), searchPattern),
                        cb.like(cb.lower(root.get("action")), searchPattern),
                        cb.like(cb.lower(root.get("entityName")), searchPattern));
                predicates.add(searchPred);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return auditLogRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public AuditLogResponse getLogById(Long id) {
        return auditLogRepository.findById(id)
                .map(this::mapToResponse)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getLogsByUserId(Long userId) {
        return auditLogRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getLogsByEntityName(String entityName) {
        return auditLogRepository.findByEntityName(entityName).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ByteArrayInputStream exportToCsv(List<AuditLogResponse> logs) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out)) {
            // Write Header
            writer.println("Timestamp,User,Email,Role,Action,Entity,Entity ID,Status,IP Address,Description");

            for (AuditLogResponse log : logs) {
                writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                        log.getTimestamp(),
                        escapeCsv(log.getUserName()),
                        escapeCsv(log.getUserEmail()),
                        escapeCsv(log.getRole()),
                        escapeCsv(log.getAction()),
                        escapeCsv(log.getEntityName()),
                        log.getEntityId() != null ? log.getEntityId() : "",
                        escapeCsv(log.getStatus()),
                        escapeCsv(log.getIpAddress()),
                        escapeCsv(log.getDescription()));
            }
            writer.flush();
        }
        
        eventPublisher.publishEvent(NotificationEvent.builder()
                .title("Audit Logs Exported (CSV)")
                .message("Audit logs have been compiled and exported as a CSV document.")
                .type("AUDIT_EXPORT")
                .severity("INFO")
                .priority("MEDIUM")
                .build());

        return new ByteArrayInputStream(out.toByteArray());
    }

    @Transactional(readOnly = true)
    public ByteArrayInputStream exportToPdf(List<AuditLogResponse> logs) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 16, Font.BOLD);
            Paragraph title = new Paragraph("StockMAster IMS - Enterprise Audit Logs Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Columns count: 7
            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[] { 2.5f, 2f, 2.5f, 1.5f, 1.5f, 2f, 3f });

            Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD);
            table.addCell(new Paragraph("Timestamp", headerFont));
            table.addCell(new Paragraph("User", headerFont));
            table.addCell(new Paragraph("Action", headerFont));
            table.addCell(new Paragraph("Entity", headerFont));
            table.addCell(new Paragraph("Status", headerFont));
            table.addCell(new Paragraph("IP Address", headerFont));
            table.addCell(new Paragraph("Description", headerFont));

            Font cellFont = new Font(Font.HELVETICA, 8);
            for (AuditLogResponse log : logs) {
                table.addCell(new Paragraph(log.getTimestamp() != null ? log.getTimestamp().toString() : "", cellFont));
                table.addCell(new Paragraph(log.getUserEmail() != null ? log.getUserEmail() : "System", cellFont));
                table.addCell(new Paragraph(log.getAction() != null ? log.getAction() : "", cellFont));
                table.addCell(new Paragraph(log.getEntityName() != null ? log.getEntityName() : "", cellFont));
                table.addCell(new Paragraph(log.getStatus() != null ? log.getStatus() : "", cellFont));
                table.addCell(new Paragraph(log.getIpAddress() != null ? log.getIpAddress() : "", cellFont));
                table.addCell(new Paragraph(log.getDescription() != null ? log.getDescription() : "", cellFont));
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        eventPublisher.publishEvent(NotificationEvent.builder()
                .title("Audit Logs Exported (PDF)")
                .message("Audit logs have been compiled and exported as a PDF document.")
                .type("REPORT_READY")
                .severity("INFO")
                .priority("MEDIUM")
                .build());

        return new ByteArrayInputStream(out.toByteArray());
    }

    private String escapeCsv(String val) {
        if (val == null)
            return "";
        return val.replace("\"", "\"\"");
    }

    private AuditLogResponse mapToResponse(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getUserId(),
                log.getUserName(),
                log.getUserEmail(),
                log.getRole(),
                log.getAction(),
                log.getEntityName(),
                log.getEntityId(),
                log.getDescription(),
                log.getOldValue(),
                log.getNewValue(),
                log.getIpAddress(),
                log.getUserAgent(),
                log.getRequestMethod(),
                log.getRequestUri(),
                log.getStatus(),
                log.getTimestamp(),
                log.getCreatedAt());
    }
}
