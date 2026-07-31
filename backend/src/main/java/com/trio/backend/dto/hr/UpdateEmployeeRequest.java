package com.trio.backend.dto.hr;

import com.trio.backend.enums.EmploymentStatus;
import com.trio.backend.enums.ContractType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class UpdateEmployeeRequest {

    @Size(max = 100)
    private String firstName;

    @Size(max = 100)
    private String lastName;

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

    @Size(max = 150)
    private String position;

    private UUID teamId;

    private UUID managerId;

    private ContractType employmentType;

    private EmploymentStatus employmentStatus;

    private LocalDate startDate;

    private LocalDate endDate;

    @Size(max = 500)
    private String profilePicturePath;
}
