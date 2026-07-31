package com.trio.backend.service.marketing;

import com.trio.backend.dto.marketing.CreateMarketingCampaignRequest;
import com.trio.backend.dto.marketing.MarketingCampaignResponse;
import com.trio.backend.dto.marketing.MarketingCampaignSearchCriteria;
import com.trio.backend.dto.marketing.MarketingCampaignStatistics;
import com.trio.backend.dto.marketing.UpdateMarketingCampaignRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface MarketingCampaignService {

    MarketingCampaignResponse create(UUID workspaceId, UUID departmentId, CreateMarketingCampaignRequest request);

    MarketingCampaignResponse getById(UUID workspaceId, UUID departmentId, UUID campaignId);

    Page<MarketingCampaignResponse> search(UUID workspaceId, UUID departmentId, MarketingCampaignSearchCriteria criteria, Pageable pageable);

    MarketingCampaignResponse update(UUID workspaceId, UUID departmentId, UUID campaignId, UpdateMarketingCampaignRequest request);

    MarketingCampaignResponse activate(UUID workspaceId, UUID departmentId, UUID campaignId);

    MarketingCampaignResponse complete(UUID workspaceId, UUID departmentId, UUID campaignId);

    MarketingCampaignResponse archive(UUID workspaceId, UUID departmentId, UUID campaignId);

    MarketingCampaignStatistics getStatistics(UUID workspaceId, UUID departmentId);
}
