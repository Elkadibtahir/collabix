package com.trio.backend.service;

import com.trio.backend.entity.User;

/**
 * Service d'sending d'emails pour Collabix.
 *
 * <p>Responsibilitys :</p>
 * <ul>
 *     <li>Envoyer des emails transactionals relateds Ã  authentication et Ã  management des comptes.</li>
 *     <li>Fournir une interface extensible pour les futurs types d'emails
 *     (verification d'email, reset de mot de passe, invitations, etc.).</li>
 * </ul>
 *
 * <p>Architecture :</p>
 * <ul>
 *     <li>Each method correspondss Ã  un type d'email specific.</li>
 *     <li>L'implementation concrÃ¨te utilise Spring Boot Mail (JavaMailSender).</li>
 *     <li>Les templates HTML sont encapsulated dans l'implementation to avoid
 *     une dependency Ã  un moteur de templates externe dans cette iteration MVP.</li>
 * </ul>
 */
public interface EmailService {

    /**
     * Envoie un email of activation de compte Ã  the user.
     *
     * <p>Cet email est sent lorsqu'un administrator crÃ©e un compte pour un user.
     * Il contains un link of activation allowstant Ã  the user de finaliser
     * creation de son compte.</p>
     *
     * @param user           the user recipient de l'email
     * @param activationLink le link of activation complete Ã  inclure dans l'email
     */
    void sendAccountActivationEmail(User user, String activationLink);

    /**
     * Envoie un email de reset de mot de passe Ã  the user.
     *
     * <p>Cet email est sent lorsqu'un user request la reset
     * de son mot de passe oubrelated. Il contains un link allowstant Ã  the user
     * de dÃ©finir a new mot de passe.</p>
     *
     * @param user     the user recipient de l'email
     * @param resetLink le link de reset complete Ã  inclure dans l'email
     */
    void sendPasswordResetEmail(User user, String resetLink);

    /**
     * Envoie une notification par email Ã  the user.
     *
     * <p>Cet email est sent lorsqu'un event nÃ©cessitant une notification
     * est sortggered dans l'application. Il contains le title et le body de
     * the notification, ainsi qu'un link optional vers la ressource concernÃ©e.</p>
     *
     * @param user              the user recipient de l'email
     * @param notificationTitle le title de the notification
     * @param notificationBody  le body de the notification
     * @param actionLink        le link optional vers la ressource concernÃ©e
     */
    void sendNotificationEmail(User user, String notificationTitle, String notificationBody, String actionLink);

}

