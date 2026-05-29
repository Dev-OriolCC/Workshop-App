package com.workshop_app.demo.data.repository;

import com.workshop_app.demo.data.entity.RepairOrderItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepairOrderItemRepository extends JpaRepository<RepairOrderItemEntity, Long> {

    boolean existsByService_Id(Long serviceId);
}
