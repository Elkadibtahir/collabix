package com.trio.backend.repository;

import com.trio.backend.entity.Workspace;
import com.trio.backend.enums.WorkspaceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface WorkspaceRepository extends JpaRepository<Workspace, UUID> {

    /**
     * Resorteves a workspace by ID si the owner correspondss.
     *
     * @param id      the ID of the workspace
     * @param ownerId the ID of the owner
     * @return Optional containing the workspace si found et belong au owner
     */
    Optional<Workspace> findByIdAndOwner_Id(UUID id, UUID ownerId);

    /**
     * Resorteves all les workspaces of an owner.
     *
     * @param ownerId the ID of the owner
     * @return list of workspaces of the owner
     */
    List<Workspace> findAllByOwner_Id(UUID ownerId);

    /**
     * Checks existence of a workspace par name pour un owner.
     *
     * @param ownerId the ID of the owner
     * @param name    the name of the workspace
     * @return true si the workspace existe, false sinon
     */
    boolean existsByOwner_IdAndName(UUID ownerId, String name);

    /**
     * Resorteves all les workspaces avec un status specific.
     *
     * @param status the status of the workspace
     * @return list of workspaces avec the status specified
     */
    List<Workspace> findAllByStatus(WorkspaceStatus status);

    /**
     * Resorteves all les workspaces actives.
     *
     * @return list of workspaces actives
     */
    @Query("SELECT w FROM Workspace w WHERE w.status = 'ACTIVE' ORDER BY w.createdAt DESC")
    List<Workspace> findAllActive();

    /**
     * Resorteves the workspaces actives of an owner.
     *
     * @param ownerId the ID of the owner
     * @param status  the status of the workspace
     * @return list of workspaces actives of the owner
     */
    List<Workspace> findAllByOwner_IdAndStatus(UUID ownerId, WorkspaceStatus status);

    /**
     * Checks existence of a workspace by ID.
     *
     * @param id the ID of the workspace
     * @return true si the workspace existe, false sinon
     */
    boolean existsById(UUID id);

    /**
     * Resorteves the namebre de workspaces of an owner.
     *
     * @param ownerId the ID of the owner
     * @return the namebre de workspaces
     */
    long countByOwner_Id(UUID ownerId);

    /**
     * Resorteves the namebre de workspaces actives.
     *
     * @return the namebre de workspaces actives
     */
    long countByStatus(WorkspaceStatus status);

    /**
     * Recherche les workspaces par name containing (recherche partialle).
     *
     * @param name le texte de recherche
     * @return list of workspaces correspondssings
     */
    @Query("SELECT w FROM Workspace w WHERE LOWER(w.name) LIKE LOWER(CONCAT('%', :name, '%')) ORDER BY w.name ASC")
    List<Workspace> searchByName(@Param("name") String name);

    /**
     * Recherche les workspaces of an owner par name containing.
     *
     * @param ownerId the ID of the owner
     * @param name    le texte de recherche
     * @return list of workspaces of the owner correspondssings
     */
    @Query("SELECT w FROM Workspace w WHERE w.owner.id = :ownerId " +
            "AND LOWER(w.name) LIKE LOWER(CONCAT('%', :name, '%')) ORDER BY w.name ASC")
    List<Workspace> searchByOwnerIdAndName(
            @Param("ownerId") UUID ownerId,
            @Param("name") String name
    );

    /**
     * Resorteves the IDs des workspaces of an owner.
     *
     * @param ownerId the ID of the owner
     * @return Set des IDs des workspaces
     */
    @Query("SELECT w.id FROM Workspace w WHERE w.owner.id = :ownerId")
    Set<UUID> findIdsByOwnerId(@Param("ownerId") UUID ownerId);
}