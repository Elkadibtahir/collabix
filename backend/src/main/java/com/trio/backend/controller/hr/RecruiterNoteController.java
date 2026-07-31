package com.trio.backend.controller.hr;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.hr.CreateRecruiterNoteRequest;
import com.trio.backend.dto.hr.RecruiterNoteResponse;
import com.trio.backend.dto.hr.RecruiterNoteSearchCriteria;
import com.trio.backend.dto.hr.RecruiterNoteStatistics;
import com.trio.backend.dto.hr.UpdateRecruiterNoteRequest;
import com.trio.backend.service.hr.RecruiterNoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/departments/{departmentId}")
@RequiredArgsConstructor
public class RecruiterNoteController {

    private final RecruiterNoteService noteService;

    @PostMapping("/candidates/{candidateId}/notes")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'RECRUITER_NOTE_CREATE')")
    public ApiResponse<RecruiterNoteResponse> create(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID candidateId,
            @Valid @RequestBody CreateRecruiterNoteRequest request) {
        request.setCandidateId(candidateId);
        return ApiResponse.success("Note created successfully.",
                noteService.create(workspaceId, departmentId, request));
    }

    @GetMapping("/candidates/{candidateId}/notes/{noteId}")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'RECRUITER_NOTE_READ')")
    public ApiResponse<RecruiterNoteResponse> getById(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID candidateId,
            @PathVariable UUID noteId) {
        return ApiResponse.success("Note resorteved successfully.",
                noteService.getById(workspaceId, departmentId, candidateId, noteId));
    }

    @GetMapping("/candidates/{candidateId}/notes")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'RECRUITER_NOTE_READ')")
    public ApiResponse<Page<RecruiterNoteResponse>> listByCandidate(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID candidateId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success("Notes resorteved successfully.",
                noteService.listByCandidate(workspaceId, departmentId, candidateId, pageable));
    }

    @GetMapping("/candidates/{candidateId}/notes/search")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'RECRUITER_NOTE_READ')")
    public ApiResponse<Page<RecruiterNoteResponse>> search(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID candidateId,
            RecruiterNoteSearchCriteria criteria,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        criteria.setCandidateId(candidateId);
        return ApiResponse.success("Notes resorteved successfully.",
                noteService.search(workspaceId, departmentId, criteria, pageable));
    }

    @PutMapping("/candidates/{candidateId}/notes/{noteId}")
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'RECRUITER_NOTE_UPDATE')")
    public ApiResponse<RecruiterNoteResponse> update(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID candidateId,
            @PathVariable UUID noteId,
            @Valid @RequestBody UpdateRecruiterNoteRequest request) {
        return ApiResponse.success("Note updated successfully.",
                noteService.update(workspaceId, departmentId, candidateId, noteId, request));
    }

    @DeleteMapping("/candidates/{candidateId}/notes/{noteId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'RECRUITER_NOTE_DELETE')")
    public void delete(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID candidateId,
            @PathVariable UUID noteId) {
        noteService.delete(workspaceId, departmentId, candidateId, noteId);
    }

    @GetMapping("/notes/stats")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'RECRUITER_NOTE_READ')")
    public ApiResponse<RecruiterNoteStatistics> getStatistics(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId) {
        return ApiResponse.success("Note statistics resorteved successfully.",
                noteService.getStatistics(workspaceId, departmentId));
    }
}
