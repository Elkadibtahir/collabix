package com.trio.backend.repository;

import com.trio.backend.entity.AIModel;
import com.trio.backend.enums.ModelStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AIModelRepository extends JpaRepository<AIModel, UUID>, JpaSpecificationExecutor<AIModel> {

    List<AIModel> findByDepartmentId(UUID departmentId);

    List<AIModel> findByProjectId(UUID projectId);

    Optional<AIModel> findByIdAndDepartmentId(UUID id, UUID departmentId);

    boolean existsByIdAndDepartmentId(UUID id, UUID departmentId);

    long countByDepartmentIdAndStatus(UUID departmentId, ModelStatus status);

    long countByProjectIdAndStatus(UUID projectId, ModelStatus status);

    long countByStatus(ModelStatus status);

    @Query("SELECT COUNT(m) FROM AIModel m WHERE m.department.id = :departmentId AND m.status NOT IN :excludeddedStatuses")
    long countByDepartmentIdAndStatusNotIn(@Param("departmentId") UUID departmentId,
                                           @Param("excludeddedStatuses") List<ModelStatus> excludeddedStatuses);

    @Query("SELECT AVG(m.accuracy) FROM AIModel m WHERE m.department.id = :departmentId AND m.accuracy IS NOT NULL")
    Double averageAccuracyByDepartmentId(@Param("departmentId") UUID departmentId);

    @Query("SELECT m.status, COUNT(m) FROM AIModel m WHERE m.department.id = :departmentId GROUP BY m.status")
    List<Object[]> countByStatusGrouped(@Param("departmentId") UUID departmentId);

    @Query("SELECT m.project.name, COUNT(m) FROM AIModel m WHERE m.department.id = :departmentId GROUP BY m.project.name")
    List<Object[]> countByProjectGrouped(@Param("departmentId") UUID departmentId);

    @Query("SELECT m.team.name, COUNT(m) FROM AIModel m WHERE m.department.id = :departmentId AND m.team IS NOT NULL GROUP BY m.team.name")
    List<Object[]> countByTeamGrouped(@Param("departmentId") UUID departmentId);
}
