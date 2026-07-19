package com.example.sales.Inventory.Management.System.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;


@Component
@RequiredArgsConstructor
public class DbDebugRunner implements CommandLineRunner {


    @Override
    public void run(String... args) {

        // System.out.println("========== DATABASE INFO ==========");

        // System.out.println("Database : " +
        //         jdbcTemplate.queryForObject("select current_database()", String.class));

        // System.out.println("Schema : " +
        //         jdbcTemplate.queryForObject("select current_schema()", String.class));

        // System.out.println("Search Path : " +
        //         jdbcTemplate.queryForObject("show search_path", String.class));

        // System.out.println("Users exists : " +
        //         jdbcTemplate.queryForObject(
        //                 "select exists(select 1 from information_schema.tables where table_name='users')",
        //                 Boolean.class));

        // System.out.println("Products exists : " +
        //         jdbcTemplate.queryForObject(
        //                 "select exists(select 1 from information_schema.tables where table_name='products')",
        //                 Boolean.class));
    }
}