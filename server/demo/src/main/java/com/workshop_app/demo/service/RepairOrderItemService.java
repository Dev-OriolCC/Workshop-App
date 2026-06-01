package com.workshop_app.demo.service;

import com.workshop_app.demo.service.dto.RepairOrderItemDTO;

import java.util.List;

public interface RepairOrderItemService {
    List<RepairOrderItemDTO> findAll();

    RepairOrderItemDTO findById(Long id);

    List<RepairOrderItemDTO> findByRepairOrderId(Long repairOrderId);

    List<RepairOrderItemDTO> findByServiceId(Long serviceId);

    List<RepairOrderItemDTO> findByServiceName(String serviceName);

    RepairOrderItemDTO create(RepairOrderItemDTO request);

    RepairOrderItemDTO update(Long id, RepairOrderItemDTO request);

    void deleteById(Long id);

    boolean existsByRepairOrderId(Long repairOrderId);

    boolean existsByServiceId(Long serviceId);
}
