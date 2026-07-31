package com.trio.backend.controller.marketing;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.marketing.CreateMarketingCampaignRequest;
import com.trio.backend.dto.marketing.MarketingCampaignResponse;
import com.trio.backend.dto.marketing.MarketingCampaignSearchCriteria;
import com.trio.backend.dto.marketing.MarketingCampaignStatistics;
import com.trio.backend.dto.marketing.UpdateMarketingCampaignRequest;
import com.trio.backend.service.marketing.MarketingCampaignService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/departments/{departmentId}/campaigns")
@RequiredArgsConstructor
public class MarketingCampaignController {

    private final MarketingCampaignService marketingCampaignService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'CAMPAIGN_CREATE')")
    public ApiResponse<MarketingCampaignResponse> create(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @Valid @RequestBody CreateMarketingCampaignRequest request) {
        return ApiResponse.success("Marketing campaign created successfully.",
                marketingCampaignService.create(workspaceId, departmentId, request));
    }

    @GetMapping("/{campaignId}")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'CAMPAIGN_READ')")
    public ApiResponse<MarketingCampaignResponse> getById(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID campaignId) {
        return ApiResponse.success("Marketing campaign resorteved successfully.",
                marketingCampaignService.getById(workspaceId, departmentId, campaignId));
    }

    @GetMapping
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'CAMPAIGN_READ')")
    public ApiResponse<Page<MarketingCampaignResponse>> search(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            MarketingCampaignSearchCriteria criteria,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success("Marketing campaigns resorteved successfully.",
                marketingCampaignService.search(workspaceId, departmentId, criteria, pageable));
    }

    @PutMapping("/{campaignId}")
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'CAMPAIGN_UPDATE')")
    public ApiResponse<MarketingCampaignResponse> update(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID campaignId,
            @Valid @RequestBody UpdateMarketingCampaignRequest request) {
        return ApiResponse.success("Marketing campaign updated successfully.",
                marketingCampaignService.update(workspaceId, departmentId, campaignId, request));
    }

    @PutMapping("/{campaignId}/activate")
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'CAMPAIGN_ACTIVATE')")
    public ApiResponse<MarketingCampaignResponse> activate(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID campaignId) {
        return ApiResponse.success("Marketing campaign activated successfully.",
                marketingCampaignService.activate(workspaceId, departmentId, campaignId));
    }

    @PutMapping("/{campaignId}/complete")
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'CAMPAIGN_COMPLETE')")
    public ApiResponse<MarketingCampaignResponse> complete(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID campaignId) {
        return ApiResponse.success("Marketing campaign completed successfully.",
                marketingCampaignService.complete(workspaceId, departmentId, campaignId));
    }

    @PutMapping("/{campaignId}/archive")
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'CAMPAIGN_ARCHIVE')")
    public ApiResponse<MarketingCampaignResponse> archive(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID campaignId) {
        return ApiResponse.success("Marketing campaign archived successfully.",
                marketingCampaignService.archive(workspaceId, departmentId, campaignId));
    }

    @GetMapping("/stats")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'CAMPAIGN_READ')")
    public ApiResponse<MarketingCampaignStatistics> getStatistics(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId) {
        return ApiResponse.success("Marketing campaign statistics resorteved successfully.",
                marketingCampaignService.getStatistics(workspaceId, departmentId));
    }
}
