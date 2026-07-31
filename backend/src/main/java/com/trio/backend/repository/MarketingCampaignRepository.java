package com.trio.backend.repository;

import com.trio.backend.entity.MarketingCampaign;
import com.trio.backend.enums.CampaignStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MarketingCampaignRepository extends JpaRepository<MarketingCampaign, UUID>,
        JpaSpecificationExecutor<MarketingCampaign> {

    Optional<MarketingCampaign> findByIdAndDepartment_Id(UUID id, UUID departmentId);

    boolean existsByProject_IdAndName(UUID projectId, String name);

    long countByDepartment_Id(UUID departmentId);

    long countByDepartment_IdAndStatus(UUID departmentId, CampaignStatus status);

    long countByProject_Id(UUID projectId);

    @Query("SELECT c.status, COUNT(c) FROM MarketingCampaign c WHERE c.department.id = :departmentId GROUP BY c.status")
    List<Object[]> countByStatusGrouped(@Param("departmentId") UUID departmentId);

    @Query("SELECT c.project.id, c.project.name, COUNT(c) FROM MarketingCampaign c WHERE c.department.id = :departmentId GROUP BY c.project.id, c.project.name")
    List<Object[]> countByProjectGrouped(@Param("departmentId") UUID departmentId);

    @Query("SELECT c.team.name, COUNT(c) FROM MarketingCampaign c WHERE c.department.id = :departmentId AND c.team IS NOT NULL GROUP BY c.team.name")
    List<Object[]> countByTeamGrouped(@Param("departmentId") UUID departmentId);

    @Query("SELECT c FROM MarketingCampaign c WHERE c.department.id = :departmentId AND c.status = 'COMPLETED' AND c.startDate IS NOT NULL AND c.completedAt IS NOT NULL")
    List<MarketingCampaign> findCompletedWithDates(@Param("departmentId") UUID departmentId);

    @Query("SELECT c FROM MarketingCampaign c WHERE c.department.id = :departmentId AND c.completionPercentage IS NOT NULL")
    List<MarketingCampaign> findWithcompletionPercentage(@Param("departmentId") UUID departmentId);
}
