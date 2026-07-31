package com.trio.backend.validation;

import com.trio.backend.validation.PasswordValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = PasswordValidator.class)
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Password {

    String message() default
            "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one digit and one special character.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

}