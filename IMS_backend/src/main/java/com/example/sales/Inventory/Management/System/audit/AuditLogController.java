package com.example.sales.Inventory.Management.System.audit;

import com.example.sales.Inventory.Management.System.audit.dto.AuditLogResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<Page<AuditLogResponse>> getLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityName,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<AuditLogResponse> logs = auditLogService.getLogs(
                startDate, endDate, userId, action, entityName, status, role, search, pageable
        );
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditLogResponse> getLogById(@PathVariable Long id) {
        AuditLogResponse log = auditLogService.getLogById(id);
        if (log == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(log);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AuditLogResponse>> getLogsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(auditLogService.getLogsByUserId(userId));
    }

    @GetMapping("/entity/{entityName}")
    public ResponseEntity<List<AuditLogResponse>> getLogsByEntityName(@PathVariable String entityName) {
        return ResponseEntity.ok(auditLogService.getLogsByEntityName(entityName));
    }

    @GetMapping("/export")
    @Audit(action = "EXPORT", entityName = "AUDIT", description = "Exported system logs report")
    public ResponseEntity<byte[]> exportLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityName,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "csv") String format) {

        // Query all matched items without pagination limit for report downloads
        Pageable pageable = PageRequest.of(0, 100000, Sort.by("timestamp").descending());
        List<AuditLogResponse> logs = auditLogService.getLogs(
                startDate, endDate, userId, action, entityName, status, role, search, pageable
        ).getContent();

        ByteArrayInputStream bis;
        String filename;
        MediaType mediaType;

        if (format.equalsIgnoreCase("pdf")) {
            bis = auditLogService.exportToPdf(logs);
            filename = "audit_logs_" + System.currentTimeMillis() + ".pdf";
            mediaType = MediaType.APPLICATION_PDF;
        } else {
            bis = auditLogService.exportToCsv(logs);
            filename = "audit_logs_" + System.currentTimeMillis() + ".csv";
            mediaType = MediaType.parseMediaType("text/csv");
        }

        byte[] data = bis.readAllBytes();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=" + filename);

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(mediaType)
                .body(data);
    }
}
