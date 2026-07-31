package com.trio.backend.security.jwt;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.jwt")
@Getter
@Setter
@Slf4j
public class JwtProperties {

    private String secret;

    private String issuer;

    private long accessTokenExpiration;

    private long refreshTokenExpiration;

    @PostConstruct
    public void validate() {
        if (secret == null || secret.isBlank()) {
            log.warn("JWT secret is not configured. Set app.jwt.secret or JWT_SECRET environment variable.");
        } else if (secret.getBytes(java.nio.charset.StandardCharsets.UTF_8).length < 32) {
            log.warn("JWT secret is too short: {} bytes (min 32). Generate a proper secret for production.",
                    secret.getBytes(java.nio.charset.StandardCharsets.UTF_8).length);
        }
    }
}