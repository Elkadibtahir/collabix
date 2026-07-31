package com.trio.backend.mapper;

import com.trio.backend.config.InstantToLocalDateTimeMapper;
import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.Knowledgebase.CreateKnowledgeBaseRequest;
import com.trio.backend.dto.Knowledgebase.UpdateKnowledgeBaseRequest;
import com.trio.backend.dto.Knowledgebase.KnowledgeBaseResponse;
import com.trio.backend.entity.KnowledgeBase;
import org.mapstruct.*;

/**
 * Mapper for KnowledgeBase module.
 */
@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @Builder(disableBuilder = true),
        config = MapStructConfig.class,
        uses = InstantToLocalDateTimeMapper.class
)
public interface KnowledgeBaseMapper {

    @Mapping(source = "articleVersion", target = "version")
    KnowledgeBaseResponse toResponse(KnowledgeBase knowledgeBase);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "project", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "isPinned", ignore = true)
    @Mapping(target = "aiProcessed", ignore = true)
    @Mapping(target = "aiSummary", ignore = true)
    @Mapping(target = "aiTags", ignore = true)
    @Mapping(target = "ragEmbeddingsAvailable", ignore = true)
    @Mapping(target = "viewCount", ignore = true)
    @Mapping(target = "favoriteCount", ignore = true)
    @Mapping(target = "lastViewedAt", ignore = true)
    @Mapping(target = "lastViewedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "approvalStatus", ignore = true)
    @Mapping(target = "approvedBy", ignore = true)
    @Mapping(target = "approvedAt", ignore = true)
    KnowledgeBase toEntity(CreateKnowledgeBaseRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "project", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "approvalStatus", ignore = true)
    @Mapping(target = "approvedBy", ignore = true)
    @Mapping(target = "approvedAt", ignore = true)
    void updateKnowledgeBase(UpdateKnowledgeBaseRequest request, @MappingTarget KnowledgeBase knowledgeBase);
}
