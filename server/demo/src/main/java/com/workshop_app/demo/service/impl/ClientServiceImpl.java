package com.workshop_app.demo.service.impl;

import com.workshop_app.demo.data.entity.ClientEntity;
import com.workshop_app.demo.data.repository.ClientRepository;
import com.workshop_app.demo.data.repository.InstallmentRepository;
import com.workshop_app.demo.data.repository.RepairOrderRepository;
import com.workshop_app.demo.service.ClientService;
import com.workshop_app.demo.service.dto.ClientDTO;
import com.workshop_app.demo.service.exception.InvalidRequestException;
import com.workshop_app.demo.service.exception.ResourceInUseException;
import com.workshop_app.demo.service.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@Transactional
public class ClientServiceImpl implements ClientService {
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$", Pattern.CASE_INSENSITIVE);
    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\+[0-9\\s\\-()]+$");

    private final ClientRepository clientRepository;
    private final RepairOrderRepository repairOrderRepository;
    private final InstallmentRepository installmentRepository;

    public ClientServiceImpl(
            ClientRepository clientRepository,
            RepairOrderRepository repairOrderRepository,
            InstallmentRepository installmentRepository) {
        this.clientRepository = clientRepository;
        this.repairOrderRepository = repairOrderRepository;
        this.installmentRepository = installmentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClientDTO> findAll() {
        return clientRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ClientDTO findById(Long id) {
        return clientRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClientDTO> findByEmail(String email) {
        return clientRepository.findAllByEmail(normalizeEmail(email))
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClientDTO> findByPhone(String phone) {
        return clientRepository.findAllByPhone(normalizePhone(phone))
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClientDTO> findByName(String name) {
        return clientRepository.findAllByName(normalizeRequiredText(name, "Client name is required"))
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    public ClientDTO create(ClientDTO request) {
        ValidatedClientRequest validatedRequest = validateRequest(request);

        ClientEntity client = new ClientEntity();
        applyRequest(client, validatedRequest);
        return toDTO(clientRepository.save(client));
    }

    @Override
    public ClientDTO update(Long id, ClientDTO request) {
        ValidatedClientRequest validatedRequest = validateRequest(request);
        ClientEntity client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));

        applyRequest(client, validatedRequest);
        return toDTO(clientRepository.save(client));
    }

    @Override
    public void deleteById(Long id) {
        ClientEntity client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));

        if (repairOrderRepository.existsByClient_Id(client.getId())
                || installmentRepository.existsByClient_Id(client.getId())) {
            throw new ResourceInUseException("Client has repair orders or installments and cannot be deleted: " + client.getName());
        }

        clientRepository.deleteById(client.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return clientRepository.existsByEmail(normalizeEmail(email));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByPhone(String phone) {
        return clientRepository.existsByPhone(normalizePhone(phone));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByName(String name) {
        return clientRepository.existsByName(normalizeRequiredText(name, "Client name is required"));
    }

    // Helpful Methods
    private ValidatedClientRequest validateRequest(ClientDTO request) {
        if (request == null) {
            throw new InvalidRequestException("Client request is required");
        }

        return new ValidatedClientRequest(
                normalizeRequiredText(request.getName(), "Client name is required"),
                normalizeOptionalText(request.getAlias()),
                normalizeOptionalPhone(request.getPhone()),
                normalizeOptionalEmail(request.getEmail()),
                normalizeOptionalText(request.getComment())
        );
    }

    private void applyRequest(ClientEntity client, ValidatedClientRequest request) {
        client.setName(request.name());
        client.setAlias(request.alias());
        client.setPhone(request.phone());
        client.setEmail(request.email());
        client.setComment(request.comment());
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

    private String normalizeEmail(String email) {
        String normalizedEmail = normalizeOptionalEmail(email);
        if (normalizedEmail == null) {
            throw new InvalidRequestException("Client email is required");
        }
        return normalizedEmail;
    }

    private String normalizeOptionalEmail(String email) {
        String normalizedEmail = normalizeOptionalText(email);
        if (normalizedEmail == null) {
            return null;
        }
        normalizedEmail = normalizedEmail.toLowerCase(Locale.ROOT);
        if (!EMAIL_PATTERN.matcher(normalizedEmail).matches()) {
            throw new InvalidRequestException("Client email is invalid");
        }
        return normalizedEmail;
    }

    private String normalizePhone(String phone) {
        String normalizedPhone = normalizeOptionalPhone(phone);
        if (normalizedPhone == null) {
            throw new InvalidRequestException("Client phone is required");
        }
        return normalizedPhone;
    }

    private String normalizeOptionalPhone(String phone) {
        String normalizedPhone = normalizeOptionalText(phone);
        if (normalizedPhone == null) {
            return null;
        }
        if (!PHONE_PATTERN.matcher(normalizedPhone).matches()) {
            throw new InvalidRequestException("Client phone must be an international number starting with +");
        }

        String digits = normalizedPhone.replaceAll("\\D", "");
        if (digits.length() < 8 || digits.length() > 15) {
            throw new InvalidRequestException("Client phone must contain 8 to 15 digits");
        }
        return "+" + digits;
    }

    private ClientDTO toDTO(ClientEntity client) {
        return new ClientDTO(
                client.getId(),
                client.getName(),
                client.getAlias(),
                client.getPhone(),
                client.getEmail(),
                client.getComment(),
                client.getCreatedAt()
        );
    }

    private record ValidatedClientRequest(String name, String alias, String phone, String email, String comment) {
    }
}
