package com.trio.backend.repository;

import com.trio.backend.entity.User;
import com.trio.backend.entity.WorkspaceMember;
import com.trio.backend.entity.ids.WorkspaceMemberId;
import com.trio.backend.enums.UserStatus;
import com.trio.backend.enums.WorkspaceMemberStatus;
import com.trio.backend.enums.WorkspaceRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, WorkspaceMemberId> {

    /**
     * RÃƒÂ©cupÃƒÂ¨re all members of a workspace.
     *
     * @param workspaceId the ID of the workspace
     * @return list de all members
     */
    List<WorkspaceMember> findAllByWorkspace_Id(UUID workspaceId);

    /**
     * RÃƒÂ©cupÃƒÂ¨re all workspaces of a user.
     *
     * @param userId the ID of the user
     * @return list of workspaces de the user
     */
    List<WorkspaceMember> findAllByUser_Id(UUID userId);

    /**
     * RÃƒÂ©cupÃƒÂ¨re all members actives of a workspace.
     *
     * @param workspaceId the ID of the workspace
     * @param status      the status of the member
     * @return list of members avec the status spÃƒÂ©cifiÃƒÂ©
     */
    List<WorkspaceMember> findAllByWorkspace_IdAndStatus(UUID workspaceId, WorkspaceMemberStatus status);

    /**
     * RÃƒÂ©cupÃƒÂ¨re un member of a workspace par ses IDs.
     *
     * @param workspaceId the ID of the workspace
     * @param userId      the ID of the user
     * @return Optional containing the member si found
     */
    Optional<WorkspaceMember> findByWorkspaceMemberId_WorkspaceIdAndWorkspaceMemberId_UserId(
            UUID workspaceId,
            UUID userId
    );

    /**
     * VÃƒÂ©rifie si un user is a member of a workspace.
     *
     * @param workspaceId the ID of the workspace
     * @param userId      the ID of the user
     * @return true si the user is a member, false sinon
     */
    boolean existsByWorkspaceMemberId_WorkspaceIdAndWorkspaceMemberId_UserId(UUID workspaceId, UUID userId);

    /**
     * RÃƒÂ©cupÃƒÂ¨re all members of a workspace avec un rÃƒÂ´le spÃƒÂ©cifique.
     *
     * @param workspaceId the ID of the workspace
     * @param role        le rÃƒÂ´le of the member
     * @return list of members avec le rÃƒÂ´le spÃƒÂ©cifiÃƒÂ©
     */
    List<WorkspaceMember> findAllByWorkspace_IdAndRole(UUID workspaceId, WorkspaceRole role);

    /**
     * RÃƒÂ©cupÃƒÂ¨re the members of a workspace pour une list d'IDs users.
     *
     * <p>UtilisÃƒÂ© par le Team Dashboard pour rÃƒÂ©soudre les rÃƒÂ´les workspace
     * of members of a ÃƒÂ©quipe sans N+1.</p>
     *
     * @param workspaceId the ID of the workspace
     * @param userIds     the list des IDs users
     * @return list of members of the workspace correspondssing aux users
     */
    @Query("SELECT wm FROM WorkspaceMember wm " +
            "WHERE wm.workspace.id = :workspaceId " +
            "AND wm.user.id IN :userIds")
    List<WorkspaceMember> findByWorkspaceIdAndUserIds(
            @Param("workspaceId") UUID workspaceId,
            @Param("userIds") List<UUID> userIds
    );



    /**
     * RÃƒÂ©cupÃƒÂ¨re the namebre de members actives in a workspace.
     *
     * @param workspaceId the ID of the workspace
     * @param status      the status of the member
     * @return the namebre de members
     */
    long countByWorkspace_IdAndStatus(UUID workspaceId, WorkspaceMemberStatus status);

    @Query("SELECT wm.workspace.id, COUNT(wm) FROM WorkspaceMember wm WHERE wm.workspace.id IN :workspaceIds AND wm.status = :status GROUP BY wm.workspace.id")
    List<Object[]> countByWorkspaceIdsAndStatus(@Param("workspaceIds") List<UUID> workspaceIds, @Param("status") WorkspaceMemberStatus status);

    /**
     * VÃƒÂ©rifie si un user est propriÃƒÂ©taire of a workspace.
     *
     * @param workspaceId the ID of the workspace
     * @param userId      the ID of the user
     * @return true si the user est propriÃƒÂ©taire, false sinon
     */
    @Query("SELECT CASE WHEN COUNT(wm) > 0 THEN true ELSE false END " +
            "FROM WorkspaceMember wm " +
            "WHERE wm.workspace.id = :workspaceId AND wm.user.id = :userId AND wm.role = :role")
    boolean existsWithRole(
            @Param("workspaceId") UUID workspaceId,
            @Param("userId") UUID userId,
            @Param("role") WorkspaceRole role
    );

    /**
     * RÃƒÂ©cupÃƒÂ¨re all workspaces actives of a user.
     *
     * @param userId the ID of the user
     * @param status the status of the member
     * @return list of workspaces actives de the user
     */
    @Query("SELECT wm FROM WorkspaceMember wm " +
            "WHERE wm.user.id = :userId AND wm.status = :status " +
            "ORDER BY wm.joinedAt DESC")
    List<WorkspaceMember> findActiveWorkspacesByUserId(
            @Param("userId") UUID userId,
            @Param("status") WorkspaceMemberStatus status
    );

    /**
     * RÃƒÂ©cupÃƒÂ¨re the namebre de members in a workspace.
     *
     * @param workspaceId the ID of the workspace
     * @return the namebre de members
     */
    long countByWorkspace_Id(UUID workspaceId);

    /**
     * Counts the members of a workspace dont the user (User) a the status spÃƒÂ©cifiÃƒÂ©.
     *
     * <p>Allows to compter les users pending of activation (PENDING_ACTIVATION)
     * ou verrouillÃƒÂ©s (LOCKED) au sein of a workspace.</p>
     *
     * @param workspaceId the ID of the workspace
     * @param userStatus the status de the user ÃƒÂ  compter (ex: PENDING_ACTIVATION, LOCKED)
     * @return the namebre de members correspondssing
     */
    @Query("SELECT COUNT(wm) FROM WorkspaceMember wm " +
            "WHERE wm.workspace.id = :workspaceId " +
            "AND wm.user.status = :userStatus")
    long countByWorkspaceIdAndUserStatus(
            @Param("workspaceId") UUID workspaceId,
            @Param("userStatus") UserStatus userStatus
    );

    /**
     * RÃƒÂ©cupÃƒÂ¨re all members invitÃƒÂ©s of a workspace.
     *
     * @param workspaceId the ID of the workspace
     * @return list of members invitÃƒÂ©s
     */
    @Query("SELECT wm FROM WorkspaceMember wm " +
            "WHERE wm.workspace.id = :workspaceId AND wm.status = 'INVITED'")
    List<WorkspaceMember> findInvitedMembers(@Param("workspaceId") UUID workspaceId);

    /**
     * RÃƒÂ©cupÃƒÂ¨re les IDs des workspaces of a user.
     *
     * @param userId the ID of the user
     * @return Set des IDs des workspaces
     */
    @Query("SELECT wm.workspace.id FROM WorkspaceMember wm " +
            "WHERE wm.user.id = :userId AND wm.status = 'ACTIVE'")
    Set<UUID> findActiveWorkspaceIdsByUserId(@Param("userId") UUID userId);
}
