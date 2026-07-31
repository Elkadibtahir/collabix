package com.trio.backend.service;

import com.trio.backend.dto.organisation.department.CreateDepartmentRequest;
import com.trio.backend.dto.organisation.department.DepartmentDetailsResponse;
import com.trio.backend.dto.organisation.department.DepartmentResponse;
import com.trio.backend.dto.organisation.department.DepartmentSummaryResponse;
import com.trio.backend.dto.organisation.department.UpdateDepartmentRequest;
import com.trio.backend.entity.Department;
import com.trio.backend.entity.User;
import com.trio.backend.entity.Workspace;
import com.trio.backend.entity.WorkspaceMember;

import com.trio.backend.enums.WorkspaceMemberStatus;
import com.trio.backend.enums.WorkspaceRole;
import com.trio.backend.enums.WorkspaceStatus;
import com.trio.backend.exception.BadRequestException;
import com.trio.backend.exception.ConflictException;
import com.trio.backend.exception.ForbiddenException;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.mapper.DepartmentMapper;
import com.trio.backend.repository.DepartmentRepository;
import com.trio.backend.repository.TeamRepository;
import com.trio.backend.repository.UserRepository;
import com.trio.backend.repository.WorkspaceMemberRepository;
import com.trio.backend.repository.WorkspaceRepository;

import com.trio.backend.security.user.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

