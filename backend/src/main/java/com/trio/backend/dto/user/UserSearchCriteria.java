package com.trio.backend.dto.user;

import com.trio.backend.enums.MemberType;
import com.trio.backend.enums.RoleName;
import com.trio.backend.enums.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSearchCriteria {

    @Size(max = 100)
    private String keyword;

    @Size(max = 100)
    private String firstName;

    @Size(max = 100)
    private String lastName;

    @Size(max = 150)
    @Email
    private String email;

    private UserStatus status;

    private List<UserStatus> statuses;

    private RoleName role;

    private UUID departmentId;

    private UUID teamId;

    private MemberType memberType;

    private Instant createdAfter;

    private Instant createdBefore;

    private Instant lastLoginAfter;

    private Instant lastLoginBefore;

    private boolean excludeSoftDeleted;

}
