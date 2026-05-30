package com.workshop_app.demo.service;

import com.workshop_app.demo.data.entity.ClientEntity;
import com.workshop_app.demo.data.entity.RepairOrderEntity;
import com.workshop_app.demo.data.entity.UserEntity;
import com.workshop_app.demo.data.repository.ClientRepository;
import com.workshop_app.demo.data.repository.RepairOrderRepository;
import com.workshop_app.demo.data.repository.UserRepository;
import com.workshop_app.demo.service.dto.RepairOrderDTO;
import com.workshop_app.demo.service.exception.InvalidRequestException;
import com.workshop_app.demo.service.exception.ResourceNotFoundException;
import com.workshop_app.demo.service.impl.RepairOrderServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static com.workshop_app.demo.data.entity.RepairOrderEntity.RepairOrderStatus.IN_PROGRESS;
import static com.workshop_app.demo.data.entity.RepairOrderEntity.RepairOrderStatus.PENDING;
import static com.workshop_app.demo.data.entity.RepairOrderEntity.RepairOrderStatus.READY;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RepairOrderServiceTest {

    @Mock
    RepairOrderRepository repairOrderRepository;

    @Mock
    ClientRepository clientRepository;

    @Mock
    UserRepository userRepository;

    @InjectMocks
    RepairOrderServiceImpl repairOrderService;

    @Test
    void findAllMapsEntitiesToDTOsWithClientUserAndFormattedDates() {
        when(repairOrderRepository.findAll()).thenReturn(List.of(
                repairOrder(1L, client(2L, "Roberto Garcia", "+13214444444"), user(3L, "Admin User"), READY,
                        "Ready for pickup", BigDecimal.valueOf(100), BigDecimal.valueOf(40), BigDecimal.valueOf(60))
        ));

        List<RepairOrderDTO> repairOrders = repairOrderService.findAll();

        assertEquals(1, repairOrders.size());
        assertEquals(1L, repairOrders.get(0).getId());
        assertEquals(2L, repairOrders.get(0).getClientId());
        assertEquals(3L, repairOrders.get(0).getCreatedById());
        assertEquals("Roberto Garcia", repairOrders.get(0).getClientName());
        assertEquals("Admin User", repairOrders.get(0).getCreatedBy());
        assertEquals("March 13, 2026", repairOrders.get(0).getCreatedAt());
        assertEquals("March 14, 2026", repairOrders.get(0).getUpdatedAt());
    }

    @Test
    void findByIdReturnsDTO() {
        when(repairOrderRepository.findById(1L)).thenReturn(Optional.of(
                repairOrder(1L, client(2L, "Roberto Garcia", "+13214444444"), user(3L, "Admin User"), PENDING,
                        null, BigDecimal.valueOf(100), BigDecimal.ZERO, BigDecimal.valueOf(100))
        ));

        RepairOrderDTO repairOrder = repairOrderService.findById(1L);

        assertEquals(1L, repairOrder.getId());
        assertEquals("Roberto Garcia", repairOrder.getClientName());
        assertEquals(PENDING, repairOrder.getStatus());
    }

    @Test
    void findByIdThrowsWhenMissing() {
        when(repairOrderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> repairOrderService.findById(99L));
    }

    @Test
    void findByStatusNormalizesInputBeforeLookup() {
        when(repairOrderRepository.findAllByStatus(IN_PROGRESS)).thenReturn(List.of(
                repairOrder(1L, client(2L, "Roberto Garcia", "+13214444444"), user(3L, "Admin User"), IN_PROGRESS,
                        null, BigDecimal.TEN, BigDecimal.ONE, BigDecimal.valueOf(9))
        ));

        List<RepairOrderDTO> repairOrders = repairOrderService.findByStatus(" in-progress ");

        assertEquals(1, repairOrders.size());
        assertEquals(IN_PROGRESS, repairOrders.get(0).getStatus());
        verify(repairOrderRepository).findAllByStatus(IN_PROGRESS);
    }

    @Test
    void findByClientNameClientNumberAndCommentNormalizeInputs() {
        when(repairOrderRepository.findAllByClient_NameContainingIgnoreCase("Roberto"))
                .thenReturn(List.of(repairOrder(1L, client(2L, "Roberto Garcia", "+13214444444"), user(3L, "Admin User"), PENDING,
                        "Handle repair", BigDecimal.TEN, BigDecimal.ONE, BigDecimal.valueOf(9))));
        when(repairOrderRepository.findAllByClient_Phone("+13214444444"))
                .thenReturn(List.of(repairOrder(2L, client(2L, "Roberto Garcia", "+13214444444"), user(3L, "Admin User"), READY,
                        "Pickup", BigDecimal.TEN, BigDecimal.TEN, BigDecimal.ZERO)));
        when(repairOrderRepository.findAllByCommentContainingIgnoreCase("pickup"))
                .thenReturn(List.of(repairOrder(2L, client(2L, "Roberto Garcia", "+13214444444"), user(3L, "Admin User"), READY,
                        "Pickup", BigDecimal.TEN, BigDecimal.TEN, BigDecimal.ZERO)));

        assertEquals(1, repairOrderService.findByClientName(" Roberto ").size());
        assertEquals(1, repairOrderService.findByClientNumber("+1 (321) 444-4444").size());
        assertEquals(1, repairOrderService.findByComment(" pickup ").size());

        verify(repairOrderRepository).findAllByClient_NameContainingIgnoreCase("Roberto");
        verify(repairOrderRepository).findAllByClient_Phone("+13214444444");
        verify(repairOrderRepository).findAllByCommentContainingIgnoreCase("pickup");
    }

    @Test
    void createResolvesClientAndUserValidatesAmountsComputesPendingAndSaves() {
        ClientEntity client = client(2L, "Roberto Garcia", "+13214444444");
        UserEntity user = user(3L, "Admin User");
        when(clientRepository.findById(2L)).thenReturn(Optional.of(client));
        when(userRepository.findById(3L)).thenReturn(Optional.of(user));
        when(repairOrderRepository.save(any(RepairOrderEntity.class))).thenAnswer(invocation -> {
            RepairOrderEntity repairOrder = invocation.getArgument(0);
            repairOrder.setId(8L);
            return repairOrder;
        });

        RepairOrderDTO createdRepairOrder = repairOrderService.create(new RepairOrderDTO(
                null, 2L, 3L, null, null, READY, " New order ", BigDecimal.valueOf(150),
                BigDecimal.valueOf(25), BigDecimal.valueOf(999), null, null
        ));

        assertEquals(8L, createdRepairOrder.getId());
        assertEquals("Roberto Garcia", createdRepairOrder.getClientName());
        assertEquals("Admin User", createdRepairOrder.getCreatedBy());
        assertEquals(0, createdRepairOrder.getPendingAmount().compareTo(BigDecimal.valueOf(125)));

        ArgumentCaptor<RepairOrderEntity> repairOrderCaptor = ArgumentCaptor.forClass(RepairOrderEntity.class);
        verify(repairOrderRepository).save(repairOrderCaptor.capture());
        assertSame(client, repairOrderCaptor.getValue().getClient());
        assertSame(user, repairOrderCaptor.getValue().getCreatedBy());
        assertEquals("New order", repairOrderCaptor.getValue().getComment());
        assertEquals(0, repairOrderCaptor.getValue().getPendingAmount().compareTo(BigDecimal.valueOf(125)));
    }

    @Test
    void createDefaultsNullStatusToPendingAndBlankCommentToNull() {
        when(clientRepository.findById(2L)).thenReturn(Optional.of(client(2L, "Roberto Garcia", "+13214444444")));
        when(userRepository.findById(3L)).thenReturn(Optional.of(user(3L, "Admin User")));
        when(repairOrderRepository.save(any(RepairOrderEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RepairOrderDTO createdRepairOrder = repairOrderService.create(new RepairOrderDTO(
                null, 2L, 3L, null, null, null, " ", BigDecimal.TEN, BigDecimal.ONE, null, null, null
        ));

        assertEquals(PENDING, createdRepairOrder.getStatus());
        assertNull(createdRepairOrder.getComment());
    }

    @Test
    void createRejectsMissingClientMissingUserAndInvalidAmounts() {
        assertThrows(InvalidRequestException.class, () -> repairOrderService.create(new RepairOrderDTO(
                null, null, 3L, null, null, PENDING, null, BigDecimal.TEN, BigDecimal.ONE, null, null, null
        )));
        assertThrows(InvalidRequestException.class, () -> repairOrderService.create(new RepairOrderDTO(
                null, 2L, null, null, null, PENDING, null, BigDecimal.TEN, BigDecimal.ONE, null, null, null
        )));
        assertThrows(InvalidRequestException.class, () -> repairOrderService.create(new RepairOrderDTO(
                null, 2L, 3L, null, null, PENDING, null, null, BigDecimal.ONE, null, null, null
        )));
        assertThrows(InvalidRequestException.class, () -> repairOrderService.create(new RepairOrderDTO(
                null, 2L, 3L, null, null, PENDING, null, BigDecimal.TEN, null, null, null, null
        )));
        assertThrows(InvalidRequestException.class, () -> repairOrderService.create(new RepairOrderDTO(
                null, 2L, 3L, null, null, PENDING, null, BigDecimal.valueOf(-1), BigDecimal.ZERO, null, null, null
        )));
        assertThrows(InvalidRequestException.class, () -> repairOrderService.create(new RepairOrderDTO(
                null, 2L, 3L, null, null, PENDING, null, BigDecimal.TEN, BigDecimal.valueOf(11), null, null, null
        )));
        verify(repairOrderRepository, never()).save(any(RepairOrderEntity.class));
    }

    @Test
    void createThrowsWhenClientOrUserIsMissing() {
        when(clientRepository.findById(2L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> repairOrderService.create(new RepairOrderDTO(
                null, 2L, 3L, null, null, PENDING, null, BigDecimal.TEN, BigDecimal.ONE, null, null, null
        )));

        when(clientRepository.findById(2L)).thenReturn(Optional.of(client(2L, "Roberto Garcia", "+13214444444")));
        when(userRepository.findById(3L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> repairOrderService.create(new RepairOrderDTO(
                null, 2L, 3L, null, null, PENDING, null, BigDecimal.TEN, BigDecimal.ONE, null, null, null
        )));
        verify(repairOrderRepository, never()).save(any(RepairOrderEntity.class));
    }

    @Test
    void updateAppliesEditableFieldsResolvesClientAndUserAndComputesPending() {
        RepairOrderEntity existingRepairOrder = repairOrder(1L, client(2L, "Old Client", "+13214444444"), user(3L, "Old User"), PENDING,
                "Old comment", BigDecimal.TEN, BigDecimal.ONE, BigDecimal.valueOf(9));
        ClientEntity newClient = client(4L, "New Client", "+525559001001");
        UserEntity newUser = user(5L, "New User");
        when(repairOrderRepository.findById(1L)).thenReturn(Optional.of(existingRepairOrder));
        when(clientRepository.findById(4L)).thenReturn(Optional.of(newClient));
        when(userRepository.findById(5L)).thenReturn(Optional.of(newUser));
        when(repairOrderRepository.save(existingRepairOrder)).thenReturn(existingRepairOrder);

        RepairOrderDTO updatedRepairOrder = repairOrderService.update(1L, new RepairOrderDTO(
                null, 4L, 5L, null, null, READY, " Updated comment ", BigDecimal.valueOf(200),
                BigDecimal.valueOf(50), null, null, null
        ));

        assertEquals(1L, updatedRepairOrder.getId());
        assertEquals("New Client", updatedRepairOrder.getClientName());
        assertEquals("New User", updatedRepairOrder.getCreatedBy());
        assertEquals(READY, updatedRepairOrder.getStatus());
        assertEquals("Updated comment", updatedRepairOrder.getComment());
        assertEquals(0, updatedRepairOrder.getPendingAmount().compareTo(BigDecimal.valueOf(150)));
    }

    @Test
    void updateThrowsWhenRepairOrderIsMissing() {
        when(repairOrderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> repairOrderService.update(99L, new RepairOrderDTO(
                null, 2L, 3L, null, null, PENDING, null, BigDecimal.TEN, BigDecimal.ONE, null, null, null
        )));
    }

    @Test
    void deleteByIdSucceedsAfterExistenceCheck() {
        when(repairOrderRepository.findById(7L)).thenReturn(Optional.of(
                repairOrder(7L, client(2L, "Roberto Garcia", "+13214444444"), user(3L, "Admin User"), PENDING,
                        null, BigDecimal.TEN, BigDecimal.ONE, BigDecimal.valueOf(9))
        ));

        repairOrderService.deleteById(7L);

        verify(repairOrderRepository).deleteById(7L);
    }

    @Test
    void deleteByIdThrowsWhenMissing() {
        when(repairOrderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> repairOrderService.deleteById(99L));
        verify(repairOrderRepository, never()).deleteById(any());
    }

    @Test
    void existsHelpersNormalizeInputsBeforeChecking() {
        when(repairOrderRepository.existsByClient_NameContainingIgnoreCase("Roberto")).thenReturn(true);
        when(repairOrderRepository.existsByStatus(IN_PROGRESS)).thenReturn(true);
        when(repairOrderRepository.existsByClient_Phone("+13214444444")).thenReturn(true);
        when(repairOrderRepository.existsByCommentContainingIgnoreCase("pickup")).thenReturn(true);

        assertTrue(repairOrderService.existsByClientName(" Roberto "));
        assertTrue(repairOrderService.existsByStatus(" in progress "));
        assertTrue(repairOrderService.existsByClientNumber("+1 3214444444"));
        assertTrue(repairOrderService.existsByComment(" pickup "));

        verify(repairOrderRepository).existsByClient_NameContainingIgnoreCase("Roberto");
        verify(repairOrderRepository).existsByStatus(IN_PROGRESS);
        verify(repairOrderRepository).existsByClient_Phone("+13214444444");
        verify(repairOrderRepository).existsByCommentContainingIgnoreCase("pickup");
    }

    @Test
    void lookupHelpersRejectInvalidInputs() {
        assertThrows(InvalidRequestException.class, () -> repairOrderService.findByStatus("not real"));
        assertThrows(InvalidRequestException.class, () -> repairOrderService.findByClientNumber("3214444444"));
        assertThrows(InvalidRequestException.class, () -> repairOrderService.findByClientName(" "));
        assertThrows(InvalidRequestException.class, () -> repairOrderService.findByComment(" "));
    }

    private RepairOrderEntity repairOrder(
            Long id,
            ClientEntity client,
            UserEntity createdBy,
            RepairOrderEntity.RepairOrderStatus status,
            String comment,
            BigDecimal total,
            BigDecimal amountPaid,
            BigDecimal pendingAmount) {
        RepairOrderEntity repairOrder = new RepairOrderEntity();
        repairOrder.setId(id);
        repairOrder.setClient(client);
        repairOrder.setCreatedBy(createdBy);
        repairOrder.setStatus(status);
        repairOrder.setComment(comment);
        repairOrder.setTotal(total);
        repairOrder.setAmountPaid(amountPaid);
        repairOrder.setPendingAmount(pendingAmount);
        repairOrder.setCreatedAt(LocalDateTime.of(2026, 3, 13, 8, 30));
        repairOrder.setUpdatedAt(LocalDateTime.of(2026, 3, 14, 9, 45));
        return repairOrder;
    }

    private ClientEntity client(Long id, String name, String phone) {
        ClientEntity client = new ClientEntity();
        client.setId(id);
        client.setName(name);
        client.setPhone(phone);
        return client;
    }

    private UserEntity user(Long id, String name) {
        UserEntity user = new UserEntity();
        user.setId(id);
        user.setName(name);
        return user;
    }
}
