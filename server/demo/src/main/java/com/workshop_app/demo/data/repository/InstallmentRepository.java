package com.workshop_app.demo.data.repository;

import com.workshop_app.demo.data.entity.InstallmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InstallmentRepository extends JpaRepository<InstallmentEntity, Long> {

    boolean existsByCreatedBy_Id(Long userId);

    boolean existsByClient_Id(Long clientId);
}
