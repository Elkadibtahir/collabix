package com.trio.backend.service;

import com.trio.backend.dto.communication.ConversationMemberResponse;
import com.trio.backend.dto.communication.ConversationResponse;
import com.trio.backend.dto.communication.CreateConversationRequest;
import com.trio.backend.dto.communication.UpdateConversationRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ConversationService {

    ConversationResponse create(UUID workspaceId, CreateConversationRequest request);

    ConversationResponse getById(UUID workspaceId, UUID conversationId);

    Page<ConversationResponse> listUserConversations(UUID workspaceId, Pageable pageable);

    Page<ConversationResponse> listByType(UUID workspaceId, String type, Pageable pageable);

    List<ConversationResponse> listWorkspaceDefaults(UUID workspaceId);

    List<ConversationResponse> listDirectConversations(UUID workspaceId);

    ConversationResponse update(UUID workspaceId, UUID conversationId, UpdateConversationRequest request);

    void archive(UUID workspaceId, UUID conversationId);

    void delete(UUID workspaceId, UUID conversationId);

    ConversationResponse addMember(UUID workspaceId, UUID conversationId, UUID userId);

    void removeMember(UUID workspaceId, UUID conversationId, UUID userId);

    List<ConversationMemberResponse> listMembers(UUID workspaceId, UUID conversationId);

    long getUnreadCount(UUID workspaceId, UUID conversationId);
}
