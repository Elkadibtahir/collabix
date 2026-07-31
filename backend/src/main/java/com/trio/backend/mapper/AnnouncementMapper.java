package com.trio.backend.mapper;

import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.announcement.AnnouncementResponse;
import com.trio.backend.dto.announcement.CreateAnnouncementRequest;
import com.trio.backend.dto.announcement.UpdateAnnouncementRequest;
import com.trio.backend.entity.Announcement;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(config = MapStructConfig.class)
public interface AnnouncementMapper {

    @Mapping(target = "workspace", ignore = true)
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "team", ignore = true)
    @Mapping(target = "project", ignore = true)
    @Mapping(target = "pinned", source = "pinned")
    @Mapping(target = "status", ignore = true)
    Announcement toEntity(CreateAnnouncementRequest request);

    @Mapping(target = "workspaceId", source = "workspace.id")
    @Mapping(target = "departmentId", source = "department.id")
    @Mapping(target = "teamId", source = "team.id")
    @Mapping(target = "projectId", source = "project.id")
    AnnouncementResponse toResponse(Announcement announcement);

    @Mapping(target = "workspace", ignore = true)
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "team", ignore = true)
    @Mapping(target = "project", ignore = true)
    @Mapping(target = "pinned", source = "isPinned")
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateAnnouncement(UpdateAnnouncementRequest request, @MappingTarget Announcement announcement);
}
