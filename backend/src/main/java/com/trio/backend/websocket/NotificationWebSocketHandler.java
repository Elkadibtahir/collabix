package com.trio.backend.websocket;

import com.trio.backend.entity.Notification;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(NotificationWebSocketHandler.class);

    private final Map<UUID, Set<WebSocketSession>> userSessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public NotificationWebSocketHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        UUID userId = extractUserId(session);
        if (userId != null) {
            userSessions.computeIfAbsent(userId, k -> new CopyOnWriteArraySet<>()).add(session);
            log.debug("WebSocket connected: userId={}, sessionId={}", userId, session.getId());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        UUID userId = extractUserId(session);
        if (userId != null) {
            Set<WebSocketSession> sessions = userSessions.get(userId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    userSessions.remove(userId);
                }
            }
            log.debug("WebSocket disconnected: userId={}, sessionId={}", userId, session.getId());
        }
    }

    public void sendNotification(UUID recipientId, Notification notification) {
        Set<WebSocketSession> sessions = userSessions.get(recipientId);
        if (sessions == null || sessions.isEmpty()) {
            return;
        }
        try {
            String payload = objectMapper.writeValueAsString(notification);
            TextMessage message = new TextMessage(payload);
            for (WebSocketSession session : sessions) {
                if (session.isOpen()) {
                    try {
                        session.sendMessage(message);
                    } catch (IOException e) {
                        log.warn("Failed to send WebSocket message to session={}", session.getId(), e);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to serialize notification for WebSocket", e);
        }
    }

    private UUID extractUserId(WebSocketSession session) {
        String query = session.getUri().getQuery();
        if (query != null && query.startsWith("userId=")) {
            try {
                return UUID.fromString(query.substring(7));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid userId in WebSocket query: {}", query);
            }
        }
        return null;
    }
}
