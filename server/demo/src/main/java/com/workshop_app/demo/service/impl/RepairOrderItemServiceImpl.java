package com.workshop_app.demo.service.impl;

import com.workshop_app.demo.data.entity.ClientEntity;
import com.workshop_app.demo.data.entity.RepairOrderEntity;
import com.workshop_app.demo.data.entity.RepairOrderItemEntity;
import com.workshop_app.demo.data.entity.ServiceEntity;
import com.workshop_app.demo.data.repository.RepairOrderItemRepository;
import com.workshop_app.demo.data.repository.RepairOrderRepository;
import com.workshop_app.demo.data.repository.ServiceRepository;
import com.workshop_app.demo.service.RepairOrderItemService;
import com.workshop_app.demo.service.dto.RepairOrderItemDTO;
import com.workshop_app.demo.service.exception.InvalidRequestException;
import com.workshop_app.demo.service.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

@Service
@Transactional
public class RepairOrderItemServiceImpl implements RepairOrderItemService {
    private final RepairOrderItemRepository repairOrderItemRepository;
    private final RepairOrderRepository repairOrderRepository;
    private final ServiceRepository serviceRepository;

    public RepairOrderItemServiceImpl(
            RepairOrderItemRepository repairOrderItemRepository,
            RepairOrderRepository repairOrderRepository,
            ServiceRepository serviceRepository) {
        this.repairOrderItemRepository = repairOrderItemRepository;
        this.repairOrderRepository = repairOrderRepository;
        this.serviceRepository = serviceRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RepairOrderItemDTO> findAll() {
        return repairOrderItemRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RepairOrderItemDTO findById(Long id) {
        return repairOrderItemRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Repair order item not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RepairOrderItemDTO> findByRepairOrderId(Long repairOrderId) {
        return repairOrderItemRepository.findAllByRepairOrder_Id(validateId(repairOrderId, "Repair order id is required"))
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RepairOrderItemDTO> findByServiceId(Long serviceId) {
        return repairOrderItemRepository.findAllByService_Id(validateId(serviceId, "Service id is required"))
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RepairOrderItemDTO> findByServiceName(String serviceName) {
        return repairOrderItemRepository.findAllByService_NameContainingIgnoreCase(normalizeRequiredText(serviceName, "Service name is required"))
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    public RepairOrderItemDTO create(RepairOrderItemDTO request) {
        ValidatedRepairOrderItemRequest validatedRequest = validateRequest(request);
        RepairOrderEntity repairOrder = findRepairOrder(validatedRequest.repairOrderId());
        ServiceEntity service = findActiveService(validatedRequest.serviceId());
        BigDecimal unitPrice = validateServicePrice(service.getPrice());
        BigDecimal subtotal = calculateSubtotal(validatedRequest.quantity(), unitPrice);

        List<RepairOrderItemEntity> currentItems = repairOrderItemRepository.findAllByRepairOrder_Id(repairOrder.getId());
        validateRepairOrderCanUseTotal(repairOrder, sumSubtotals(currentItems).add(subtotal));

        RepairOrderItemEntity item = new RepairOrderItemEntity();
        item.setRepairOrder(repairOrder);
        item.setService(service);
        item.setQuantity(validatedRequest.quantity());
        item.setUnitPrice(unitPrice);
        item.setSubtotal(subtotal);

        RepairOrderItemEntity savedItem = repairOrderItemRepository.save(item);
        syncRepairOrderTotals(repairOrder, withItem(currentItems, savedItem));
        return toDTO(savedItem);
    }

    @Override
    public RepairOrderItemDTO update(Long id, RepairOrderItemDTO request) {
        ValidatedRepairOrderItemRequest validatedRequest = validateRequest(request);
        RepairOrderItemEntity item = repairOrderItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Repair order item not found with id: " + id));
        RepairOrderEntity oldRepairOrder = item.getRepairOrder();
        RepairOrderEntity repairOrder = findRepairOrder(validatedRequest.repairOrderId());
        ServiceEntity service = findActiveService(validatedRequest.serviceId());
        BigDecimal unitPrice = validateServicePrice(service.getPrice());
        BigDecimal subtotal = calculateSubtotal(validatedRequest.quantity(), unitPrice);

        List<RepairOrderItemEntity> newOrderItems = repairOrderItemRepository.findAllByRepairOrder_Id(repairOrder.getId());
        validateRepairOrderCanUseTotal(repairOrder, replacementTotal(newOrderItems, item.getId(), subtotal, true));

        boolean movedOrders = oldRepairOrder != null && !Objects.equals(oldRepairOrder.getId(), repairOrder.getId());
        List<RepairOrderItemEntity> oldOrderItems = List.of();
        if (movedOrders) {
            oldOrderItems = repairOrderItemRepository.findAllByRepairOrder_Id(oldRepairOrder.getId());
            validateRepairOrderCanUseTotal(oldRepairOrder, totalWithoutItem(oldOrderItems, item.getId()));
        }

        item.setRepairOrder(repairOrder);
        item.setService(service);
        item.setQuantity(validatedRequest.quantity());
        item.setUnitPrice(unitPrice);
        item.setSubtotal(subtotal);

        RepairOrderItemEntity savedItem = repairOrderItemRepository.save(item);
        syncRepairOrderTotals(repairOrder, withReplacement(newOrderItems, savedItem));
        if (movedOrders) {
            syncRepairOrderTotals(oldRepairOrder, withoutItem(oldOrderItems, savedItem.getId()));
        }
        return toDTO(savedItem);
    }

    @Override
    public void deleteById(Long id) {
        RepairOrderItemEntity item = repairOrderItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Repair order item not found with id: " + id));
        RepairOrderEntity repairOrder = item.getRepairOrder();
        List<RepairOrderItemEntity> currentItems = repairOrderItemRepository.findAllByRepairOrder_Id(repairOrder.getId());
        List<RepairOrderItemEntity> remainingItems = withoutItem(currentItems, item.getId());

        validateRepairOrderCanUseTotal(repairOrder, sumSubtotals(remainingItems));
        repairOrderItemRepository.deleteById(item.getId());
        syncRepairOrderTotals(repairOrder, remainingItems);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByRepairOrderId(Long repairOrderId) {
        return repairOrderItemRepository.existsByRepairOrder_Id(validateId(repairOrderId, "Repair order id is required"));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByServiceId(Long serviceId) {
        return repairOrderItemRepository.existsByService_Id(validateId(serviceId, "Service id is required"));
    }

    private ValidatedRepairOrderItemRequest validateRequest(RepairOrderItemDTO request) {
        if (request == null) {
            throw new InvalidRequestException("Repair order item request is required");
        }

        return new ValidatedRepairOrderItemRequest(
                validateId(request.getRepairOrderId(), "Repair order id is required"),
                validateId(request.getServiceId(), "Service id is required"),
                validateQuantity(request.getQuantity())
        );
    }

    private RepairOrderEntity findRepairOrder(Long repairOrderId) {
        return repairOrderRepository.findById(repairOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Repair order not found with id: " + repairOrderId));
    }

    private ServiceEntity findActiveService(Long serviceId) {
        ServiceEntity service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + serviceId));
        if (!Boolean.TRUE.equals(service.getActive())) {
            throw new InvalidRequestException("Service is inactive and cannot be added to a repair order: " + service.getName());
        }
        return service;
    }

    private Long validateId(Long id, String message) {
        if (id == null) {
            throw new InvalidRequestException(message);
        }
        if (id <= 0) {
            throw new InvalidRequestException("Id must be greater than zero");
        }
        return id;
    }

    private Integer validateQuantity(Integer quantity) {
        if (quantity == null) {
            throw new InvalidRequestException("Repair order item quantity is required");
        }
        if (quantity <= 0) {
            throw new InvalidRequestException("Repair order item quantity must be greater than zero");
        }
        return quantity;
    }

    private BigDecimal validateServicePrice(BigDecimal price) {
        if (price == null) {
            throw new InvalidRequestException("Service price is required");
        }
        if (price.compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidRequestException("Service price must be greater than or equal to zero");
        }
        return price;
    }

    private String normalizeRequiredText(String value, String message) {
        if (value == null || value.trim().isEmpty()) {
            throw new InvalidRequestException(message);
        }
        return value.trim();
    }

    private BigDecimal calculateSubtotal(Integer quantity, BigDecimal unitPrice) {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }

    private void validateRepairOrderCanUseTotal(RepairOrderEntity repairOrder, BigDecimal total) {
        BigDecimal amountPaid = repairOrder.getAmountPaid() == null ? BigDecimal.ZERO : repairOrder.getAmountPaid();
        if (amountPaid.compareTo(total) > 0) {
            throw new InvalidRequestException("Repair order total cannot be less than amount paid");
        }
    }

    private void syncRepairOrderTotals(RepairOrderEntity repairOrder, List<RepairOrderItemEntity> items) {
        BigDecimal total = sumSubtotals(items);
        validateRepairOrderCanUseTotal(repairOrder, total);

        BigDecimal amountPaid = repairOrder.getAmountPaid() == null ? BigDecimal.ZERO : repairOrder.getAmountPaid();
        repairOrder.setTotal(total);
        repairOrder.setPendingAmount(total.subtract(amountPaid));
        repairOrderRepository.save(repairOrder);
    }

    private BigDecimal sumSubtotals(List<RepairOrderItemEntity> items) {
        return items.stream()
                .map(RepairOrderItemEntity::getSubtotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal replacementTotal(List<RepairOrderItemEntity> items, Long itemId, BigDecimal replacementSubtotal, boolean includeIfMissing) {
        boolean replaced = false;
        BigDecimal total = BigDecimal.ZERO;
        for (RepairOrderItemEntity item : items) {
            if (Objects.equals(item.getId(), itemId)) {
                total = total.add(replacementSubtotal);
                replaced = true;
            } else if (item.getSubtotal() != null) {
                total = total.add(item.getSubtotal());
            }
        }
        if (!replaced && includeIfMissing) {
            total = total.add(replacementSubtotal);
        }
        return total;
    }

    private BigDecimal totalWithoutItem(List<RepairOrderItemEntity> items, Long itemId) {
        return sumSubtotals(withoutItem(items, itemId));
    }

    private List<RepairOrderItemEntity> withItem(List<RepairOrderItemEntity> items, RepairOrderItemEntity addedItem) {
        return java.util.stream.Stream.concat(items.stream(), java.util.stream.Stream.of(addedItem)).toList();
    }

    private List<RepairOrderItemEntity> withReplacement(List<RepairOrderItemEntity> items, RepairOrderItemEntity replacementItem) {
        boolean containsItem = items.stream().anyMatch(item -> Objects.equals(item.getId(), replacementItem.getId()));
        List<RepairOrderItemEntity> replacedItems = items.stream()
                .map(item -> Objects.equals(item.getId(), replacementItem.getId()) ? replacementItem : item)
                .toList();
        return containsItem ? replacedItems : withItem(replacedItems, replacementItem);
    }

    private List<RepairOrderItemEntity> withoutItem(List<RepairOrderItemEntity> items, Long itemId) {
        return items.stream()
                .filter(item -> !Objects.equals(item.getId(), itemId))
                .toList();
    }

    private RepairOrderItemDTO toDTO(RepairOrderItemEntity item) {
        RepairOrderEntity repairOrder = item.getRepairOrder();
        ClientEntity client = repairOrder == null ? null : repairOrder.getClient();
        ServiceEntity service = item.getService();
        return new RepairOrderItemDTO(
                item.getId(),
                repairOrder == null ? null : repairOrder.getId(),
                service == null ? null : service.getId(),
                repairOrder == null ? null : repairOrder.getStatus(),
                client == null ? null : client.getName(),
                service == null ? null : service.getName(),
                service == null ? null : service.getCategory(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getSubtotal()
        );
    }

    private record ValidatedRepairOrderItemRequest(Long repairOrderId, Long serviceId, Integer quantity) {
    }
}
