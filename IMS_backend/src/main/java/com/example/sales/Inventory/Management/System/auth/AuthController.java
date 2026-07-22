package com.example.sales.Inventory.Management.System.auth;


import com.example.sales.Inventory.Management.System.auth.dto.AuthResponse;
import com.example.sales.Inventory.Management.System.auth.dto.ForgotPasswordRequest;
import com.example.sales.Inventory.Management.System.auth.dto.LoginRequest;
import com.example.sales.Inventory.Management.System.auth.dto.RegisterRequest;
import com.example.sales.Inventory.Management.System.auth.dto.ResetPasswordRequest;
import com.example.sales.Inventory.Management.System.auth.dto.ResendVerificationRequest;
import com.example.sales.Inventory.Management.System.user.PasswordResetService;
import com.example.sales.Inventory.Management.System.user.EmailVerificationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Tag(name = "Authentication",
        description = "Public endpoints for user registration, login, email verification, and password reset. "
                + "No JWT token required for any endpoint in this module.")
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

    @Operation(
            summary = "Register a new user account",
            description = """
                    Creates a new user account in        the system. Upon successful registration,
                    a **verification email** is dispatched to the provided address.
                    The account remains inactive until the email is verified.
                    
                    **Required Fields:** fullName, email, password, phone
                    
                    **Roles:** ADMIN, MANAGER, STAFF (defaults to STAFF if omitted)
                    """,
            security = @SecurityRequirement(name = "")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Account created — verification email sent",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class),
                            examples = @ExampleObject(value = """
                                    {
                                      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                                      "fullName": "Jane Smith",
                                      "email": "jane@stockmaster.io",
                                      "role": "STAFF"
                                    }"""))),
            @ApiResponse(responseCode = "400", description = "Validation failed — missing or invalid fields",
                    content = @Content(examples = @ExampleObject(value = """
                            { "success": false, "message": "email: Email must be valid", "timestamp": "2025-07-15T10:00:00" }"""))),
            @ApiResponse(responseCode = "409", description = "Email already registered",
                    content = @Content(examples = @ExampleObject(value = """
                            { "success": false, "message": "Email already in use", "timestamp": "2025-07-15T10:00:00" }""")))
    })
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "Login and obtain a JWT token",
            description = """
                    Authenticates a user and returns a **JWT Bearer token** valid for 24 hours.
                    
                    **Flow:**
                    1. Submit email and password
                    2. Copy the `token` value from the response
                    3. Click **Authorize 🔓** at the top of this page
                    4. Paste the token — all secured endpoints are now callable
                    
                    > ⚠️ The account must be email-verified before login succeeds.
                    """,
            security = @SecurityRequirement(name = "")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login successful — JWT token returned",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class),
                            examples = @ExampleObject(value = """
                                    {
                                      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqYW5lQGxvZ2l0cmFjay5pbyIsImlhdCI6MTcyMTAyMDAwMCwiZXhwIjoxNzIxMTA2NDAwfQ.abc123",
                                      "fullName": "Jane Smith",
                                      "email": "jane@stockmaster.io",
                                      "role": "ADMIN"
                                    }"""))),
            @ApiResponse(responseCode = "400", description = "Missing email or password"),
            @ApiResponse(responseCode = "401", description = "Invalid credentials or unverified account",
                    content = @Content(examples = @ExampleObject(value = """
                            { "success": false, "message": "Invalid email or password", "timestamp": "2025-07-15T10:00:00" }""")))
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Initiate forgot password flow",
            description = """
                    Sends a **password reset link** to the provided email address if an account exists.
                    The response is always the same regardless of whether the email exists
                    (to prevent user enumeration attacks).
                    
                    The reset link expires in **15 minutes**.
                    """,
            security = @SecurityRequirement(name = "")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reset link dispatched (if email exists)",
                    content = @Content(examples = @ExampleObject(value = """
                            { "message": "If an account exists, a password reset link has been sent." }"""))),
            @ApiResponse(responseCode = "400", description = "Email field missing or invalid format")
    })
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.initiateForgotPassword(request.getEmail());
        Map<String, String> response = new HashMap<>();
        response.put("message", "If an account exists, a password reset link has been sent.");
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Reset password using token",
            description = """
                    Resets the user's password using the one-time token from the reset email.
                    
                    **Token validity:** 15 minutes from issuance.
                    After reset, the token is invalidated and cannot be reused.
                    """,
            security = @SecurityRequirement(name = "")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Password reset successfully",
                    content = @Content(examples = @ExampleObject(value = """
                            { "message": "Password has been reset successfully." }"""))),
            @ApiResponse(responseCode = "400", description = "Invalid or expired reset token"),
            @ApiResponse(responseCode = "400", description = "Password does not meet requirements")
    })
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password has been reset successfully.");
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Resend email verification link",
            description = """
                    Resends a verification email to the specified address if the account is registered
                    but not yet verified. Always returns a neutral response to prevent enumeration.
                    """,
            security = @SecurityRequirement(name = "")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Verification email dispatched (if eligible)",
                    content = @Content(examples = @ExampleObject(value = """
                            { "message": "If the email is registered and not verified, a verification link has been sent." }"""))),
            @ApiResponse(responseCode = "400", description = "Email field missing or invalid")
    })
    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(
            @Valid @RequestBody ResendVerificationRequest request) {
        emailVerificationService.resendVerificationEmail(request.getEmail());
        Map<String, String> response = new HashMap<>();
        response.put("message", "If the email is registered and not verified, a verification link has been sent.");
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Verify email address",
            description = """
                    Confirms the user's email address using the token from the verification email.
                    Once verified, the user can log in normally.
                    
                    This endpoint is typically called by the frontend redirect from the email link.
                    """,
            security = @SecurityRequirement(name = "")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Email verified successfully",
                    content = @Content(examples = @ExampleObject(value = """
                            { "message": "Email verified successfully. You can now log in." }"""))),
            @ApiResponse(responseCode = "400", description = "Invalid or already-used verification token")
    })
    @GetMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestParam String token) {
        emailVerificationService.verifyEmail(token);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Email verified successfully. You can now log in.");
        return ResponseEntity.ok(response);
    }
}