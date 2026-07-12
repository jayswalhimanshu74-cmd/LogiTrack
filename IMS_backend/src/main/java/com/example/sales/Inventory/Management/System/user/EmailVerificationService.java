package com.example.sales.Inventory.Management.System.user;

import com.example.sales.Inventory.Management.System.email.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
public class EmailVerificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailVerificationService.class);

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository tokenRepository;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.verification-token-expiration-hours:24}")
    private int expiryHours;

    public EmailVerificationService(UserRepository userRepository,
                                    EmailVerificationTokenRepository tokenRepository,
                                    EmailService emailService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
    }

    @Transactional
    public void createAndSendVerificationToken(User user) {
        log.info("Creating verification token for user: {}", user.getEmail());

        // Invalidate any existing unused verification tokens for this user
        List<EmailVerificationToken> activeTokens = tokenRepository.findByUserAndUsedFalse(user);
        if (activeTokens != null && !activeTokens.isEmpty()) {
            for (EmailVerificationToken oldToken : activeTokens) {
                oldToken.setUsed(true);
            }
            tokenRepository.saveAll(activeTokens);
            log.info("Invalidated {} old active verification tokens for user: {}", activeTokens.size(), user.getEmail());
        }

        // Generate cryptographically secure token
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);

        // Create new EmailVerificationToken entity
        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.setExpiryDate(LocalDateTime.now().plusHours(expiryHours));
        verificationToken.setCreatedAt(LocalDateTime.now());
        verificationToken.setUsed(false);

        tokenRepository.save(verificationToken);

        // Send email
        emailService.sendVerificationEmail(user.getEmail(), token, expiryHours);
    }

    @Transactional
    public void verifyEmail(String token) {
        log.info("Attempting to verify email with token");

        EmailVerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email verification token"));

        if (verificationToken.isUsed()) {
            throw new IllegalArgumentException("Verification token has already been used");
        }

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification token has expired");
        }

        User user = verificationToken.getUser();
        if (user.isVerified()) {
            // Already verified, mark token as used and complete
            verificationToken.setUsed(true);
            tokenRepository.save(verificationToken);
            log.info("User {} was already verified", user.getEmail());
            return;
        }

        user.setVerified(true);
        userRepository.save(user);

        verificationToken.setUsed(true);
        tokenRepository.save(verificationToken);

        log.info("User {} email successfully verified", user.getEmail());
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        log.info("Verification email resend requested for email: {}", email);

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // Mitigate email enumeration: do not reveal that the email doesn't exist.
            // Throwing a generic message is acceptable or logging internally.
            log.warn("Resend verification requested for non-existent email: {}", email);
            throw new IllegalArgumentException("If the email is registered and not verified, a verification link has been sent.");
        }

        User user = userOpt.get();
        if (user.isVerified()) {
            log.info("Resend verification requested for already verified user: {}", email);
            throw new IllegalArgumentException("This account is already verified. Please log in.");
        }

        createAndSendVerificationToken(user);
    }
}
