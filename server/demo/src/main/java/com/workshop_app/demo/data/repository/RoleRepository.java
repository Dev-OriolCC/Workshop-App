package com.workshop_app.demo.data.repository;

import com.workshop_app.demo.data.entity.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<RoleEntity, Long> {
    List<RoleEntity> findAll();

    Optional<RoleEntity> findByRoleName(String roleName);

    boolean existsByRoleName(String roleName);
}
