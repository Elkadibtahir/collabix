package com.trio.backend.dto.communication;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateMessageRequest {

    private String content;

    private boolean isPinned;
}
