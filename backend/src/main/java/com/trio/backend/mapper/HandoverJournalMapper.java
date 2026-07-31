package com.trio.backend.mapper;

import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.organisation.handover.HandoverJournalResponse;
import com.trio.backend.entity.HandoverJournal;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = MapStructConfig.class, builder = @Builder(disableBuilder = true))
public interface HandoverJournalMapper {

    /**
     * Mappe l'entité HandoverJournal vers son DTO de réponse (Aplatissement des relations).
     */
    @Mapping(source = "workspace.id", target = "workspaceId")
    @Mapping(source = "department.id", target = "departmentId")
    @Mapping(source = "project.id", target = "projectId")
    @Mapping(source = "journalDate", target = "logDate")
    HandoverJournalResponse toResponse(HandoverJournal handoverJournal);

    /**
     * Mappe le DTO de réponse vers l'entité HandoverJournal en ignorant les champs spécifiés.
     */
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "workspace", ignore = true)
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "project", ignore = true)
    @Mapping(source = "logDate", target = "journalDate")
    HandoverJournal toEntity(HandoverJournalResponse handoverJournalResponse);
}