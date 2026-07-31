package com.trio.backend.repository;

import com.trio.backend.entity.ChecklistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, UUID> {

    List<ChecklistItem> findAllByChecklist_IdAndStatusOrderBySortOrderAsc(UUID checklistId, String status);

    Optional<ChecklistItem> findByIdAndChecklist_Id(UUID id, UUID checklistId);

    long countByChecklist_Id(UUID checklistId);

    long countByChecklist_IdAndCompletedTrue(UUID checklistId);
}
