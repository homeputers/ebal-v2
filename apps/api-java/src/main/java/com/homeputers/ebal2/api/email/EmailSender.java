package com.homeputers.ebal2.api.email;

import java.util.Locale;

public interface EmailSender {

    void sendPasswordResetEmail(String to, String resetUrl, Locale locale);

    void sendUserInvitationEmail(String to, String displayName, String temporaryPassword, Locale locale);

    void sendEmailChangeConfirmationEmail(String to, String confirmationUrl, Locale locale);
}
