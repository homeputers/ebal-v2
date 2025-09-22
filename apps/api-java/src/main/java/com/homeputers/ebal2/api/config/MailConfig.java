package com.homeputers.ebal2.api.config;

import com.homeputers.ebal2.api.email.DevEmailSender;
import com.homeputers.ebal2.api.email.EmailSender;
import com.homeputers.ebal2.api.email.SmtpEmailSender;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
@EnableConfigurationProperties(MailProperties.class)
public class MailConfig {

    @Bean
    @ConditionalOnProperty(prefix = "ebal.mail.smtp", name = "enabled", havingValue = "true")
    public JavaMailSender javaMailSender(MailProperties properties) {
        MailProperties.Smtp smtp = properties.getSmtp();
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(smtp.getHost());
        if (smtp.getPort() != null) {
            sender.setPort(smtp.getPort());
        }
        sender.setUsername(smtp.getUsername());
        sender.setPassword(smtp.getPassword());

        Properties javaMailProperties = sender.getJavaMailProperties();
        javaMailProperties.put("mail.transport.protocol", "smtp");
        javaMailProperties.put("mail.smtp.auth", Boolean.toString(smtp.isAuth()));
        javaMailProperties.put("mail.smtp.starttls.enable", Boolean.toString(smtp.isStartTls()));
        return sender;
    }

    @Bean
    @ConditionalOnMissingBean(EmailSender.class)
    public EmailSender emailSender(MailProperties properties,
                                   ObjectProvider<JavaMailSender> javaMailSenderProvider,
                                   MessageSource messageSource) {
        if (properties.getSmtp().isEnabled()) {
            JavaMailSender javaMailSender = javaMailSenderProvider.getIfAvailable();
            if (javaMailSender == null) {
                throw new IllegalStateException(
                        "SMTP email sender requires JavaMailSender bean when smtp.enabled=true");
            }
            return new SmtpEmailSender(javaMailSender, properties, messageSource);
        }
        return new DevEmailSender(properties, messageSource);
    }
}
