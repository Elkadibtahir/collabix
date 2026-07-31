package com.trio.backend.mapper;

import com.trio.backend.dto.ai.AIModelResponse;
import com.trio.backend.entity.AIModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AIModelMapper {

    @Mapping(target = "departmentId", source = "entity.department.id")
    @Mapping(target = "projectId", source = "entity.project.id")
    @Mapping(target = "projectName", source = "entity.project.name")
    @Mapping(target = "teamId", source = "entity.team.id")
    @Mapping(target = "teamName", source = "entity.team.name")
    @Mapping(target = "createdAt", source = "entity.createdAt")
    @Mapping(target = "updatedAt", source = "entity.updatedAt")
    AIModelResponse toResponse(AIModel entity);
}
