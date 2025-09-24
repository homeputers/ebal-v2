package com.homeputers.ebal2.api.email;

import com.homeputers.ebal2.api.config.MailProperties;
import org.springframework.context.MessageSource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Locale;

public class SmtpEmailSender implements EmailSender {

    private final JavaMailSender mailSender;
    private final MailProperties mailProperties;
    private final MessageSource messageSource;

    public SmtpEmailSender(JavaMailSender mailSender, MailProperties mailProperties,
                          MessageSource messageSource) {
        this.mailSender = mailSender;
        this.mailProperties = mailProperties;
        this.messageSource = messageSource;
    }

    @Override
    public void sendPasswordResetEmail(String to, String resetUrl, Locale locale) {
        String subject = messageSource.getMessage("mail.password-reset.subject", null, locale);
        String body = messageSource.getMessage("mail.password-reset.body", new Object[]{resetUrl}, locale);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailProperties.getSmtp().getFromAddress());
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    @Override
    public void sendUserInvitationEmail(String to, String displayName, String temporaryPassword, Locale locale) {
        String subject = messageSource.getMessage("mail.user-invite.subject", new Object[]{displayName}, locale);
        String body = messageSource.getMessage(
                "mail.user-invite.body",
                new Object[]{displayName, temporaryPassword, mailProperties.getFrontendBaseUrl()},
                locale);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailProperties.getSmtp().getFromAddress());
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    @Override
    public void sendEmailChangeConfirmationEmail(String to, String confirmationUrl, Locale locale) {
        String subject = messageSource.getMessage("mail.email-change.subject", null, locale);
        String body = messageSource.getMessage("mail.email-change.body", new Object[]{confirmationUrl}, locale);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailProperties.getSmtp().getFromAddress());
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}
