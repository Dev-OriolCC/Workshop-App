package com.workshop_app.demo.data.repository;

import com.workshop_app.demo.data.entity.InstallmentPaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InstallmentPaymentRepository extends JpaRepository<InstallmentPaymentEntity, Long> {

}
