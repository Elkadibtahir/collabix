package com.trio.backend.service;

import com.trio.backend.dto.communication.CreateMessageRequest;
import com.trio.backend.dto.communication.MessageResponse;
import com.trio.backend.dto.communication.UpdateMessageRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface MessageService {

    MessageResponse create(UUID workspaceId, UUID conversationId, CreateMessageRequest request);

    MessageResponse getById(UUID workspaceId, UUID messageId);

    Page<MessageResponse> listByConversation(UUID workspaceId, UUID conversationId, UUID cursor, Pageable pageable);

    Page<MessageResponse> listBySender(UUID workspaceId, Pageable pageable);

    List<MessageResponse> listPinned(UUID workspaceId, UUID conversationId);

    Page<MessageResponse> listFilesByConversation(UUID workspaceId, UUID conversationId, Pageable pageable);

    Page<MessageResponse> listFilesByWorkspace(UUID workspaceId, Pageable pageable);

    Page<MessageResponse> search(UUID workspaceId, UUID conversationId, String query, Pageable pageable);

    Page<MessageResponse> searchByWorkspace(UUID workspaceId, String query, Pageable pageable);

    MessageResponse update(UUID workspaceId, UUID messageId, UpdateMessageRequest request);

    void delete(UUID workspaceId, UUID messageId);
}
