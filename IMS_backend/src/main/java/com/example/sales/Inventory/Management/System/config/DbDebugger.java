package com.example.sales.Inventory.Management.System.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;

@Component
@RequiredArgsConstructor
public class DbDebugger implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {

        System.out.println("DB = " +
                jdbcTemplate.queryForObject(
                        "select current_database()", String.class));

        System.out.println("Schema = " +
                jdbcTemplate.queryForObject(
                        "select current_schema()", String.class));

        System.out.println("Search Path = " +
                jdbcTemplate.queryForObject(
                        "show search_path", String.class));

        System.out.println("User = " +
                jdbcTemplate.queryForObject(
                        "select current_user", String.class));

        System.out.println("Tables = " +
                jdbcTemplate.queryForObject(
                        "select count(*) from information_schema.tables where table_schema='public'",
                        Integer.class));

        System.out.println("Users Exists = " +
                jdbcTemplate.queryForObject(
                        """
                        select exists(
                            select 1
                            from information_schema.tables
                            where table_schema='public'
                            and table_name='users'
                        )
                        """,
                        Boolean.class));
    }
}