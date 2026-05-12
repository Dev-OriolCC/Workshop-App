package com.workshop_app.demo.data.repository;

import com.workshop_app.demo.data.entity.RepairOrderPaymentEntity;
import com.workshop_app.demo.data.entity.RepairOrderEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class RepairOrderPaymentRepositoryTest {

    @Autowired
    RepairOrderPaymentRepository repairOrderPaymentRepository;

    @Autowired
    RepairOrderRepository repairOrderRepository;

    @Autowired
    KnownGoodState knownGoodState;

    @BeforeEach
    void setUp() {
        knownGoodState.set();
    }

    @Test
    void findAll() {
        assertEquals(4, repairOrderPaymentRepository.findAll().size());
    }

    @Test
    void findById() {
        RepairOrderPaymentEntity payment = repairOrderPaymentRepository.findById(1L).orElse(null);
        assertNotNull(payment);
        assertEquals(0, payment.getAmount().compareTo(BigDecimal.valueOf(250.00)));
    }

    @Test
    void save() {
        RepairOrderEntity order = repairOrderRepository.findById(1L).orElse(null);
        
        RepairOrderPaymentEntity newPayment = new RepairOrderPaymentEntity();
        newPayment.setRepairOrder(order);
        newPayment.setAmount(BigDecimal.valueOf(50.0));
        newPayment.setPaymentMethod(RepairOrderPaymentEntity.PaymentMethod.CASH);
        
        RepairOrderPaymentEntity savedPayment = repairOrderPaymentRepository.save(newPayment);
        assertNotNull(savedPayment.getId());
        assertEquals(5, repairOrderPaymentRepository.findAll().size());
    }

    @Test
    void update() {
        RepairOrderPaymentEntity payment = repairOrderPaymentRepository.findById(1L).orElse(null);
        assertNotNull(payment);
        payment.setAmount(BigDecimal.valueOf(300.0));
        repairOrderPaymentRepository.save(payment);

        RepairOrderPaymentEntity updatedPayment = repairOrderPaymentRepository.findById(1L).orElse(null);
        assertNotNull(updatedPayment);
        assertEquals(0, updatedPayment.getAmount().compareTo(BigDecimal.valueOf(300.0)));
    }

    @Test
    void deleteById() {
        repairOrderPaymentRepository.deleteById(1L);
        assertEquals(3, repairOrderPaymentRepository.findAll().size());
    }
}