export type RepairOrderStatus = "PENDING" | "IN_PROGRESS" | "READY" | "COMPLETED";

export type PaymentMethod = "CASH" | "TRANSFER" | "CARD";

export type ServiceCategory = "REEL_REPAIR" | "ROD_REPAIR" | "MAINTENANCE" | "OTHER";

export type ClientDraft = {
    name: string;
    alias: string;
    phone: string;
    email: string;
    comment: string;
};

export type UserSummary = {
    id: number;
    name: string;
    email: string;
    phone?: string;
};

export type ServiceSummary = {
    id: string;
    name: string;
    category: ServiceCategory;
    price: number;
    active: boolean;
};

export type RepairOrderItemDraft = {
    id: string;
    service: ServiceSummary;
    quantity: number;
    unitPrice: number;
    subtotal: number;
};

export type RepairOrderPaymentDraft = {
    id: string;
    amount: number;
    paymentMethod: PaymentMethod;
    note: string;
};

export type RepairOrderDraftPayload = {
    client: ClientDraft;
    createdBy: UserSummary;
    status: RepairOrderStatus;
    comment: string;
    total: number;
    amountPaid: number;
    pendingAmount: number;
    items: RepairOrderItemDraft[];
    payments: RepairOrderPaymentDraft[];
};
