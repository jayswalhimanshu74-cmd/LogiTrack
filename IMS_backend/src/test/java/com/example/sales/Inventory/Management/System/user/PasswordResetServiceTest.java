package com.example.sales.Inventory.Management.System.user;

import com.example.sales.Inventory.Management.System.email.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PasswordResetServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @Mock
    private org.springframework.context.ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private PasswordResetService passwordResetService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testForgotPassword_ExistingEmail() {
        String email = "existing@example.com";
        User user = new User();
        user.setEmail(email);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(tokenRepository.findByUserAndUsedFalse(user)).thenReturn(Collections.emptyList());

        passwordResetService.initiateForgotPassword(email);

        verify(tokenRepository, times(1)).save(any(PasswordResetToken.class));
        verify(emailService, times(1)).sendResetPasswordEmail(eq(email), anyString(), anyInt());
    }

    @Test
    void testForgotPassword_NonExistingEmail() {
        String email = "nonexisting@example.com";

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        passwordResetService.initiateForgotPassword(email);

        verify(tokenRepository, never()).save(any(PasswordResetToken.class));
        verify(emailService, never()).sendResetPasswordEmail(anyString(), anyString(), anyInt());
    }

    @Test
    void testResetPassword_Success() {
        String token = "valid-token";
        String newPassword = "new-secure-password";
        String encodedPassword = "encoded-password";

        User user = new User();
        user.setPasswordHash("old-hash");

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(15));
        resetToken.setUsed(false);

        when(tokenRepository.findByToken(token)).thenReturn(Optional.of(resetToken));
        when(passwordEncoder.encode(newPassword)).thenReturn(encodedPassword);

        passwordResetService.resetPassword(token, newPassword);

        verify(passwordEncoder, times(1)).encode(newPassword);
        assertEquals(encodedPassword, user.getPasswordHash());
        assertTrue(resetToken.isUsed());
        verify(userRepository, times(1)).save(user);
        verify(tokenRepository, times(1)).save(resetToken);
    }

    @Test
    void testResetPassword_InvalidToken() {
        String token = "invalid-token";
        String newPassword = "new-secure-password";

        when(tokenRepository.findByToken(token)).thenReturn(Optional.empty());

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            passwordResetService.resetPassword(token, newPassword);
        });

        assertEquals("Invalid token", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testResetPassword_ExpiredToken() {
        String token = "expired-token";
        String newPassword = "new-secure-password";

        User user = new User();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().minusMinutes(5));
        resetToken.setUsed(false);

        when(tokenRepository.findByToken(token)).thenReturn(Optional.of(resetToken));

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            passwordResetService.resetPassword(token, newPassword);
        });

        assertEquals("Token has expired", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testResetPassword_UsedToken() {
        String token = "used-token";
        String newPassword = "new-secure-password";

        User user = new User();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(15));
        resetToken.setUsed(true);

        when(tokenRepository.findByToken(token)).thenReturn(Optional.of(resetToken));

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            passwordResetService.resetPassword(token, newPassword);
        });

        assertEquals("Token has already been used", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }
}
