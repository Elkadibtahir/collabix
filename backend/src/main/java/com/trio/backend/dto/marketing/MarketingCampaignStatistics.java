package com.trio.backend.dto.marketing;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class MarketingCampaignStatistics {

    private long totalCampaigns;
    private long activeCampaigns;
    private long CompletedCampaigns;
    private long plannedCampaigns;
    private long cancelledCampaigns;
    private long archivedCampaigns;
    private double averagecompletionPercentage;
    private double averageDurationDays;
    private Map<String, Long> campaignsByStatus;
    private Map<String, Long> campaignsByProject;
    private Map<String, Long> campaignsByTeam;
}
