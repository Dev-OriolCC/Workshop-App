package com.workshop_app.demo.data.repository;

import com.workshop_app.demo.data.entity.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {

    Optional<ServiceEntity> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    List<ServiceEntity> findAllByCategory(ServiceEntity.ServiceCategory category);

    List<ServiceEntity> findAllByActiveTrue();
}
