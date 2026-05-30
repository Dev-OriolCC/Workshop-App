package com.workshop_app.demo.service.impl;

import com.workshop_app.demo.data.entity.ClientEntity;
import com.workshop_app.demo.data.entity.RepairOrderEntity;
import com.workshop_app.demo.data.entity.RepairOrderEntity.RepairOrderStatus;
import com.workshop_app.demo.data.entity.UserEntity;
import com.workshop_app.demo.data.repository.ClientRepository;
import com.workshop_app.demo.data.repository.RepairOrderRepository;
import com.workshop_app.demo.data.repository.UserRepository;
import com.workshop_app.demo.service.RepairOrderService;
import com.workshop_app.demo.service.dto.RepairOrderDTO;
import com.workshop_app.demo.service.exception.InvalidRequestException;
import com.workshop_app.demo.service.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@Transactional
public class RepairOrderServiceImpl implements RepairOrderService {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMMM d, yyyy", Locale.ENGLISH);
    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\+[0-9\\s\\-()]+$");

    private final RepairOrderRepository repairOrderRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;

    public RepairOrderServiceImpl(
            RepairOrderRepository repairOrderRepository,
            ClientRepository clientRepository,
            UserRepository userRepository) {
        this.repairOrderRepository = repairOrderRepository;
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RepairOrderDTO> findAll() {
        return repairOrderRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RepairOrderDTO findById(Long id) {
        return repairOrderRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Repair order not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RepairOrderDTO> findByClientName(String clientName) {
        return repairOrderRepository.findAllByClient_NameContainingIgnoreCase(normalizeRequiredText(clientName, "Client name is required"))
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RepairOrderDTO> findByStatus(String status) {
        return repairOrderRepository.findAllByStatus(normalizeStatus(status))
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RepairOrderDTO> findByClientNumber(String clientNumber) {
        return repairOrderRepository.findAllByClient_Phone(normalizePhone(clientNumber))
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RepairOrderDTO> findByComment(String comment) {
        return repairOrderRepository.findAllByCommentContainingIgnoreCase(normalizeRequiredText(comment, "Comment is required"))
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    public RepairOrderDTO create(RepairOrderDTO request) {
        ValidatedRepairOrderRequest validatedRequest = validateRequest(request);
        ClientEntity client = findClient(validatedRequest.clientId());
        UserEntity createdBy = findUser(validatedRequest.createdById());

        RepairOrderEntity repairOrder = new RepairOrderEntity();
        repairOrder.setClient(client);
        repairOrder.setCreatedBy(createdBy);
        applyRequest(repairOrder, validatedRequest);
        return toDTO(repairOrderRepository.save(repairOrder));
    }

    @Override
    public RepairOrderDTO update(Long id, RepairOrderDTO request) {
        ValidatedRepairOrderRequest validatedRequest = validateRequest(request);
        RepairOrderEntity repairOrder = repairOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Repair order not found with id: " + id));
        ClientEntity client = findClient(validatedRequest.clientId());
        UserEntity createdBy = findUser(validatedRequest.createdById());

        repairOrder.setClient(client);
        repairOrder.setCreatedBy(createdBy);
        applyRequest(repairOrder, validatedRequest);
        return toDTO(repairOrderRepository.save(repairOrder));
    }

    @Override
    public void deleteById(Long id) {
        RepairOrderEntity repairOrder = repairOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Repair order not found with id: " + id));

        repairOrderRepository.deleteById(repairOrder.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByClientName(String clientName) {
        return repairOrderRepository.existsByClient_NameContainingIgnoreCase(normalizeRequiredText(clientName, "Client name is required"));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByStatus(String status) {
        return repairOrderRepository.existsByStatus(normalizeStatus(status));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByClientNumber(String clientNumber) {
        return repairOrderRepository.existsByClient_Phone(normalizePhone(clientNumber));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByComment(String comment) {
        return repairOrderRepository.existsByCommentContainingIgnoreCase(normalizeRequiredText(comment, "Comment is required"));
    }

    private ValidatedRepairOrderRequest validateRequest(RepairOrderDTO request) {
        if (request == null) {
            throw new InvalidRequestException("Repair order request is required");
        }
        if (request.getClientId() == null) {
            throw new InvalidRequestException("Repair order client id is required");
        }
        if (request.getCreatedById() == null) {
            throw new InvalidRequestException("Repair order created by id is required");
        }

        BigDecimal total = validateAmount(request.getTotal(), "Repair order total is required");
        BigDecimal amountPaid = validateAmount(request.getAmountPaid(), "Repair order amount paid is required");
        if (amountPaid.compareTo(total) > 0) {
            throw new InvalidRequestException("Repair order amount paid cannot be greater than total");
        }

        return new ValidatedRepairOrderRequest(
                request.getClientId(),
                request.getCreatedById(),
                request.getStatus() == null ? RepairOrderStatus.PENDING : request.getStatus(),
                normalizeOptionalText(request.getComment()),
                total,
                amountPaid,
                total.subtract(amountPaid)
        );
    }

    private void applyRequest(RepairOrderEntity repairOrder, ValidatedRepairOrderRequest request) {
        repairOrder.setStatus(request.status());
        repairOrder.setComment(request.comment());
        repairOrder.setTotal(request.total());
        repairOrder.setAmountPaid(request.amountPaid());
        repairOrder.setPendingAmount(request.pendingAmount());
    }

    private ClientEntity findClient(Long clientId) {
        return clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + clientId));
    }

    private UserEntity findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private BigDecimal validateAmount(BigDecimal amount, String requiredMessage) {
        if (amount == null) {
            throw new InvalidRequestException(requiredMessage);
        }
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidRequestException("Repair order amounts cannot be negative");
        }
        return amount;
    }

    private RepairOrderStatus normalizeStatus(String status) {
        String normalizedStatus = normalizeRequiredText(status, "Repair order status is required")
                .toUpperCase(Locale.ROOT)
                .replace(" ", "_")
                .replace("-", "_");
        try {
            return RepairOrderStatus.valueOf(normalizedStatus);
        } catch (IllegalArgumentException exception) {
            throw new InvalidRequestException("Repair order status is invalid: " + status);
        }
    }

    private String normalizePhone(String phone) {
        String normalizedPhone = normalizeRequiredText(phone, "Client phone is required");
        if (!PHONE_PATTERN.matcher(normalizedPhone).matches()) {
            throw new InvalidRequestException("Client phone must be an international number starting with +");
        }

        String digits = normalizedPhone.replaceAll("\\D", "");
        if (digits.length() < 8 || digits.length() > 15) {
            throw new InvalidRequestException("Client phone must contain 8 to 15 digits");
        }
        return "+" + digits;
    }

    private String normalizeRequiredText(String value, String message) {
        if (value == null || value.trim().isEmpty()) {
            throw new InvalidRequestException(message);
        }
        return value.trim();
    }

    private String normalizeOptionalText(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }

    private RepairOrderDTO toDTO(RepairOrderEntity repairOrder) {
        ClientEntity client = repairOrder.getClient();
        UserEntity createdBy = repairOrder.getCreatedBy();
        return new RepairOrderDTO(
                repairOrder.getId(),
                client == null ? null : client.getId(),
                createdBy == null ? null : createdBy.getId(),
                client == null ? null : client.getName(),
                createdBy == null ? null : createdBy.getName(),
                repairOrder.getStatus(),
                repairOrder.getComment(),
                repairOrder.getTotal(),
                repairOrder.getAmountPaid(),
                repairOrder.getPendingAmount(),
                formatDate(repairOrder.getCreatedAt()),
                formatDate(repairOrder.getUpdatedAt())
        );
    }

    private String formatDate(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.format(DATE_FORMATTER);
    }

    private record ValidatedRepairOrderRequest(
            Long clientId,
            Long createdById,
            RepairOrderStatus status,
            String comment,
            BigDecimal total,
            BigDecimal amountPaid,
            BigDecimal pendingAmount) {
    }
}
