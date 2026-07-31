package com.trio.backend.repository;

import com.trio.backend.entity.RecruiterNote;
import com.trio.backend.enums.NoteCategory;
import com.trio.backend.enums.NotePriority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.UUID;

public interface RecruiterNoteRepository extends JpaRepository<RecruiterNote, UUID>,
        JpaSpecificationExecutor<RecruiterNote> {

    Page<RecruiterNote> findAllByCandidate_IdOrderByCreatedAtDesc(UUID candidateId, Pageable pageable);

    long countByCandidate_Id(UUID candidateId);

    long countByCandidate_IdAndCategory(UUID candidateId, NoteCategory category);

    @Query("SELECT COUNT(n) FROM RecruiterNote n WHERE n.candidate.department.id = :departmentId")
    long countByDepartmentId(@Param("departmentId") UUID departmentId);

    @Query("SELECT COUNT(n) FROM RecruiterNote n WHERE n.candidate.department.id = :departmentId AND n.createdAt >= :since")
    long countByDepartmentIdAndCreatedAtAfter(@Param("departmentId") UUID departmentId, @Param("since") Instant since);

    @Query("SELECT n.category, COUNT(n) FROM RecruiterNote n WHERE n.candidate.department.id = :departmentId GROUP BY n.category")
    java.util.List<Object[]> countByCategoryGrouped(@Param("departmentId") UUID departmentId);

    @Query("SELECT n.priority, COUNT(n) FROM RecruiterNote n WHERE n.candidate.department.id = :departmentId GROUP BY n.priority")
    java.util.List<Object[]> countByPriorityGrouped(@Param("departmentId") UUID departmentId);
}
