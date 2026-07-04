package com.example.sales.Inventory.Management.System.auth;


import com.example.sales.Inventory.Management.System.auth.dto.AuthResponse;
import com.example.sales.Inventory.Management.System.auth.dto.LoginRequest;
import com.example.sales.Inventory.Management.System.auth.dto.RegisterRequest;
import com.example.sales.Inventory.Management.System.security.JwtService;
import com.example.sales.Inventory.Management.System.user.Role;
import com.example.sales.Inventory.Management.System.user.User;
import com.example.sales.Inventory.Management.System.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.STAFF); // default role; promote to ADMIN manually in DB if needed
        user.setActive(true);

        userRepository.save(user);

        String token = jwtService.generateToken(
                org.springframework.security.core.userdetails.User.builder()
                        .username(user.getEmail())
                        .password(user.getPasswordHash())
                        .authorities("ROLE_" + user.getRole().name())
                        .build()
        );

        return new AuthResponse(token, user.getFullName(), user.getEmail(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        // this throws AuthenticationException automatically if credentials are wrong
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalStateException("User disappeared after authentication"));

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .authorities("ROLE_" + user.getRole().name())
                .build();

        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, user.getFullName(), user.getEmail(), user.getRole().name());
    }
}
