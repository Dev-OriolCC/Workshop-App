package com.workshop_app.demo.data.repository;

import com.workshop_app.demo.data.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    boolean existsByRole_Id(Long roleId);

    Optional<UserEntity> findByEmail(String email);

    boolean existsByEmail(String email);
}
