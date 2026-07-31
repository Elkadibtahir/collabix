package com.trio.backend.event;

import com.trio.backend.service.EmailService;
import com.trio.backend.websocket.NotificationWebSocketHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final EmailService emailService;
    private final NotificationWebSocketHandler webSocketHandler;

    @Async
    @EventListener
    @Transactional(readOnly = true)
    public void handleNotificationCreated(NotificationCreatedEvent event) {
        try {
            webSocketHandler.sendNotification(
                    event.getRecipient().getId(),
                    event.getNotification()
            );
        } catch (Exception e) {
            log.warn("Failed to send WebSocket notification to user {}: {}",
                    event.getRecipient().getId(), e.getMessage());
        }

        try {
            emailService.sendNotificationEmail(
                    event.getRecipient(),
                    event.getNotification().getTitle(),
                    event.getNotification().getBody(),
                    event.getNotification().getLinkUrl()
            );
        } catch (Exception e) {
            log.error("Failed to send notification email to user {}: {}",
                    event.getRecipient().getId(), e.getMessage());
        }
    }
}
