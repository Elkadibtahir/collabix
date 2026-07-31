package com.trio.backend.repository;

import com.trio.backend.entity.Checklist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChecklistRepository extends JpaRepository<Checklist, UUID> {

    List<Checklist> findAllByTask_IdAndStatus(UUID taskId, String status);

    Page<Checklist> findAllByTask_IdAndStatus(UUID taskId, String status, Pageable pageable);

    Optional<Checklist> findByIdAndTask_Id(UUID id, UUID taskId);

    long countByTask_Id(UUID taskId);
}
