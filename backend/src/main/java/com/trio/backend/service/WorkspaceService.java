package com.trio.backend.service;

import com.trio.backend.dto.workspace.CreateWorkspaceRequest;
import com.trio.backend.dto.workspace.UpdateWorkspaceRequest;
import com.trio.backend.dto.workspace.WorkspaceResponse;
import com.trio.backend.dto.workspace.WorkspaceSummaryResponse;

import java.util.List;
import java.util.UUID;

/**
 * Service mÃƒÂ©tier pour management of the Workspaces.
 *
 * Cette interface centralise alle la logical mÃƒÂ©tier liÃƒÂ©e aux Workspaces,
 * qui constituent le cÃ…â€œur functionnel de la plateforme Collabix.
 *
 * ResponsabilitÃƒÂ©s :
 * - CrÃƒÂ©er a new Workspace and initialize le propriÃƒÂ©taire comme first member.
 * - Modify les information of a workspace (name, description).
 * - Delete (soft delete) un Workspace et alles its resources associÃƒÂ©es.
 * - RÃƒÂ©cupÃƒÂ©rer un Workspace spÃƒÂ©cifique avec vÃƒÂ©rification d'accÃƒÂ¨s.
 * - RÃƒÂ©cupÃƒÂ©rer the list of the Workspaces of a user.
 * - Validr les rÃƒÂ¨gles mÃƒÂ©tier (unicitÃƒÂ© du name, permissions, etc.).
 * - GÃƒÂ©rer the statistics (namebre de members, ÃƒÂ©quipes, etc.).
 *
 * Un Workspace reprÃƒÂ©sente the context de travail dans lequel all
 * collaborations s'perform. All futurs modules (ÃƒÂ©quipes, tÃƒÂ¢ches,
 * documents, notifications, etc.) seront rattachÃƒÂ©s ÃƒÂ  un Workspace.
 *
 * HiÃƒÂ©rarchie mÃƒÂ©tier :
 * Workspace
 *   Ã¢â€Å“Ã¢â€â‚¬ WorkspaceMember
 *   Ã¢â€â€š  Ã¢â€â€Ã¢â€â‚¬ User
 *   Ã¢â€Å“Ã¢â€â‚¬ Team
 *   Ã¢â€â€š  Ã¢â€â€Ã¢â€â‚¬ TeamMember
 *   Ã¢â€â€š     Ã¢â€â€Ã¢â€â‚¬ User
 *   Ã¢â€Å“Ã¢â€â‚¬ Tasks
 *   Ã¢â€Å“Ã¢â€â‚¬ Documents
 *   Ã¢â€Å“Ã¢â€â‚¬ Notifications
 *   Ã¢â€â€Ã¢â€â‚¬ Activities
 */
public interface WorkspaceService {

    /**
     * Creates a nouveau Workspace.
     *
     * Le Workspace est crÃƒÂ©ÃƒÂ© avec the status ACTIVE et le propriÃƒÂ©taire est
     * automaticment ajoutÃƒÂ© en tant que first member of the workspace avec
     * le rÃƒÂ´le OWNER. Un Workspace est immutable une fois crÃƒÂ©ÃƒÂ© (le propriÃƒÂ©taire
     * et the date de crÃƒÂ©ation cannot pas ÃƒÂªtre modifiÃƒÂ©s).
     *
     * RÃƒÂ¨gles mÃƒÂ©tier :
     * - The name of the workspace doit ÃƒÂªtre unique pour ce propriÃƒÂ©taire.
     * - The name est required et limitÃƒÂ© ÃƒÂ  150 caractÃƒÂ¨res.
     * - La description est optional et limitÃƒÂ©e ÃƒÂ  500 caractÃƒÂ¨res.
     * - L'user authentifiÃƒÂ© devient propriÃƒÂ©taire of the workspace crÃƒÂ©ÃƒÂ©.
     *
     * @param request les donnÃƒÂ©es de crÃƒÂ©ation of the workspace
     * @return la rÃƒÂ©ponse complÃƒÂ¨te of the workspace crÃƒÂ©ÃƒÂ©
     * @throws ConflictException si un Workspace avec le mÃƒÂªme name existe dÃƒÂ©jÃƒÂ  pour ce propriÃƒÂ©taire
     * @throws BadRequestException si les donnÃƒÂ©es de la requÃƒÂªte sont invalid
     */
    WorkspaceResponse create(CreateWorkspaceRequest request);

    /**
     * Met ÃƒÂ  jour les information of a workspace.
     *
     * Seuls the name et la description peuvent ÃƒÂªtre modifiÃƒÂ©s. The fields
     * immutables (propriÃƒÂ©taire, status, members, ÃƒÂ©quipes, timestamps)
     * cannot pas ÃƒÂªtre modifiÃƒÂ©s via cette mÃƒÂ©thode.
     *
     * RÃƒÂ¨gles mÃƒÂ©tier :
     * - L'user authentifiÃƒÂ© doit ÃƒÂªtre propriÃƒÂ©taire or administrator of the workspace.
     * - The name updated doit rester unique pour ce propriÃƒÂ©taire.
     * - The fields null are not appliquÃƒÂ©s (partial update).
     *
     * @param workspaceId the ID of the Workspace ÃƒÂ  mettre ÃƒÂ  jour
     * @param request les donnÃƒÂ©es de updated
     * @return la rÃƒÂ©ponse complÃƒÂ¨te of the workspace modifiÃƒÂ©
     * @throws ResourceNotFoundException si le Workspace does not exist
     * @throws ForbiddenException si the user n'a pas the permission
     * @throws ConflictException si the name proposÃƒÂ© existe dÃƒÂ©jÃƒÂ  pour ce propriÃƒÂ©taire
     * @throws BadRequestException si les donnÃƒÂ©es sont invalid
     */
    WorkspaceResponse update(UUID workspaceId, UpdateWorkspaceRequest request);

