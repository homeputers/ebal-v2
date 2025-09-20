package com.homeputers.ebal2.api.email;

import com.homeputers.ebal2.api.config.MailProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DevEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(DevEmailSender.class);

    private final MailProperties mailProperties;

    public DevEmailSender(MailProperties mailProperties) {
        this.mailProperties = mailProperties;
    }

    @Override
    public void sendPasswordResetEmail(String to, String resetUrl) {
        log.info("Password reset requested for {}. Provide link via frontend {}: {}", to,
                mailProperties.getFrontendBaseUrl(), resetUrl);
    }
}
