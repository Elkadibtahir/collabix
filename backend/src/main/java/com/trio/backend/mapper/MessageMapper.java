package com.trio.backend.mapper;

import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.communication.CreateMessageRequest;
import com.trio.backend.dto.communication.MessageResponse;
import com.trio.backend.dto.communication.UpdateMessageRequest;
import com.trio.backend.entity.Message;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(config = MapStructConfig.class)
public interface MessageMapper {

    @Mapping(target = "conversation", ignore = true)
    @Mapping(target = "sender", ignore = true)
    @Mapping(target = "parentMessage", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    Message toEntity(CreateMessageRequest request);

    @Mapping(target = "conversationId", source = "conversation.id")
    @Mapping(target = "senderId", source = "sender.id")
    @Mapping(target = "senderFirstName", source = "sender.firstName")
    @Mapping(target = "senderLastName", source = "sender.lastName")
    @Mapping(target = "senderProfilePicture", source = "sender.profilePicture")
    @Mapping(target = "parentMessageId", source = "parentMessage.id")
    MessageResponse toResponse(Message message);

    @Mapping(target = "conversation", ignore = true)
    @Mapping(target = "sender", ignore = true)
    @Mapping(target = "parentMessage", ignore = true)
    @Mapping(target = "messageType", ignore = true)
    @Mapping(target = "fileUrl", ignore = true)
    @Mapping(target = "fileName", ignore = true)
    @Mapping(target = "fileSize", ignore = true)
    @Mapping(target = "mimeType", ignore = true)
    @Mapping(target = "mentions", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateMessage(UpdateMessageRequest request, @MappingTarget Message message);
}
