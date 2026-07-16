package com.example.sales.Inventory.Management.System.dashboard;

import com.example.sales.Inventory.Management.System.dashboard.dto.DashboardStatsResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Dashboard",
        description = "Live KPI statistics for the main dashboard. Returns aggregated metrics across all modules "
                + "in a single response to minimize frontend API calls. Requires JWT authentication.")
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(
            summary = "Get dashboard statistics",
            description = """
                    Returns a comprehensive snapshot of current business KPIs in a single response:
                    
                    **Sales Metrics:**
                    - Total revenue (all time and this month)
                    - Total order count
                    - Orders by status
                    
                    **Purchase Metrics:**
                    - Total spend (all time and this month)
                    - Total purchase orders
                    
                    **Inventory Metrics:**
                    - Total product count (active)
                    - Total stock value at cost
                    - Low-stock alert count
                    
                    **Invoice Metrics:**
                    - Overdue invoice count and amount
                    - Pending payment count
                    
                    This endpoint is called on every dashboard load and is designed for speed.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dashboard statistics returned",
                    content = @Content(schema = @Schema(implementation = DashboardStatsResponse.class),
                            examples = @ExampleObject(value = """
                                    {
                                      "totalRevenue": 1250000.00,
                                      "monthlyRevenue": 185000.00,
                                      "totalOrders": 342,
                                      "pendingOrders": 15,
                                      "totalProducts": 87,
                                      "lowStockCount": 6,
                                      "totalPurchaseSpend": 820000.00,
                                      "overdueInvoices": 3,
                                      "overdueAmount": 45000.00,
                                      "totalStockValue": 680000.00
                                    }"""))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        DashboardStatsResponse response = dashboardService.getDashboardStats();
        return ResponseEntity.ok(response);
    }
}
