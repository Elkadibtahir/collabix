package com.trio.backend.mapper;

import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.communication.ConversationMemberResponse;
import com.trio.backend.dto.communication.ConversationResponse;
import com.trio.backend.dto.communication.CreateConversationRequest;
import com.trio.backend.dto.communication.UpdateConversationRequest;
import com.trio.backend.entity.Conversation;
import com.trio.backend.entity.ConversationMember;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(config = MapStructConfig.class)
public interface ConversationMapper {

    @Mapping(target = "workspace", ignore = true)
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "team", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "archived", ignore = true)
    @Mapping(target = "lastMessageAt", ignore = true)
    @Mapping(target = "lastMessagePreview", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    Conversation toEntity(CreateConversationRequest request);

    @Mapping(target = "workspaceId", source = "workspace.id")
    @Mapping(target = "departmentId", source = "department.id")
    @Mapping(target = "teamId", source = "team.id")
    @Mapping(target = "memberCount", ignore = true)
    @Mapping(target = "unreadCount", ignore = true)
    ConversationResponse toResponse(Conversation conversation);

    @Mapping(target = "workspace", ignore = true)
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "team", ignore = true)
    @Mapping(target = "type", ignore = true)
    @Mapping(target = "private", ignore = true)
    @Mapping(target = "archived", source = "isArchived")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "lastMessageAt", ignore = true)
    @Mapping(target = "lastMessagePreview", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateConversation(UpdateConversationRequest request, @MappingTarget Conversation conversation);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "firstName", source = "user.firstName")
    @Mapping(target = "lastName", source = "user.lastName")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "profilePicture", source = "user.profilePicture")
    ConversationMemberResponse toMemberResponse(ConversationMember member);
}
