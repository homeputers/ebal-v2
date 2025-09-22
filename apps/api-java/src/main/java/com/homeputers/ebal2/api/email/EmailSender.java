package com.homeputers.ebal2.api.email;

import java.util.Locale;

public interface EmailSender {

    void sendPasswordResetEmail(String to, String resetUrl, Locale locale);
}
