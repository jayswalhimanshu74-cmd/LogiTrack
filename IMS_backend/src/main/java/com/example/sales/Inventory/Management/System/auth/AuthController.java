package com.example.sales.Inventory.Management.System.auth;


import com.example.sales.Inventory.Management.System.auth.dto.AuthResponse;
import com.example.sales.Inventory.Management.System.auth.dto.ForgotPasswordRequest;
import com.example.sales.Inventory.Management.System.auth.dto.LoginRequest;
import com.example.sales.Inventory.Management.System.auth.dto.RegisterRequest;
import com.example.sales.Inventory.Management.System.auth.dto.ResetPasswordRequest;
import com.example.sales.Inventory.Management.System.auth.dto.ResendVerificationRequest;
import com.example.sales.Inventory.Management.System.user.PasswordResetService;
import com.example.sales.Inventory.Management.System.user.EmailVerificationService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    private final EmailVerificationService emailVerificationService;

    public AuthController(AuthService authService,
                          PasswordResetService passwordResetService,
                          EmailVerificationService emailVerificationService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
        this.emailVerificationService = emailVerificationService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.initiateForgotPassword(request.getEmail());
        Map<String, String> response = new HashMap<>();
        response.put("message", "If an account exists, a password reset link has been sent.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password has been reset successfully.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(
            @Valid @RequestBody ResendVerificationRequest request) {
        emailVerificationService.resendVerificationEmail(request.getEmail());
        Map<String, String> response = new HashMap<>();
        response.put("message", "If the email is registered and not verified, a verification link has been sent.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestParam String token) {
        emailVerificationService.verifyEmail(token);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Email verified successfully. You can now log in.");
        return ResponseEntity.ok(response);
    }
}