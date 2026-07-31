package com.trio.backend.service;

import com.trio.backend.dto.announcement.AnnouncementResponse;
import com.trio.backend.dto.announcement.CreateAnnouncementRequest;
import com.trio.backend.dto.announcement.UpdateAnnouncementRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface AnnouncementService {

    AnnouncementResponse create(UUID workspaceId, CreateAnnouncementRequest request);

    AnnouncementResponse getById(UUID workspaceId, UUID announcementId);

    Page<AnnouncementResponse> listWorkspaceAnnouncements(UUID workspaceId, Pageable pageable);

    Page<AnnouncementResponse> listDepartmentAnnouncements(UUID workspaceId, UUID departmentId, Pageable pageable);

    Page<AnnouncementResponse> listTeamAnnouncements(UUID workspaceId, UUID teamId, Pageable pageable);

    Page<AnnouncementResponse> listProjectAnnouncements(UUID workspaceId, UUID projectId, Pageable pageable);

    AnnouncementResponse update(UUID workspaceId, UUID announcementId, UpdateAnnouncementRequest request);

    void delete(UUID workspaceId, UUID announcementId);
}
