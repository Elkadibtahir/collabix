package com.trio.backend.service;

import com.trio.backend.dto.organisation.checklist.*;
import com.trio.backend.entity.*;
import com.trio.backend.enums.ActivityStatus;
import com.trio.backend.enums.TaskStatus;
import com.trio.backend.enums.WorkspaceMemberStatus;
import com.trio.backend.enums.WorkspaceRole;
import com.trio.backend.enums.WorkspaceStatus;
import com.trio.backend.exception.BadRequestException;
import com.trio.backend.exception.ForbiddenException;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.mapper.ChecklistItemMapper;
import com.trio.backend.mapper.ChecklistMapper;
import com.trio.backend.repository.*;
import com.trio.backend.security.user.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ChecklistServiceImpl implements ChecklistService {

    private final ChecklistRepository checklistRepository;
    private final ChecklistItemRepository checklistItemRepository;
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final ChecklistMapper checklistMapper;
    private final ChecklistItemMapper checklistItemMapper;

    @Override
    public ChecklistResponse create(UUID workspaceId, UUID departmentId, UUID projectId, UUID taskId, CreateChecklistRequest request) {
        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);

        Task task = findActiveTask(workspaceId, departmentId, projectId, taskId);

        Checklist checklist = checklistMapper.toEntity(request);
        checklist.setTask(task);
        Checklist saved = checklistRepository.save(checklist);

        return buildChecklistResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ChecklistResponse getById(UUID workspaceId, UUID departmentId, UUID projectId, UUID taskId, UUID checklistId) {
        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());
        Checklist checklist = findChecklist(taskId, checklistId);
        validateTaskChain(workspaceId, departmentId, projectId, checklist.getTask());
        return buildChecklistResponse(checklist);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ChecklistResponse> list(UUID workspaceId, UUID departmentId, UUID projectId, UUID taskId, Pageable pageable) {
        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());
        findActiveTask(workspaceId, departmentId, projectId, taskId);
        return checklistRepository.findAllByTask_IdAndStatus(taskId, "ACTIVE", pageable)
                .map(this::buildChecklistResponse);
    }

    @Override
    public ChecklistResponse update(UUID workspaceId, UUID departmentId, UUID projectId, UUID taskId, UUID checklistId, UpdateChecklistRequest request) {
        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        Checklist checklist = findChecklist(taskId, checklistId);
        validateTaskChain(workspaceId, departmentId, projectId, checklist.getTask());

        checklistMapper.updateChecklist(request, checklist);
        Checklist saved = checklistRepository.save(checklist);
        return buildChecklistResponse(saved);
    }

    @Override
    public void delete(UUID workspaceId, UUID departmentId, UUID projectId, UUID taskId, UUID checklistId) {
        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        Checklist checklist = findChecklist(taskId, checklistId);
        validateTaskChain(workspaceId, departmentId, projectId, checklist.getTask());
        checklist.setStatus("ARCHIVED");
        checklistRepository.save(checklist);
    }

    @Override
    public ChecklistItemResponse createItem(UUID workspaceId, UUID departmentId, UUID projectId, UUID taskId, UUID checklistId, CreateChecklistItemRequest request) {
        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        Checklist checklist = findChecklist(taskId, checklistId);
        validateTaskChain(workspaceId, departmentId, projectId, checklist.getTask());

        List<ChecklistItem> existing = checklistItemRepository.findAllByChecklist_IdAndStatusOrderBySortOrderAsc(checklistId, "ACTIVE");
        int nextSortOrder = existing.isEmpty() ? 0 : existing.get(existing.size() - 1).getSortOrder() + 1;

        ChecklistItem item = checklistItemMapper.toEntity(request);
        item.setChecklist(checklist);
        item.setSortOrder(nextSortOrder);
        ChecklistItem saved = checklistItemRepository.save(item);
        return checklistItemMapper.toResponse(saved);
    }

    @Override
    public ChecklistItemResponse updateItem(UUID workspaceId, UUID departmentId, UUID projectId, UUID taskId, UUID checklistId, UUID itemId, UpdateChecklistItemRequest request) {
        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        Checklist checklist = findChecklist(taskId, checklistId);
        validateTaskChain(workspaceId, departmentId, projectId, checklist.getTask());

        ChecklistItem item = checklistItemRepository.findByIdAndChecklist_Id(itemId, checklistId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist item not found."));

        checklistItemMapper.updateChecklistItem(request, item);
        ChecklistItem saved = checklistItemRepository.save(item);
        return checklistItemMapper.toResponse(saved);
    }

    @Override
    public void deleteItem(UUID workspaceId, UUID departmentId, UUID projectId, UUID taskId, UUID checklistId, UUID itemId) {
        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        Checklist checklist = findChecklist(taskId, checklistId);
        validateTaskChain(workspaceId, departmentId, projectId, checklist.getTask());

        ChecklistItem item = checklistItemRepository.findByIdAndChecklist_Id(itemId, checklistId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist item not found."));

        item.setStatus("ARCHIVED");
        checklistItemRepository.save(item);
    }

    @Override
    public ChecklistItemResponse toggleItem(UUID workspaceId, UUID departmentId, UUID projectId, UUID taskId, UUID checklistId, UUID itemId) {
        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        Checklist checklist = findChecklist(taskId, checklistId);
        validateTaskChain(workspaceId, departmentId, projectId, checklist.getTask());

        ChecklistItem item = checklistItemRepository.findByIdAndChecklist_Id(itemId, checklistId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist item not found."));

        item.setCompleted(!item.isCompleted());
        ChecklistItem saved = checklistItemRepository.save(item);
        return checklistItemMapper.toResponse(saved);
    }

    private ChecklistResponse buildChecklistResponse(Checklist checklist) {
        ChecklistResponse response = checklistMapper.toResponse(checklist);
        List<ChecklistItem> items = checklistItemRepository.findAllByChecklist_IdAndStatusOrderBySortOrderAsc(
                checklist.getId(), "ACTIVE");
        response.setItems(items.stream().map(checklistItemMapper::toResponse).toList());
        response.setTotalItems(items.size());
        long completedCount = checklistItemRepository.countByChecklist_IdAndCompletedTrue(checklist.getId());
        response.setCompletedItems((int) completedCount);
        response.setCompletionPercentage(items.isEmpty() ? 0 : (int) ((completedCount * 100) / items.size()));
        return response;
    }

    private Checklist findChecklist(UUID taskId, UUID checklistId) {
        Checklist checklist = checklistRepository.findByIdAndTask_Id(checklistId, taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist not found."));
        if (!"ACTIVE".equals(checklist.getStatus())) {
            throw new ResourceNotFoundException("Checklist not found.");
        }
        return checklist;
    }

    private Task findActiveTask(UUID workspaceId, UUID departmentId, UUID projectId, UUID taskId) {
        Task task = taskRepository.findByIdAndProject_Id(taskId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found."));
        validateTaskChain(workspaceId, departmentId, projectId, task);
        if (task.getStatus() == TaskStatus.ARCHIVED || task.getStatus() == TaskStatus.CANCELLED) {
            throw new ResourceNotFoundException("Task not found.");
        }
        return task;
    }

    private void validateTaskChain(UUID workspaceId, UUID departmentId, UUID projectId, Task task) {
        if (!task.getProject().getId().equals(projectId)) {
            throw new ResourceNotFoundException("Task not found.");
        }
        if (!task.getProject().getDepartment().getId().equals(departmentId)) {
            throw new ResourceNotFoundException("Task not found.");
        }
        if (!task.getProject().getDepartment().getWorkspace().getId().equals(workspaceId)) {
            throw new ResourceNotFoundException("Task not found.");
        }
    }

    private UUID getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof CustomUserDetails main)) {
            throw new BadRequestException("User is not authenticated.");
        }
        return main.getId();
    }

    private void assertActiveWorkspaceMember(UUID workspaceId, UUID userId) {
        WorkspaceMember wm = workspaceMemberRepository
                .findByWorkspaceMemberId_WorkspaceIdAndWorkspaceMemberId_UserId(workspaceId, userId)
                .orElseThrow(() -> new ForbiddenException("You are not a member of this workspace."));
        if (wm.getStatus() != WorkspaceMemberStatus.ACTIVE) {
            throw new ForbiddenException("You are not an active member of this workspace.");
        }
    }
}
