package com.trio.backend.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

/**
 * Requests delivery of an account-activation email after its token transaction
 * has committed.
 */
@Getter
public class AccountActivationEmailRequestedEvent extends ApplicationEvent {

    private final UUID userId;
    private final String activationLink;

    public AccountActivationEmailRequestedEvent(Object source, UUID userId, String activationLink) {
        super(source);
        this.userId = userId;
        this.activationLink = activationLink;
    }
}
