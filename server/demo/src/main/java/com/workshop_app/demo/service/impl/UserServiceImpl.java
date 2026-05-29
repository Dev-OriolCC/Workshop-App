package com.workshop_app.demo.service.impl;

import com.workshop_app.demo.data.entity.RoleEntity;
import com.workshop_app.demo.data.entity.UserEntity;
import com.workshop_app.demo.data.repository.InstallmentRepository;
import com.workshop_app.demo.data.repository.RepairOrderRepository;
import com.workshop_app.demo.data.repository.RoleRepository;
import com.workshop_app.demo.data.repository.UserRepository;
import com.workshop_app.demo.service.UserService;
import com.workshop_app.demo.service.dto.UserDTO;
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
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RepairOrderRepository repairOrderRepository;
    private final InstallmentRepository installmentRepository;

    public UserServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            RepairOrderRepository repairOrderRepository,
            InstallmentRepository installmentRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.repairOrderRepository = repairOrderRepository;
        this.installmentRepository = installmentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> findAll() {
        return userRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO findById(Long id) {
        return userRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO findByEmail(String email) {
        String normalizedEmail = normalizeEmail(email);
        return userRepository.findByEmail(normalizedEmail)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + normalizedEmail));
    }

    @Override
    public UserDTO update(Long id, UserDTO request) {
        ValidatedUserRequest validatedRequest = validateRequest(request);
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        userRepository.findByEmail(validatedRequest.email())
                .filter(existingUser -> !Objects.equals(existingUser.getId(), id))
                .ifPresent(existingUser -> {
                    throw new DuplicateResourceException("User already exists with email: " + validatedRequest.email());
                });

        RoleEntity role = roleRepository.findById(validatedRequest.roleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + validatedRequest.roleId()));

        user.setRole(role);
        user.setName(validatedRequest.name());
        user.setEmail(validatedRequest.email());
        user.setPhone(validatedRequest.phone());
        return toDTO(userRepository.save(user));
    }

    @Override
    public void deleteById(Long id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (repairOrderRepository.existsByCreatedBy_Id(user.getId())
                || installmentRepository.existsByCreatedBy_Id(user.getId())) {
            throw new ResourceInUseException("User has created repair orders or installments and cannot be deleted: " + user.getEmail());
        }

        userRepository.deleteById(user.getId());
    }

    // Helpful methods
    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(normalizeEmail(email));
    }

    private ValidatedUserRequest validateRequest(UserDTO request) {
        if (request == null) {
            throw new InvalidRequestException("User request is required");
        }
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new InvalidRequestException("User name is required");
        }
        if (request.getRoleId() == null) {
            throw new InvalidRequestException("User role id is required");
        }

        return new ValidatedUserRequest(
                request.getName().trim(),
                normalizeEmail(request.getEmail()),
                normalizePhone(request.getPhone()),
                request.getRoleId()
        );
    }

    private String normalizeEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new InvalidRequestException("User email is required");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizePhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return null;
        }
        return phone.trim();
    }

    private UserDTO toDTO(UserEntity user) {
        RoleEntity role = user.getRole();
        return new UserDTO(
                user.getId(),
                role == null ? null : role.getId(),
                role == null ? null : role.getRoleName(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getCreatedAt()
        );
    }

    private record ValidatedUserRequest(String name, String email, String phone, Long roleId) {
    }
}
