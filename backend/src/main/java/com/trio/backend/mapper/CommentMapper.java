package com.trio.backend.mapper;

import com.trio.backend.config.InstantToLocalDateTimeMapper;
import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.organisation.comment.CommentResponse;
import com.trio.backend.dto.organisation.comment.CreateCommentRequest;
import com.trio.backend.dto.organisation.comment.UpdateCommentRequest;
import com.trio.backend.entity.Comment;
import org.mapstruct.*;

/**
 * Mapper for Comment module.
 */
@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @Builder(disableBuilder = true),
        config = MapStructConfig.class,
        uses = InstantToLocalDateTimeMapper.class
)
public interface CommentMapper {

    @Mapping(target = "taskId", source = "comment.task.id")
    @Mapping(target = "parentCommentId", source = "comment.parentCommentId")
    CommentResponse toResponse(Comment comment);


    // Only map business editable fields (ignore audit, status, author, task, etc.).
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "task", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Comment toEntity(CreateCommentRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "task", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateComment(UpdateCommentRequest request, @MappingTarget Comment comment);
}

