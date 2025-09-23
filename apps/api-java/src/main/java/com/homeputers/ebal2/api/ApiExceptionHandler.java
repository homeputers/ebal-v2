package com.homeputers.ebal2.api;

import com.homeputers.ebal2.api.admin.user.DuplicateEmailException;
import com.homeputers.ebal2.api.admin.user.LastAdminRemovalException;
import com.homeputers.ebal2.api.auth.InvalidCredentialsException;
import com.homeputers.ebal2.api.auth.InvalidPasswordResetTokenException;
import com.homeputers.ebal2.api.auth.InvalidRefreshTokenException;
import com.homeputers.ebal2.api.security.ProblemDetailHttpWriter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@RestControllerAdvice
public class ApiExceptionHandler {

    private final ProblemDetailHttpWriter problemDetailHttpWriter;

    public ApiExceptionHandler(ProblemDetailHttpWriter problemDetailHttpWriter) {
        this.problemDetailHttpWriter = problemDetailHttpWriter;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public void handleValidation(MethodArgumentNotValidException ex, HttpServletResponse response) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage));
        pd.setProperty("errors", errors);
        respond(pd, response);
    }

    @ExceptionHandler(NoSuchElementException.class)
    public void handleNotFound(NoSuchElementException ex, HttpServletResponse response) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
        pd.setDetail(ex.getMessage());
        respond(pd, response);
    }

    @ExceptionHandler({InvalidCredentialsException.class, InvalidRefreshTokenException.class})
    public void handleUnauthorized(RuntimeException ex, HttpServletResponse response) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.UNAUTHORIZED);
        pd.setDetail(ex.getMessage());
        respond(pd, response);
    }

    @ExceptionHandler(InvalidPasswordResetTokenException.class)
    public void handleInvalidPasswordResetToken(InvalidPasswordResetTokenException ex, HttpServletResponse response) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        pd.setDetail(ex.getMessage());
        respond(pd, response);
    }

    @ExceptionHandler(DuplicateEmailException.class)
    public void handleDuplicateEmail(DuplicateEmailException ex, HttpServletResponse response) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.CONFLICT);
        pd.setDetail(ex.getMessage());
        respond(pd, response);
    }

    @ExceptionHandler(OptimisticLockingFailureException.class)
    public void handleOptimisticLocking(OptimisticLockingFailureException ex, HttpServletResponse response) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.CONFLICT);
        pd.setDetail(ex.getMessage());
        respond(pd, response);
    }

    @ExceptionHandler(LastAdminRemovalException.class)
    public void handleLastAdmin(LastAdminRemovalException ex, HttpServletResponse response) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        pd.setDetail(ex.getMessage());
        pd.setProperty("code", LastAdminRemovalException.ERROR_CODE);
        respond(pd, response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public void handleIllegalArgument(IllegalArgumentException ex, HttpServletResponse response) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        pd.setDetail(ex.getMessage());
        respond(pd, response);
    }

    private void respond(ProblemDetail pd, HttpServletResponse response) {
        try {
            problemDetailHttpWriter.write(response, pd);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to write problem detail response", ex);
        }
    }
}
