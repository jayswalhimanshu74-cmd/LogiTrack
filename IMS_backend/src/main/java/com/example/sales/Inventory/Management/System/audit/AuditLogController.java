package com.example.sales.Inventory.Management.System.audit;

import com.example.sales.Inventory.Management.System.audit.dto.AuditLogResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
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

@Tag(name = "Audit Logs",
        description = "**ADMIN ONLY** — System-wide audit trail for all user actions. "
                + "Filter by user, action type, entity, status, date range, and role. "
                + "Supports CSV and PDF export. Requires JWT + ADMIN role.")
@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @Operation(
            summary = "List and filter audit logs",
            description = """
                    Returns a paginated audit log with comprehensive filtering options.
                    
                    **Filter parameters (all optional):**
                    - `startDate` / `endDate` — ISO datetime range (e.g. `2025-07-01T00:00:00`)
                    - `userId` — filter by specific user ID
                    - `action` — e.g. `CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `EXPORT_CSV`, `REPORT_GENERATED`
                    - `entityName` — e.g. `PRODUCT`, `SALE`, `INVOICE`, `AUDIT`
                    - `status` — `SUCCESS` or `FAILURE`
                    - `role` — `ADMIN`, `MANAGER`, `STAFF`
                    - `search` — free-text search across description and entity fields
                    
                    **Sort parameters:** `sortBy` (default: `timestamp`), `direction` (`asc` | `desc`)
                    
                    > 🔐 **Requires ADMIN role**
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Paginated audit log returned",
                    content = @Content(examples = @ExampleObject(value = """
                            {
                              "content": [
                                {
                                  "id": 1001,
                                  "userId": 1,
                                  "userEmail": "admin@logitrack.io",
                                  "userRole": "ADMIN",
                                  "action": "CREATE",
                                  "entityName": "PRODUCT",
                                  "entityId": "42",
                                  "description": "Created new product: Premium Headphones",
                                  "status": "SUCCESS",
                                  "timestamp": "2025-07-15T10:00:00"
                                }
                              ],
                              "totalElements": 1500,
                              "totalPages": 150,
                              "size": 10,
                              "number": 0
                            }"""))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated but not ADMIN role")
    })
    @GetMapping
    public ResponseEntity<Page<AuditLogResponse>> getLogs(
            @Parameter(description = "Filter start datetime (ISO 8601)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "Filter end datetime (ISO 8601)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @Parameter(description = "Filter by user ID") @RequestParam(required = false) Long userId,
            @Parameter(description = "Filter by action: CREATE, UPDATE, DELETE, LOGIN, etc.") @RequestParam(required = false) String action,
            @Parameter(description = "Filter by entity: PRODUCT, SALE, INVOICE, PURCHASE, AUDIT") @RequestParam(required = false) String entityName,
            @Parameter(description = "Filter by outcome: SUCCESS or FAILURE") @RequestParam(required = false) String status,
            @Parameter(description = "Filter by user role: ADMIN, MANAGER, STAFF") @RequestParam(required = false) String role,
            @Parameter(description = "Full-text search across description and entity fields") @RequestParam(required = false) String search,
            @Parameter(description = "Page number (0-indexed)", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "10") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field", example = "timestamp") @RequestParam(defaultValue = "timestamp") String sortBy,
            @Parameter(description = "Sort direction: asc or desc", example = "desc") @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<AuditLogResponse> logs = auditLogService.getLogs(
                startDate, endDate, userId, action, entityName, status, role, search, pageable
        );
        return ResponseEntity.ok(logs);
    }

    @Operation(
            summary = "Get a specific audit log entry",
            description = "Retrieves a single audit log entry by its unique ID."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Audit log entry found"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "ADMIN role required"),
            @ApiResponse(responseCode = "404", description = "Audit log entry not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<AuditLogResponse> getLogById(
            @Parameter(description = "Audit log entry ID", required = true, example = "1001")
            @PathVariable Long id) {
        AuditLogResponse log = auditLogService.getLogById(id);
        if (log == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(log);
    }

    @Operation(
            summary = "Get audit logs by user ID",
            description = "Returns all audit log entries for a specific user, sorted by timestamp descending."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User audit log list returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "ADMIN role required")
    })
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AuditLogResponse>> getLogsByUserId(
            @Parameter(description = "User ID", required = true, example = "1")
            @PathVariable Long userId) {
        return ResponseEntity.ok(auditLogService.getLogsByUserId(userId));
    }

    @Operation(
            summary = "Get audit logs by entity type",
            description = "Returns all audit log entries for a specific entity type, e.g. all PRODUCT events."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Entity audit log list returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "ADMIN role required")
    })
    @GetMapping("/entity/{entityName}")
    public ResponseEntity<List<AuditLogResponse>> getLogsByEntityName(
            @Parameter(description = "Entity name: PRODUCT, SALE, INVOICE, PURCHASE, AUDIT, REPORT", required = true, example = "PRODUCT")
            @PathVariable String entityName) {
        return ResponseEntity.ok(auditLogService.getLogsByEntityName(entityName));
    }

    @Operation(
            summary = "Export audit logs",
            description = """
                    Exports filtered audit logs as a **CSV** or **PDF** file download.
                    
                    - `format=csv` (default) — Returns a `.csv` file for spreadsheet analysis
                    - `format=pdf` — Returns a formatted `.pdf` report
                    
                    Accepts the same filter parameters as the list endpoint. All matching records
                    are exported (no pagination limit — max 100,000 rows).
                    
                    > 🔐 **Requires ADMIN role**
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Export file returned as binary download",
                    content = {
                            @Content(mediaType = "text/csv"),
                            @Content(mediaType = "application/pdf")
                    }),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "ADMIN role required")
    })
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
            @Parameter(description = "Export format: csv (default) or pdf", example = "csv")
            @RequestParam(defaultValue = "csv") String format) {

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
