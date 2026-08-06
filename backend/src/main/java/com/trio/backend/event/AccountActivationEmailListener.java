package com.trio.backend.event;

import com.trio.backend.repository.UserRepository;
import com.trio.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/** Delivers activation emails only after token and user changes are committed. */
@Component
@RequiredArgsConstructor
@Slf4j
public class AccountActivationEmailListener {

    private final UserRepository userRepository;
    private final EmailService emailService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public void handle(AccountActivationEmailRequestedEvent event) {
        userRepository.findById(event.getUserId()).ifPresentOrElse(
                user -> emailService.sendAccountActivationEmail(user, event.getActivationLink()),
                () -> log.error("Activation email was not sent because user {} no longer exists.", event.getUserId())
        );
    }
}
