package com.trio.backend.dto.marketing;

import com.trio.backend.enums.CampaignPriority;
import com.trio.backend.enums.CampaignStatus;
import com.trio.backend.enums.CampaignType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class MarketingCampaignSearchCriteria {

    private UUID projectId;
    private UUID teamId;
    private CampaignStatus status;
    private CampaignType campaignType;
    private CampaignPriority priority;
    private LocalDate dateFrom;
    private LocalDate dateTo;
    private String keyword;
}
