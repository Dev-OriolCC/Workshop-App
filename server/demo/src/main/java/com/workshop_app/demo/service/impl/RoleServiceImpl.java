package com.workshop_app.demo.service.impl;

import com.workshop_app.demo.data.entity.RoleEntity;
import com.workshop_app.demo.data.repository.RoleRepository;
import com.workshop_app.demo.data.repository.UserRepository;
import com.workshop_app.demo.service.RoleService;
import com.workshop_app.demo.service.dto.RoleDTO;
import com.workshop_app.demo.service.exception.DuplicateResourceException;
import com.workshop_app.demo.service.exception.InvalidRequestException;
import com.workshop_app.demo.service.exception.ResourceInUseException;
import com.workshop_app.demo.service.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
@Transactional
public class RoleServiceImpl implements RoleService {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    public RoleServiceImpl(RoleRepository roleRepository, UserRepository userRepository) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleDTO> findAll() {
        return roleRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RoleDTO findById(Long id) {
        return roleRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public RoleDTO findByName(String roleName) {
        String normalizedRoleName = normalizeRoleName(roleName);
        return roleRepository.findByRoleName(normalizedRoleName)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with name: " + normalizedRoleName));
    }

    @Override
    public RoleDTO create(RoleDTO request) {
        String normalizedRoleName = normalizeRequestRoleName(request);
        if (roleRepository.existsByRoleName(normalizedRoleName)) {
            throw new DuplicateResourceException("Role already exists with name: " + normalizedRoleName);
        }

        RoleEntity role = new RoleEntity();
        role.setRoleName(normalizedRoleName);
        return toDTO(roleRepository.save(role));
    }

    @Override
    public RoleDTO update(Long id, RoleDTO request) {
        RoleEntity role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + id));
        String normalizedRoleName = normalizeRequestRoleName(request);

        roleRepository.findByRoleName(normalizedRoleName)
                .filter(existingRole -> !Objects.equals(existingRole.getId(), id))
                .ifPresent(existingRole -> {
                    throw new DuplicateResourceException("Role already exists with name: " + normalizedRoleName);
                });

        role.setRoleName(normalizedRoleName);
        return toDTO(roleRepository.save(role));
    }

    @Override
    public void deleteById(Long id) {
        RoleEntity role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + id));

        if (userRepository.existsByRole_Id(role.getId())) {
            throw new ResourceInUseException("Role is assigned to one or more users and cannot be deleted: " + role.getRoleName());
        }

        roleRepository.deleteById(role.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByName(String roleName) {
        return roleRepository.existsByRoleName(normalizeRoleName(roleName));
    }

    private String normalizeRequestRoleName(RoleDTO request) {
        if (request == null) {
            throw new InvalidRequestException("Role request is required");
        }
        return normalizeRoleName(request.getRoleName());
    }

    private String normalizeRoleName(String roleName) {
        if (roleName == null || roleName.trim().isEmpty()) {
            throw new InvalidRequestException("Role name is required");
        }
        return roleName.trim().toUpperCase(Locale.ROOT);
    }

    private RoleDTO toDTO(RoleEntity role) {
        return new RoleDTO(role.getId(), role.getRoleName());
    }
}
