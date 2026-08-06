package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Widget representing a handover (handover/passation) of the authenticated user
 * for today in the Personal Dashboard.
 *
 * <p>Shows handovers where the user is the sender or the receiver.</p>
 */
@Getter
@Setter
public class PersonalHandoverWidget {

    private UUID id;

    private String projectName;

    private String senderName;

    private String receiverName;

    private String title;

    private String status;

    private String priority;

    private LocalDateTime dueDate;

    private LocalDateTime createdAt;
}
