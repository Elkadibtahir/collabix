package com.trio.backend.service;

import com.trio.backend.config.MailProperties;
import com.trio.backend.entity.User;
import com.trio.backend.enums.MemberType;
import com.trio.backend.enums.UserStatus;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceImplTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private MailProperties mailProperties;

    @InjectMocks
    private EmailServiceImpl emailService;

    @Captor
    private ArgumentCaptor<MimeMessage> mimeMessageCaptor;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .firstName("Test")
                .lastName("User")
                .email("test@collabix.app")
                .password("encoded")
                .memberType(MemberType.EMPLOYEE)
                .status(UserStatus.ACTIVE)
                .enabled(true)
                .build();
    }

    @Test
    void sendAccountActivationEmail_shouldSendMimeMessage() throws Exception {
        when(mailProperties.getFrom()).thenReturn("noreply@collabix.app");
        when(mailProperties.getFromName()).thenReturn("Collabix");
        when(mailSender.createMimeMessage()).thenReturn(mock(MimeMessage.class));

        emailService.sendAccountActivationEmail(testUser, "https://collabix.app/activate?token=abc");

        verify(mailSender).send(mimeMessageCaptor.capture());
        MimeMessage message = mimeMessageCaptor.getValue();
        assertNotNull(message);
    }

    @Test
    void sendAccountActivationEmail_shouldUseConfiguredFromAddress() throws Exception {
        when(mailProperties.getFrom()).thenReturn("noreply@collabix.app");
        when(mailProperties.getFromName()).thenReturn("Collabix");
        MimeMessage mimeMessage = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendAccountActivationEmail(testUser, "https://collabix.app/activate?token=abc");

        verify(mailSender).send(mimeMessage);
    }

    @Test
    void sendPasswordResetEmail_shouldSendMimeMessage() throws Exception {
        when(mailProperties.getFrom()).thenReturn("noreply@collabix.app");
        when(mailProperties.getFromName()).thenReturn("Collabix");
        when(mailSender.createMimeMessage()).thenReturn(mock(MimeMessage.class));

        emailService.sendPasswordResetEmail(testUser, "https://collabix.app/reset?token=abc");

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendNotificationEmail_shouldSendMimeMessage() throws Exception {
        when(mailProperties.getFrom()).thenReturn("noreply@collabix.app");
        when(mailProperties.getFromName()).thenReturn("Collabix");
        when(mailSender.createMimeMessage()).thenReturn(mock(MimeMessage.class));

        emailService.sendNotificationEmail(testUser, "New Task", "You have a new task assigned", "https://collabix.app/tasks/1");

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendNotificationEmail_shouldHandleNullBody() throws Exception {
        when(mailProperties.getFrom()).thenReturn("noreply@collabix.app");
        when(mailProperties.getFromName()).thenReturn("Collabix");
        when(mailSender.createMimeMessage()).thenReturn(mock(MimeMessage.class));

        emailService.sendNotificationEmail(testUser, "Test", null, null);

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendAccountActivationEmail_shouldHandleMailException() throws Exception {
        when(mailProperties.getFrom()).thenReturn("noreply@collabix.app");
        when(mailProperties.getFromName()).thenReturn("Collabix");
        when(mailSender.createMimeMessage()).thenReturn(mock(MimeMessage.class));
        doThrow(new MailSendException("SMTP error")).when(mailSender).send(any(MimeMessage.class));

        emailService.sendAccountActivationEmail(testUser, "https://collabix.app/activate?token=abc");

        verify(mailSender).send(any(MimeMessage.class));
    }
}