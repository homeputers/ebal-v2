package com.homeputers.ebal2.api;

import com.homeputers.ebal2.api.admin.user.DuplicateEmailException;
import com.homeputers.ebal2.api.admin.user.LastAdminRemovalException;
import com.homeputers.ebal2.api.auth.InvalidCredentialsException;
import com.homeputers.ebal2.api.auth.InvalidPasswordResetTokenException;
import com.homeputers.ebal2.api.auth.InvalidRefreshTokenException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage));
        return respond(HttpStatus.BAD_REQUEST, problemDetail -> problemDetail.setProperty("errors", errors));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ProblemDetail> handleNotFound(NoSuchElementException ex) {
        return respond(HttpStatus.NOT_FOUND, problemDetail -> problemDetail.setDetail(ex.getMessage()));
    }

    @ExceptionHandler({InvalidCredentialsException.class, InvalidRefreshTokenException.class})
    public ResponseEntity<ProblemDetail> handleUnauthorized(RuntimeException ex) {
        return respond(HttpStatus.UNAUTHORIZED, problemDetail -> problemDetail.setDetail(ex.getMessage()));
    }

    @ExceptionHandler(InvalidPasswordResetTokenException.class)
    public ResponseEntity<ProblemDetail> handleInvalidPasswordResetToken(InvalidPasswordResetTokenException ex) {
        return respond(HttpStatus.BAD_REQUEST, problemDetail -> problemDetail.setDetail(ex.getMessage()));
    }

    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<ProblemDetail> handleDuplicateEmail(DuplicateEmailException ex) {
        return respond(HttpStatus.CONFLICT, problemDetail -> problemDetail.setDetail(ex.getMessage()));
    }

    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ResponseEntity<ProblemDetail> handleOptimisticLocking(OptimisticLockingFailureException ex) {
        return respond(HttpStatus.CONFLICT, problemDetail -> problemDetail.setDetail(ex.getMessage()));
    }

    @ExceptionHandler(LastAdminRemovalException.class)
    public ResponseEntity<ProblemDetail> handleLastAdmin(LastAdminRemovalException ex) {
        return respond(HttpStatus.BAD_REQUEST, problemDetail -> {
            problemDetail.setDetail(ex.getMessage());
            problemDetail.setProperty("code", LastAdminRemovalException.ERROR_CODE);
        });
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ProblemDetail> handleIllegalArgument(IllegalArgumentException ex) {
        return respond(HttpStatus.BAD_REQUEST, problemDetail -> problemDetail.setDetail(ex.getMessage()));
    }

    private ResponseEntity<ProblemDetail> respond(HttpStatus status, java.util.function.Consumer<ProblemDetail> customizer) {
        ProblemDetail problemDetail = ProblemDetail.forStatus(status);
        if (customizer != null) {
            customizer.accept(problemDetail);
        }
        return ResponseEntity.status(status)
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body(problemDetail);
    }
}
