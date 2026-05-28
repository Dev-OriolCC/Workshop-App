package com.workshop_app.demo.data.repository;

import com.workshop_app.demo.data.entity.UserEntity;
import com.workshop_app.demo.data.entity.RoleEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class UserRepositoryTest {

    @Autowired
    UserRepository userRepository;

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
        assertEquals(3, userRepository.findAll().size());
    }

    @Test
    void findById() {
        UserEntity user = userRepository.findById(1L).orElse(null);
        assertNotNull(user);
        assertEquals("Carlos Mendoza", user.getName());
    }

    @Test
    void save() {
        RoleEntity role = roleRepository.findById(1L).orElse(null);
        UserEntity newUser = new UserEntity();
        newUser.setRole(role);
        newUser.setName("New User");
        newUser.setEmail("new@user.com");
        newUser.setPassword("password");
        
        UserEntity savedUser = userRepository.save(newUser);
        assertNotNull(savedUser.getId());
        assertEquals(4, userRepository.findAll().size());
    }

    @Test
    void update() {
        UserEntity user = userRepository.findById(1L).orElse(null);
        assertNotNull(user);
        user.setName("Carlos Updated");
        userRepository.save(user);

        UserEntity updatedUser = userRepository.findById(1L).orElse(null);
        assertNotNull(updatedUser);
        assertEquals("Carlos Updated", updatedUser.getName());
    }

    @Test
    void deleteById() {
        assertThrows(DataIntegrityViolationException.class, () -> {
            userRepository.deleteById(1L);
            userRepository.flush();
        });
        assertEquals(3, userRepository.findAll().size());
    }
}
