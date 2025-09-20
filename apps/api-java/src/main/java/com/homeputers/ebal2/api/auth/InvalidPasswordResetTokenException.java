package com.homeputers.ebal2.api.auth;

public class InvalidPasswordResetTokenException extends RuntimeException {

    public InvalidPasswordResetTokenException() {
        super("Password reset link is invalid or has expired.");
    }
}
