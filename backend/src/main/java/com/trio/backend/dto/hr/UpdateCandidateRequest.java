package com.trio.backend.dto.hr;

import com.trio.backend.enums.CandidateSource;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCandidateRequest {

    @Size(max = 100)
    private String firstName;

    @Size(max = 100)
    private String lastName;

    @Email
    @Size(max = 255)
    private String email;

    @Size(max = 50)
    private String phone;

    @Size(max = 150)
    private String position;

    private CandidateSource source;
}
