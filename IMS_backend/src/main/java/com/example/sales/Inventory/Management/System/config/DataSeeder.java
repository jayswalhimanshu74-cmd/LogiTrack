package com.example.sales.Inventory.Management.System.config;

import com.example.sales.Inventory.Management.System.user.Role;
import com.example.sales.Inventory.Management.System.user.User;
import com.example.sales.Inventory.Management.System.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds three default users on first startup (if they don't already exist).
 * Never overwrites existing accounts — safe to run on every boot.
 *
 * Credentials (change before production):
 *   admin@logitrack.com   / Admin@1234   → ADMIN
 *   manager@logitrack.com / Manager@1234 → MANAGER
 *   staff@logitrack.com   / Staff@1234   → STAFF
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        seedUser("Admin User",   "admin@logitrack.com",   "Admin@1234",   Role.ADMIN);
        seedUser("Manager User", "manager@logitrack.com", "Manager@1234", Role.MANAGER);
        seedUser("Staff User",   "staff@logitrack.com",   "Staff@1234",   Role.STAFF);
    }

    private void seedUser(String fullName, String email, String rawPassword, Role role) {
        if (userRepository.existsByEmail(email)) {
            log.debug("DataSeeder: {} already exists — skipping.", email);
            return;
        }
        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setPhone("0000000000");
        user.setRole(role);
        user.setVerified(true);
        user.setActive(true);
        userRepository.save(user);
        log.info("DataSeeder: created {} user → {}", role, email);
    }
}
