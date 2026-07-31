package com.trio.backend.dto.hr;

import com.trio.backend.enums.ContractType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class CreateEmployeeRequest {

    private UUID candidateId;

    @NotBlank
    @Size(max = 100)
    private String firstName;

    @NotBlank
    @Size(max = 100)
    private String lastName;

    @NotBlank
    @Email
    @Size(max = 255)
    private String email;

    @Size(max = 50)
    private String phone;

    private String address;

    private LocalDate dateOfBirth;

    @Size(max = 100)
    private String nationality;

    @Size(max = 255)
    private String emergencyContact;

    @NotBlank
    @Size(max = 150)
    private String position;

    private UUID teamId;

    private UUID managerId;

    @NotNull
    private ContractType employmentType;

    @NotNull
    private LocalDate startDate;
}
