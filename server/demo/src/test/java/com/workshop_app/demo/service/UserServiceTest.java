package com.workshop_app.demo.service;

import com.workshop_app.demo.data.entity.RoleEntity;
import com.workshop_app.demo.data.entity.UserEntity;
import com.workshop_app.demo.data.repository.InstallmentRepository;
import com.workshop_app.demo.data.repository.RepairOrderRepository;
import com.workshop_app.demo.data.repository.RoleRepository;
import com.workshop_app.demo.data.repository.UserRepository;
import com.workshop_app.demo.service.dto.UserDTO;
import com.workshop_app.demo.service.exception.DuplicateResourceException;
import com.workshop_app.demo.service.exception.InvalidRequestException;
import com.workshop_app.demo.service.exception.ResourceInUseException;
import com.workshop_app.demo.service.exception.ResourceNotFoundException;
import com.workshop_app.demo.service.impl.UserServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    UserRepository userRepository;

    @Mock
    RoleRepository roleRepository;

    @Mock
    RepairOrderRepository repairOrderRepository;

    @Mock
    InstallmentRepository installmentRepository;

    @InjectMocks
    UserServiceImpl userService;

    @Test
    void userDTODoesNotExposePasswordField() {
        boolean hasPasswordField = Arrays.stream(UserDTO.class.getDeclaredFields())
                .map(Field::getName)
                .anyMatch("password"::equals);

        assertFalse(hasPasswordField);
    }

    @Test
    void findAllMapsUsersWithRoleInfoToDTOs() {
        RoleEntity admin = new RoleEntity(1L, "ADMIN");
        RoleEntity superadmin = new RoleEntity(2L, "SUPERADMIN");
        when(userRepository.findAll()).thenReturn(List.of(
                user(1L, admin, "Ana Torres", "ana@workshop.test", "+525551000002"),
                user(2L, superadmin, "Carlos Mendoza", "carlos@workshop.test", null)
        ));

        List<UserDTO> users = userService.findAll();

        assertEquals(2, users.size());
        assertEquals(1L, users.get(0).getId());
        assertEquals(1L, users.get(0).getRoleId());
        assertEquals("ADMIN", users.get(0).getRoleName());
        assertEquals("ana@workshop.test", users.get(0).getEmail());
        assertEquals(2L, users.get(1).getRoleId());
        assertEquals("SUPERADMIN", users.get(1).getRoleName());
    }

    @Test
    void findByIdReturnsDTO() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L, new RoleEntity(1L, "ADMIN"), "Ana Torres", "ana@workshop.test", null)));

        UserDTO user = userService.findById(1L);

        assertEquals(1L, user.getId());
        assertEquals("Ana Torres", user.getName());
        assertEquals("ADMIN", user.getRoleName());
    }

    @Test
    void findByIdThrowsWhenMissing() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.findById(99L));
    }

    @Test
    void findByEmailNormalizesInputBeforeLookup() {
        when(userRepository.findByEmail("ana@workshop.test"))
                .thenReturn(Optional.of(user(1L, new RoleEntity(1L, "ADMIN"), "Ana Torres", "ana@workshop.test", null)));

        UserDTO user = userService.findByEmail(" Ana@Workshop.Test ");

        assertEquals("ana@workshop.test", user.getEmail());
        verify(userRepository).findByEmail("ana@workshop.test");
    }

    @Test
    void existsByEmailNormalizesInputBeforeChecking() {
        when(userRepository.existsByEmail("ana@workshop.test")).thenReturn(true);

        assertTrue(userService.existsByEmail(" Ana@Workshop.Test "));
        verify(userRepository).existsByEmail("ana@workshop.test");
    }

    @Test
    void updateTrimsNormalizesResolvesRoleAndSaves() {
        RoleEntity oldRole = new RoleEntity(1L, "ADMIN");
        RoleEntity newRole = new RoleEntity(2L, "SUPERADMIN");
        UserEntity existingUser = user(1L, oldRole, "Ana Torres", "ana@workshop.test", "+1");
        when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));
        when(userRepository.findByEmail("updated@workshop.test")).thenReturn(Optional.empty());
        when(roleRepository.findById(2L)).thenReturn(Optional.of(newRole));
        when(userRepository.save(existingUser)).thenReturn(existingUser);

        UserDTO updatedUser = userService.update(1L, new UserDTO(null, 2L, null, " Ana Updated ", " Updated@Workshop.Test ", "  +525551111111  ", null));

        assertEquals(1L, updatedUser.getId());
        assertEquals(2L, updatedUser.getRoleId());
        assertEquals("SUPERADMIN", updatedUser.getRoleName());
        assertEquals("Ana Updated", updatedUser.getName());
        assertEquals("updated@workshop.test", updatedUser.getEmail());
        assertEquals("+525551111111", updatedUser.getPhone());
        assertEquals("encoded-password", existingUser.getPassword());
        verify(userRepository).save(existingUser);
    }

    @Test
    void updateRejectsBlankNameEmailAndMissingRoleId() {
        assertThrows(InvalidRequestException.class, () -> userService.update(1L, new UserDTO(null, 1L, null, " ", "user@test.com", null, null)));
        assertThrows(InvalidRequestException.class, () -> userService.update(1L, new UserDTO(null, 1L, null, "User", " ", null, null)));
        assertThrows(InvalidRequestException.class, () -> userService.update(1L, new UserDTO(null, null, null, "User", "user@test.com", null, null)));
        verify(userRepository, never()).save(any(UserEntity.class));
    }

    @Test
    void updateThrowsWhenUserIsMissing() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.update(99L, new UserDTO(null, 1L, null, "User", "user@test.com", null, null)));
    }

    @Test
    void updateThrowsWhenRoleIsMissing() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L, new RoleEntity(1L, "ADMIN"), "Ana Torres", "ana@workshop.test", null)));
        when(userRepository.findByEmail("ana.updated@test.com")).thenReturn(Optional.empty());
        when(roleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.update(1L, new UserDTO(null, 99L, null, "Ana Updated", "ana.updated@test.com", null, null)));
        verify(userRepository, never()).save(any(UserEntity.class));
    }

    @Test
    void updateRejectsDuplicateEmailOwnedByAnotherUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L, new RoleEntity(1L, "ADMIN"), "Ana Torres", "ana@workshop.test", null)));
        when(userRepository.findByEmail("carlos@workshop.test"))
                .thenReturn(Optional.of(user(2L, new RoleEntity(2L, "SUPERADMIN"), "Carlos Mendoza", "carlos@workshop.test", null)));

        assertThrows(DuplicateResourceException.class, () -> userService.update(1L, new UserDTO(null, 1L, null, "Ana Torres", " Carlos@Workshop.Test ", null, null)));
        verify(userRepository, never()).save(any(UserEntity.class));
    }

    @Test
    void deleteByIdSucceedsWhenUserHasNoCreatedRecords() {
        when(userRepository.findById(3L)).thenReturn(Optional.of(user(3L, new RoleEntity(1L, "ADMIN"), "Luis Ramirez", "luis@workshop.test", null)));
        when(repairOrderRepository.existsByCreatedBy_Id(3L)).thenReturn(false);
        when(installmentRepository.existsByCreatedBy_Id(3L)).thenReturn(false);

        userService.deleteById(3L);

        verify(userRepository).deleteById(3L);
    }

    @Test
    void deleteByIdThrowsWhenUserCreatedRepairOrders() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L, new RoleEntity(2L, "SUPERADMIN"), "Carlos Mendoza", "carlos@workshop.test", null)));
        when(repairOrderRepository.existsByCreatedBy_Id(1L)).thenReturn(true);

        assertThrows(ResourceInUseException.class, () -> userService.deleteById(1L));
        verify(userRepository, never()).deleteById(any());
    }

    @Test
    void deleteByIdThrowsWhenUserCreatedInstallments() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L, new RoleEntity(2L, "SUPERADMIN"), "Carlos Mendoza", "carlos@workshop.test", null)));
        when(repairOrderRepository.existsByCreatedBy_Id(1L)).thenReturn(false);
        when(installmentRepository.existsByCreatedBy_Id(1L)).thenReturn(true);

        assertThrows(ResourceInUseException.class, () -> userService.deleteById(1L));
        verify(userRepository, never()).deleteById(any());
    }

    private UserEntity user(Long id, RoleEntity role, String name, String email, String phone) {
        UserEntity user = new UserEntity();
        user.setId(id);
        user.setRole(role);
        user.setName(name);
        user.setEmail(email);
        user.setPassword("encoded-password");
        user.setPhone(phone);
        user.setCreatedAt(LocalDateTime.of(2026, 1, 1, 0, 0));
        return user;
    }
}
