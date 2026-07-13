package com.example.sales.Inventory.Management.System.audit;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.time.LocalDateTime;

@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final ApplicationEventPublisher eventPublisher;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Around("@annotation(auditAnnotation)")
    public Object profileExecution(ProceedingJoinPoint joinPoint, Audit auditAnnotation) throws Throwable {
        HttpServletRequest request = null;
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            request = attributes.getRequest();
        }

        // Capture request HTTP parameters
        String ipAddress = request != null ? getClientIp(request) : "N/A";
        String userAgent = request != null ? request.getHeader("User-Agent") : "N/A";
        String requestMethod = request != null ? request.getMethod() : "N/A";
        String requestUri = request != null ? request.getRequestURI() : "N/A";

        // Capture User Context
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = null;
        String userName = "System";
        String userEmail = "system@logitrack.com";
        String role = "SYSTEM";

        if (auth != null && auth.isAuthenticated() && !(auth instanceof org.springframework.security.authentication.AnonymousAuthenticationToken)) {
            Object principal = auth.getPrincipal();
            if (principal instanceof com.example.sales.Inventory.Management.System.user.User) {
                com.example.sales.Inventory.Management.System.user.User u = (com.example.sales.Inventory.Management.System.user.User) principal;
                userId = u.getId();
                userName = u.getFullName();
                userEmail = u.getEmail();
                role = u.getRole().name();
            } else {
                userName = auth.getName();
                userEmail = auth.getName();
                role = auth.getAuthorities().isEmpty() ? "USER" : auth.getAuthorities().iterator().next().getAuthority();
            }
        }

        // Before method execution details (oldValue mapping placeholder)
        Object[] args = joinPoint.getArgs();
        String oldValue = null;
        try {
            if (args.length > 0 && args[0] != null) {
                oldValue = maskSensitiveData(objectMapper.writeValueAsString(args[0]));
            }
        } catch (Exception ignored) {}

        Object result = null;
        String status = "SUCCESS";
        String exceptionMsg = null;

        try {
            result = joinPoint.proceed();
            return result;
        } catch (Throwable t) {
            status = "FAILED";
            exceptionMsg = t.getMessage();
            throw t;
        } finally {
            // After method details (newValue serialization)
            String newValue = null;
            try {
                if (result != null) {
                    newValue = maskSensitiveData(objectMapper.writeValueAsString(result));
                }
            } catch (Exception ignored) {}

            Long entityId = extractEntityId(args, result);
            String description = auditAnnotation.description();
            if (description.isEmpty()) {
                if ("FAILED".equals(status)) {
                    description = "Execution failed: " + exceptionMsg;
                } else {
                    description = "Executed action: " + auditAnnotation.action();
                }
            } else {
                description = maskSensitiveData(description);
            }

            AuditEvent event = AuditEvent.builder()
                    .userId(userId)
                    .userName(userName)
                    .userEmail(userEmail)
                    .role(role)
                    .action(auditAnnotation.action())
                    .entityName(auditAnnotation.entityName().isEmpty() ? null : auditAnnotation.entityName())
                    .entityId(entityId)
                    .description(description)
                    .oldValue(oldValue)
                    .newValue(newValue)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .requestMethod(requestMethod)
                    .requestUri(requestUri)
                    .status(status)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventPublisher.publishEvent(event);
        }
    }

    private Long extractEntityId(Object[] args, Object result) {
        if (result != null) {
            try {
                Method getId = result.getClass().getMethod("getId");
                Object id = getId.invoke(result);
                if (id instanceof Long) {
                    return (Long) id;
                }
            } catch (Exception ignored) {}
        }
        for (Object arg : args) {
            if (arg instanceof Long) {
                return (Long) arg;
            }
            if (arg != null) {
                try {
                    Method getId = arg.getClass().getMethod("getId");
                    Object id = getId.invoke(arg);
                    if (id instanceof Long) {
                        return (Long) id;
                    }
                } catch (Exception ignored) {}
            }
        }
        return null;
    }

    private String maskSensitiveData(String data) {
        if (data == null) return null;
        return data.replaceAll("(?i)\"(password|confirmPassword|currentPassword|newPassword|token|jwt|accessToken|refreshToken|authorization)\"\\s*:\\s*\"[^\"]+\"", "\"$1\":\"[MASKED]\"");
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
