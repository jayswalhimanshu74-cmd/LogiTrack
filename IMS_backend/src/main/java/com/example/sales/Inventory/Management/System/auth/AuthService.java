package com.example.sales.Inventory.Management.System.auth;


import com.example.sales.Inventory.Management.System.auth.dto.AuthResponse;
import com.example.sales.Inventory.Management.System.auth.dto.LoginRequest;
import com.example.sales.Inventory.Management.System.auth.dto.RegisterRequest;
import com.example.sales.Inventory.Management.System.security.JwtService;
import com.example.sales.Inventory.Management.System.user.EmailVerificationService;
import com.example.sales.Inventory.Management.System.user.Role;
import com.example.sales.Inventory.Management.System.user.User;
import com.example.sales.Inventory.Management.System.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailVerificationService emailVerificationService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager,
                       EmailVerificationService emailVerificationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.emailVerificationService = emailVerificationService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        String rawPassword = request.getEffectivePassword();
        if (rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setPhone(request.getPhone());
        
        if (request.getRole() != null) {
            try {
                user.setRole(Role.valueOf(request.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                user.setRole(Role.STAFF);
            }
        } else {
            user.setRole(Role.STAFF);
        }
        
        user.setVerified(false);
        user.setActive(true);

        userRepository.save(user);

        // Generate and send email verification token
        emailVerificationService.createAndSendVerificationToken(user);

        return new AuthResponse(null, user.getFullName(), user.getEmail(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        // this throws AuthenticationException automatically if credentials are wrong
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalStateException("User disappeared after authentication"));

        if (!user.isVerified()) {
            throw new IllegalArgumentException("Please verify your email before logging in.");
        }

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .authorities("ROLE_" + user.getRole().name())
                .build();

        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, user.getFullName(), user.getEmail(), user.getRole().name());
    }
}
