package com.trio.backend.reporting.analytics.dto.chart;

import com.trio.backend.reporting.analytics.dto.ChartType;
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
public class ChartData {

    private String chartId;
    private String title;
    private ChartType type;
    private List<ChartSeries> series;
    private List<String> labels;
}
