package com.example.sales.Inventory.Management.System.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Enterprise OpenAPI 3.0 Configuration for StockMAster IMS.
 *
 * <p>Configures a production-grade Swagger UI with:
 * <ul>
 *   <li>JWT Bearer Authentication (global security requirement)</li>
 *   <li>Professional API metadata and developer contact</li>
 *   <li>Logical tag groupings for every module</li>
 *   <li>Multi-environment server definitions</li>
 * </ul>
 */
@Configuration
public class OpenApiConfig {

    private static final String BEARER_SCHEME_NAME = "BearerAuth";

    @Bean
    public OpenAPI stockMasterOpenAPI() {
        return new OpenAPI()
                .info(buildApiInfo())
                .externalDocs(new ExternalDocumentation()
                        .description("StockMAster GitHub Repository")
                        .url("https://github.com/jayswalhimanshu74-cmd/Inventory-Managment-System"))
                .servers(buildServers())
                .components(buildSecurityComponents())
                .addSecurityItem(new SecurityRequirement().addList(BEARER_SCHEME_NAME))
                .tags(buildTags());
    }

    // ─── API Info ────────────────────────────────────────────────────────────

    private Info buildApiInfo() {
        return new Info()
                .title("StockMAster — Inventory Management System API")
                .version("1.0.0")
                .description("""
                        ## StockMAster Enterprise Inventory Management REST API
                        
                        StockMAster is a full-featured, enterprise-grade Inventory Management System built with
                        **Spring Boot 4**, **Spring Security + JWT**, **Spring Data JPA**, and **PostgreSQL**.
                        
                        ### Core Modules
                        | Module | Description |
                        |---|---|
                        | 🔐 Authentication | Register, login, email verification, password reset |
                        | 👤 Profile | User profile management, avatar upload, password change |
                        | 📦 Products | Full product catalog CRUD with category management |
                        | 🛒 Purchases | Purchase order lifecycle management |
                        | 💰 Sales Orders | Sales order processing and fulfillment |
                        | 🧾 Invoices | Invoice generation, PDF export, email delivery |
                        | 📊 Reports | Sales, purchase, inventory, and intelligence reports |
                        | 📁 CSV Export | Bulk data export for all entities |
                        | 🔔 Notifications | Real-time notification center |
                        | 📋 Audit Logs | Complete system audit trail (Admin only) |
                        | 🔄 Stock Movements | Full stock ledger with adjustment support |
                        | 📈 Dashboard | KPI metrics and live statistics |
                        
                        ### Authentication Flow
                        1. **POST** `/api/auth/register` — Create a new account
                        2. Verify your email via the link sent to your inbox
                        3. **POST** `/api/auth/login` — Obtain a JWT Bearer token
                        4. Click the **🔓 Authorize** button above and paste your token
                        5. All secured endpoints are now executable
                        
                        ### API Conventions
                        - All timestamps are **ISO 8601** format (`yyyy-MM-dd'T'HH:mm:ss`)
                        - All monetary values use **BigDecimal** with 2 decimal places (INR)
                        - Paginated endpoints accept `page`, `size`, `sort` query parameters
                        - Error responses follow the shape: `{ success, message, timestamp }`
                        """)
                .contact(new Contact()
                        .name("Himanshu Jayswal — Lead Developer")
                        .email("jayswalhimanshu74@gmail.com")
                        .url("https://github.com/jayswalhimanshu74-cmd"))
                .license(new License()
                        .name("MIT License")
                        .url("https://opensource.org/licenses/MIT"));
    }

    // ─── Servers ─────────────────────────────────────────────────────────────

    private List<Server> buildServers() {
        Server localServer = new Server()
                .url("http://localhost:8080")
                .description("Local Development Server");

        Server renderServer = new Server()
                .url("https://inventory-managment-system-31tb.onrender.com")
                .description("Render Production Server");

        Server stagingServer = new Server()
                .url("https://api-staging.stockmaster.io")
                .description("Staging Environment");

        return List.of(localServer, renderServer, stagingServer);
    }

    // ─── Security ─────────────────────────────────────────────────────────────

    private Components buildSecurityComponents() {
        SecurityScheme jwtScheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .name(BEARER_SCHEME_NAME)
                .description("""
                        **JWT Bearer Authentication**
                        
                        Obtain a token from `POST /api/auth/login`, then click the **Authorize** button
                        and paste the token value (without the `Bearer ` prefix — it is added automatically).
                        
                        Token lifetime: **24 hours** (configurable in `application.properties`).
                        """);

        return new Components()
                .addSecuritySchemes(BEARER_SCHEME_NAME, jwtScheme);
    }

    // ─── Tag Definitions ─────────────────────────────────────────────────────

    private List<Tag> buildTags() {
        return List.of(
                new Tag().name("Authentication")
                        .description("Register, login, email verification, forgot/reset password. Public endpoints — no token required."),
                new Tag().name("Profile")
                        .description("Authenticated user profile: view, update, avatar upload, password change, security info."),
                new Tag().name("Products")
                        .description("Full product catalog management: create, read, update, delete, search, category listing, and low-stock queries."),
                new Tag().name("Purchases")
                        .description("Purchase order lifecycle: create purchase orders from suppliers, update status, track payment, and view statistics."),
                new Tag().name("Sales Orders")
                        .description("Sales order management: create customer sales, update fulfillment status, track payments, and view revenue statistics."),
                new Tag().name("Invoices")
                        .description("Invoice management: generate from sales, update status, send via email, and retrieve PDF/download links."),
                new Tag().name("Invoice PDF")
                        .description("Binary PDF operations: view invoice inline in browser or download as a file attachment."),
                new Tag().name("Reports & Analytics")
                        .description("Business intelligence reports: sales, purchases, inventory, invoices, financial summary, charts, low-stock, demand forecast, and ABC analysis."),
                new Tag().name("CSV Exports")
                        .description("Bulk CSV data export for products, sales, purchases, invoices, and analytics reports."),
                new Tag().name("Notifications")
                        .description("Real-time notification center: list, filter, mark read, and clear notifications for the authenticated user."),
                new Tag().name("Audit Logs")
                        .description("System-wide audit trail — ADMIN ONLY. View, filter, and export all user activity logs."),
                new Tag().name("Stock Movements")
                        .description("Stock ledger: view movements by product or user, get summary metrics, and perform manual stock adjustments."),
                new Tag().name("Dashboard")
                        .description("Live KPI metrics: total revenue, stock value, order counts, and trend indicators for the main dashboard.")
        );
    }
}
