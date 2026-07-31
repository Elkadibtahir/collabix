package com.trio.backend.repository;

import com.trio.backend.entity.Team;
import com.trio.backend.enums.WorkspaceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeamRepository extends JpaRepository<Team, UUID> {

    /**
     * Verifies si une Team active existe pour un Department.
     *
     * @param departmentId the ID of the department
     * @param status the status de la team (ex: ACTIVE)
     * @return true si au moins une Team existe avec ce status, false sinon
     */
    boolean existsByDepartment_IdAndStatus(UUID departmentId, WorkspaceStatus status);


    /**
     * Resorteves all the teams of a workspace.

     *
     * @param workspaceId the ID of the workspace
     * @return list of teams of the workspace
     */
    @Query("select t from Team t join t.department d where d.workspace.id = :workspaceId")
    List<Team> findAllByWorkspace_Id(@Param("workspaceId") UUID workspaceId);

    /**
     * Resorteves all the teams actives of a workspace.
     *
     * @param workspaceId the ID of the workspace
     * @param status      the status de the team
     * @return list of teams actives
     */
    @Query("select t from Team t join t.department d where d.workspace.id = :workspaceId and t.status = :status")
    List<Team> findAllByWorkspace_IdAndStatus(@Param("workspaceId") UUID workspaceId, @Param("status") WorkspaceStatus status);

    /**
     * Resorteves all les teams actives d'un department in a workspace.
     *
     * @param workspaceId the ID of the workspace
     * @param departmentId the ID of the department
     * @param status the status de the team
     * @return list of teams filtered par department
     */
    @Query("select t from Team t join t.department d where d.workspace.id = :workspaceId and d.id = :departmentId and t.status = :status")
    List<Team> findAllByWorkspace_IdAndDepartment_IdAndStatus(
            @Param("workspaceId") UUID workspaceId,
            @Param("departmentId") UUID departmentId,
            @Param("status") WorkspaceStatus status
    );

    /**
     * Checks existence of a team par son scope department in a workspace.
     *
     * @param workspaceId the ID of the workspace
     * @param departmentId the ID of the department
     * @param name the name de la team (normalized)
     * @return true si une team existe, false sinon
     */
    @Query("select case when count(t) > 0 then true else false end from Team t join t.department d where d.workspace.id = :workspaceId and d.id = :departmentId and lower(t.name) = lower(:name)")
    boolean existsByWorkspace_IdAndDepartment_IdAndName(
            @Param("workspaceId") UUID workspaceId,
            @Param("departmentId") UUID departmentId,
            @Param("name") String name
    );


    /**
     * Resorteves ae team by ID et verifies that it belong to the workspace.
     *
     * @param teamId      the ID of the team
     * @param workspaceId the ID of the workspace
     * @return Optional containing the team si elle existe
     */
    @Query("select t from Team t join t.department d where t.id = :teamId and d.workspace.id = :workspaceId")
    Optional<Team> findByIdAndWorkspace_Id(@Param("teamId") UUID teamId, @Param("workspaceId") UUID workspaceId);

    /**
     * Checks existence of a team par name in a workspace.
     *
     * @param workspaceId the ID of the workspace
     * @param name        the name de the team
     * @return true si the team existe, false sinon
     */
    @Query("select case when count(t) > 0 then true else false end from Team t join t.department d where d.workspace.id = :workspaceId and lower(t.name) = lower(:name)")
    boolean existsByWorkspace_IdAndName(@Param("workspaceId") UUID workspaceId, @Param("name") String name);

    /**
     * Checks existence of a team by ID et workspace.
     *
     * @param teamId      the ID of the team
     * @param workspaceId the ID of the workspace
     * @return true si the team existe, false sinon
     */
    @Query("select case when count(t) > 0 then true else false end from Team t join t.department d where t.id = :teamId and d.workspace.id = :workspaceId")
    boolean existsByIdAndWorkspace_Id(@Param("teamId") UUID teamId, @Param("workspaceId") UUID workspaceId);

    /**
     * Resorteves the namebre of teams in a workspace.
     *
     * @param workspaceId the ID of the workspace
     * @return the namebre of teams
     */
    @Query("select count(t) from Team t join t.department d where d.workspace.id = :workspaceId")
    long countByWorkspace_Id(@Param("workspaceId") UUID workspaceId);

    /**
     * Resorteves the namebre of teams actives in a workspace.
     *
     * @param workspaceId the ID of the workspace
     * @param status      the status de the team
     * @return the namebre of teams actives
     */
    @Query("select count(t) from Team t join t.department d where d.workspace.id = :workspaceId and t.status = :status")
    long countByWorkspace_IdAndStatus(@Param("workspaceId") UUID workspaceId, @Param("status") WorkspaceStatus status);

    @Query("SELECT t.department.workspace.id, COUNT(t) FROM Team t WHERE t.department.workspace.id IN :workspaceIds AND t.status = :status GROUP BY t.department.workspace.id")
    List<Object[]> countByWorkspaceIdsAndStatus(@Param("workspaceIds") List<UUID> workspaceIds, @Param("status") WorkspaceStatus status);

    // ==================== DASHBOARD-SPECIFIC QUERIES ====================

    /**
     * Counts the namebre of teams in a department avec un status donnÃ©.
     *
     * @param departmentId the ID of the department
     * @param status       the status de the team
     * @return the namebre of teams correspondssing
     */
    @Query("select count(t) from Team t where t.department.id = :departmentId and t.status = :status")
    long countByDepartment_IdAndStatus(@Param("departmentId") UUID departmentId, @Param("status") WorkspaceStatus status);

    @Query("select t from Team t where t.department.id = :departmentId and t.status = :status")
    List<Team> findAllByDepartment_IdAndStatus(@Param("departmentId") UUID departmentId, @Param("status") WorkspaceStatus status);

    Optional<Team> findByIdAndDepartment_Id(UUID id, UUID departmentId);
}

