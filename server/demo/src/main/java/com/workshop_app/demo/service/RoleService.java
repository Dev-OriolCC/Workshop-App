package com.workshop_app.demo.service;

import com.workshop_app.demo.service.dto.RoleDTO;

import java.util.List;

public interface RoleService {
    List<RoleDTO> findAll();

    RoleDTO findById(Long id);

    RoleDTO findByName(String roleName);

    RoleDTO create(RoleDTO request);

    RoleDTO update(Long id, RoleDTO request);

    void deleteById(Long id);

    boolean existsByName(String roleName);
}
