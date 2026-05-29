package com.workshop_app.demo.data.repository;

import com.workshop_app.demo.data.entity.ClientEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClientRepository extends JpaRepository<ClientEntity, Long> {

    List<ClientEntity> findAllByEmail(String email);

    List<ClientEntity> findAllByPhone(String phone);

    List<ClientEntity> findAllByName(String name);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    boolean existsByName(String name);
}
