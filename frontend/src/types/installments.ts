export type InstallmentStatus = "ACTIVE" | "COMPLETED" | "DEFAULTED";

export type PaymentMethod = "CASH" | "TRANSFER" | "CARD";

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

export type InstallmentPaymentDraft = {
    id: string;
    amount: number;
    paymentMethod: PaymentMethod;
    note: string;
};

export type InstallmentDraftPayload = {
    client: ClientDraft;
    createdBy: UserSummary;
    article: string;
    comment: string;
    interestRate: number;
    totalAmount: number;
    amountPaid: number;
    pendingAmount: number;
    status: InstallmentStatus;
    payments: InstallmentPaymentDraft[];
};
