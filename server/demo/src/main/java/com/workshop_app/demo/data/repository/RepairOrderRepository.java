package com.workshop_app.demo.data.repository;

import com.workshop_app.demo.data.entity.RepairOrderEntity;
import com.workshop_app.demo.data.entity.RepairOrderEntity.RepairOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepairOrderRepository extends JpaRepository<RepairOrderEntity, Long> {

    boolean existsByCreatedBy_Id(Long userId);

    boolean existsByClient_Id(Long clientId);

    List<RepairOrderEntity> findAllByClient_NameContainingIgnoreCase(String clientName);

    boolean existsByClient_NameContainingIgnoreCase(String clientName);

    List<RepairOrderEntity> findAllByStatus(RepairOrderStatus status);

    boolean existsByStatus(RepairOrderStatus status);

    List<RepairOrderEntity> findAllByClient_Phone(String phone);

    boolean existsByClient_Phone(String phone);

    List<RepairOrderEntity> findAllByCommentContainingIgnoreCase(String comment);

    boolean existsByCommentContainingIgnoreCase(String comment);
}
