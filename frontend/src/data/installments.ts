import type {
    ClientDraft,
    InstallmentDraftPayload,
    InstallmentStatus,
    PaymentMethod,
    UserSummary,
} from "@/types/installments";

export type InstallmentPayment = {
    id: string;
    amount: number;
    paymentMethod: PaymentMethod;
    note: string;
    createdAt: string;
};

export type InstallmentRecord = {
    id: string;
    client: ClientDraft;
    createdBy: UserSummary;
    article: string;
    comment: string;
    interestRate: number;
    totalAmount: number;
    amountPaid: number;
    pendingAmount: number;
    status: InstallmentStatus;
    createdAt: string;
    payments: InstallmentPayment[];
};

export const installmentUser: UserSummary = {
    id: 1,
    name: "Carmela",
    email: "carmela@workshop.test",
    phone: "9831808283",
};

export const initialInstallments: InstallmentRecord[] = [
    {
        id: "INS-2042",
        client: {
            name: "Jorge Cortes",
            alias: "Jorge C.",
            phone: "983-112-2042",
            email: "jorge.cortes@example.com",
            comment: "Prefers WhatsApp updates after 4 PM.",
        },
        createdBy: installmentUser,
        article: "Shimano Stella FK Reel",
        comment: "Four-payment plan for premium reel purchase.",
        interestRate: 4.5,
        totalAmount: 1250,
        amountPaid: 750,
        pendingAmount: 500,
        status: "ACTIVE",
        createdAt: "2026-05-18T10:15:00",
        payments: [
            {
                id: "PAY-901",
                amount: 350,
                paymentMethod: "CASH",
                note: "Initial payment",
                createdAt: "2026-05-18T10:20:00",
            },
            {
                id: "PAY-918",
                amount: 400,
                paymentMethod: "TRANSFER",
                note: "Second payment",
                createdAt: "2026-05-20T09:00:00",
            },
        ],
    },
    {
        id: "INS-2038",
        client: {
            name: "Marta Ruiz",
            alias: "Marta R.",
            phone: "983-219-2038",
            email: "marta.ruiz@example.com",
            comment: "Frequent customer. Ask about rod case add-on.",
        },
        createdBy: installmentUser,
        article: "St. Croix Victory Rod",
        comment: "Paid in full and ready to archive.",
        interestRate: 0,
        totalAmount: 680,
        amountPaid: 680,
        pendingAmount: 0,
        status: "COMPLETED",
        createdAt: "2026-05-11T14:30:00",
        payments: [
            {
                id: "PAY-884",
                amount: 300,
                paymentMethod: "CARD",
                note: "Deposit",
                createdAt: "2026-05-11T14:32:00",
            },
            {
                id: "PAY-902",
                amount: 380,
                paymentMethod: "CASH",
                note: "Final balance",
                createdAt: "2026-05-17T11:45:00",
            },
        ],
    },
    {
        id: "INS-2027",
        client: {
            name: "Ana Medina",
            alias: "Ana M.",
            phone: "983-440-2027",
            email: "ana.medina@example.com",
            comment: "Call before next due date; payment schedule is behind.",
        },
        createdBy: installmentUser,
        article: "Daiwa Saltist Combo",
        comment: "Payment is behind schedule. Call before next due date.",
        interestRate: 7.25,
        totalAmount: 980,
        amountPaid: 180,
        pendingAmount: 800,
        status: "DEFAULTED",
        createdAt: "2026-04-28T16:00:00",
        payments: [
            {
                id: "PAY-811",
                amount: 180,
                paymentMethod: "TRANSFER",
                note: "Only payment received",
                createdAt: "2026-04-28T16:08:00",
            },
        ],
    },
];

export const toInstallmentDraftPayload = (
    installment: InstallmentRecord
): InstallmentDraftPayload => ({
    client: installment.client,
    createdBy: installment.createdBy,
    article: installment.article,
    comment: installment.comment,
    interestRate: installment.interestRate,
    totalAmount: installment.totalAmount,
    amountPaid: installment.amountPaid,
    pendingAmount: installment.pendingAmount,
    status: installment.status,
    payments: installment.payments.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        note: payment.note,
    })),
});

export const findInstallmentById = (id: string | undefined) =>
    initialInstallments.find((installment) => installment.id === id);
