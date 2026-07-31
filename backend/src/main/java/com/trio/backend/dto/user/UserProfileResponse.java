package com.trio.backend.dto.user;

import com.trio.backend.enums.MemberType;
import com.trio.backend.enums.RoleName;
import com.trio.backend.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private UUID id;

    private String firstName;

    private String lastName;

    private String email;

    private String profilePicture;

    private MemberType memberType;

    private RoleName role;

    private UserStatus status;

    private Instant lastLoginAt;

}