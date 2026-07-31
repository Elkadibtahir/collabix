package com.trio.backend.mapper;

import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.hr.PerformanceReviewResponse;
import com.trio.backend.entity.PerformanceReview;
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
public interface PerformanceReviewMapper {

    @Mapping(target = "employeeId", source = "review.employee.id")
    @Mapping(target = "employeeName", expression = "java(review.getEmployee().getFirstName() + \" \" + review.getEmployee().getLastName())")
    @Mapping(target = "employeeNumber", source = "review.employee.employeeNumber")
    @Mapping(target = "reviewerId", source = "review.reviewer.id")
    @Mapping(target = "reviewerName", expression = "java(review.getReviewer().getFirstName() + \" \" + review.getReviewer().getLastName())")
    @Mapping(target = "teamId", expression = "java(review.getTeam() != null ? review.getTeam().getId() : null)")
    @Mapping(target = "teamName", expression = "java(review.getTeam() != null ? review.getTeam().getName() : null)")
    PerformanceReviewResponse toResponse(PerformanceReview review);
}
