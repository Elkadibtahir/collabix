package com.trio.backend.mapper;

import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.hr.OnboardingTaskResponse;
import com.trio.backend.entity.OnboardingTask;
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
public interface OnboardingTaskMapper {

    @Mapping(target = "onboardingId", source = "task.onboarding.id")
    OnboardingTaskResponse toResponse(OnboardingTask task);
}
