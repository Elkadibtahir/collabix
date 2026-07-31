package com.trio.backend.ai.mapper;

import com.trio.backend.ai.dto.request.AIPromptRequest;
import com.trio.backend.ai.dto.response.AIPromptResponse;
import com.trio.backend.ai.entity.AIPrompt;
import com.trio.backend.config.InstantToLocalDateTimeMapper;
import com.trio.backend.config.MapStructConfig;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @Builder(disableBuilder = true),
        config = MapStructConfig.class,
        uses = InstantToLocalDateTimeMapper.class
)
public interface AIPromptMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    AIPrompt toEntity(AIPromptRequest request);

    AIPromptResponse toResponse(AIPrompt entity);
}
