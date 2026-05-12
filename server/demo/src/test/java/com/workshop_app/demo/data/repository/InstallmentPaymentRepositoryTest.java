package com.workshop_app.demo.data.repository;

import com.workshop_app.demo.data.entity.InstallmentPaymentEntity;
import com.workshop_app.demo.data.entity.InstallmentEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class InstallmentPaymentRepositoryTest {

    @Autowired
    InstallmentPaymentRepository installmentPaymentRepository;

    @Autowired
    InstallmentRepository installmentRepository;

    @Autowired
    KnownGoodState knownGoodState;

    @BeforeEach
    void setUp() {
        knownGoodState.set();
    }

    @Test
    void findAll() {
        assertEquals(5, installmentPaymentRepository.findAll().size());
    }

    @Test
    void findById() {
        InstallmentPaymentEntity payment = installmentPaymentRepository.findById(1L).orElse(null);
        assertNotNull(payment);
        assertEquals(0, payment.getAmount().compareTo(BigDecimal.valueOf(1600.00)));
    }

    @Test
    void save() {
        InstallmentEntity installment = installmentRepository.findById(1L).orElse(null);
        
        InstallmentPaymentEntity newPayment = new InstallmentPaymentEntity();
        newPayment.setInstallment(installment);
        newPayment.setAmount(BigDecimal.valueOf(100.0));
        newPayment.setPaymentMethod(InstallmentPaymentEntity.PaymentMethod.TRANSFER);
        
        InstallmentPaymentEntity savedPayment = installmentPaymentRepository.save(newPayment);
        assertNotNull(savedPayment.getId());
        assertEquals(6, installmentPaymentRepository.findAll().size());
    }

    @Test
    void update() {
        InstallmentPaymentEntity payment = installmentPaymentRepository.findById(1L).orElse(null);
        assertNotNull(payment);
        payment.setAmount(BigDecimal.valueOf(200.0));
        installmentPaymentRepository.save(payment);

        InstallmentPaymentEntity updatedPayment = installmentPaymentRepository.findById(1L).orElse(null);
        assertNotNull(updatedPayment);
        assertEquals(0, updatedPayment.getAmount().compareTo(BigDecimal.valueOf(200.0)));
    }

    @Test
    void deleteById() {
        installmentPaymentRepository.deleteById(1L);
        assertEquals(4, installmentPaymentRepository.findAll().size());
    }
}