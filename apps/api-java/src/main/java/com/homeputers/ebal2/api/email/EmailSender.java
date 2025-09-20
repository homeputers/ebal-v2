package com.homeputers.ebal2.api.email;

public interface EmailSender {

    void sendPasswordResetEmail(String to, String resetUrl);
}
