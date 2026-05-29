package com.workshop_app.demo.service.impl;

import com.workshop_app.demo.data.entity.ServiceEntity;
import com.workshop_app.demo.data.repository.RepairOrderItemRepository;
import com.workshop_app.demo.data.repository.ServiceRepository;
import com.workshop_app.demo.service.ServiceService;
import com.workshop_app.demo.service.dto.ServiceDTO;
import com.workshop_app.demo.service.exception.DuplicateResourceException;
import com.workshop_app.demo.service.exception.InvalidRequestException;
import com.workshop_app.demo.service.exception.ResourceInUseException;
import com.workshop_app.demo.service.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

@Service
@Transactional
public class ServiceServiceImpl implements ServiceService {
    private final ServiceRepository serviceRepository;
    private final RepairOrderItemRepository repairOrderItemRepository;

    public ServiceServiceImpl(ServiceRepository serviceRepository, RepairOrderItemRepository repairOrderItemRepository) {
        this.serviceRepository = serviceRepository;
        this.repairOrderItemRepository = repairOrderItemRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceDTO> findAll() {
        return serviceRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceDTO findById(Long id) {
        return serviceRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceDTO findByName(String name) {
        String normalizedName = normalizeName(name);
        return serviceRepository.findByNameIgnoreCase(normalizedName)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with name: " + normalizedName));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceDTO> findByCategory(ServiceEntity.ServiceCategory category) {
        ServiceEntity.ServiceCategory normalizedCategory = normalizeCategory(category);
        return serviceRepository.findAllByCategory(normalizedCategory)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceDTO> findActive() {
        return serviceRepository.findAllByActiveTrue()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    public ServiceDTO create(ServiceDTO request) {
        ValidatedServiceRequest validatedRequest = validateRequest(request);
        if (serviceRepository.existsByNameIgnoreCase(validatedRequest.name())) {
            throw new DuplicateResourceException("Service already exists with name: " + validatedRequest.name());
        }

        ServiceEntity service = new ServiceEntity();
        applyRequest(service, validatedRequest);
        return toDTO(serviceRepository.save(service));
    }

    @Override
    public ServiceDTO update(Long id, ServiceDTO request) {
        ValidatedServiceRequest validatedRequest = validateRequest(request);
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));

        serviceRepository.findByNameIgnoreCase(validatedRequest.name())
                .filter(existingService -> !Objects.equals(existingService.getId(), id))
                .ifPresent(existingService -> {
                    throw new DuplicateResourceException("Service already exists with name: " + validatedRequest.name());
                });

        applyRequest(service, validatedRequest);
        return toDTO(serviceRepository.save(service));
    }

    @Override
    public void deleteById(Long id) {
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));

        if (repairOrderItemRepository.existsByService_Id(service.getId())) {
            throw new ResourceInUseException("Service is used by one or more repair order items and cannot be deleted: " + service.getName());
        }

        serviceRepository.deleteById(service.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByName(String name) {
        return serviceRepository.existsByNameIgnoreCase(normalizeName(name));
    }

    private ValidatedServiceRequest validateRequest(ServiceDTO request) {
        if (request == null) {
            throw new InvalidRequestException("Service request is required");
        }

        return new ValidatedServiceRequest(
                normalizeName(request.getName()),
                normalizeCategory(request.getCategory()),
                normalizePrice(request.getPrice()),
                normalizeActive(request.getActive())
        );
    }

    private String normalizeName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new InvalidRequestException("Service name is required");
        }
        return name.trim();
    }

    private ServiceEntity.ServiceCategory normalizeCategory(ServiceEntity.ServiceCategory category) {
        return category == null ? ServiceEntity.ServiceCategory.OTHER : category;
    }

    private BigDecimal normalizePrice(BigDecimal price) {
        if (price == null) {
            throw new InvalidRequestException("Service price is required");
        }
        if (price.compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidRequestException("Service price must be greater than or equal to zero");
        }
        return price;
    }

    private Boolean normalizeActive(Boolean active) {
        return active == null ? Boolean.TRUE : active;
    }

    private void applyRequest(ServiceEntity service, ValidatedServiceRequest request) {
        service.setName(request.name());
        service.setCategory(request.category());
        service.setPrice(request.price());
        service.setActive(request.active());
    }

    private ServiceDTO toDTO(ServiceEntity service) {
        return new ServiceDTO(
                service.getId(),
                service.getName(),
                service.getCategory(),
                service.getPrice(),
                service.getActive(),
                service.getCreatedAt()
        );
    }

    private record ValidatedServiceRequest(String name, ServiceEntity.ServiceCategory category, BigDecimal price, Boolean active) {
    }
}
