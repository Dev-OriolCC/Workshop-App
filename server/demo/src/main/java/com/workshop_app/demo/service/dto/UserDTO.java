package com.workshop_app.demo.service.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private Long id;
    private Long roleId;
    private String roleName;
    private String name;
    private String email;
    private String phone;
    private LocalDateTime createdAt;
}
