package com.trio.backend.reporting.analytics.dto.chart;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChartPoint {

    private String label;
    private double value;
    private Instant timestamp;
    private String category;
}
