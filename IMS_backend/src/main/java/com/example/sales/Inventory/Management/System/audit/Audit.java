package com.example.sales.Inventory.Management.System.audit;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Audit {
    String action();
    String entityName() default "";
    String description() default "";
}
