package com.trio.backend.validation;

import com.trio.backend.validation.Password;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordValidator
        implements ConstraintValidator<Password, String> {

    private static final String PASSWORD_REGEX =
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&._#\\-])[A-Za-z\\d@$!%*?&._#\\-]{8,255}$";

    @Override
    public boolean isValid(
            String password,
            ConstraintValidatorContext context
    ) {

        if (password == null) {
            return false;
        }

        return password.matches(PASSWORD_REGEX);
    }

}