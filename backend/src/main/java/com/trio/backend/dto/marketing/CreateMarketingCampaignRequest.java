package com.trio.backend.dto.marketing;

import com.trio.backend.enums.CampaignPriority;
import com.trio.backend.enums.CampaignType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class CreateMarketingCampaignRequest {

    @NotNull
    private UUID projectId;

    private UUID teamId;

    @NotBlank
    @Size(max = 150)
    private String name;

    @Size(max = 2000)
    private String description;

    @NotNull
    private CampaignType campaignType;

    @Size(max = 500)
    private String objective;

    @NotNull
    private CampaignPriority priority;

    @Size(max = 500)
    private String targetAudience;

    private LocalDate startDate;

    private LocalDate endDate;
}
