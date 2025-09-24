package com.homeputers.ebal2.api.profile.support;

public class InvalidEmailChangeTokenException extends RuntimeException {

    public InvalidEmailChangeTokenException() {
        super("The email confirmation token is invalid or has expired.");
    }
}
