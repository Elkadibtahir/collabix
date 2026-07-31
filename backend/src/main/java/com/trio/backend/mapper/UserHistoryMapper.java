package com.trio.backend.mapper;

import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.user.UserHistoryResponse;
import com.trio.backend.entity.UserHistory;
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
public interface UserHistoryMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userEmail", source = "user.email")
    @Mapping(target = "userFullName", expression = "java(history.getUser().getFirstName() + \" \" + history.getUser().getLastName())")
    @Mapping(target = "workspaceId", source = "workspace.id")
    @Mapping(target = "workspaceName", source = "workspace.name")
    @Mapping(target = "performedById", source = "performedBy.id")
    @Mapping(target = "performedByEmail", source = "performedBy.email")
    @Mapping(target = "performedByName", expression = "java(history.getPerformedBy() != null ? history.getPerformedBy().getFirstName() + \" \" + history.getPerformedBy().getLastName() : null)")
    UserHistoryResponse toResponse(UserHistory history);

}
