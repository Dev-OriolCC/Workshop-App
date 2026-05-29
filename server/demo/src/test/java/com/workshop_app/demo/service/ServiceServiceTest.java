package com.workshop_app.demo.service;

import com.workshop_app.demo.data.entity.ServiceEntity;
import com.workshop_app.demo.data.repository.RepairOrderItemRepository;
import com.workshop_app.demo.data.repository.ServiceRepository;
import com.workshop_app.demo.service.dto.ServiceDTO;
import com.workshop_app.demo.service.exception.DuplicateResourceException;
import com.workshop_app.demo.service.exception.InvalidRequestException;
import com.workshop_app.demo.service.exception.ResourceInUseException;
import com.workshop_app.demo.service.exception.ResourceNotFoundException;
import com.workshop_app.demo.service.impl.ServiceServiceImpl;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServiceServiceTest {

    @Mock
    ServiceRepository serviceRepository;

    @Mock
    RepairOrderItemRepository repairOrderItemRepository;

    @InjectMocks
    ServiceServiceImpl serviceService;

    @Test
    void findAllMapsEntitiesToDTOs() {
        when(serviceRepository.findAll()).thenReturn(List.of(
                service(1L, "Full Reel Overhaul", ServiceEntity.ServiceCategory.REEL_REPAIR, BigDecimal.valueOf(350), true),
                service(2L, "Rod Tip Repair", ServiceEntity.ServiceCategory.ROD_REPAIR, BigDecimal.valueOf(250), true)
        ));

        List<ServiceDTO> services = serviceService.findAll();

        assertEquals(2, services.size());
        assertEquals(1L, services.get(0).getId());
        assertEquals("Full Reel Overhaul", services.get(0).getName());
        assertEquals(ServiceEntity.ServiceCategory.REEL_REPAIR, services.get(0).getCategory());
        assertEquals(0, services.get(0).getPrice().compareTo(BigDecimal.valueOf(350)));
        assertTrue(services.get(0).getActive());
    }

    @Test
    void findByIdReturnsDTO() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service(1L, "Full Reel Overhaul", ServiceEntity.ServiceCategory.REEL_REPAIR, BigDecimal.valueOf(350), true)));

        ServiceDTO service = serviceService.findById(1L);

        assertEquals(1L, service.getId());
        assertEquals("Full Reel Overhaul", service.getName());
        assertEquals(ServiceEntity.ServiceCategory.REEL_REPAIR, service.getCategory());
    }

    @Test
    void findByIdThrowsWhenMissing() {
        when(serviceRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> serviceService.findById(99L));
    }

    @Test
    void findByNameTrimsAndUsesCaseInsensitiveLookup() {
        when(serviceRepository.findByNameIgnoreCase("Full Reel Overhaul"))
                .thenReturn(Optional.of(service(1L, "Full Reel Overhaul", ServiceEntity.ServiceCategory.REEL_REPAIR, BigDecimal.valueOf(350), true)));

        ServiceDTO service = serviceService.findByName(" Full Reel Overhaul ");

        assertEquals("Full Reel Overhaul", service.getName());
        verify(serviceRepository).findByNameIgnoreCase("Full Reel Overhaul");
    }

    @Test
    void findByCategoryReturnsMatchingServices() {
        when(serviceRepository.findAllByCategory(ServiceEntity.ServiceCategory.MAINTENANCE))
                .thenReturn(List.of(service(5L, "General Cleaning & Lube", ServiceEntity.ServiceCategory.MAINTENANCE, BigDecimal.valueOf(120), true)));

        List<ServiceDTO> services = serviceService.findByCategory(ServiceEntity.ServiceCategory.MAINTENANCE);

        assertEquals(1, services.size());
        assertEquals(ServiceEntity.ServiceCategory.MAINTENANCE, services.get(0).getCategory());
    }

    @Test
    void findByCategoryDefaultsNullToOther() {
        when(serviceRepository.findAllByCategory(ServiceEntity.ServiceCategory.OTHER))
                .thenReturn(List.of(service(6L, "Custom Handle Grip", ServiceEntity.ServiceCategory.OTHER, BigDecimal.valueOf(300), false)));

        List<ServiceDTO> services = serviceService.findByCategory(null);

        assertEquals(1, services.size());
        verify(serviceRepository).findAllByCategory(ServiceEntity.ServiceCategory.OTHER);
    }

    @Test
    void findActiveReturnsActiveServices() {
        when(serviceRepository.findAllByActiveTrue())
                .thenReturn(List.of(service(1L, "Full Reel Overhaul", ServiceEntity.ServiceCategory.REEL_REPAIR, BigDecimal.valueOf(350), true)));

        List<ServiceDTO> services = serviceService.findActive();

        assertEquals(1, services.size());
        assertTrue(services.get(0).getActive());
    }

    @Test
    void createTrimsDefaultsCategoryAndActiveValidatesPriceAndSaves() {
        when(serviceRepository.existsByNameIgnoreCase("New Service")).thenReturn(false);
        when(serviceRepository.save(any(ServiceEntity.class))).thenAnswer(invocation -> {
            ServiceEntity service = invocation.getArgument(0);
            service.setId(7L);
            return service;
        });

        ServiceDTO createdService = serviceService.create(new ServiceDTO(null, " New Service ", null, BigDecimal.ZERO, null, null));

        assertEquals(7L, createdService.getId());
        assertEquals("New Service", createdService.getName());
        assertEquals(ServiceEntity.ServiceCategory.OTHER, createdService.getCategory());
        assertEquals(0, createdService.getPrice().compareTo(BigDecimal.ZERO));
        assertTrue(createdService.getActive());

        ArgumentCaptor<ServiceEntity> serviceCaptor = ArgumentCaptor.forClass(ServiceEntity.class);
        verify(serviceRepository).save(serviceCaptor.capture());
        assertEquals("New Service", serviceCaptor.getValue().getName());
        assertEquals(ServiceEntity.ServiceCategory.OTHER, serviceCaptor.getValue().getCategory());
        assertTrue(serviceCaptor.getValue().getActive());
    }

    @Test
    void createRejectsDuplicateName() {
        when(serviceRepository.existsByNameIgnoreCase("Full Reel Overhaul")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> serviceService.create(new ServiceDTO(null, " Full Reel Overhaul ", ServiceEntity.ServiceCategory.REEL_REPAIR, BigDecimal.valueOf(350), true, null)));
        verify(serviceRepository, never()).save(any(ServiceEntity.class));
    }

    @Test
    void createRejectsBlankNameMissingPriceAndNegativePrice() {
        assertThrows(InvalidRequestException.class, () -> serviceService.create(new ServiceDTO(null, " ", ServiceEntity.ServiceCategory.OTHER, BigDecimal.ZERO, true, null)));
        assertThrows(InvalidRequestException.class, () -> serviceService.create(new ServiceDTO(null, "Service", ServiceEntity.ServiceCategory.OTHER, null, true, null)));
        assertThrows(InvalidRequestException.class, () -> serviceService.create(new ServiceDTO(null, "Service", ServiceEntity.ServiceCategory.OTHER, BigDecimal.valueOf(-1), true, null)));
        verify(serviceRepository, never()).save(any(ServiceEntity.class));
    }

    @Test
    void updateValidatesRejectsDuplicateOwnedByAnotherServiceAndSaves() {
        ServiceEntity existingService = service(1L, "Old Name", ServiceEntity.ServiceCategory.OTHER, BigDecimal.TEN, false);
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(existingService));
        when(serviceRepository.findByNameIgnoreCase("Updated Service")).thenReturn(Optional.empty());
        when(serviceRepository.save(existingService)).thenReturn(existingService);

        ServiceDTO updatedService = serviceService.update(1L, new ServiceDTO(null, " Updated Service ", ServiceEntity.ServiceCategory.MAINTENANCE, BigDecimal.valueOf(125), null, null));

        assertEquals(1L, updatedService.getId());
        assertEquals("Updated Service", updatedService.getName());
        assertEquals(ServiceEntity.ServiceCategory.MAINTENANCE, updatedService.getCategory());
        assertEquals(0, updatedService.getPrice().compareTo(BigDecimal.valueOf(125)));
        assertTrue(updatedService.getActive());
    }

    @Test
    void updateRejectsDuplicateNameOwnedByAnotherService() {
        when(serviceRepository.findById(2L)).thenReturn(Optional.of(service(2L, "Rod Tip Repair", ServiceEntity.ServiceCategory.ROD_REPAIR, BigDecimal.valueOf(250), true)));
        when(serviceRepository.findByNameIgnoreCase("Full Reel Overhaul"))
                .thenReturn(Optional.of(service(1L, "Full Reel Overhaul", ServiceEntity.ServiceCategory.REEL_REPAIR, BigDecimal.valueOf(350), true)));

        assertThrows(DuplicateResourceException.class, () -> serviceService.update(2L, new ServiceDTO(null, "Full Reel Overhaul", ServiceEntity.ServiceCategory.ROD_REPAIR, BigDecimal.valueOf(250), true, null)));
        verify(serviceRepository, never()).save(any(ServiceEntity.class));
    }

    @Test
    void updateThrowsWhenMissing() {
        when(serviceRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> serviceService.update(99L, new ServiceDTO(null, "Service", ServiceEntity.ServiceCategory.OTHER, BigDecimal.ZERO, true, null)));
    }

    @Test
    void deleteByIdSucceedsWhenUnused() {
        when(serviceRepository.findById(7L)).thenReturn(Optional.of(service(7L, "Unused Service", ServiceEntity.ServiceCategory.OTHER, BigDecimal.ZERO, true)));
        when(repairOrderItemRepository.existsByService_Id(7L)).thenReturn(false);

        serviceService.deleteById(7L);

        verify(serviceRepository).deleteById(7L);
    }

    @Test
    void deleteByIdThrowsWhenReferencedByRepairOrderItems() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service(1L, "Full Reel Overhaul", ServiceEntity.ServiceCategory.REEL_REPAIR, BigDecimal.valueOf(350), true)));
        when(repairOrderItemRepository.existsByService_Id(1L)).thenReturn(true);

        assertThrows(ResourceInUseException.class, () -> serviceService.deleteById(1L));
        verify(serviceRepository, never()).deleteById(any());
    }

    @Test
    void existsByNameTrimsAndChecksCaseInsensitively() {
        when(serviceRepository.existsByNameIgnoreCase("Full Reel Overhaul")).thenReturn(true);

        assertTrue(serviceService.existsByName(" Full Reel Overhaul "));
        verify(serviceRepository).existsByNameIgnoreCase("Full Reel Overhaul");
    }

    private ServiceEntity service(Long id, String name, ServiceEntity.ServiceCategory category, BigDecimal price, Boolean active) {
        ServiceEntity service = new ServiceEntity();
        service.setId(id);
        service.setName(name);
        service.setCategory(category);
        service.setPrice(price);
        service.setActive(active);
        service.setCreatedAt(LocalDateTime.of(2026, 1, 1, 0, 0));
        return service;
    }
}
