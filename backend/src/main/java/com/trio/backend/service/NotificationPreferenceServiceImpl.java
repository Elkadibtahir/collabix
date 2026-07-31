package com.trio.backend.service;

import com.trio.backend.dto.notification.NotificationPreferenceRequest;
import com.trio.backend.dto.notification.NotificationPreferenceResponse;
import com.trio.backend.entity.NotificationPreference;
import com.trio.backend.entity.User;
import com.trio.backend.entity.Workspace;
import com.trio.backend.exception.BadRequestException;
import com.trio.backend.exception.ForbiddenException;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.repository.NotificationPreferenceRepository;
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

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class NotificationPreferenceServiceImpl implements NotificationPreferenceService {

    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationPreferenceResponse> getPreferences(UUID workspaceId) {
        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);

        return preferenceRepository.findByUserIdAndWorkspaceId(userId, workspaceId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public NotificationPreferenceResponse createPreference(UUID workspaceId, NotificationPreferenceRequest request) {
        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found."));

        NotificationPreference preference = NotificationPreference.builder()
                .user(user)
                .workspace(workspace)
                .notificationType(request.getNotificationType())
                .emailEnabled(request.isEmailEnabled())
                .inAppEnabled(request.isInAppEnabled())
                .digestFrequency(request.getDigestFrequency() != null ? request.getDigestFrequency() : "REALTIME")
                .quietHoursStart(request.getQuietHoursStart())
                .quietHoursEnd(request.getQuietHoursEnd())
                .build();

        NotificationPreference saved = preferenceRepository.save(preference);
        log.info("Notification preference created: userId={}, workspaceId={}, type={}", userId, workspaceId, request.getNotificationType());
        return toResponse(saved);
    }

    @Override
    public NotificationPreferenceResponse updatePreference(UUID workspaceId, UUID preferenceId, NotificationPreferenceRequest request) {
        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);

        NotificationPreference preference = preferenceRepository.findById(preferenceId)
                .orElseThrow(() -> new ResourceNotFoundException("Preference not found."));

        if (!preference.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You can only update your own preferences.");
        }

        if (request.getNotificationType() != null) {
            preference.setNotificationType(request.getNotificationType());
        }
        preference.setEmailEnabled(request.isEmailEnabled());
        preference.setInAppEnabled(request.isInAppEnabled());
        if (request.getDigestFrequency() != null) {
            preference.setDigestFrequency(request.getDigestFrequency());
        }
        if (request.getQuietHoursStart() != null) {
            preference.setQuietHoursStart(request.getQuietHoursStart());
        }
        if (request.getQuietHoursEnd() != null) {
            preference.setQuietHoursEnd(request.getQuietHoursEnd());
        }

        NotificationPreference saved = preferenceRepository.save(preference);
        return toResponse(saved);
    }

    @Override
    public void deletePreference(UUID workspaceId, UUID preferenceId) {
        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);

        NotificationPreference preference = preferenceRepository.findById(preferenceId)
                .orElseThrow(() -> new ResourceNotFoundException("Preference not found."));

        if (!preference.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You can only delete your own preferences.");
        }

        preferenceRepository.delete(preference);
        log.info("Notification preference deleted: id={}", preferenceId);
    }

    private NotificationPreferenceResponse toResponse(NotificationPreference pref) {
        NotificationPreferenceResponse resp = new NotificationPreferenceResponse();
        resp.setId(pref.getId());
        resp.setUserId(pref.getUser().getId());
        resp.setWorkspaceId(pref.getWorkspace().getId());
        resp.setNotificationType(pref.getNotificationType());
        resp.setEmailEnabled(pref.isEmailEnabled());
        resp.setInAppEnabled(pref.isInAppEnabled());
        resp.setDigestFrequency(pref.getDigestFrequency());
        resp.setQuietHoursStart(pref.getQuietHoursStart());
        resp.setQuietHoursEnd(pref.getQuietHoursEnd());
        return resp;
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
        workspaceMemberRepository
                .findByWorkspaceMemberId_WorkspaceIdAndWorkspaceMemberId_UserId(workspaceId, userId)
                .orElseThrow(() -> new ForbiddenException("You are not a member of this workspace."));
    }
}
