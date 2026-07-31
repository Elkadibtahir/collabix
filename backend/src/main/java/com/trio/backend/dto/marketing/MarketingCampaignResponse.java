package com.trio.backend.dto.marketing;

import com.trio.backend.enums.CampaignPriority;
import com.trio.backend.enums.CampaignStatus;
import com.trio.backend.enums.CampaignType;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class MarketingCampaignResponse {

    private UUID id;
    private UUID departmentId;
    private UUID projectId;
    private String projectName;
    private UUID teamId;
    private String teamName;
    private String name;
    private String description;
    private CampaignType campaignType;
    private String objective;
    private CampaignStatus status;
    private CampaignPriority priority;
    private String targetAudience;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate CompletedAt;
    private Integer totalTasks;
    private Integer CompletedTasks;
    private Integer remainingTasks;
    private Double completionPercentage;
    private Instant createdAt;
    private Instant updatedAt;
}
