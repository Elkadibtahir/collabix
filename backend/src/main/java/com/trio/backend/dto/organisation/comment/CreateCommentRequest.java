package com.trio.backend.dto.organisation.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/**
 * Create request d'un Comment.
 */
@Getter
@Setter
public class CreateCommentRequest {

    @NotBlank
    @Size(max = 100000)
    private String content;

    private UUID parentCommentId;
}


