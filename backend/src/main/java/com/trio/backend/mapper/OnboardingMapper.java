package com.trio.backend.mapper;

import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.hr.OnboardingResponse;
import com.trio.backend.entity.Onboarding;
import com.trio.backend.entity.OnboardingTask;
import com.trio.backend.enums.OnboardingTaskStatus;
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
public interface OnboardingMapper {

    @Mapping(target = "employeeId", source = "onboarding.employee.id")
    @Mapping(target = "employeeName", expression = "java(onboarding.getEmployee().getFirstName() + \" \" + onboarding.getEmployee().getLastName())")
    @Mapping(target = "employeeNumber", source = "onboarding.employee.employeeNumber")
    @Mapping(target = "totalTasks", expression = "java(onboarding.getTasks() != null ? onboarding.getTasks().size() : 0)")
    @Mapping(target = "completedTasks", expression = "java(countCompletedTasks(onboarding))")
    @Mapping(target = "completionPercentage", expression = "java(calculateCompletion(onboarding))")
    OnboardingResponse toResponse(Onboarding onboarding);

    default int countCompletedTasks(Onboarding onboarding) {
        if (onboarding.getTasks() == null) return 0;
        return (int) onboarding.getTasks().stream()
                .filter(t -> t.getStatus() == OnboardingTaskStatus.COMPLETED)
                .count();
    }

    default int calculateCompletion(Onboarding onboarding) {
        if (onboarding.getTasks() == null || onboarding.getTasks().isEmpty()) return 0;
        long completed = onboarding.getTasks().stream()
                .filter(t -> t.getStatus() == OnboardingTaskStatus.COMPLETED)
                .count();
        return (int) (completed * 100 / onboarding.getTasks().size());
    }
}
