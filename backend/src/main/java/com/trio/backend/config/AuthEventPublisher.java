package com.trio.backend.config;

import com.trio.backend.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Lightweight publisher for authentication-related events.
 *
 * <p>Currently logs events to the application log. This class serves as
 * a future extension point for:</p>
 * <ul>
 *   <li>Security audit logs</li>
 *   <li>Suspicious activity detection</li>
 *   <li>Security notification emails</li>
 *   <li>Integration with external SIEM systems</li>
 * </ul>
 *
 * <p><strong>Usage:</strong> Inject {@code AuthEventPublisher} and call the
 * relevant method at the appropriate point in the authentication flow.</p>
 */
@Component
@Slf4j
public class AuthEventPublisher {

    /**
     * Logs a failed login attempt for the given user.
     *
     * @param user                 the user who attempted to log in
     * @param failedAttempts       the current number of consecutive failed attempts
     * @param maxAttempts          the configured maximum before lockout
     */
    public void publishFailedLogin(User user, int failedAttempts, int maxAttempts) {
        log.warn(
                "Failed login attempt for user [id={}, email={}]. Attempt {}/{}.",
                user.getId(),
                user.getEmail(),
                failedAttempts,
                maxAttempts
        );
    }

    /**
     * Logs a successful login for the given user.
     *
     * @param user the user who logged in successfully
     */
    public void publishSuccessfulLogin(User user) {
        log.info(
                "Successful login for user [id={}, email={}].",
                user.getId(),
                user.getEmail()
        );
    }

    /**
     * Logs an account lockout event.
     *
     * @param user           the user whose account was locked
     * @param failedAttempts the number of failed attempts that triggered the lockout
     */
    public void publishAccountLocked(User user, int failedAttempts) {
        log.warn(
                "Account LOCKED for user [id={}, email={}] after {} consecutive failed attempts.",
                user.getId(),
                user.getEmail(),
                failedAttempts
        );
    }

    /**
     * Logs an account unlock event.
     *
     * @param user the user whose account was unlocked
     */
    public void publishAccountUnlocked(User user) {
        log.info(
                "Account UNLOCKED for user [id={}, email={}].",
                user.getId(),
                user.getEmail()
        );
    }

}
