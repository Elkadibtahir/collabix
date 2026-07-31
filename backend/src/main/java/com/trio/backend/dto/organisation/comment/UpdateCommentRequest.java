package com.trio.backend.dto.organisation.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Getter;

import lombok.Setter;

/**
 * Request de updated d'un Comment.
 *
 * <p>Partial update : the fields null sont ignorÃƒÂ©s cÃƒÂ´tÃƒÂ© service.</p>
 */
@Getter
@Setter
public class UpdateCommentRequest {

    @NotBlank
    @Size(max = 100000)
    private String content;

}

