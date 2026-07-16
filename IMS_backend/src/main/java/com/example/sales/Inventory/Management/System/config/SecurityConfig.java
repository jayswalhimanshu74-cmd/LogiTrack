package com.example.sales.Inventory.Management.System.config;

import com.example.sales.Inventory.Management.System.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Enterprise Security Configuration.
 *
 * Roles (Spring authority prefix "ROLE_" applied automatically):
 *   ADMIN   → full access to everything
 *   MANAGER → operational modules: products, purchases, sales, invoices, reports
 *   STAFF   → read-only on products; own sales + invoices; notifications + profile
 *
 * Fine-grained method-level security is applied via @PreAuthorize on each controller.
 * This class enforces the broad category rules and enables method security.
 */
@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                // ── Public endpoints ─────────────────────────────────────────
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers(
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**",
                    "/webjars/**"
                ).permitAll()

                // ── Audit Logs: ADMIN only ────────────────────────────────────
                .requestMatchers("/api/audit/**").hasRole("ADMIN")

                // ── Reports: ADMIN + MANAGER ─────────────────────────────────
                .requestMatchers("/api/reports/**").hasAnyRole("ADMIN", "MANAGER")

                // ── CSV Export: ADMIN + MANAGER ───────────────────────────────
                .requestMatchers("/api/export/**").hasAnyRole("ADMIN", "MANAGER")

                // ── Dashboard: all authenticated roles ────────────────────────
                .requestMatchers("/api/dashboard/**").authenticated()

                // ── Products ──────────────────────────────────────────────────
                // Read: all roles
                .requestMatchers(HttpMethod.GET, "/api/products/**").authenticated()
                // Write: ADMIN + MANAGER
                .requestMatchers(HttpMethod.POST,   "/api/products/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.PUT,    "/api/products/**").hasAnyRole("ADMIN", "MANAGER")
                // Delete: ADMIN only
                .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")

                // ── Purchases ─────────────────────────────────────────────────
                // Read: ADMIN + MANAGER
                .requestMatchers(HttpMethod.GET, "/api/purchases/**").hasAnyRole("ADMIN", "MANAGER")
                // Write: ADMIN + MANAGER
                .requestMatchers(HttpMethod.POST,   "/api/purchases/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.PUT,    "/api/purchases/**").hasAnyRole("ADMIN", "MANAGER")
                // Delete: ADMIN only
                .requestMatchers(HttpMethod.DELETE, "/api/purchases/**").hasRole("ADMIN")

                // ── Sales ─────────────────────────────────────────────────────
                // Read: all roles
                .requestMatchers(HttpMethod.GET, "/api/sales/**").authenticated()
                // Write: ADMIN + MANAGER
                .requestMatchers(HttpMethod.POST,   "/api/sales/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.PUT,    "/api/sales/**").hasAnyRole("ADMIN", "MANAGER")
                // Delete: ADMIN only
                .requestMatchers(HttpMethod.DELETE, "/api/sales/**").hasRole("ADMIN")

                // ── Invoices ──────────────────────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/api/invoices/**").authenticated()
                .requestMatchers(HttpMethod.POST,   "/api/invoices/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.PUT,    "/api/invoices/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/api/invoices/**").hasRole("ADMIN")

                // ── Stock Movements ───────────────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/api/stock-movements/**").authenticated()
                .requestMatchers(HttpMethod.POST,   "/api/stock-movements/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/api/stock-movements/**").hasRole("ADMIN")

                // ── Notifications: all roles ──────────────────────────────────
                .requestMatchers("/api/notifications/**").authenticated()

                // ── Profile: all roles ────────────────────────────────────────
                .requestMatchers("/api/profile/**").authenticated()

                // ── Catch-all: require authentication ─────────────────────────
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:5174"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}