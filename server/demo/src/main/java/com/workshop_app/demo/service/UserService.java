package com.workshop_app.demo.service;

import com.workshop_app.demo.service.dto.UserDTO;

import java.util.List;

public interface UserService {
    List<UserDTO> findAll();

    UserDTO findById(Long id);

    UserDTO findByEmail(String email);

    UserDTO update(Long id, UserDTO request);

    void deleteById(Long id);

    boolean existsByEmail(String email);
}
