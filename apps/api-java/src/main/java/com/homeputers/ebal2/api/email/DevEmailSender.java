package com.homeputers.ebal2.api.email;

import com.homeputers.ebal2.api.config.MailProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;

import java.util.Locale;

public class DevEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(DevEmailSender.class);

    private final MailProperties mailProperties;
    private final MessageSource messageSource;

    public DevEmailSender(MailProperties mailProperties, MessageSource messageSource) {
        this.mailProperties = mailProperties;
        this.messageSource = messageSource;
    }

    @Override
    public void sendPasswordResetEmail(String to, String resetUrl, Locale locale) {
        String subject = messageSource.getMessage("mail.password-reset.subject", null, locale);
        String body = messageSource.getMessage("mail.password-reset.body", new Object[]{resetUrl}, locale);

        log.info("Password reset requested for {} using locale {} via frontend {}.",
                to, locale, mailProperties.getFrontendBaseUrl());
        log.info("Password reset email subject: {}", subject);
        log.info("Password reset email body: {}", body);
    }

    @Override
    public void sendUserInvitationEmail(String to, String displayName, String temporaryPassword, Locale locale) {
        String subject = messageSource.getMessage("mail.user-invite.subject", new Object[]{displayName}, locale);
        String body = messageSource.getMessage(
                "mail.user-invite.body",
                new Object[]{displayName, temporaryPassword, mailProperties.getFrontendBaseUrl()},
                locale);

        log.info("Inviting user {} with locale {} via frontend {}.",
                to, locale, mailProperties.getFrontendBaseUrl());
        log.info("User invite email subject: {}", subject);
        log.info("User invite email body: {}", body);
    }

    @Override
    public void sendEmailChangeConfirmationEmail(String to, String confirmationUrl, Locale locale) {
        String subject = messageSource.getMessage("mail.email-change.subject", null, locale);
        String body = messageSource.getMessage("mail.email-change.body", new Object[]{confirmationUrl}, locale);

        log.info("Email change confirmation sent to {} using locale {}.", to, locale);
        log.info("Email change subject: {}", subject);
        log.info("Email change body: {}", body);
    }
}
