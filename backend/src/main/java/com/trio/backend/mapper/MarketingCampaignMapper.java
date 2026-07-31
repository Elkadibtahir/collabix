package com.trio.backend.mapper;

import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.marketing.MarketingCampaignResponse;
import com.trio.backend.entity.MarketingCampaign;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @Builder(disableBuilder = true),
        config = MapStructConfig.class
)
public interface MarketingCampaignMapper {

    @Mapping(target = "departmentId", source = "campaign.department.id")
    @Mapping(target = "projectId", source = "campaign.project.id")
    @Mapping(target = "projectName", source = "campaign.project.name")
    @Mapping(target = "teamId", expression = "java(campaign.getTeam() != null ? campaign.getTeam().getId() : null)")
    @Mapping(target = "teamName", expression = "java(campaign.getTeam() != null ? campaign.getTeam().getName() : null)")
    @Mapping(target = "remainingTasks", expression = "java(campaign.getTotalTasks() != null && campaign.getCompletedTasks() != null ? campaign.getTotalTasks() - campaign.getCompletedTasks() : 0)")
    @Mapping(target = "createdAt", source = "campaign.createdAt")
    @Mapping(target = "updatedAt", source = "campaign.updatedAt")
    MarketingCampaignResponse toResponse(MarketingCampaign campaign);
}
