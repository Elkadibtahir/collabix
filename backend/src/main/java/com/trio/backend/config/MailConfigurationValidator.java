package com.trio.backend.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Reports incomplete SMTP configuration without exposing secret values. */
@Component
@Slf4j
public class MailConfigurationValidator {

    @Value("${spring.mail.host:}")
    private String host;

    @Value("${spring.mail.username:}")
    private String username;

    @Value("${spring.mail.password:}")
    private String password;

    @PostConstruct
    void validate() {
        if (username.isBlank() || password.isBlank()) {
            log.warn("SMTP is not fully configured for host '{}'. Activation emails will not be sent until MAIL_USERNAME and MAIL_PASSWORD are configured.", host);
        }
    }
}
