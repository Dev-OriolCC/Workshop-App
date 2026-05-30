package com.workshop_app.demo.service.dto;


import com.workshop_app.demo.data.entity.RepairOrderEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RepairOrderDTO {
    private Long id;
    private Long clientId;
    private Long createdById;
    private String clientName;
    private String createdBy;
    private RepairOrderEntity.RepairOrderStatus status;
    private String comment;
    private BigDecimal total;
    private BigDecimal amountPaid;
    private BigDecimal pendingAmount;

    private String createdAt;
    private String updatedAt;

}
