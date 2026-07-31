package com.trio.backend.service;

/**
 * Service management of tokens de reset de mot de passe.
 *
 * <p>Responsibilitys :</p>
 * <ul>
 *     <li>Initier une request de reset de mot de passe.</li>
 *     <li>GÃ©nÃ©rer un token de reset unique et secure.</li>
 *     <li>Invalidate les previouss tokens valids.</li>
 *     <li>DÃ©lÃ©guer l'sending de l'email Ã  {@link EmailService}.</li>
 * </ul>
 *
 * <p>Architecture :</p>
 * <ul>
 *     <li>Ce service est totalement independsant of the module JWT.</li>
 *     <li>Il suit le same pattern que {@link AccountActivationService}.</li>
 * </ul>
 */
public interface PasswordResetService {

    /**
     * Initie une request de reset de mot de passe.
     *
     * <p>Cette method verifies que the user existe et que son compte
     * est ACTIVE, puis generates un token de reset, invalid les
     * previouss tokens valids et sendinge un email containing le link de
     * reset.</p>
     *
     * <p>Ne rÃ©vÃ¨le jamais si l'email existe ou non.</p>
     *
     * @param email l'address email de the user demandant la reset
     */
    void requestPasswordReset(String email);

    /**
     * Resets le mot de passe of a user Ã  partir d'un token valid.
     *
     * <p>Cette method valid the token de reset, verifies qu'il
     * belong Ã  un user existant, qu'il is not expiresd et qu'il
     * n'a pas dÃ©jÃ  Ã©tÃ© used, puis met Ã  jour le mot de passe, marque le
     * token comme used et invalid all others tokens actives du same
     * user.</p>
     *
     * @param resetToken   the token de reset
     * @param password     le nouveau mot de passe en clear
     * @param confirmPassword la confirmation du nouveau mot de passe
     * @throws com.trio.backend.exception.BadRequestException si the token est invalid,
     *                                                        les mots de passe ne correspondssent pas,
     *                                                        ou the token a expiresd/dÃ©jÃ  Ã©tÃ© used
     */
    void resetPassword(String resetToken, String password, String confirmPassword);
}

