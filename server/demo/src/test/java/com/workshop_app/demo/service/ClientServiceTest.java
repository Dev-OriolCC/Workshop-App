package com.workshop_app.demo.service;

import com.workshop_app.demo.data.entity.ClientEntity;
import com.workshop_app.demo.data.repository.ClientRepository;
import com.workshop_app.demo.data.repository.InstallmentRepository;
import com.workshop_app.demo.data.repository.RepairOrderRepository;
import com.workshop_app.demo.service.dto.ClientDTO;
import com.workshop_app.demo.service.exception.InvalidRequestException;
import com.workshop_app.demo.service.exception.ResourceInUseException;
import com.workshop_app.demo.service.exception.ResourceNotFoundException;
import com.workshop_app.demo.service.impl.ClientServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClientServiceTest {

    @Mock
    ClientRepository clientRepository;

    @Mock
    RepairOrderRepository repairOrderRepository;

    @Mock
    InstallmentRepository installmentRepository;

    @InjectMocks
    ClientServiceImpl clientService;

    @Test
    void findAllMapsEntitiesToDTOs() {
        when(clientRepository.findAll()).thenReturn(List.of(
                client(1L, "Roberto Garcia", "Beto", "+525559001001", "beto@email.test", "Frequent customer"),
                client(2L, "Maria Lopez", "Mari", "+525559001002", "mari@email.test", null)
        ));

        List<ClientDTO> clients = clientService.findAll();

        assertEquals(2, clients.size());
        assertEquals(1L, clients.get(0).getId());
        assertEquals("Roberto Garcia", clients.get(0).getName());
        assertEquals("Beto", clients.get(0).getAlias());
        assertEquals("+525559001001", clients.get(0).getPhone());
        assertEquals("beto@email.test", clients.get(0).getEmail());
    }

    @Test
    void findByIdReturnsDTO() {
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client(1L, "Roberto Garcia", "Beto", null, null, null)));

        ClientDTO client = clientService.findById(1L);

        assertEquals(1L, client.getId());
        assertEquals("Roberto Garcia", client.getName());
    }

    @Test
    void findByIdThrowsWhenMissing() {
        when(clientRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> clientService.findById(99L));
    }

    @Test
    void findByEmailNormalizesInputAndReturnsList() {
        when(clientRepository.findAllByEmail("client@email.test"))
                .thenReturn(List.of(client(1L, "Client One", null, null, "client@email.test", null)));

        List<ClientDTO> clients = clientService.findByEmail(" Client@Email.Test ");

        assertEquals(1, clients.size());
        assertEquals("client@email.test", clients.get(0).getEmail());
        verify(clientRepository).findAllByEmail("client@email.test");
    }

    @Test
    void findByPhoneCanonicalizesInputAndReturnsList() {
        when(clientRepository.findAllByPhone("+13214444444"))
                .thenReturn(List.of(client(1L, "Client One", null, "+13214444444", null, null)));

        List<ClientDTO> clients = clientService.findByPhone("+1 (321) 444-4444");

        assertEquals(1, clients.size());
        assertEquals("+13214444444", clients.get(0).getPhone());
        verify(clientRepository).findAllByPhone("+13214444444");
    }

    @Test
    void findByNameTrimsInputAndReturnsList() {
        when(clientRepository.findAllByName("Roberto Garcia"))
                .thenReturn(List.of(client(1L, "Roberto Garcia", null, null, null, null)));

        List<ClientDTO> clients = clientService.findByName(" Roberto Garcia ");

        assertEquals(1, clients.size());
        assertEquals("Roberto Garcia", clients.get(0).getName());
        verify(clientRepository).findAllByName("Roberto Garcia");
    }

    @Test
    void createTrimsNormalizesAndSaves() {
        when(clientRepository.save(any(ClientEntity.class))).thenAnswer(invocation -> {
            ClientEntity client = invocation.getArgument(0);
            client.setId(6L);
            return client;
        });

        ClientDTO createdClient = clientService.create(new ClientDTO(null, " New Client ", " Alias ", " +1 3214444444 ", " CLIENT@Email.Test ", " Comment ", null));

        assertEquals(6L, createdClient.getId());
        assertEquals("New Client", createdClient.getName());
        assertEquals("Alias", createdClient.getAlias());
        assertEquals("+13214444444", createdClient.getPhone());
        assertEquals("client@email.test", createdClient.getEmail());
        assertEquals("Comment", createdClient.getComment());

        ArgumentCaptor<ClientEntity> clientCaptor = ArgumentCaptor.forClass(ClientEntity.class);
        verify(clientRepository).save(clientCaptor.capture());
        assertEquals("+13214444444", clientCaptor.getValue().getPhone());
    }

    @Test
    void createConvertsBlankOptionalFieldsToNull() {
        when(clientRepository.save(any(ClientEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ClientDTO createdClient = clientService.create(new ClientDTO(null, "Client", " ", " ", " ", " ", null));

        assertNull(createdClient.getAlias());
        assertNull(createdClient.getPhone());
        assertNull(createdClient.getEmail());
        assertNull(createdClient.getComment());
    }

    @Test
    void createRejectsBlankNameInvalidEmailAndInvalidPhone() {
        assertThrows(InvalidRequestException.class, () -> clientService.create(new ClientDTO(null, " ", null, null, null, null, null)));
        assertThrows(InvalidRequestException.class, () -> clientService.create(new ClientDTO(null, "Client", null, null, "not-email", null, null)));
        assertThrows(InvalidRequestException.class, () -> clientService.create(new ClientDTO(null, "Client", null, "3214444444", null, null, null)));
        assertThrows(InvalidRequestException.class, () -> clientService.create(new ClientDTO(null, "Client", null, "+1 123", null, null, null)));
        verify(clientRepository, never()).save(any(ClientEntity.class));
    }

    @Test
    void updateTrimsNormalizesAndSaves() {
        ClientEntity existingClient = client(1L, "Old Name", null, null, null, null);
        when(clientRepository.findById(1L)).thenReturn(Optional.of(existingClient));
        when(clientRepository.save(existingClient)).thenReturn(existingClient);

        ClientDTO updatedClient = clientService.update(1L, new ClientDTO(null, " Updated Name ", " Alias ", "+52 555 900 1001", " UPDATED@Email.Test ", " Updated comment ", null));

        assertEquals(1L, updatedClient.getId());
        assertEquals("Updated Name", updatedClient.getName());
        assertEquals("Alias", updatedClient.getAlias());
        assertEquals("+525559001001", updatedClient.getPhone());
        assertEquals("updated@email.test", updatedClient.getEmail());
        assertEquals("Updated comment", updatedClient.getComment());
    }

    @Test
    void updateThrowsWhenClientIsMissing() {
        when(clientRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> clientService.update(99L, new ClientDTO(null, "Client", null, null, null, null, null)));
    }

    @Test
    void updateRejectsBlankNameInvalidEmailAndInvalidPhone() {
        assertThrows(InvalidRequestException.class, () -> clientService.update(1L, new ClientDTO(null, " ", null, null, null, null, null)));
        assertThrows(InvalidRequestException.class, () -> clientService.update(1L, new ClientDTO(null, "Client", null, null, "invalid", null, null)));
        assertThrows(InvalidRequestException.class, () -> clientService.update(1L, new ClientDTO(null, "Client", null, "555-1234", null, null, null)));
        verify(clientRepository, never()).save(any(ClientEntity.class));
    }

    @Test
    void deleteByIdSucceedsWhenUnused() {
        when(clientRepository.findById(5L)).thenReturn(Optional.of(client(5L, "Juan Castillo", null, null, null, null)));
        when(repairOrderRepository.existsByClient_Id(5L)).thenReturn(false);
        when(installmentRepository.existsByClient_Id(5L)).thenReturn(false);

        clientService.deleteById(5L);

        verify(clientRepository).deleteById(5L);
    }

    @Test
    void deleteByIdThrowsWhenReferencedByRepairOrders() {
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client(1L, "Roberto Garcia", null, null, null, null)));
        when(repairOrderRepository.existsByClient_Id(1L)).thenReturn(true);

        assertThrows(ResourceInUseException.class, () -> clientService.deleteById(1L));
        verify(clientRepository, never()).deleteById(any());
    }

    @Test
    void deleteByIdThrowsWhenReferencedByInstallments() {
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client(1L, "Roberto Garcia", null, null, null, null)));
        when(repairOrderRepository.existsByClient_Id(1L)).thenReturn(false);
        when(installmentRepository.existsByClient_Id(1L)).thenReturn(true);

        assertThrows(ResourceInUseException.class, () -> clientService.deleteById(1L));
        verify(clientRepository, never()).deleteById(any());
    }

    @Test
    void existsHelpersNormalizeInputsBeforeChecking() {
        when(clientRepository.existsByEmail("client@email.test")).thenReturn(true);
        when(clientRepository.existsByPhone("+13214444444")).thenReturn(true);
        when(clientRepository.existsByName("Client Name")).thenReturn(true);

        assertTrue(clientService.existsByEmail(" Client@Email.Test "));
        assertTrue(clientService.existsByPhone("+1 3214444444"));
        assertTrue(clientService.existsByName(" Client Name "));

        verify(clientRepository).existsByEmail("client@email.test");
        verify(clientRepository).existsByPhone("+13214444444");
        verify(clientRepository).existsByName("Client Name");
    }

    private ClientEntity client(Long id, String name, String alias, String phone, String email, String comment) {
        ClientEntity client = new ClientEntity();
        client.setId(id);
        client.setName(name);
        client.setAlias(alias);
        client.setPhone(phone);
        client.setEmail(email);
        client.setComment(comment);
        client.setCreatedAt(LocalDateTime.of(2026, 1, 1, 0, 0));
        return client;
    }
}
