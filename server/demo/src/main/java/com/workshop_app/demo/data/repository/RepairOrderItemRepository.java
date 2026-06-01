package com.workshop_app.demo.data.repository;

import com.workshop_app.demo.data.entity.RepairOrderItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepairOrderItemRepository extends JpaRepository<RepairOrderItemEntity, Long> {

    boolean existsByService_Id(Long serviceId);

    List<RepairOrderItemEntity> findAllByRepairOrder_Id(Long repairOrderId);

    boolean existsByRepairOrder_Id(Long repairOrderId);

    List<RepairOrderItemEntity> findAllByService_Id(Long serviceId);

    List<RepairOrderItemEntity> findAllByService_NameContainingIgnoreCase(String serviceName);
}
