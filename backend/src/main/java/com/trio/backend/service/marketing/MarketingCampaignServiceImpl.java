package com.trio.backend.service.marketing;

import com.trio.backend.dto.marketing.CreateMarketingCampaignRequest;
import com.trio.backend.dto.marketing.MarketingCampaignResponse;
import com.trio.backend.dto.marketing.MarketingCampaignSearchCriteria;
import com.trio.backend.dto.marketing.MarketingCampaignStatistics;
import com.trio.backend.dto.marketing.UpdateMarketingCampaignRequest;
import com.trio.backend.dto.notification.CreateNotificationRequest;
import com.trio.backend.entity.MarketingCampaign;
import com.trio.backend.entity.Notification;
import com.trio.backend.entity.Project;
import com.trio.backend.entity.Team;
import com.trio.backend.enums.CampaignStatus;
import com.trio.backend.enums.TaskStatus;
import com.trio.backend.enums.WorkspaceStatus;
import com.trio.backend.exception.BadRequestException;
import com.trio.backend.exception.ConflictException;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.mapper.MarketingCampaignMapper;
import com.trio.backend.repository.DepartmentRepository;
import com.trio.backend.repository.MarketingCampaignRepository;
import com.trio.backend.repository.MarketingCampaignSpecification;
import com.trio.backend.repository.ProjectRepository;
import com.trio.backend.repository.TaskRepository;
import com.trio.backend.repository.TeamRepository;
import com.trio.backend.service.NotificationService;
import com.trio.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class MarketingCampaignServiceImpl implements MarketingCampaignService {

    private final MarketingCampaignRepository marketingCampaignRepository;
    private final ProjectRepository projectRepository;
    private final DepartmentRepository departmentRepository;
    private final TeamRepository teamRepository;
    private final TaskRepository taskRepository;
    private final NotificationService notificationService;
    private final MarketingCampaignMapper marketingCampaignMapper;

    @Override
    public MarketingCampaignResponse create(UUID workspaceId, UUID departmentId, CreateMarketingCampaignRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);

        Project project = projectRepository.findByIdAndDepartment_Id(request.getProjectId(), departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));

        if (project.getStatus() != WorkspaceStatus.ACTIVE) {
            throw new ResourceNotFoundException("Project not found.");
        }

        if (request.getEndDate() != null && request.getStartDate() != null
                && request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date.");
        }

        if (marketingCampaignRepository.existsByProject_IdAndNameIgnoreCase(request.getProjectId(),
                request.getName().trim())) {
            throw new ConflictException("A campaign with this name already exists in the project.");
        }

        Team team = null;
        if (request.getTeamId() != null) {
            team = teamRepository.findByIdAndDepartment_Id(request.getTeamId(), departmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found."));
        }

        MarketingCampaign campaign = MarketingCampaign.builder()
                .department(project.getDepartment())
                .project(project)
                .team(team)
                .name(request.getName().trim())
                .description(request.getDescription())
                .campaignType(request.getCampaignType())
                .objective(request.getObjective())
                .priority(request.getPriority())
                .targetAudience(request.getTargetAudience())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(CampaignStatus.PLANNED)
                .build();

        MarketingCampaign saved = marketingCampaignRepository.save(campaign);
        log.info("Marketing campaign {} created for project {} by user {}",
                saved.getId(), project.getId(), userId);

        CreateNotificationRequest notifReq = new CreateNotificationRequest();
        notifReq.setRecipientId(userId);
        notifReq.setNotificationType(Notification.NotificationType.CAMPAIGN_CREATED);
        notifReq.setTitle("Marketing campaign created");
        notifReq.setBody("Marketing campaign \"" + saved.getName() + "\" has been created for project " + project.getName() + ".");
        notificationService.create(workspaceId, notifReq);

        return marketingCampaignMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public MarketingCampaignResponse getById(UUID workspaceId, UUID departmentId, UUID campaignId) {
        SecurityUtils.getCurrentUserId();
        MarketingCampaign campaign = findCampaign(workspaceId, departmentId, campaignId);
        return marketingCampaignMapper.toResponse(campaign);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MarketingCampaignResponse> search(UUID workspaceId, UUID departmentId,
                                                  MarketingCampaignSearchCriteria criteria, Pageable pageable) {
        SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);
        return marketingCampaignRepository.findAll(
                        MarketingCampaignSpecification.withFilter(departmentId, criteria), pageable)
                .map(marketingCampaignMapper::toResponse);
    }

    @Override
    public MarketingCampaignResponse update(UUID workspaceId, UUID departmentId, UUID campaignId, UpdateMarketingCampaignRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        MarketingCampaign campaign = findCampaign(workspaceId, departmentId, campaignId);

        if (campaign.getStatus() == CampaignStatus.COMPLETED
                || campaign.getStatus() == CampaignStatus.CANCELLED
                || campaign.getStatus() == CampaignStatus.ARCHIVED) {
            throw new BadRequestException("Cannot modify a Completed, cancelled, or archived campaign.");
        }

        if (request.getTeamId() != null) {
            Team team = teamRepository.findByIdAndDepartment_Id(request.getTeamId(), departmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found."));
            campaign.setTeam(team);
        }
        if (request.getName() != null) campaign.setName(request.getName().trim());
        if (request.getDescription() != null) campaign.setDescription(request.getDescription());
        if (request.getCampaignType() != null) campaign.setCampaignType(request.getCampaignType());
        if (request.getObjective() != null) campaign.setObjective(request.getObjective());
        if (request.getPriority() != null) campaign.setPriority(request.getPriority());
        if (request.getTargetAudience() != null) campaign.setTargetAudience(request.getTargetAudience());
        if (request.getStartDate() != null) campaign.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) campaign.setEndDate(request.getEndDate());

        if (campaign.getStartDate() != null && campaign.getEndDate() != null
                && campaign.getEndDate().isBefore(campaign.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date.");
        }

        MarketingCampaign saved = marketingCampaignRepository.save(campaign);
        log.info("Marketing campaign {} updated by user {}", campaignId, userId);

        return marketingCampaignMapper.toResponse(saved);
    }

    @Override
    public MarketingCampaignResponse activate(UUID workspaceId, UUID departmentId, UUID campaignId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        MarketingCampaign campaign = findCampaign(workspaceId, departmentId, campaignId);

        if (campaign.getStatus() != CampaignStatus.PLANNED) {
            throw new BadRequestException("Only planned campaigns can be activated.");
        }

        campaign.setStatus(CampaignStatus.ACTIVE);
        if (campaign.getStartDate() == null) {
            campaign.setStartDate(LocalDate.now());
        }
        MarketingCampaign saved = marketingCampaignRepository.save(campaign);

        log.info("Marketing campaign {} activated by user {}", campaignId, userId);

        CreateNotificationRequest notifReq = new CreateNotificationRequest();
        notifReq.setRecipientId(userId);
        notifReq.setNotificationType(Notification.NotificationType.CAMPAIGN_STARTED);
        notifReq.setTitle("Marketing campaign started");
        notifReq.setBody("Marketing campaign \"" + saved.getName() + "\" is now active.");
        notificationService.create(workspaceId, notifReq);

        return marketingCampaignMapper.toResponse(saved);
    }

    @Override
    public MarketingCampaignResponse complete(UUID workspaceId, UUID departmentId, UUID campaignId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        MarketingCampaign campaign = findCampaign(workspaceId, departmentId, campaignId);

        if (campaign.getStatus() != CampaignStatus.ACTIVE && campaign.getStatus() != CampaignStatus.ON_HOLD) {
            throw new BadRequestException("Only active or on hold campaigns can be Completed.");
        }

        updateCampaignmetrics(campaign);

        campaign.setStatus(CampaignStatus.COMPLETED);
        campaign.setCompletedAt(LocalDate.now());
        MarketingCampaign saved = marketingCampaignRepository.save(campaign);

        log.info("Marketing campaign {} Completed by user {}", campaignId, userId);

        CreateNotificationRequest notifReq = new CreateNotificationRequest();
        notifReq.setRecipientId(userId);
        notifReq.setNotificationType(Notification.NotificationType.CAMPAIGN_COMPLETED);
        notifReq.setTitle("Marketing campaign Completed");
        notifReq.setBody("Marketing campaign \"" + saved.getName() + "\" has been Completed. "
                + "Completion: " + (saved.getCompletionPercentage() != null ? Math.round(saved.getCompletionPercentage()) : 0) + "%.");
        notificationService.create(workspaceId, notifReq);

        return marketingCampaignMapper.toResponse(saved);
    }

    @Override
    public MarketingCampaignResponse archive(UUID workspaceId, UUID departmentId, UUID campaignId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        MarketingCampaign campaign = findCampaign(workspaceId, departmentId, campaignId);

        if (campaign.getStatus() == CampaignStatus.ARCHIVED) {
            throw new BadRequestException("Marketing campaign is already archived.");
        }

        campaign.setStatus(CampaignStatus.ARCHIVED);
        MarketingCampaign saved = marketingCampaignRepository.save(campaign);

        log.info("Marketing campaign {} archived by user {}", campaignId, userId);

        CreateNotificationRequest notifReq = new CreateNotificationRequest();
        notifReq.setRecipientId(userId);
        notifReq.setNotificationType(Notification.NotificationType.CAMPAIGN_ARCHIVED);
        notifReq.setTitle("Marketing campaign archived");
        notifReq.setBody("Marketing campaign \"" + saved.getName() + "\" has been archived.");
        notificationService.create(workspaceId, notifReq);

        return marketingCampaignMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public MarketingCampaignStatistics getStatistics(UUID workspaceId, UUID departmentId) {
        SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);

        MarketingCampaignStatistics stats = new MarketingCampaignStatistics();
        long total = marketingCampaignRepository.countByDepartment_Id(departmentId);
        stats.setTotalCampaigns(total);

        stats.setActiveCampaigns(marketingCampaignRepository.countByDepartment_IdAndStatus(departmentId, CampaignStatus.ACTIVE));
        stats.setCompletedCampaigns(marketingCampaignRepository.countByDepartment_IdAndStatus(departmentId, CampaignStatus.COMPLETED));
        stats.setPlannedCampaigns(marketingCampaignRepository.countByDepartment_IdAndStatus(departmentId, CampaignStatus.PLANNED));
        stats.setCancelledCampaigns(marketingCampaignRepository.countByDepartment_IdAndStatus(departmentId, CampaignStatus.CANCELLED));
        stats.setArchivedCampaigns(marketingCampaignRepository.countByDepartment_IdAndStatus(departmentId, CampaignStatus.ARCHIVED));

        List<MarketingCampaign> CompletedWithDates = marketingCampaignRepository.findCompletedWithDates(departmentId);
        double avgDuration = 0;
        if (!CompletedWithDates.isEmpty()) {
            avgDuration = CompletedWithDates.stream()
                    .mapToLong(c -> ChronoUnit.DAYS.between(c.getStartDate(), c.getCompletedAt()))
                    .average()
                    .orElse(0);
        }
        stats.setAverageDurationDays(avgDuration);

        List<MarketingCampaign> withPct = marketingCampaignRepository.findWithcompletionPercentage(departmentId);
        double avgPct = 0;
        if (!withPct.isEmpty()) {
            avgPct = withPct.stream()
                    .mapToDouble(c -> c.getCompletionPercentage() != null ? c.getCompletionPercentage() : 0)
                    .average()
                    .orElse(0);
        }
        stats.setAverageCompletionPercentage(avgPct);

        Map<String, Long> byStatus = new HashMap<>();
        for (Object[] row : marketingCampaignRepository.countByStatusGrouped(departmentId)) {
            byStatus.put(((CampaignStatus) row[0]).name(), (Long) row[1]);
        }
        stats.setCampaignsByStatus(byStatus);

        Map<String, Long> byProject = new HashMap<>();
        for (Object[] row : marketingCampaignRepository.countByProjectGrouped(departmentId)) {
            byProject.put((String) row[1], (Long) row[2]);
        }
        stats.setCampaignsByProject(byProject);

        Map<String, Long> byTeam = new HashMap<>();
        for (Object[] row : marketingCampaignRepository.countByTeamGrouped(departmentId)) {
            byTeam.put((String) row[0], (Long) row[1]);
        }
        stats.setCampaignsByTeam(byTeam);

        return stats;
    }

    private void updateCampaignmetrics(MarketingCampaign campaign) {
        UUID campaignId = campaign.getId();

        long totalTasks = taskRepository.countByMarketingCampaign_Id(campaignId);
        long CompletedTasks = taskRepository.countByMarketingCampaign_IdAndStatus(campaignId, TaskStatus.COMPLETED);

        campaign.setTotalTasks((int) totalTasks);
        campaign.setCompletedTasks((int) CompletedTasks);

        if (totalTasks > 0) {
            double pct = (double) CompletedTasks / totalTasks * 100;
            campaign.setCompletionPercentage(Math.round(pct * 100.0) / 100.0);
        } else {
            campaign.setCompletionPercentage(0.0);
        }
    }

    private MarketingCampaign findCampaign(UUID workspaceId, UUID departmentId, UUID campaignId) {
        findActiveDepartment(workspaceId, departmentId);
        return marketingCampaignRepository.findByIdAndDepartment_Id(campaignId, departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Marketing campaign not found."));
    }

    private void findActiveDepartment(UUID workspaceId, UUID departmentId) {
        departmentRepository.findByIdAndWorkspace_Id(departmentId, workspaceId)
                .filter(dept -> dept.getStatus() == WorkspaceStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found."));
    }
}
