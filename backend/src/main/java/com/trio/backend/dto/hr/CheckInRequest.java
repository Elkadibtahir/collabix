package com.trio.backend.dto.hr;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CheckInRequest {

    @NotNull
    private LocalDate date;

    private String notes;
}
