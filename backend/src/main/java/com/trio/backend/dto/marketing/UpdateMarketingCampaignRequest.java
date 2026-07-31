package com.trio.backend.dto.marketing;

import com.trio.backend.enums.CampaignPriority;
import com.trio.backend.enums.CampaignType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class UpdateMarketingCampaignRequest {

    private UUID teamId;
    private String name;
    private String description;
    private CampaignType campaignType;
    private String objective;
    private CampaignPriority priority;
    private String targetAudience;
    private LocalDate startDate;
    private LocalDate endDate;
}
