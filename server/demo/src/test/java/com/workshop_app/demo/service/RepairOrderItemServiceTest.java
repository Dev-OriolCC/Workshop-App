package com.workshop_app.demo.service;

import com.workshop_app.demo.data.entity.ClientEntity;
import com.workshop_app.demo.data.entity.RepairOrderEntity;
import com.workshop_app.demo.data.entity.RepairOrderItemEntity;
import com.workshop_app.demo.data.entity.ServiceEntity;
import com.workshop_app.demo.data.repository.RepairOrderItemRepository;
import com.workshop_app.demo.data.repository.RepairOrderRepository;
import com.workshop_app.demo.data.repository.ServiceRepository;
import com.workshop_app.demo.service.dto.RepairOrderItemDTO;
import com.workshop_app.demo.service.exception.InvalidRequestException;
import com.workshop_app.demo.service.exception.ResourceNotFoundException;
import com.workshop_app.demo.service.impl.RepairOrderItemServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static com.workshop_app.demo.data.entity.RepairOrderEntity.RepairOrderStatus.IN_PROGRESS;
import static com.workshop_app.demo.data.entity.RepairOrderEntity.RepairOrderStatus.PENDING;
import static com.workshop_app.demo.data.entity.ServiceEntity.ServiceCategory.MAINTENANCE;
import static com.workshop_app.demo.data.entity.ServiceEntity.ServiceCategory.REEL_REPAIR;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RepairOrderItemServiceTest {

    @Mock
    RepairOrderItemRepository repairOrderItemRepository;

    @Mock
    RepairOrderRepository repairOrderRepository;

    @Mock
    ServiceRepository serviceRepository;

    @InjectMocks
    RepairOrderItemServiceImpl repairOrderItemService;

    @Test
    void findAllMapsItemRepairOrderClientAndServiceDisplayFields() {
        RepairOrderEntity repairOrder = repairOrder(1L, "Roberto Garcia", PENDING, BigDecimal.valueOf(350), BigDecimal.ZERO);
        ServiceEntity service = service(2L, "Full Reel Overhaul", REEL_REPAIR, BigDecimal.valueOf(350), true);
        when(repairOrderItemRepository.findAll()).thenReturn(List.of(item(3L, repairOrder, service, 1, BigDecimal.valueOf(350), BigDecimal.valueOf(350))));

        List<RepairOrderItemDTO> items = repairOrderItemService.findAll();

        assertEquals(1, items.size());
        assertEquals(3L, items.get(0).getId());
        assertEquals(1L, items.get(0).getRepairOrderId());
        assertEquals(2L, items.get(0).getServiceId());
        assertEquals(PENDING, items.get(0).getRepairOrderStatus());
        assertEquals("Roberto Garcia", items.get(0).getClientName());
        assertEquals("Full Reel Overhaul", items.get(0).getServiceName());
        assertEquals(REEL_REPAIR, items.get(0).getServiceCategory());
    }

    @Test
    void findByIdReturnsDTO() {
        RepairOrderEntity repairOrder = repairOrder(1L, "Roberto Garcia", PENDING, BigDecimal.valueOf(350), BigDecimal.ZERO);
        ServiceEntity service = service(2L, "Full Reel Overhaul", REEL_REPAIR, BigDecimal.valueOf(350), true);
        when(repairOrderItemRepository.findById(3L)).thenReturn(Optional.of(item(3L, repairOrder, service, 1, BigDecimal.valueOf(350), BigDecimal.valueOf(350))));

        RepairOrderItemDTO item = repairOrderItemService.findById(3L);

        assertEquals(3L, item.getId());
        assertEquals("Full Reel Overhaul", item.getServiceName());
    }

    @Test
    void findByIdThrowsWhenMissing() {
        when(repairOrderItemRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> repairOrderItemService.findById(99L));
    }

    @Test
    void findByRepairOrderIdServiceIdAndServiceNameReturnLists() {
        RepairOrderEntity repairOrder = repairOrder(1L, "Roberto Garcia", PENDING, BigDecimal.TEN, BigDecimal.ZERO);
        ServiceEntity service = service(2L, "General Cleaning", MAINTENANCE, BigDecimal.TEN, true);
        RepairOrderItemEntity item = item(3L, repairOrder, service, 1, BigDecimal.TEN, BigDecimal.TEN);
        when(repairOrderItemRepository.findAllByRepairOrder_Id(1L)).thenReturn(List.of(item));
        when(repairOrderItemRepository.findAllByService_Id(2L)).thenReturn(List.of(item));
        when(repairOrderItemRepository.findAllByService_NameContainingIgnoreCase("Cleaning")).thenReturn(List.of(item));

        assertEquals(1, repairOrderItemService.findByRepairOrderId(1L).size());
        assertEquals(1, repairOrderItemService.findByServiceId(2L).size());
        assertEquals(1, repairOrderItemService.findByServiceName(" Cleaning ").size());

        verify(repairOrderItemRepository).findAllByRepairOrder_Id(1L);
        verify(repairOrderItemRepository).findAllByService_Id(2L);
        verify(repairOrderItemRepository).findAllByService_NameContainingIgnoreCase("Cleaning");
    }

    @Test
    void createResolvesLinksSnapshotsPriceComputesSubtotalSavesAndSyncsTotals() {
        RepairOrderEntity repairOrder = repairOrder(1L, "Roberto Garcia", PENDING, BigDecimal.valueOf(100), BigDecimal.valueOf(50));
        ServiceEntity service = service(2L, "General Cleaning", MAINTENANCE, BigDecimal.valueOf(25), true);
        RepairOrderItemEntity existingItem = item(4L, repairOrder, service, 4, BigDecimal.valueOf(25), BigDecimal.valueOf(100));
        when(repairOrderRepository.findById(1L)).thenReturn(Optional.of(repairOrder));
        when(serviceRepository.findById(2L)).thenReturn(Optional.of(service));
        when(repairOrderItemRepository.findAllByRepairOrder_Id(1L)).thenReturn(List.of(existingItem));
        when(repairOrderItemRepository.save(any(RepairOrderItemEntity.class))).thenAnswer(invocation -> {
            RepairOrderItemEntity savedItem = invocation.getArgument(0);
            savedItem.setId(5L);
            return savedItem;
        });

        RepairOrderItemDTO createdItem = repairOrderItemService.create(new RepairOrderItemDTO(
                null, 1L, 2L, null, null, null, null, 2, BigDecimal.valueOf(999), null
        ));

        assertEquals(5L, createdItem.getId());
        assertEquals(0, createdItem.getUnitPrice().compareTo(BigDecimal.valueOf(25)));
        assertEquals(0, createdItem.getSubtotal().compareTo(BigDecimal.valueOf(50)));
        assertEquals(0, repairOrder.getTotal().compareTo(BigDecimal.valueOf(150)));
        assertEquals(0, repairOrder.getPendingAmount().compareTo(BigDecimal.valueOf(100)));

        ArgumentCaptor<RepairOrderItemEntity> itemCaptor = ArgumentCaptor.forClass(RepairOrderItemEntity.class);
        verify(repairOrderItemRepository).save(itemCaptor.capture());
        assertSame(repairOrder, itemCaptor.getValue().getRepairOrder());
        assertSame(service, itemCaptor.getValue().getService());
        assertEquals(2, itemCaptor.getValue().getQuantity());
        verify(repairOrderRepository).save(repairOrder);
    }

    @Test
    void createRejectsMissingIdsMissingLinksInactiveServiceInvalidQuantityAndInvalidPrice() {
        assertThrows(InvalidRequestException.class, () -> repairOrderItemService.create(new RepairOrderItemDTO(
                null, null, 2L, null, null, null, null, 1, null, null
        )));
        assertThrows(InvalidRequestException.class, () -> repairOrderItemService.create(new RepairOrderItemDTO(
                null, 1L, null, null, null, null, null, 1, null, null
        )));
        assertThrows(InvalidRequestException.class, () -> repairOrderItemService.create(new RepairOrderItemDTO(
                null, 1L, 2L, null, null, null, null, 0, null, null
        )));

        when(repairOrderRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> repairOrderItemService.create(new RepairOrderItemDTO(
                null, 1L, 2L, null, null, null, null, 1, null, null
        )));

        RepairOrderEntity repairOrder = repairOrder(1L, "Roberto Garcia", PENDING, BigDecimal.ZERO, BigDecimal.ZERO);
        when(repairOrderRepository.findById(1L)).thenReturn(Optional.of(repairOrder));
        when(serviceRepository.findById(2L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> repairOrderItemService.create(new RepairOrderItemDTO(
                null, 1L, 2L, null, null, null, null, 1, null, null
        )));

        when(serviceRepository.findById(2L)).thenReturn(Optional.of(service(2L, "Inactive Service", MAINTENANCE, BigDecimal.TEN, false)));
        assertThrows(InvalidRequestException.class, () -> repairOrderItemService.create(new RepairOrderItemDTO(
                null, 1L, 2L, null, null, null, null, 1, null, null
        )));

        when(serviceRepository.findById(2L)).thenReturn(Optional.of(service(2L, "No Price", MAINTENANCE, null, true)));
        assertThrows(InvalidRequestException.class, () -> repairOrderItemService.create(new RepairOrderItemDTO(
                null, 1L, 2L, null, null, null, null, 1, null, null
        )));

        when(serviceRepository.findById(2L)).thenReturn(Optional.of(service(2L, "Negative Price", MAINTENANCE, BigDecimal.valueOf(-1), true)));
        assertThrows(InvalidRequestException.class, () -> repairOrderItemService.create(new RepairOrderItemDTO(
                null, 1L, 2L, null, null, null, null, 1, null, null
        )));

        verify(repairOrderItemRepository, never()).save(any(RepairOrderItemEntity.class));
    }

    @Test
    void createRejectsWhenNewTotalWouldBeLessThanAmountPaid() {
        RepairOrderEntity repairOrder = repairOrder(1L, "Roberto Garcia", PENDING, BigDecimal.valueOf(100), BigDecimal.valueOf(200));
        ServiceEntity service = service(2L, "General Cleaning", MAINTENANCE, BigDecimal.valueOf(25), true);
        when(repairOrderRepository.findById(1L)).thenReturn(Optional.of(repairOrder));
        when(serviceRepository.findById(2L)).thenReturn(Optional.of(service));
        when(repairOrderItemRepository.findAllByRepairOrder_Id(1L)).thenReturn(List.of(
                item(4L, repairOrder, service, 4, BigDecimal.valueOf(25), BigDecimal.valueOf(100))
        ));

        assertThrows(InvalidRequestException.class, () -> repairOrderItemService.create(new RepairOrderItemDTO(
                null, 1L, 2L, null, null, null, null, 2, null, null
        )));
        verify(repairOrderItemRepository, never()).save(any(RepairOrderItemEntity.class));
    }

    @Test
    void updateChangesLinksQuantityRecomputesPriceSubtotalAndSyncsTotals() {
        RepairOrderEntity repairOrder = repairOrder(1L, "Roberto Garcia", IN_PROGRESS, BigDecimal.valueOf(100), BigDecimal.valueOf(50));
        ServiceEntity oldService = service(2L, "Old Service", MAINTENANCE, BigDecimal.valueOf(25), true);
        ServiceEntity newService = service(3L, "Full Reel Overhaul", REEL_REPAIR, BigDecimal.valueOf(80), true);
        RepairOrderItemEntity existingItem = item(5L, repairOrder, oldService, 4, BigDecimal.valueOf(25), BigDecimal.valueOf(100));
        RepairOrderItemEntity otherItem = item(6L, repairOrder, oldService, 1, BigDecimal.valueOf(20), BigDecimal.valueOf(20));
        when(repairOrderItemRepository.findById(5L)).thenReturn(Optional.of(existingItem));
        when(repairOrderRepository.findById(1L)).thenReturn(Optional.of(repairOrder));
        when(serviceRepository.findById(3L)).thenReturn(Optional.of(newService));
        when(repairOrderItemRepository.findAllByRepairOrder_Id(1L)).thenReturn(List.of(existingItem, otherItem));
        when(repairOrderItemRepository.save(existingItem)).thenReturn(existingItem);

        RepairOrderItemDTO updatedItem = repairOrderItemService.update(5L, new RepairOrderItemDTO(
                null, 1L, 3L, null, null, null, null, 2, null, null
        ));

        assertEquals(5L, updatedItem.getId());
        assertEquals("Full Reel Overhaul", updatedItem.getServiceName());
        assertEquals(2, updatedItem.getQuantity());
        assertEquals(0, updatedItem.getUnitPrice().compareTo(BigDecimal.valueOf(80)));
        assertEquals(0, updatedItem.getSubtotal().compareTo(BigDecimal.valueOf(160)));
        assertEquals(0, repairOrder.getTotal().compareTo(BigDecimal.valueOf(180)));
        assertEquals(0, repairOrder.getPendingAmount().compareTo(BigDecimal.valueOf(130)));
        verify(repairOrderRepository).save(repairOrder);
    }

    @Test
    void updateThrowsWhenItemIsMissing() {
        when(repairOrderItemRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> repairOrderItemService.update(99L, new RepairOrderItemDTO(
                null, 1L, 2L, null, null, null, null, 1, null, null
        )));
    }

    @Test
    void updateRejectsWhenNewTotalWouldBeLessThanAmountPaid() {
        RepairOrderEntity repairOrder = repairOrder(1L, "Roberto Garcia", IN_PROGRESS, BigDecimal.valueOf(150), BigDecimal.valueOf(120));
        ServiceEntity oldService = service(2L, "Old Service", MAINTENANCE, BigDecimal.valueOf(100), true);
        ServiceEntity newService = service(3L, "Small Service", MAINTENANCE, BigDecimal.TEN, true);
        RepairOrderItemEntity existingItem = item(5L, repairOrder, oldService, 1, BigDecimal.valueOf(100), BigDecimal.valueOf(100));
        RepairOrderItemEntity otherItem = item(6L, repairOrder, oldService, 1, BigDecimal.valueOf(50), BigDecimal.valueOf(50));
        when(repairOrderItemRepository.findById(5L)).thenReturn(Optional.of(existingItem));
        when(repairOrderRepository.findById(1L)).thenReturn(Optional.of(repairOrder));
        when(serviceRepository.findById(3L)).thenReturn(Optional.of(newService));
        when(repairOrderItemRepository.findAllByRepairOrder_Id(1L)).thenReturn(List.of(existingItem, otherItem));

        assertThrows(InvalidRequestException.class, () -> repairOrderItemService.update(5L, new RepairOrderItemDTO(
                null, 1L, 3L, null, null, null, null, 1, null, null
        )));
        verify(repairOrderItemRepository, never()).save(any(RepairOrderItemEntity.class));
    }

    @Test
    void deleteByIdDeletesItemAndSyncsTotals() {
        RepairOrderEntity repairOrder = repairOrder(1L, "Roberto Garcia", PENDING, BigDecimal.valueOf(150), BigDecimal.valueOf(25));
        ServiceEntity service = service(2L, "General Cleaning", MAINTENANCE, BigDecimal.valueOf(50), true);
        RepairOrderItemEntity deletedItem = item(5L, repairOrder, service, 1, BigDecimal.valueOf(50), BigDecimal.valueOf(50));
        RepairOrderItemEntity remainingItem = item(6L, repairOrder, service, 2, BigDecimal.valueOf(50), BigDecimal.valueOf(100));
        when(repairOrderItemRepository.findById(5L)).thenReturn(Optional.of(deletedItem));
        when(repairOrderItemRepository.findAllByRepairOrder_Id(1L)).thenReturn(List.of(deletedItem, remainingItem));

        repairOrderItemService.deleteById(5L);

        verify(repairOrderItemRepository).deleteById(5L);
        assertEquals(0, repairOrder.getTotal().compareTo(BigDecimal.valueOf(100)));
        assertEquals(0, repairOrder.getPendingAmount().compareTo(BigDecimal.valueOf(75)));
        verify(repairOrderRepository).save(repairOrder);
    }

    @Test
    void deleteByIdRejectsWhenRemainingTotalWouldBeLessThanAmountPaid() {
        RepairOrderEntity repairOrder = repairOrder(1L, "Roberto Garcia", PENDING, BigDecimal.valueOf(125), BigDecimal.valueOf(100));
        ServiceEntity service = service(2L, "General Cleaning", MAINTENANCE, BigDecimal.valueOf(50), true);
        RepairOrderItemEntity deletedItem = item(5L, repairOrder, service, 2, BigDecimal.valueOf(50), BigDecimal.valueOf(100));
        RepairOrderItemEntity remainingItem = item(6L, repairOrder, service, 1, BigDecimal.valueOf(25), BigDecimal.valueOf(25));
        when(repairOrderItemRepository.findById(5L)).thenReturn(Optional.of(deletedItem));
        when(repairOrderItemRepository.findAllByRepairOrder_Id(1L)).thenReturn(List.of(deletedItem, remainingItem));

        assertThrows(InvalidRequestException.class, () -> repairOrderItemService.deleteById(5L));
        verify(repairOrderItemRepository, never()).deleteById(any());
        verify(repairOrderRepository, never()).save(any());
    }

    @Test
    void existsHelpersValidateIdsBeforeChecking() {
        when(repairOrderItemRepository.existsByRepairOrder_Id(1L)).thenReturn(true);
        when(repairOrderItemRepository.existsByService_Id(2L)).thenReturn(true);

        assertTrue(repairOrderItemService.existsByRepairOrderId(1L));
        assertTrue(repairOrderItemService.existsByServiceId(2L));
        assertThrows(InvalidRequestException.class, () -> repairOrderItemService.existsByRepairOrderId(null));
        assertThrows(InvalidRequestException.class, () -> repairOrderItemService.existsByServiceId(0L));

        verify(repairOrderItemRepository).existsByRepairOrder_Id(1L);
        verify(repairOrderItemRepository).existsByService_Id(2L);
    }

    @Test
    void lookupHelpersRejectInvalidInputs() {
        assertThrows(InvalidRequestException.class, () -> repairOrderItemService.findByRepairOrderId(0L));
        assertThrows(InvalidRequestException.class, () -> repairOrderItemService.findByServiceId(null));
        assertThrows(InvalidRequestException.class, () -> repairOrderItemService.findByServiceName(" "));
    }

    private RepairOrderItemEntity item(
            Long id,
            RepairOrderEntity repairOrder,
            ServiceEntity service,
            Integer quantity,
            BigDecimal unitPrice,
            BigDecimal subtotal) {
        RepairOrderItemEntity item = new RepairOrderItemEntity();
        item.setId(id);
        item.setRepairOrder(repairOrder);
        item.setService(service);
        item.setQuantity(quantity);
        item.setUnitPrice(unitPrice);
        item.setSubtotal(subtotal);
        return item;
    }

    private RepairOrderEntity repairOrder(
            Long id,
            String clientName,
            RepairOrderEntity.RepairOrderStatus status,
            BigDecimal total,
            BigDecimal amountPaid) {
        RepairOrderEntity repairOrder = new RepairOrderEntity();
        repairOrder.setId(id);
        repairOrder.setClient(client(clientName));
        repairOrder.setStatus(status);
        repairOrder.setTotal(total);
        repairOrder.setAmountPaid(amountPaid);
        repairOrder.setPendingAmount(total.subtract(amountPaid));
        return repairOrder;
    }

    private ClientEntity client(String name) {
        ClientEntity client = new ClientEntity();
        client.setName(name);
        return client;
    }

    private ServiceEntity service(Long id, String name, ServiceEntity.ServiceCategory category, BigDecimal price, Boolean active) {
        ServiceEntity service = new ServiceEntity();
        service.setId(id);
        service.setName(name);
        service.setCategory(category);
        service.setPrice(price);
        service.setActive(active);
        return service;
    }
}
