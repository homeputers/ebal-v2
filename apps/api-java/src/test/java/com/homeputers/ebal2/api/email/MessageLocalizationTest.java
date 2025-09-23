package com.homeputers.ebal2.api.email;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;

import java.util.Locale;

import static org.assertj.core.api.Assertions.assertThat;

class MessageLocalizationTest {

    private Locale originalDefaultLocale;

    @BeforeEach
    void setUp() {
        originalDefaultLocale = Locale.getDefault();
        Locale.setDefault(new Locale("es", "MX"));
    }

    @AfterEach
    void tearDown() {
        Locale.setDefault(originalDefaultLocale);
    }

    @Test
    void resolvesEnglishContentWhenLocaleIsEnglish() {
        ReloadableResourceBundleMessageSource messageSource = new ReloadableResourceBundleMessageSource();
        messageSource.setBasename("classpath:messages");
        messageSource.setDefaultEncoding("UTF-8");

        String subject = messageSource.getMessage("mail.password-reset.subject", null, Locale.ENGLISH);
        String body = messageSource.getMessage("mail.password-reset.body", new Object[]{"https://example.com"}, Locale.ENGLISH);

        assertThat(subject).isEqualTo("Reset your password");
        assertThat(body)
                .contains("Reset your password")
                .contains("https://example.com");
    }

    @Test
    void resolvesSpanishContentWhenLocaleIsSpanish() {
        ReloadableResourceBundleMessageSource messageSource = new ReloadableResourceBundleMessageSource();
        messageSource.setBasename("classpath:messages");
        messageSource.setDefaultEncoding("UTF-8");

        Locale spanish = Locale.forLanguageTag("es-MX");
        String subject = messageSource.getMessage("mail.password-reset.subject", null, spanish);
        String body = messageSource.getMessage("mail.password-reset.body", new Object[]{"https://example.com"}, spanish);

        assertThat(subject).isEqualTo("Restablece tu contraseña");
        assertThat(body)
                .contains("Hemos recibido una solicitud")
                .contains("https://example.com");
    }

    @Test
    void resolvesEnglishUserInviteContent() {
        ReloadableResourceBundleMessageSource messageSource = new ReloadableResourceBundleMessageSource();
        messageSource.setBasename("classpath:messages");
        messageSource.setDefaultEncoding("UTF-8");

        String subject = messageSource.getMessage("mail.user-invite.subject", new Object[]{"Taylor"}, Locale.ENGLISH);
        String body = messageSource.getMessage("mail.user-invite.body",
                new Object[]{"Taylor", "Temp123!", "https://app.example.com"}, Locale.ENGLISH);

        assertThat(subject).contains("invited");
        assertThat(body)
                .contains("Taylor")
                .contains("Temp123!")
                .contains("https://app.example.com");
    }

    @Test
    void resolvesSpanishUserInviteContent() {
        ReloadableResourceBundleMessageSource messageSource = new ReloadableResourceBundleMessageSource();
        messageSource.setBasename("classpath:messages");
        messageSource.setDefaultEncoding("UTF-8");

        Locale spanish = Locale.forLanguageTag("es-MX");
        String subject = messageSource.getMessage("mail.user-invite.subject", new Object[]{"Taylor"}, spanish);
        String body = messageSource.getMessage("mail.user-invite.body",
                new Object[]{"Taylor", "Temp123!", "https://app.example.com"}, spanish);

        assertThat(subject).isEqualTo("Te han invitado a Every Breath And Life");
        assertThat(body)
                .contains("Hola Taylor")
                .contains("Temp123!")
                .contains("https://app.example.com")
                .contains("cambia tu contraseña");
    }
}
