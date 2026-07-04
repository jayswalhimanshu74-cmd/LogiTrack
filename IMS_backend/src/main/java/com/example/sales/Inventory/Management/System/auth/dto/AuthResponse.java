package com.example.sales.Inventory.Management.System.auth.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    private String token;
    private String fullName;
    private String email;
    private String role;
}
