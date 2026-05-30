package com.workshop_app.demo.service;

import com.workshop_app.demo.service.dto.ClientDTO;
import com.workshop_app.demo.service.dto.RepairOrderDTO;

import java.util.List;

public interface RepairOrderService {

    List<RepairOrderDTO> findAll();

    RepairOrderDTO findById(Long id);

    List<RepairOrderDTO> findByClientName(String clientName);

    List<RepairOrderDTO> findByStatus(String status);

    List<RepairOrderDTO> findByClientNumber(String clientNumber);
    List<RepairOrderDTO> findByComment(String comment);

    RepairOrderDTO create(RepairOrderDTO request);

    RepairOrderDTO update(Long id, RepairOrderDTO request);

    void deleteById(Long id);

    boolean existsByClientName(String clientName);

    boolean existsByStatus(String status);

    boolean existsByClientNumber(String clientNumber);
    boolean existsByComment(String comment);
}
