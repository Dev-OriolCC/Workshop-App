package com.workshop_app.demo.data.repository;

import com.workshop_app.demo.data.entity.InstallmentEntity;
import com.workshop_app.demo.data.entity.ClientEntity;
import com.workshop_app.demo.data.entity.UserEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class InstallmentRepositoryTest {

    @Autowired
    InstallmentRepository installmentRepository;

    @Autowired
    ClientRepository clientRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    KnownGoodState knownGoodState;

    @BeforeEach
    void setUp() {
        knownGoodState.set();
    }

    @Test
    void findAll() {
        assertEquals(3, installmentRepository.findAll().size());
    }

    @Test
    void findById() {
        InstallmentEntity installment = installmentRepository.findById(1L).orElse(null);
        assertNotNull(installment);
        assertEquals("Shimano Stella SW 8000", installment.getArticle());
    }

    @Test
    void save() {
        ClientEntity client = clientRepository.findById(1L).orElse(null);
        UserEntity user = userRepository.findById(1L).orElse(null);
        
        InstallmentEntity newInstallment = new InstallmentEntity();
        newInstallment.setClient(client);
        newInstallment.setCreatedBy(user);
        newInstallment.setArticle("New Article");
        newInstallment.setInterestRate(BigDecimal.ZERO);
        newInstallment.setTotalAmount(BigDecimal.valueOf(500.0));
        newInstallment.setAmountPaid(BigDecimal.ZERO);
        newInstallment.setPendingAmount(BigDecimal.valueOf(500.0));
        newInstallment.setStatus(InstallmentEntity.InstallmentStatus.ACTIVE);
        
        InstallmentEntity savedInstallment = installmentRepository.save(newInstallment);
        assertNotNull(savedInstallment.getId());
        assertEquals(4, installmentRepository.findAll().size());
    }

    @Test
    void update() {
        InstallmentEntity installment = installmentRepository.findById(1L).orElse(null);
        assertNotNull(installment);
        installment.setStatus(InstallmentEntity.InstallmentStatus.COMPLETED);
        installmentRepository.save(installment);

        InstallmentEntity updatedInstallment = installmentRepository.findById(1L).orElse(null);
        assertNotNull(updatedInstallment);
        assertEquals(InstallmentEntity.InstallmentStatus.COMPLETED, updatedInstallment.getStatus());
    }

    @Test
    void deleteById() {
        installmentRepository.deleteById(1L);
        assertEquals(2, installmentRepository.findAll().size());
    }
}