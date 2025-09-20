package com.homeputers.ebal2.api.email;

import com.homeputers.ebal2.api.config.MailProperties;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

public class SmtpEmailSender implements EmailSender {

    private final JavaMailSender mailSender;
    private final MailProperties mailProperties;

    public SmtpEmailSender(JavaMailSender mailSender, MailProperties mailProperties) {
        this.mailSender = mailSender;
        this.mailProperties = mailProperties;
    }

    @Override
    public void sendPasswordResetEmail(String to, String resetUrl) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailProperties.getSmtp().getFromAddress());
        message.setTo(to);
        message.setSubject("Reset your password");
        message.setText("We received a request to reset your password. Use the link below to set a new password:\n\n"
                + resetUrl + "\n\nIf you did not request a password reset, you can safely ignore this email.");
        mailSender.send(message);
    }
}
