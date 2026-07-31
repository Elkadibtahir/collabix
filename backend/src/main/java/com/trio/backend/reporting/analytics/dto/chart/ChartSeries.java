package com.trio.backend.reporting.analytics.dto.chart;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChartSeries {

    private String name;
    private List<ChartPoint> points;
    private String color;
}
