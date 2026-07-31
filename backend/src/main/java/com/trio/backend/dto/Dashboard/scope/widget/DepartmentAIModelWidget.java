package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DepartmentAIModelWidget {

    private long totalModels;
    private long modelsInTraining;
    private long readyModels;
    private long deployedModels;
}
