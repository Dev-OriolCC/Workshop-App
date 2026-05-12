package com.workshop_app.demo.data.repository;

import com.workshop_app.demo.data.entity.RepairOrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepairOrderRepository extends JpaRepository<RepairOrderEntity, Long> {
}
