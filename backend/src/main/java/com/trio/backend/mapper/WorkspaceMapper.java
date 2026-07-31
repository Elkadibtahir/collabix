package com.trio.backend.mapper;

import com.trio.backend.config.InstantToLocalDateTimeMapper;
import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.workspace.CreateWorkspaceRequest;
import com.trio.backend.dto.workspace.UpdateWorkspaceRequest;
import com.trio.backend.dto.workspace.WorkspaceResponse;
import com.trio.backend.dto.workspace.WorkspaceSummaryResponse;
import com.trio.backend.entity.Workspace;
import org.mapstruct.BeanMapping;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @Builder(disableBuilder = true),
        config = MapStructConfig.class,
        uses = InstantToLocalDateTimeMapper.class
)
public interface WorkspaceMapper {

    /**
     * Mappe une entité Workspace vers WorkspaceResponse (complète).
     *
     * @param workspace l'entité Workspace
     * @return la réponse complète du workspace
     */
    @Mapping(target = "owner", source = "owner")
    @Mapping(target = "memberCount", ignore = true)
    @Mapping(target = "teamCount", ignore = true)
    WorkspaceResponse toResponse(Workspace workspace);

    /**
     * Mappe une entité Workspace vers WorkspaceSummaryResponse (allégée).
     *
     * @param workspace l'entité Workspace
     * @return la réponse résumée du workspace
     */
    @Mapping(target = "memberCount", ignore = true)
    @Mapping(target = "teamCount", ignore = true)
    WorkspaceSummaryResponse toSummary(Workspace workspace);

    /**
     * Mappe une CreateWorkspaceRequest vers une entité Workspace.
     *
     * @param request la requête de création
     * @return l'entité Workspace créée
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "workspaceMembers", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Workspace toEntity(CreateWorkspaceRequest request);

    /**
     * Met à jour une entité Workspace à partir d'une UpdateWorkspaceRequest.
     * Les champs null ne sont pas mappés (nullValuePropertyMappingStrategy = IGNORE).
     *
     * @param request la requête de mise à jour
     * @param workspace l'entité Workspace cible
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "workspaceMembers", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateWorkspace(UpdateWorkspaceRequest request,
                         @MappingTarget Workspace workspace);

}
