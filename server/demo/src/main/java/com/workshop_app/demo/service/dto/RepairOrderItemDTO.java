package com.workshop_app.demo.service.dto;

import com.workshop_app.demo.data.entity.RepairOrderEntity;
import com.workshop_app.demo.data.entity.ServiceEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RepairOrderItemDTO {
    private Long id;
    private Long repairOrderId;
    private Long serviceId;
    private RepairOrderEntity.RepairOrderStatus repairOrderStatus;
    private String clientName;
    private String serviceName;
    private ServiceEntity.ServiceCategory serviceCategory;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}
