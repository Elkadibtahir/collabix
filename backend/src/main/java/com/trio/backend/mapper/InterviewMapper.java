package com.trio.backend.mapper;

import com.trio.backend.config.InstantToLocalDateTimeMapper;
import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.hr.InterviewFeedbackResponse;
import com.trio.backend.dto.hr.InterviewParticipantResponse;
import com.trio.backend.dto.hr.InterviewResponse;
import com.trio.backend.entity.Interview;
import com.trio.backend.entity.InterviewFeedback;
import com.trio.backend.entity.InterviewParticipant;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @Builder(disableBuilder = true),
        config = MapStructConfig.class,
        uses = InstantToLocalDateTimeMapper.class
)
public interface InterviewMapper {

    @Mapping(target = "candidateId", source = "interview.candidate.id")
    InterviewResponse toResponse(Interview interview);

    @Mapping(target = "interviewId", source = "participant.interview.id")
    @Mapping(target = "userId", source = "participant.user.id")
    @Mapping(target = "userFirstName", source = "participant.user.firstName")
    @Mapping(target = "userLastName", source = "participant.user.lastName")
    @Mapping(target = "userEmail", source = "participant.user.email")
    InterviewParticipantResponse toResponse(InterviewParticipant participant);

    @Mapping(target = "interviewId", source = "feedback.interview.id")
    @Mapping(target = "submittedBy", source = "feedback.createdBy")
    @Mapping(target = "submittedAt", source = "feedback.createdAt")
    InterviewFeedbackResponse toResponse(InterviewFeedback feedback);
}
