package com.trio.backend.mapper;

import com.trio.backend.config.InstantToLocalDateTimeMapper;
import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.notification.CreateNotificationRequest;
import com.trio.backend.dto.notification.NotificationResponse;
import com.trio.backend.entity.Notification;
import org.mapstruct.*;

/**
 * Mapper for Notification module.
 */
@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @Builder(disableBuilder = true),
        config = MapStructConfig.class,
        uses = InstantToLocalDateTimeMapper.class
)
public interface NotificationMapper {

    @Mappings({
            @Mapping(target = "workspaceId", source = "notification.workspace.id"),
            @Mapping(target = "recipientId", source = "notification.recipient.id"),
            @Mapping(target = "projectId", source = "notification.project.id"),
            @Mapping(target = "taskId", source = "notification.task.id"),
            @Mapping(target = "commentId", source = "notification.comment.id"),
            @Mapping(target = "documentId", source = "notification.document.id"),
            @Mapping(target = "knowledgeBaseId", source = "notification.knowledgeBase.id"),
            @Mapping(target = "handoverEntryId", source = "notification.handoverEntry.id")
    })
    NotificationResponse toResponse(Notification notification);

    @Mappings({
            @Mapping(target = "id", ignore = true),
            @Mapping(target = "workspace", ignore = true),
            @Mapping(target = "recipient", ignore = true),
            @Mapping(target = "project", ignore = true),
            @Mapping(target = "task", ignore = true),
            @Mapping(target = "comment", ignore = true),
            @Mapping(target = "document", ignore = true),
            @Mapping(target = "knowledgeBase", ignore = true),
            @Mapping(target = "handoverEntry", ignore = true),
            @Mapping(target = "status", ignore = true),
            @Mapping(target = "createdAt", ignore = true),
            @Mapping(target = "updatedAt", ignore = true),
            @Mapping(target = "createdBy", ignore = true),
            @Mapping(target = "updatedBy", ignore = true)
    })
    Notification toEntity(CreateNotificationRequest request);
}
