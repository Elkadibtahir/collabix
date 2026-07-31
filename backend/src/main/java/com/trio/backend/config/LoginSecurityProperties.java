package com.trio.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Configuration properties for login security (brute-force protection).
 *
 * <p>Controls the account lockout behavior after repeated failed login attempts.
 * All properties are externalised via {@code app.login-security.*} in
 * {@code application.properties} or environment variables.</p>
*
 * <p><strong>Default values:</strong></p>
 * <ul>
 *   <li>{@code maxAttempts = 5} — lock the account after 5 consecutive failures</li>
 *   <li>{@code lockDuration = 30m} — duration for which the account remains locked</li>
 *   <li>{@code automaticUnlockEnabled = true} — automatically unlock after lockDuration expires</li>
 *   <li>{@code enabled = true} — feature is active by default; set to {@code false} to disable during development</li>
 * </ul>
 *
 * <p><strong>Usage in {@code application.properties}:</strong></p>
 * <pre>{@code
 * app.login-security.max-attempts=5
 * app.login-security.lock-duration=30m
 * app.login-security.automatic-unlock-enabled=true
 * app.login-security.enabled=true
 * }</pre>
 */
@Component
@ConfigurationProperties(prefix = "app.login-security")
@Getter
@Setter
public class LoginSecurityProperties {

    /**
     * Maximum number of consecutive failed login attempts before the
     * account is automatically locked.
     */
    private int maxAttempts = 5;

    /**
     * Duration for which the account remains locked after reaching
     * the maximum number of failed attempts.
     *
     * <p>When {@link #automaticUnlockEnabled} is {@code true}, the account
     * will be automatically unlocked once this duration has elapsed since
     * {@code lockedAt}.</p>
     */
    private Duration lockDuration = Duration.ofMinutes(30);

    /**
     * Enables or disables automatic account unlocking after the lock
     * duration has expired.
     *
     * <p>When set to {@code true}, accounts locked due to excessive failed
     * login attempts are automatically unlocked during the next login
     * attempt if the configured {@link #lockDuration} has elapsed.</p>
     *
     * <p>When set to {@code false}, locked accounts must be unlocked
     * manually by an administrator via the unlock endpoint.</p>
     */
    private boolean automaticUnlockEnabled = true;

    /**
     * Enables or disables the login security feature entirely.
     *
     * <p>When set to {@code false}, no failed login attempt tracking
     * or account locking occurs. Useful during development or testing.</p>
     */
    private boolean enabled = true;

}
