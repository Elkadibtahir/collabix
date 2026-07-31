package com.trio.backend.repository;

import com.trio.backend.entity.OnboardingTask;
import com.trio.backend.enums.OnboardingTaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OnboardingTaskRepository extends JpaRepository<OnboardingTask, UUID> {

    List<OnboardingTask> findAllByOnboarding_IdOrderByTaskOrderAsc(UUID onboardingId);

    Optional<OnboardingTask> findByIdAndOnboarding_Id(UUID id, UUID onboardingId);

    long countByOnboarding_Id(UUID onboardingId);

    long countByOnboarding_IdAndStatus(UUID onboardingId, OnboardingTaskStatus status);

    long countByOnboarding_Employee_Department_IdAndStatusAndDueDateBefore(UUID departmentId, OnboardingTaskStatus status, java.time.LocalDate date);
}
