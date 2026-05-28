package com.workshop_app.demo.service;

import com.workshop_app.demo.data.entity.RoleEntity;
import com.workshop_app.demo.data.repository.RoleRepository;
import com.workshop_app.demo.data.repository.UserRepository;
import com.workshop_app.demo.service.dto.RoleDTO;
import com.workshop_app.demo.service.exception.DuplicateResourceException;
import com.workshop_app.demo.service.exception.InvalidRequestException;
import com.workshop_app.demo.service.exception.ResourceInUseException;
import com.workshop_app.demo.service.exception.ResourceNotFoundException;
import com.workshop_app.demo.service.impl.RoleServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoleServiceTest {

    @Mock
    RoleRepository roleRepository;

    @Mock
    UserRepository userRepository;

    @InjectMocks
    RoleServiceImpl roleService;

    @Test
    void findAllMapsEntitiesToDTOs() {
        when(roleRepository.findAll()).thenReturn(List.of(
                new RoleEntity(1L, "ADMIN"),
                new RoleEntity(2L, "SUPERADMIN")
        ));

        List<RoleDTO> roles = roleService.findAll();

        assertEquals(2, roles.size());
        assertEquals(1L, roles.get(0).getId());
        assertEquals("ADMIN", roles.get(0).getRoleName());
        assertEquals(2L, roles.get(1).getId());
        assertEquals("SUPERADMIN", roles.get(1).getRoleName());
    }

    @Test
    void findByIdReturnsDTO() {
        when(roleRepository.findById(1L)).thenReturn(Optional.of(new RoleEntity(1L, "ADMIN")));

        RoleDTO role = roleService.findById(1L);

        assertEquals(1L, role.getId());
        assertEquals("ADMIN", role.getRoleName());
    }

    @Test
    void findByIdThrowsWhenMissing() {
        when(roleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> roleService.findById(99L));
    }

    @Test
    void findByNameNormalizesInputBeforeLookup() {
        when(roleRepository.findByRoleName("ADMIN")).thenReturn(Optional.of(new RoleEntity(1L, "ADMIN")));

        RoleDTO role = roleService.findByName(" admin ");

        assertEquals("ADMIN", role.getRoleName());
        verify(roleRepository).findByRoleName("ADMIN");
    }

    @Test
    void createTrimsUppercasesAndSaves() {
        when(roleRepository.existsByRoleName("MANAGER")).thenReturn(false);
        when(roleRepository.save(any(RoleEntity.class))).thenAnswer(invocation -> {
            RoleEntity role = invocation.getArgument(0);
            role.setId(3L);
            return role;
        });

        RoleDTO createdRole = roleService.create(new RoleDTO(null, " manager "));

        assertEquals(3L, createdRole.getId());
        assertEquals("MANAGER", createdRole.getRoleName());

        ArgumentCaptor<RoleEntity> roleCaptor = ArgumentCaptor.forClass(RoleEntity.class);
        verify(roleRepository).save(roleCaptor.capture());
        assertEquals("MANAGER", roleCaptor.getValue().getRoleName());
    }

    @Test
    void createRejectsBlankRoleNames() {
        assertThrows(InvalidRequestException.class, () -> roleService.create(new RoleDTO(null, "  ")));
        verify(roleRepository, never()).save(any(RoleEntity.class));
    }

    @Test
    void createRejectsDuplicates() {
        when(roleRepository.existsByRoleName("ADMIN")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> roleService.create(new RoleDTO(null, "admin")));
        verify(roleRepository, never()).save(any(RoleEntity.class));
    }

    @Test
    void updateChangesRoleNameAfterNormalization() {
        RoleEntity existingRole = new RoleEntity(3L, "MANAGER");
        when(roleRepository.findById(3L)).thenReturn(Optional.of(existingRole));
        when(roleRepository.findByRoleName("SUPPORT")).thenReturn(Optional.empty());
        when(roleRepository.save(existingRole)).thenReturn(existingRole);

        RoleDTO updatedRole = roleService.update(3L, new RoleDTO(null, " support "));

        assertEquals(3L, updatedRole.getId());
        assertEquals("SUPPORT", updatedRole.getRoleName());
        verify(roleRepository).save(existingRole);
    }

    @Test
    void updateRejectsDuplicateRoleNameOwnedByAnotherRole() {
        when(roleRepository.findById(3L)).thenReturn(Optional.of(new RoleEntity(3L, "MANAGER")));
        when(roleRepository.findByRoleName("ADMIN")).thenReturn(Optional.of(new RoleEntity(1L, "ADMIN")));

        assertThrows(DuplicateResourceException.class, () -> roleService.update(3L, new RoleDTO(null, "admin")));
        verify(roleRepository, never()).save(any(RoleEntity.class));
    }

    @Test
    void deleteByIdSucceedsWhenRoleIsUnused() {
        when(roleRepository.findById(3L)).thenReturn(Optional.of(new RoleEntity(3L, "MANAGER")));
        when(userRepository.existsByRole_Id(3L)).thenReturn(false);

        roleService.deleteById(3L);

        verify(roleRepository).deleteById(3L);
    }

    @Test
    void deleteByIdThrowsWhenRoleIsAssignedToUsers() {
        when(roleRepository.findById(1L)).thenReturn(Optional.of(new RoleEntity(1L, "ADMIN")));
        when(userRepository.existsByRole_Id(1L)).thenReturn(true);

        assertThrows(ResourceInUseException.class, () -> roleService.deleteById(1L));
        verify(roleRepository, never()).deleteById(any());
    }
}
