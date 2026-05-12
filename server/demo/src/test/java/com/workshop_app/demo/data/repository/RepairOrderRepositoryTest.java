package com.workshop_app.demo.data.repository;

import com.workshop_app.demo.data.entity.RepairOrderEntity;
import com.workshop_app.demo.data.entity.ClientEntity;
import com.workshop_app.demo.data.entity.UserEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class RepairOrderRepositoryTest {

    @Autowired
    RepairOrderRepository repairOrderRepository;

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
        assertEquals(4, repairOrderRepository.findAll().size());
    }

    @Test
    void findById() {
        RepairOrderEntity order = repairOrderRepository.findById(1L).orElse(null);
        assertNotNull(order);
        assertEquals(RepairOrderEntity.RepairOrderStatus.PENDING, order.getStatus());
    }

    @Test
    void save() {
        ClientEntity client = clientRepository.findById(1L).orElse(null);
        UserEntity user = userRepository.findById(1L).orElse(null);
        
        RepairOrderEntity newOrder = new RepairOrderEntity();
        newOrder.setClient(client);
        newOrder.setCreatedBy(user);
        newOrder.setStatus(RepairOrderEntity.RepairOrderStatus.PENDING);
        newOrder.setTotal(BigDecimal.valueOf(100.0));
        newOrder.setAmountPaid(BigDecimal.ZERO);
        newOrder.setPendingAmount(BigDecimal.valueOf(100.0));
        
        RepairOrderEntity savedOrder = repairOrderRepository.save(newOrder);
        assertNotNull(savedOrder.getId());
        assertEquals(5, repairOrderRepository.findAll().size());
    }

    @Test
    void update() {
        RepairOrderEntity order = repairOrderRepository.findById(1L).orElse(null);
        assertNotNull(order);
        order.setStatus(RepairOrderEntity.RepairOrderStatus.COMPLETED);
        repairOrderRepository.save(order);

        RepairOrderEntity updatedOrder = repairOrderRepository.findById(1L).orElse(null);
        assertNotNull(updatedOrder);
        assertEquals(RepairOrderEntity.RepairOrderStatus.COMPLETED, updatedOrder.getStatus());
    }

    @Test
    void deleteById() {
        repairOrderRepository.deleteById(1L);
        assertEquals(3, repairOrderRepository.findAll().size());
    }
}