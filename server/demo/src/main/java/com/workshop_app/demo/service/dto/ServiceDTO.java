package com.workshop_app.demo.service.dto;

import com.workshop_app.demo.data.entity.ServiceEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ServiceDTO {

    private Long id;
    private String name;
    private ServiceEntity.ServiceCategory category;
    private BigDecimal price;
    private Boolean active;
    private LocalDateTime createdAt;
}
