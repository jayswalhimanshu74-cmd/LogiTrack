package com.example.sales.Inventory.Management.System.user;

import com.example.sales.Inventory.Management.System.email.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.reset-token-expiration-minutes:15}")
    private int expiryMinutes;

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetTokenRepository tokenRepository,
                                PasswordEncoder passwordEncoder,
                                EmailService emailService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional
    public void initiateForgotPassword(String email) {
        log.info("Password reset request received for email: {}", email);
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // Mitigate email enumeration: log internally but do not fail or reveal to caller
            log.warn("Password reset requested for non-existent email: {}", email);
            return;
        }

        User user = userOpt.get();

        // Invalidate old active reset tokens for this user
        List<PasswordResetToken> activeTokens = tokenRepository.findByUserAndUsedFalse(user);
        if (activeTokens != null && !activeTokens.isEmpty()) {
            for (PasswordResetToken oldToken : activeTokens) {
                oldToken.setUsed(true);
            }
            tokenRepository.saveAll(activeTokens);
            log.info("Invalidated {} old active password reset tokens for user: {}", activeTokens.size(), email);
        }

        // Generate cryptographically secure token
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);

        // Create new PasswordResetToken entity
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(expiryMinutes));
        resetToken.setCreatedAt(LocalDateTime.now());
        resetToken.setUsed(false);

        tokenRepository.save(resetToken);

        // Send email (handling failures internally within EmailService)
        emailService.sendResetPasswordEmail(user.getEmail(), token, expiryMinutes);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        log.info("Password reset attempt with token");

        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid token"));

        if (resetToken.isUsed()) {
            throw new IllegalArgumentException("Token has already been used");
        }

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token has expired");
        }

        User user = resetToken.getUser();
        
        // Encode and update the password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Invalidate the token used
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        log.info("Password successfully reset for user ID: {}", user.getId());
    }
}
