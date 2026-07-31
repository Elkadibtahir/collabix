package com.trio.backend.dto.hr;

import com.trio.backend.enums.EmploymentStatus;
import com.trio.backend.enums.ContractType;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class EmployeeResponse {

    private UUID id;
    private String employeeNumber;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;
    private LocalDate dateOfBirth;
    private String nationality;
    private String emergencyContact;
    private String position;
    private UUID departmentId;
    private UUID teamId;
    private UUID managerId;
    private ContractType employmentType;
    private EmploymentStatus employmentStatus;
    private LocalDate startDate;
    private LocalDate endDate;
    private String profilePicturePath;
    private UUID candidateId;
    private Instant createdAt;
    private Instant updatedAt;
}
