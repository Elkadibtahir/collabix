package com.trio.backend.event;

import com.trio.backend.entity.Notification;
import com.trio.backend.entity.User;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

@Getter
public class NotificationCreatedEvent extends ApplicationEvent {

    private final Notification notification;
    private final User recipient;
    private final UUID workspaceId;

    public NotificationCreatedEvent(Object source, Notification notification, User recipient, UUID workspaceId) {
        super(source);
        this.notification = notification;
        this.recipient = recipient;
        this.workspaceId = workspaceId;
    }
}
