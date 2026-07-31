package com.trio.backend.repository;

import com.trio.backend.entity.Department;
import com.trio.backend.enums.WorkspaceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DepartmentRepository extends JpaRepository<Department, UUID> {

    /**
     * Resorteves all les departments of a workspace.
     *
     * @param workspaceId the ID of the workspace
     * @return list of departments of the workspace
     */
    List<Department> findAllByWorkspace_Id(UUID workspaceId);

    /**
     * Resorteves all les departments actives of a workspace.
     *
     * @param workspaceId the ID of the workspace
     * @param status the status of the department
     * @return list of departments correspondssing au status
     */
    List<Department> findAllByWorkspace_IdAndStatus(UUID workspaceId, WorkspaceStatus status);

    /**
     * Resorteves the departments of a workspace with pagination.
     *
     * @param workspaceId the ID of the workspace
     * @param status the status of the department
     * @param pageable pagination information
     * @return page de departments
     */
    org.springframework.data.domain.Page<Department> findAllByWorkspace_IdAndStatus(
            UUID workspaceId,
            WorkspaceStatus status,
            org.springframework.data.domain.Pageable pageable
    );


    /**
     * Resorteves a department by ID en verifying qu'il belong to the workspace.
     *
     * @param departmentId the ID of the department
     * @param workspaceId the ID of the workspace
     * @return Optional containing the department si found
     */
    Optional<Department> findByIdAndWorkspace_Id(UUID departmentId, UUID workspaceId);

    /**
     * Checks existence of a department par name in a workspace.
     *
     * @param workspaceId the ID of the workspace
     * @param name the name of the department
     * @return true si l'existence est confirmede, false sinon
     */
    boolean existsByWorkspace_IdAndName(UUID workspaceId, String name);

    /**
     * Resorteves the namebre de departments of a workspace.
     *
     * @param workspaceId the ID of the workspace
     * @return the namebre de departments
     */
    long countByWorkspace_Id(UUID workspaceId);

    /**
     * Resorteves the namebre de departments actives of a workspace.
     *
     * @param workspaceId the ID of the workspace
     * @param status the status of the department
     * @return the namebre de departments actives
     */
    long countByWorkspace_IdAndStatus(UUID workspaceId, WorkspaceStatus status);

    /**
     * Recherche les departments of a workspace par name (contains).
     *
     * @param workspaceId the ID of the workspace
     * @param name le texte de recherche
     * @return list of departments correspondssings
     */
    @Query("SELECT d FROM Department d " +
            "WHERE d.workspace.id = :workspaceId " +
            "AND LOWER(d.name) LIKE LOWER(CONCAT('%', :name, '%')) " +
            "ORDER BY d.name ASC")
    List<Department> searchByWorkspaceIdAndName(@Param("workspaceId") UUID workspaceId,
                                                   @Param("name") String name);
}