/**
 * Implementation of the service management des Department.
 *
 * <p>Department est une ressource organizationnelle attachede ÃƒÂ  un {@link Workspace}.
 * Les operations respectsnt l'isolation multi-tenant through {@code workspaceId}.
 * </p>
 *
 * <p><strong>RÃƒÂ¨gles mÃƒÂ©tier validatedes :</strong></p>
 * <ul>
 *   <li>Creation : authorizede si the user est {@code WorkspaceMember.ACTIVE} in the workspace
 *       et has of a role {@code OWNER}/{@code ADMIN} (ou {@code SUPER_ADMIN}).</li>
 *   <li>Modification : authorizede si the user est {@code OWNER}/{@code ADMIN} (ou {@code SUPER_ADMIN}).</li>
 *   <li>Deletion : soft delete ; le Department passe ÃƒÂ  {@code ARCHIVED}.
 *       Interdite s'il still contains active teams (pour le MVP, verification sera faite
 *       par the method TeamRepository lorsque ce module sera branchÃƒÂ©).</li>
 *   <li>UnicitÃƒÂ© : {@code name} unique in a workspace, normalized (sortm + case-insensitive ÃƒÂ  la casse).</li>
 * </ul>
 *
 * @see DepartmentService
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final TeamRepository teamRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final DepartmentMapper departmentMapper;


    /**
     * Creates a Department in the workspace.
     *
     * @param workspaceId the ID of the workspace
     * @param request the request de creation
     * @return le Department created
     */
    @Override
    public DepartmentResponse create(UUID workspaceId, CreateDepartmentRequest request) {

        UUID userId = getAuthenticatedUserId();
        User actor = getAuthenticatedUser();
        assertActiveWorkspaceMember(workspaceId, userId);
        assertWorkspaceAdminOrOwner(workspaceId, userId);

        String normalizedName = normalizeName(request.getName());

        if (departmentRepository.existsByWorkspace_IdAndName(workspaceId, normalizedName)) {
            throw new ConflictException("Department with this name already exists in this workspace.");
        }

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found."));

        Department department = departmentMapper.toEntity(request);
        department.setWorkspace(workspace);
        department.setStatus(WorkspaceStatus.ACTIVE);

        Department saved = departmentRepository.save(department);

        DepartmentResponse response = departmentMapper.toResponse(saved);
        response.setTeamCount(teamRepository.countByDepartment_IdAndStatus(saved.getId(), WorkspaceStatus.ACTIVE));
        return response;
    }

    /**
     * Resorteves a Department by ID.
     *
     * @param workspaceId the ID of the workspace
     * @param departmentId l'identifiant du department
     * @return le Department
     */
    @Override
    @Transactional(readOnly = true)
    public DepartmentResponse getById(UUID workspaceId, UUID departmentId) {

        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());

        Department department = departmentRepository.findByIdAndWorkspace_Id(departmentId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found."));

        if (department.getStatus() != WorkspaceStatus.ACTIVE) {
            throw new ResourceNotFoundException("Department not found.");
        }

        DepartmentResponse response = departmentMapper.toResponse(department);
        response.setTeamCount(teamRepository.countByDepartment_IdAndStatus(departmentId, WorkspaceStatus.ACTIVE));
        return response;
    }

    /**
     * Liste les Departments of a workspace.
     *
     * @param workspaceId the ID of the workspace
     * @return the list summarye
     */
    @Override
    @Transactional(readOnly = true)
    public List<DepartmentSummaryResponse> listByWorkspace(UUID workspaceId) {

        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());

        return departmentRepository.findAllByWorkspace_IdAndStatus(workspaceId, WorkspaceStatus.ACTIVE)
                .stream()
                .map(d -> {
                    DepartmentSummaryResponse r = departmentMapper.toSummary(d);
                    r.setTeamCount(teamRepository.countByDepartment_IdAndStatus(d.getId(), WorkspaceStatus.ACTIVE));
                    return r;
                })
                .toList();
    }

    /**
     * Resorteves the variante details d'un Department.
     *
     * @param workspaceId the ID of the workspace
     * @param departmentId l'identifiant du department
     * @return le DepartmentDetailsResponse
     */
    @Override
    @Transactional(readOnly = true)
    public DepartmentDetailsResponse getDetails(UUID workspaceId, UUID departmentId) {

        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());

        Department department = departmentRepository.findByIdAndWorkspace_Id(departmentId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found."));

        if (department.getStatus() != WorkspaceStatus.ACTIVE) {
            throw new ResourceNotFoundException("Department not found.");
        }

        DepartmentDetailsResponse response = departmentMapper.toDetails(department);
        response.setTeamCount(teamRepository.countByDepartment_IdAndStatus(departmentId, WorkspaceStatus.ACTIVE));
        return response;
    }

    /**
     * Updates a Department.
     *
     * <p>Partial update : the fields null are not appliquÃƒÂ©s.</p>
     *
     * @param workspaceId the ID of the workspace
     * @param departmentId l'identifiant du department
     * @param request the request de updated
     * @return le Department updated
     */
    @Override
    public DepartmentResponse update(UUID workspaceId, UUID departmentId, UpdateDepartmentRequest request) {

        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        assertWorkspaceAdminOrOwner(workspaceId, userId);

        Department department = departmentRepository.findByIdAndWorkspace_Id(departmentId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found."));

        if (department.getStatus() != WorkspaceStatus.ACTIVE) {
            throw new ResourceNotFoundException("Department not found.");
        }

        if (request.getName() != null) {
            String normalizedName = normalizeName(request.getName());
            if (!normalizedName.equals(normalizeName(department.getName()))
                    && departmentRepository.existsByWorkspace_IdAndName(workspaceId, normalizedName)) {
                throw new ConflictException("Department with this name already exists in this workspace.");
            }
            request.setName(normalizedName);
        }

        departmentMapper.updateDepartment(request, department);
        Department saved = departmentRepository.save(department);

        DepartmentResponse response = departmentMapper.toResponse(saved);
        response.setTeamCount(teamRepository.countByDepartment_IdAndStatus(saved.getId(), WorkspaceStatus.ACTIVE));
        return response;
    }

    /**
     * Restores an archived department back to ACTIVE status.
     */
    @Override
    public DepartmentResponse restore(UUID workspaceId, UUID departmentId) {

        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        assertWorkspaceAdminOrOwner(workspaceId, userId);

        Department department = departmentRepository.findByIdAndWorkspace_Id(departmentId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found."));

        if (department.getStatus() != WorkspaceStatus.ARCHIVED) {
            throw new BadRequestException("Department is not archived.");
        }

        department.setStatus(WorkspaceStatus.ACTIVE);
        Department saved = departmentRepository.save(department);

        DepartmentResponse response = departmentMapper.toResponse(saved);
        response.setTeamCount(teamRepository.countByDepartment_IdAndStatus(saved.getId(), WorkspaceStatus.ACTIVE));
        return response;
    }

    /**
     * Soft delete : passe le Department en ARCHIVED.
     *
     * <p>Le delete est Refusaled if the department contains active teams (verification non cÃƒÂ¢blÃƒÂ©e
     * tant que le TeamRepository is not used ici).</p>
     *
     * @param workspaceId the ID of the workspace
     * @param departmentId l'identifiant du department
     */
    @Override
    public void delete(UUID workspaceId, UUID departmentId) {

        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        assertWorkspaceOwner(workspaceId, userId);

        Department department = departmentRepository.findByIdAndWorkspace_Id(departmentId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found."));

        if (department.getStatus() != WorkspaceStatus.ACTIVE) {
            // idempotent : si dÃƒÂ©jÃƒÂ  archived => aucune error
            return;
        }

        // RÃƒÂ¨gle mÃƒÂ©tier validatede : deletion refusalede si le Department still contains active teams
        if (teamRepository.existsByDepartment_IdAndStatus(departmentId, WorkspaceStatus.ACTIVE)) {
            throw new ConflictException("Cannot delete department: it still contains active teams.");
        }

        department.setStatus(WorkspaceStatus.ARCHIVED);
        departmentRepository.save(department);

    }

    // ============================================================================
    // PRIVATE HELPERS
    // ============================================================================

    private UUID getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof CustomUserDetails main)) {
            throw new BadRequestException("User is not authenticated.");
        }
        return main.getId();
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof CustomUserDetails main)) {
            throw new BadRequestException("User is not authenticated.");
        }

        return userRepository.findByEmail(main.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private void assertActiveWorkspaceMember(UUID workspaceId, UUID userId) {
        // Utilise la same logical que WorkspaceAuthorization / WorkspaceServiceImpl
        WorkspaceMember wm = workspaceMemberRepository
                .findByWorkspaceMemberId_WorkspaceIdAndWorkspaceMemberId_UserId(workspaceId, userId)
                .orElseThrow(() -> new ForbiddenException("You are not a member of this workspace."));

        if (wm.getStatus() != WorkspaceMemberStatus.ACTIVE) {
            throw new ForbiddenException("You are not an active member of this workspace.");
        }
    }

    private void assertWorkspaceAdminOrOwner(UUID workspaceId, UUID userId) {
        if (!workspaceMemberRepository.existsWithRole(workspaceId, userId, WorkspaceRole.ADMIN)
                && !isOwner(workspaceId, userId)) {
            throw new ForbiddenException("You do not have permission for this operation.");
        }
    }

    private void assertWorkspaceOwner(UUID workspaceId, UUID userId) {
        if (!isOwner(workspaceId, userId)) {
            throw new ForbiddenException("Only OWNER can perform this operation.");
        }
    }

    private boolean isOwner(UUID workspaceId, UUID userId) {
        return workspaceRepository.findById(workspaceId)
                .map(ws -> ws.getOwner().getId().equals(userId))
                .orElse(false);
    }

    private String normalizeName(String value) {
        if (value == null) {
            return null;
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }
}

