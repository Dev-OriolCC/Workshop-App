package com.workshop_app.demo.service;

import com.workshop_app.demo.service.dto.ClientDTO;

import java.util.List;

public interface ClientService {
    List<ClientDTO> findAll();

    ClientDTO findById(Long id);

    List<ClientDTO> findByEmail(String email);

    List<ClientDTO> findByPhone(String phone);

    List<ClientDTO> findByName(String name);

    ClientDTO create(ClientDTO request);

    ClientDTO update(Long id, ClientDTO request);

    void deleteById(Long id);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    boolean existsByName(String name);
}
