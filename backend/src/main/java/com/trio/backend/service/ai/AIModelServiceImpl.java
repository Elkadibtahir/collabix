package com.trio.backend.service.ai;

import com.trio.backend.dto.ai.AIModelResponse;
import com.trio.backend.dto.ai.AIModelSearchCriteria;
import com.trio.backend.dto.ai.AIModelStatistics;
import com.trio.backend.dto.ai.CreateAIModelRequest;
import com.trio.backend.dto.ai.UpdateAIModelRequest;
import com.trio.backend.dto.notification.CreateNotificationRequest;
import com.trio.backend.entity.AIModel;
import com.trio.backend.entity.Department;
import com.trio.backend.entity.Notification;
import com.trio.backend.entity.Project;
import com.trio.backend.entity.Team;
import com.trio.backend.enums.ModelStatus;
import com.trio.backend.mapper.AIModelMapper;
import com.trio.backend.repository.AIModelRepository;
import com.trio.backend.repository.AIModelSpecification;
import com.trio.backend.repository.DepartmentRepository;
import com.trio.backend.repository.ProjectRepository;
import com.trio.backend.repository.TeamRepository;
import com.trio.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AIModelServiceImpl implements AIModelService {

    private static final List<ModelStatus> VALID_ARCHIVE_STATUSES = List.of(
            ModelStatus.PLANNING, ModelStatus.TRAINING, ModelStatus.VALIDATING,
            ModelStatus.READY, ModelStatus.RETIRED
    );

    private final AIModelRepository aiModelRepository;
    private final AIModelSpecification aiModelSpecification;
    private final AIModelMapper aiModelMapper;
    private final DepartmentRepository departmentRepository;
    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public AIModelResponse create(UUID departmentId, CreateAIModelRequest request) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found: " + departmentId));

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found: " + request.getProjectId()));

        if (!project.getDepartment().getId().equals(departmentId)) {
            throw new RuntimeException("Project does not belong to this department");
        }

        Team team = null;
        if (request.getTeamId() != null) {
            team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new RuntimeException("Team not found: " + request.getTeamId()));
            if (!team.getDepartment().getId().equals(departmentId)) {
                throw new RuntimeException("Team does not belong to this department");
            }
        }

        AIModel model = AIModel.builder()
                .department(department)
                .project(project)
                .team(team)
                .name(request.getName())
                .description(request.getDescription())
                .modelType(request.getModelType())
                .modelVersion(request.getModelVersion())
                .objective(request.getObjective())
                .status(ModelStatus.PLANNING)
                .accuracy(request.getAccuracy())
                .ownerId(request.getOwnerId())
                .build();

        model = aiModelRepository.save(model);

        CreateNotificationRequest notif = new CreateNotificationRequest();
        notif.setRecipientId(request.getOwnerId());
        notif.setNotificationType(Notification.NotificationType.MODEL_CREATED);
        notif.setTitle("AI model created: " + model.getName());
        notif.setBody("AI Model '" + model.getName() + "' has been created with status PLANNING.");
        notificationService.create(department.getWorkspace().getId(), notif);

        return aiModelMapper.toResponse(model);
    }

    @Override
    @Transactional
    public AIModelResponse update(UUID departmentId, UUID modelId, UpdateAIModelRequest request) {
        AIModel model = aiModelRepository.findByIdAndDepartmentId(modelId, departmentId)
                .orElseThrow(() -> new RuntimeException("AI Model not found: " + modelId));

        if (model.getStatus() == ModelStatus.ARCHIVED) {
            throw new RuntimeException("Cannot update an archived AI model");
        }

        if (request.getName() != null) model.setName(request.getName());
        if (request.getDescription() != null) model.setDescription(request.getDescription());
        if (request.getModelType() != null) model.setModelType(request.getModelType());
        if (request.getModelVersion() != null) model.setModelVersion(request.getModelVersion());
        if (request.getObjective() != null) model.setObjective(request.getObjective());
        if (request.getAccuracy() != null) model.setAccuracy(request.getAccuracy());
        if (request.getOwnerId() != null) model.setOwnerId(request.getOwnerId());

        if (request.getTeamId() != null) {
            Team team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new RuntimeException("Team not found: " + request.getTeamId()));
            if (!team.getDepartment().getId().equals(departmentId)) {
                throw new RuntimeException("Team does not belong to this department");
            }
            model.setTeam(team);
        }

        model = aiModelRepository.save(model);
        return aiModelMapper.toResponse(model);
    }

    @Override
    @Transactional
    public AIModelResponse updateStatus(UUID departmentId, UUID modelId, String newStatus) {
        AIModel model = aiModelRepository.findByIdAndDepartmentId(modelId, departmentId)
                .orElseThrow(() -> new RuntimeException("AI Model not found: " + modelId));

        if (model.getStatus() == ModelStatus.ARCHIVED) {
            throw new RuntimeException("Cannot change status of an archived AI model");
        }

        ModelStatus targetStatus;
        try {
            targetStatus = ModelStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + newStatus);
        }

        if (model.getStatus() == targetStatus) {
            throw new RuntimeException("Model is already in status " + targetStatus);
        }

        validateTransition(model.getStatus(), targetStatus);

        ModelStatus previousStatus = model.getStatus();
        model.setStatus(targetStatus);
        model = aiModelRepository.save(model);

        UUID workspaceId = model.getDepartment().getWorkspace().getId();

        if (targetStatus == ModelStatus.DEPLOYED) {
            CreateNotificationRequest notif = new CreateNotificationRequest();
            notif.setRecipientId(model.getOwnerId());
            notif.setNotificationType(Notification.NotificationType.MODEL_DEPLOYED);
            notif.setTitle("AI model deployed: " + model.getName());
            notif.setBody("AI Model '" + model.getName() + "' has been deployed.");
            notificationService.create(workspaceId, notif);
        }

        CreateNotificationRequest notif = new CreateNotificationRequest();
        notif.setRecipientId(model.getOwnerId());
        notif.setNotificationType(Notification.NotificationType.MODEL_STATUS_CHANGED);
        notif.setTitle("AI model status changed: " + model.getName());
        notif.setBody("AI Model '" + model.getName() + "' status changed from " + previousStatus + " to " + targetStatus);
        notificationService.create(workspaceId, notif);

        return aiModelMapper.toResponse(model);
    }

    @Override
    @Transactional
    public AIModelResponse archive(UUID departmentId, UUID modelId) {
        AIModel model = aiModelRepository.findByIdAndDepartmentId(modelId, departmentId)
                .orElseThrow(() -> new RuntimeException("AI Model not found: " + modelId));

        if (model.getStatus() == ModelStatus.ARCHIVED) {
            throw new RuntimeException("AI Model is already archived");
        }

        if (!VALID_ARCHIVE_STATUSES.contains(model.getStatus()) && model.getStatus() != ModelStatus.DEPLOYED) {
            throw new RuntimeException("Cannot archive model in status " + model.getStatus());
        }

        model.setStatus(ModelStatus.ARCHIVED);
        model = aiModelRepository.save(model);

        CreateNotificationRequest notif = new CreateNotificationRequest();
        notif.setRecipientId(model.getOwnerId());
        notif.setNotificationType(Notification.NotificationType.MODEL_ARCHIVED);
        notif.setTitle("AI model archived: " + model.getName());
        notif.setBody("AI Model '" + model.getName() + "' has been archived.");
        UUID workspaceId = model.getDepartment().getWorkspace().getId();
        notificationService.create(workspaceId, notif);

        return aiModelMapper.toResponse(model);
    }

    @Override
    @Transactional(readOnly = true)
    public AIModelResponse findById(UUID departmentId, UUID modelId) {
        return aiModelRepository.findByIdAndDepartmentId(modelId, departmentId)
                .map(aiModelMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("AI Model not found: " + modelId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AIModelResponse> findAllByDepartmentId(UUID departmentId) {
        return aiModelRepository.findByDepartmentId(departmentId)
                .stream()
                .map(aiModelMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AIModelResponse> search(UUID departmentId, AIModelSearchCriteria criteria) {
        return aiModelRepository.findAll(aiModelSpecification.withSearch(criteria))
                .stream()
                .filter(model -> model.getDepartment().getId().equals(departmentId))
                .map(aiModelMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AIModelStatistics getStatistics(UUID departmentId) {
        AIModelStatistics stats = new AIModelStatistics();

        stats.setTotalModels(aiModelRepository.countByDepartmentIdAndStatusNotIn(departmentId,
                List.of(ModelStatus.ARCHIVED)));
        stats.setTrainingModels(aiModelRepository.countByDepartmentIdAndStatus(departmentId, ModelStatus.TRAINING));
        stats.setReadyModels(aiModelRepository.countByDepartmentIdAndStatus(departmentId, ModelStatus.READY));
        stats.setDeployedModels(aiModelRepository.countByDepartmentIdAndStatus(departmentId, ModelStatus.DEPLOYED));
        stats.setArchivedModels(aiModelRepository.countByDepartmentIdAndStatus(departmentId, ModelStatus.ARCHIVED));

        Double avgAccuracy = aiModelRepository.averageAccuracyByDepartmentId(departmentId);
        stats.setAverageAccuracy(avgAccuracy != null ? avgAccuracy : 0.0);

        Map<String, Long> byStatus = new HashMap<>();
        for (Object[] row : aiModelRepository.countByStatusGrouped(departmentId)) {
            byStatus.put(String.valueOf(row[0]), (Long) row[1]);
        }
        stats.setModelsByStatus(byStatus);

        Map<String, Long> byProject = new HashMap<>();
        for (Object[] row : aiModelRepository.countByProjectGrouped(departmentId)) {
            byProject.put(String.valueOf(row[0]), (Long) row[1]);
        }
        stats.setModelsByProject(byProject);

        Map<String, Long> byTeam = new HashMap<>();
        for (Object[] row : aiModelRepository.countByTeamGrouped(departmentId)) {
            byTeam.put(String.valueOf(row[0]), (Long) row[1]);
        }
        stats.setModelsByTeam(byTeam);

        return stats;
    }

    private void validateTransition(ModelStatus current, ModelStatus target) {
        if (current == ModelStatus.DEPLOYED && target != ModelStatus.RETIRED) {
            throw new RuntimeException("Deployed models can only transition to RETIRED");
        }
        if (current == ModelStatus.RETIRED && target != ModelStatus.ARCHIVED) {
            throw new RuntimeException("Retired models can only transition to ARCHIVED");
        }
    }
}
