package com.workshop_app.demo.data.repository;

import com.workshop_app.demo.data.entity.RoleEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class RoleRepositoryTest {

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    KnownGoodState knownGoodState;

    @BeforeEach
    void setUp() {
        knownGoodState.set();
    }

    @Test
    void findAll() {
        assertEquals(2, roleRepository.findAll().size());
    }

    @Test
    void findById() {
        RoleEntity role = roleRepository.findById(1L).orElse(null);
        assertNotNull(role);
        assertEquals("admin", role.getRoleName());
    }

    @Test
    void save() {
        RoleEntity newRole = new RoleEntity();
        newRole.setRoleName("manager");
        
        RoleEntity savedRole = roleRepository.save(newRole);
        assertNotNull(savedRole.getId());
        assertEquals("manager", savedRole.getRoleName());
        assertEquals(3, roleRepository.findAll().size());
    }

    @Test
    void update() {
        RoleEntity role = roleRepository.findById(1L).orElse(null);
        assertNotNull(role);
        role.setRoleName("superadmin_updated");
        roleRepository.save(role);

        RoleEntity updatedRole = roleRepository.findById(1L).orElse(null);
        assertNotNull(updatedRole);
        assertEquals("superadmin_updated", updatedRole.getRoleName());
    }

    @Test
    void deleteById() {
        roleRepository.deleteById(1L);
        assertEquals(1, roleRepository.findAll().size());
        assertFalse(roleRepository.findById(1L).isPresent());
    }
}