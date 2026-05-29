package com.workshop_app.demo.service;

import com.workshop_app.demo.data.entity.ServiceEntity;
import com.workshop_app.demo.service.dto.ServiceDTO;

import java.util.List;

public interface ServiceService {
    List<ServiceDTO> findAll();

    ServiceDTO findById(Long id);

    ServiceDTO findByName(String name);

    List<ServiceDTO> findByCategory(ServiceEntity.ServiceCategory category);

    List<ServiceDTO> findActive();

    ServiceDTO create(ServiceDTO request);

    ServiceDTO update(Long id, ServiceDTO request);

    void deleteById(Long id);

    boolean existsByName(String name);
}
