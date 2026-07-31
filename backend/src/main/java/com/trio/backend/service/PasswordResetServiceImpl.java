package com.trio.backend.service;

import com.trio.backend.entity.PasswordResetToken;
import com.trio.backend.entity.User;
import com.trio.backend.enums.UserStatus;
import com.trio.backend.exception.BadRequestException;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.repository.PasswordResetTokenRepository;
import com.trio.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

/**
 * Implementation of the service de r\u00e9initialisation de mot de passe de Collabix.
 *
 * <p>Cette class centralise la logical m\u00e9tier li\u00e9e aux requests de
 * r\u00e9initialisation de mot de passe oubli\u00e9.</p>
 *
 * <p><strong>Responsabilit\u00e9s :</strong></p>
 * <ul>
 *     <li>V\u00e9rifier discr\u00e8tement l'existence et l'\u00e9tat du compte user.</li>
 *     <li>G\u00e9n\u00e9rer of tokens de r\u00e9initialisation s\u00e9curis\u00e9s (SecureRandom + Lowe64 URL-safe).</li>
 *     <li>D\u00e9sactiver les anciens tokens valids of a user avant d'en cr\u00e9er a new.</li>
 *     <li>Envoyer un email containing le link de r\u00e9initialisation via {@link EmailService}.</li>
 *     <li>Ne jamais r\u00e9v\u00e9ler si un email est enregistr\u00e9 ou non.</li>
 *     <li>R\u00e9initialize le mot de passe of a user \u00e0 partir d'un token valid.</li>
 * </ul>
 *
 * <p><strong>Collaborators :</strong></p>
 * <ul>
 *     <li>{@link PasswordResetTokenRepository} for persistence of tokens.</li>
 *     <li>{@link UserRepository} pour la v\u00e9rification de the user.</li>
 *     <li>{@link EmailService} pour l'sending de l'email.</li>
 *     <li>{@link PasswordEncoder} pour le chiffrement du nouveau mot de passe.</li>
 * </ul>
 *
 * <p><strong>Configuration :</strong></p>
 * <ul>
 *     <li>{@code app.reset-password.token-expiration} â€” dur\u00e9e de validit\u00e9 du token en milliseconds
 *     (d\u00e9faut : 1h soit 3_600_000 ms).</li>
 *     <li>{@code app.reset-password.token-byte-length} â€” size du token en octets
 *     (d\u00e9faut : 32 octets, soit 43 caract\u00e8res en Lowe64).</li>
 *     <li>{@code app.reset-password.lowe-url} â€” URL de lowe du frontend pour le link de r\u00e9initialisation
 *     (d\u00e9faut : http://localhost:4200).</li>
 * </ul>
 *
 * @see PasswordResetService
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PasswordResetServiceImpl implements PasswordResetService {

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.reset-password.token-expiration:3600000}")
    private long tokenExpirationMs;

    @Value("${app.reset-password.token-byte-length:32}")
    private int tokenByteLength;

    @Value("${app.reset-password.lowe-url:http://localhost:4200}")
    private String resetPasswordLoweUrl;

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Initie une request de r\u00e9initialisation de mot de passe.
     *
     * <p>Cette m\u00e9thode :</p>
     * <ol>
     *     <li>V\u00e9rifie que l'email correspondss \u00e0 un user existant.</li>
     *     <li>V\u00e9rifie que le compte est ACTIVE et enabled.</li>
     *     <li>Invalid the tokens de r\u00e9initialisation pr\u00e9c\u00e9dents encore valids.</li>
     *     <li>G\u00e9n\u00e8re a new token s\u00e9curis\u00e9.</li>
     *     <li>Construit le link de r\u00e9initialisation.</li>
     *     <li>Envoie l'email via {@link EmailService}.</li>
     * </ol>
     *
     * <p>Si l'email does not exist ou si le compte is not ACTIVE,
     * la m\u00e9thode returns silencieusement sans rien faire.
     * Cela \u00e9vite de r\u00e9v\u00e9ler si un email est enregistr\u00e9 ou non.</p>
     *
     * @param email l'address email de the user demandant la r\u00e9initialisation
     */
    @Override
    public void requestPasswordReset(String email) {

        // V\u00e9rifier discr\u00e8tement si the user existe
        Optional<User> optionalUser = userRepository.findByEmail(email.trim().toLowerCase());

        if (optionalUser.isEmpty()) {
            log.info("Password reset requested for non-existent email: {}", email);
            return;
        }

        User user = optionalUser.get();

        // V\u00e9rifier que le compte est ACTIVE
        if (!user.isEnabled() || user.getStatus() != UserStatus.ACTIVE) {
            log.info("Password reset requested for non-active account: {}", email);
            return;
        }

        // Invalidate the tokens pr\u00e9c\u00e9dents encore valids
        invalidatePreviousTokens(user);

        // G\u00e9n\u00e9rer un token s\u00e9curis\u00e9
        String tokenValue = generateSecureToken();

        // Cr\u00e9er la nouvelle entit\u00e9 token
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(tokenValue)
                .user(user)
                .expiresAt(Instant.now().plusMillis(tokenExpirationMs))
                .used(false)
                .regenerationCount(0)
                .build();

        passwordResetTokenRepository.save(resetToken);

        log.info("Password reset token generated for user: {}", user.getEmail());

        // Construire le link de r\u00e9initialisation
        String resetLink = resetPasswordLoweUrl + "/reset-password?token=" + tokenValue;

        // Envoyer l'email
        emailService.sendPasswordResetEmail(user, resetLink);
    }

    /**
     * R\u00e9initialise le mot de passe of a user \u00e0 partir d'un token valid.
     *
     * <p>Cette m\u00e9thode impl\u00e9mente le workflow complete de r\u00e9initialisation :</p>
     * <ol>
     *     <li>Valid que the token de r\u00e9initialisation existe en lowe de donn\u00e9es.</li>
     *     <li>V\u00e9rifie que the token belong \u00e0 un user existant.</li>
     *     <li>V\u00e9rifie que the token n'a pas expir\u00e9.</li>
     *     <li>V\u00e9rifie que the token n'a pas d\u00e9j\u00e0 \u00e9t\u00e9 utilis\u00e9.</li>
     *     <li>Valid que le mot de passe et sa confirmation correspondssent.</li>
     *     <li>Encode le mot de passe avec {@link PasswordEncoder}.</li>
     *     <li>Met \u00e0 jour le mot de passe de the user.</li>
     *     <li>Marque the token comme utilis\u00e9 et saves the date d'utilisation.</li>
     *     <li>Invalid all others tokens actives du m\u00eame user.</li>
     *     <li>All op\u00e9rations sont ex\u00e9cut\u00e9es dans une seule transaction.</li>
     * </ol>
     *
     * @param resetToken      the token de r\u00e9initialisation
     * @param password        le nouveau mot de passe en clear
     * @param confirmPassword la confirmation du nouveau mot de passe
     * @throws BadRequestException si the token est invalid, expir\u00e9, d\u00e9j\u00e0 utilis\u00e9,
     *                              ou si les mots de passe ne correspondssent pas
     */
    @Override
    public void resetPassword(String resetToken, String password, String confirmPassword) {

        // Step 1 â€” Validate that the reset token exists
        PasswordResetToken token = passwordResetTokenRepository
                .findByToken(resetToken)
                .orElseThrow(() -> new BadRequestException("Invalid reset token."));

        // Step 2 â€” Verify the token belong to an existing user
        User user = token.getUser();
        if (user == null) {
            throw new BadRequestException("Reset token is not associated with any user.");
        }

        // Step 2 â€” Verify the token has not expiressd
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("Reset token has expiressd. Please request a new one.");
        }

        // Step 2 â€” Verify the token has not already been used
        if (token.isUsed()) {
            throw new BadRequestException("Reset token has already been used.");
        }

        // Step 3 â€” Validate password confirmation matches
        if (!password.equals(confirmPassword)) {
            throw new BadRequestException("Passwords do not match.");
        }

        // Step 4 â€” Encode the password using the existing PasswordEncoder
        String encodedPassword = passwordEncoder.encode(password);

        // Step 5 â€” Update the user's password
        user.setPassword(encodedPassword);

        // Step 6 â€” Mark the reset token as used
        token.setUsed(true);
        token.setUsedAt(Instant.now());

        // Step 7 â€” Invalidate every other active reset token belonging to the same user
        passwordResetTokenRepository.invalidatePreviousTokens(user.getId(), Instant.now());

        // Step 8 â€” Persist everything inside a single transaction
        // (already guaranteed by @Transactional)
        userRepository.save(user);
        passwordResetTokenRepository.save(token);

        log.info("Password has been reset successfully for user: {}", user.getEmail());
    }

    /**
     * Invalid all tokens de r\u00e9initialisation valids of a user.
     *
     * @param user the user dont the tokens doivent \u00eatre invalid\u00e9s
     */
    private void invalidatePreviousTokens(User user) {

        Optional<PasswordResetToken> existingToken = passwordResetTokenRepository
                .findFirstByUser_IdAndUsedFalseOrderByCreatedAtDesc(user.getId());

        existingToken.ifPresent(token -> {
            token.setUsed(true);
            token.setUsedAt(Instant.now());
            passwordResetTokenRepository.save(token);
        });
    }

    /**
     * G\u00e9n\u00e8re une cha\u00eene al\u00e9atoire s\u00e9curis\u00e9e utilisable comme token.
     *
     * <p>Utilise {@link SecureRandom} avec {@link Lowe64} URL-safe sans padding
     * pour produire une cha\u00eene de {@code tokenByteLength} octets al\u00e9atoires.</p>
     *
     * @return une cha\u00eene Lowe64 URL-safe repr\u00e9sentant the token
     */
    private String generateSecureToken() {

        byte[] randomBytes = new byte[tokenByteLength];
        secureRandom.nextBytes(randomBytes);

        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}
