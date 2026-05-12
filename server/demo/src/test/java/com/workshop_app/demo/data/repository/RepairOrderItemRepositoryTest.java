package com.workshop_app.demo.data.repository;

import com.workshop_app.demo.data.entity.RepairOrderItemEntity;
import com.workshop_app.demo.data.entity.RepairOrderEntity;
import com.workshop_app.demo.data.entity.ServiceEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class RepairOrderItemRepositoryTest {

    @Autowired
    RepairOrderItemRepository repairOrderItemRepository;

    @Autowired
    RepairOrderRepository repairOrderRepository;

    @Autowired
    ServiceRepository serviceRepository;

    @Autowired
    KnownGoodState knownGoodState;

    @BeforeEach
    void setUp() {
        knownGoodState.set();
    }

    @Test
    void findAll() {
        assertEquals(6, repairOrderItemRepository.findAll().size());
    }

    @Test
    void findById() {
        RepairOrderItemEntity item = repairOrderItemRepository.findById(1L).orElse(null);
        assertNotNull(item);
        assertEquals(1, item.getQuantity());
    }

    @Test
    void save() {
        RepairOrderEntity order = repairOrderRepository.findById(1L).orElse(null);
        ServiceEntity service = serviceRepository.findById(1L).orElse(null);
        
        RepairOrderItemEntity newItem = new RepairOrderItemEntity();
        newItem.setRepairOrder(order);
        newItem.setService(service);
        newItem.setQuantity(2);
        newItem.setUnitPrice(BigDecimal.valueOf(50.0));
        newItem.setSubtotal(BigDecimal.valueOf(100.0));
        
        RepairOrderItemEntity savedItem = repairOrderItemRepository.save(newItem);
        assertNotNull(savedItem.getId());
        assertEquals(7, repairOrderItemRepository.findAll().size());
    }

    @Test
    void update() {
        RepairOrderItemEntity item = repairOrderItemRepository.findById(1L).orElse(null);
        assertNotNull(item);
        item.setQuantity(5);
        repairOrderItemRepository.save(item);

        RepairOrderItemEntity updatedItem = repairOrderItemRepository.findById(1L).orElse(null);
        assertNotNull(updatedItem);
        assertEquals(5, updatedItem.getQuantity());
    }

    @Test
    void deleteById() {
        repairOrderItemRepository.deleteById(1L);
        assertEquals(5, repairOrderItemRepository.findAll().size());
    }
}