    /**
     * RÃƒÂ©cupÃƒÂ¨re un Workspace par its ID.
     *
     * Returns the information complÃƒÂ¨tes of the workspace avec the statistics
     * (namebre de members, namebre d'ÃƒÂ©quipes). L'user authentifiÃƒÂ© doit
     * ÃƒÂªtre member of the workspace pour pouvoir y accÃƒÂ©der.
     *
     * @param workspaceId the ID of the Workspace
     * @return la rÃƒÂ©ponse complÃƒÂ¨te of the workspace
     * @throws ResourceNotFoundException si le Workspace does not exist
     * @throws ForbiddenException si the user is not member of the workspace
     */
    WorkspaceResponse getById(UUID workspaceId);

    /**
     * RÃƒÂ©cupÃƒÂ¨re the list de all Workspaces de the user authentifiÃƒÂ©.
     *
     * Returns uniquement les Workspaces pour lesquels the user est
     * member active (status = ACTIVE). Les Workspaces sont sortÃƒÂ©s by date
     * de crÃƒÂ©ation dÃƒÂ©ascending (plus rÃƒÂ©cents d'abord).
     *
     * RÃƒÂ¨gles mÃƒÂ©tier :
     * - Seuls les Workspaces avec status ACTIVE sont retournÃƒÂ©s.
     * - Seuls the members avec status ACTIVE sont considÃƒÂ©rÃƒÂ©s.
     * - Les Workspaces archivÃƒÂ©s are not retournÃƒÂ©s.
     *
     * @return list of the Workspaces de the user
     */
    List<WorkspaceSummaryResponse> listByCurrentUser(String search, String sort, String order);

    default List<WorkspaceSummaryResponse> listByCurrentUser() {
        return listByCurrentUser(null, "createdAt", "desc");
    }

    /**
     * RÃƒÂ©cupÃƒÂ¨re the list allÃƒÂ©gÃƒÂ©e de all Workspaces de the user authentifiÃƒÂ©.
     *
     * Similaire ÃƒÂ  listByCurrentUser(), mais Returns des rÃƒÂ©ponses rÃƒÂ©sumÃƒÂ©es
     * (WorkspaceSummaryResponse) avec moins de fields, optimisÃƒÂ© pour les
     * vues listÃƒÂ©es ou les dashboards.
     *
     * @return list rÃƒÂ©sumÃƒÂ©e of the Workspaces de the user
     */
    List<WorkspaceSummaryResponse> listSummaryByCurrentUser();

    /**
     * Supprime (soft delete) un Workspace.
     *
     * Le Workspace is not physiquement deleted, its status passe de ACTIVE
     * ÃƒÂ  ARCHIVED. All ressources associÃƒÂ©es (members, ÃƒÂ©quipes, tÃƒÂ¢ches, etc.)
     * restent intactes mais inaccessible through the requÃƒÂªtes normal.
     *
     * RÃƒÂ¨gles mÃƒÂ©tier :
     * - Seul le propriÃƒÂ©taire ou un administrator peut supprimer un Workspace.
     * - La deletion est permanent (pas de restauration possible dans cette version).
     * - Un Workspace dÃƒÂ©jÃƒÂ  archivÃƒÂ© peut ÃƒÂªtre deleted ÃƒÂ  nouveau (idempotent).
     * - Les donnÃƒÂ©es are not dÃƒÂ©finitivement deleteds (soft delete).
     *
     * @param workspaceId the ID of the Workspace ÃƒÂ  supprimer
     * @throws ResourceNotFoundException si le Workspace does not exist
     * @throws ForbiddenException si the user n'a pas the permission de deletion
     */
    void delete(UUID workspaceId);

    void archive(UUID workspaceId);

    void restore(UUID workspaceId);

    List<WorkspaceSummaryResponse> listArchived();

    /**
     * VÃƒÂ©rifie si the user authentifiÃƒÂ© is a member of a workspace.
     *
     * Returns true si the user is a member active of the workspace
     * (indÃƒÂ©pendamment de son rÃƒÂ´le).
     *
     * @param workspaceId the ID of the Workspace
     * @return true si the user is a member, false sinon
     */
    boolean isMember(UUID workspaceId);

    /**
     * VÃƒÂ©rifie si the user authentifiÃƒÂ© est propriÃƒÂ©taire of a workspace.
     *
     * @param workspaceId the ID of the Workspace
     * @return true si the user est propriÃƒÂ©taire, false sinon
     */
    boolean isOwner(UUID workspaceId);

    /**
     * VÃƒÂ©rifie si the user authentifiÃƒÂ© est administrator of a workspace.
     *
     * Un administrator est un user avec le rÃƒÂ´le ADMIN ou OWNER.
     *
     * @param workspaceId the ID of the Workspace
     * @return true si the user est administrator, false sinon
     */
    boolean isAdmin(UUID workspaceId);

}
