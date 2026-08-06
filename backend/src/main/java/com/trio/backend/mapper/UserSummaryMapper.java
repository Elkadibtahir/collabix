package com.trio.backend.mapper;

import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.user.UserSummaryResponse;
import com.trio.backend.entity.User;
import org.mapstruct.Mapper;

/**
 * Maps a {@link User} to a compact {@link UserSummaryResponse}.
 */
@Mapper(config = MapStructConfig.class)
public interface UserSummaryMapper {

    default UserSummaryResponse toSummary(User user) {
        if (user == null) {
            return null;
        }
        return UserSummaryResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .profilePicture(user.getProfilePicture())
                .memberType(user.getMemberType())
                .status(user.getStatus())
                .build();
    }
}
