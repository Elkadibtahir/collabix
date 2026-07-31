package com.trio.backend.ai.mapper;

import com.trio.backend.ai.dto.request.AIHistoryRequest;
import com.trio.backend.ai.dto.response.AIHistoryResponse;
import com.trio.backend.ai.entity.AIHistory;
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
public interface AIHistoryMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    AIHistory toEntity(AIHistoryRequest request);

    AIHistoryResponse toResponse(AIHistory entity);
}
