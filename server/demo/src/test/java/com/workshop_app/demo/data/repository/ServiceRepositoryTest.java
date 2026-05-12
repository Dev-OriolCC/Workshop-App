package com.workshop_app.demo.data.repository;

import com.workshop_app.demo.data.entity.ServiceEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class ServiceRepositoryTest {

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
        assertEquals(6, serviceRepository.findAll().size());
    }

    @Test
    void findById() {
        ServiceEntity service = serviceRepository.findById(1L).orElse(null);
        assertNotNull(service);
        assertEquals("Full Reel Overhaul", service.getName());
    }

    @Test
    void save() {
        ServiceEntity newService = new ServiceEntity();
        newService.setName("New Service");
        newService.setCategory(ServiceEntity.ServiceCategory.OTHER);
        newService.setPrice(BigDecimal.valueOf(100.0));
        
        ServiceEntity savedService = serviceRepository.save(newService);
        assertNotNull(savedService.getId());
        assertEquals(7, serviceRepository.findAll().size());
    }

    @Test
    void update() {
        ServiceEntity service = serviceRepository.findById(1L).orElse(null);
        assertNotNull(service);
        service.setName("Updated Service");
        serviceRepository.save(service);

        ServiceEntity updatedService = serviceRepository.findById(1L).orElse(null);
        assertNotNull(updatedService);
        assertEquals("Updated Service", updatedService.getName());
    }

    @Test
    void deleteById() {
        serviceRepository.deleteById(1L);
        assertEquals(5, serviceRepository.findAll().size());
    }
}