package com.workshop_app.demo.data.repository;

import com.workshop_app.demo.data.entity.ClientEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class ClientRepositoryTest {

    @Autowired
    ClientRepository clientRepository;

    @Autowired
    KnownGoodState knownGoodState;

    @BeforeEach
    void setUp() {
        knownGoodState.set();
    }

    @Test
    void findAll() {
        assertEquals(5, clientRepository.findAll().size());
    }

    @Test
    void findById() {
        ClientEntity client = clientRepository.findById(1L).orElse(null);
        assertNotNull(client);
        assertEquals("Roberto Garcia", client.getName());
    }

    @Test
    void save() {
        ClientEntity newClient = new ClientEntity();
        newClient.setName("New Client");
        
        ClientEntity savedClient = clientRepository.save(newClient);
        assertNotNull(savedClient.getId());
        assertEquals(6, clientRepository.findAll().size());
    }

    @Test
    void update() {
        ClientEntity client = clientRepository.findById(1L).orElse(null);
        assertNotNull(client);
        client.setName("Roberto Updated");
        clientRepository.save(client);

        ClientEntity updatedClient = clientRepository.findById(1L).orElse(null);
        assertNotNull(updatedClient);
        assertEquals("Roberto Updated", updatedClient.getName());
    }

    @Test
    void deleteById() {
        assertThrows(DataIntegrityViolationException.class, () -> {
            clientRepository.deleteById(1L);
            clientRepository.flush();
        });
        assertEquals(5, clientRepository.findAll().size());
    }
}
