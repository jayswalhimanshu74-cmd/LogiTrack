package com.example.sales.Inventory.Management.System.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DbDebugRunner implements CommandLineRunner {

    @Value("${spring.datasource.url}")
    private String url;
   

    @Override
    public void run(String... args) {
        System.out.println("========== DB URL ==========");
        System.out.println(url);
    }
}