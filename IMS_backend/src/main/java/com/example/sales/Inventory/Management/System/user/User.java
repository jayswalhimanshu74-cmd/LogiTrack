package com.example.sales.Inventory.Management.System.user;

import com.example.sales.Inventory.Management.System.utill.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "phone", nullable = true, length = 15)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.STAFF;

    @Column(name = "is_verified", nullable = false)
    private boolean verified = false;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "profile_image_url", nullable = true, length = 500)
    private String profileImageUrl;

    @Column(name = "last_password_changed", nullable = true)
    private java.time.LocalDateTime lastPasswordChanged;

    @Column(name = "oauth_provider", nullable = true, length = 50)
    private String oauthProvider; // "LOCAL", "GOOGLE", "GITHUB"
}