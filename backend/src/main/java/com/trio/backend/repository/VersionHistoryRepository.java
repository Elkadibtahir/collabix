package com.trio.backend.repository;

import com.trio.backend.entity.VersionHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VersionHistoryRepository extends JpaRepository<VersionHistory, UUID> {

    List<VersionHistory> findByResourceTypeAndResourceIdOrderByVersionNumberDesc(
            String resourceType, UUID resourceId);

    Page<VersionHistory> findByWorkspaceId(UUID workspaceId, Pageable pageable);
}
