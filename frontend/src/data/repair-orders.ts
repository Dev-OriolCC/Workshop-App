import type {
    RepairOrderDraftPayload,
    ServiceSummary,
    UserSummary,
} from "@/types/repair-orders";

export const repairOrderUser: UserSummary = {
    id: 1,
    name: "Carmela",
    email: "carmela@workshop.test",
    phone: "9831808283",
};

export const repairOrderServices: ServiceSummary[] = [
    {
        id: "1",
        name: "Reel repair",
        category: "REEL_REPAIR",
        price: 450,
        active: true,
    },
    {
        id: "2",
        name: "Rod repair",
        category: "ROD_REPAIR",
        price: 320,
        active: true,
    },
    {
        id: "3",
        name: "Maintenance",
        category: "MAINTENANCE",
        price: 250,
        active: true,
    },
    {
        id: "4",
        name: "Other service",
        category: "OTHER",
        price: 0,
        active: true,
    },
];

const reelRepair = repairOrderServices[0];
const rodRepair = repairOrderServices[1];
const maintenance = repairOrderServices[2];

export const repairOrderCreatedAtByTicket: Record<string, string> = {
    "RO-1048": "2026-05-20",
    "RO-1051": "2026-05-21",
    "RO-1053": "2026-05-22",
    "RO-1042": "2026-05-16",
    "RO-1045": "2026-05-18",
    "RO-1038": "2026-05-10",
    "RO-1039": "2026-05-12",
};

export const repairOrderDetails: Record<string, RepairOrderDraftPayload> = {
    "RO-1048": {
        client: {
            name: "Jorge Cortes",
            alias: "Jorge C.",
            phone: "983-245-1180",
            email: "jorge.cortes@example.com",
            comment: "Call before replacing parts over $500.",
        },
        createdBy: repairOrderUser,
        status: "PENDING",
        comment: "Shimano Stradic 4000 reel tune-up. Customer reported rough retrieve and wants a full cleaning.",
        total: 250,
        amountPaid: 0,
        pendingAmount: 250,
        items: [
            {
                id: "ROI-1048-1",
                service: maintenance,
                quantity: 1,
                unitPrice: 250,
                subtotal: 250,
            },
        ],
        payments: [],
    },
    "RO-1051": {
        client: {
            name: "Marta Ruiz",
            alias: "Marta R.",
            phone: "983-180-8283",
            email: "marta.ruiz@example.com",
            comment: "Prefers WhatsApp updates.",
        },
        createdBy: repairOrderUser,
        status: "PENDING",
        comment: "Penn Battle III drag inspection. Check drag washers and quote any replacement parts.",
        total: 450,
        amountPaid: 150,
        pendingAmount: 300,
        items: [
            {
                id: "ROI-1051-1",
                service: reelRepair,
                quantity: 1,
                unitPrice: 450,
                subtotal: 450,
            },
        ],
        payments: [
            {
                id: "ROP-1051-1",
                amount: 150,
                paymentMethod: "CASH",
                note: "Inspection deposit",
                createdAt: "2026-05-21",
            },
        ],
    },
    "RO-1053": {
        client: {
            name: "Luis Herrera",
            alias: "Luis H.",
            phone: "983-331-1053",
            email: "luis.herrera@example.com",
            comment: "Needs rod back before weekend trip.",
        },
        createdBy: repairOrderUser,
        status: "PENDING",
        comment: "St. Croix rod tip replacement with guide alignment check.",
        total: 320,
        amountPaid: 0,
        pendingAmount: 320,
        items: [
            {
                id: "ROI-1053-1",
                service: rodRepair,
                quantity: 1,
                unitPrice: 320,
                subtotal: 320,
            },
        ],
        payments: [],
    },
    "RO-1042": {
        client: {
            name: "Ana Medina",
            alias: "Ana M.",
            phone: "983-552-7104",
            email: "ana.medina@example.com",
            comment: "Approved bearing replacement.",
        },
        createdBy: repairOrderUser,
        status: "IN_PROGRESS",
        comment: "Daiwa BG 3000 bearing replacement. Bearing kit ordered and reel is disassembled.",
        total: 450,
        amountPaid: 200,
        pendingAmount: 250,
        items: [
            {
                id: "ROI-1042-1",
                service: reelRepair,
                quantity: 1,
                unitPrice: 450,
                subtotal: 450,
            },
        ],
        payments: [
            {
                id: "ROP-1042-1",
                amount: 200,
                paymentMethod: "TRANSFER",
                note: "Parts advance",
                createdAt: "2026-05-17",
            },
        ],
    },
    "RO-1045": {
        client: {
            name: "Carlos Vega",
            alias: "Carlos V.",
            phone: "983-772-1045",
            email: "carlos.vega@example.com",
            comment: "Pickup after 5 PM.",
        },
        createdBy: repairOrderUser,
        status: "IN_PROGRESS",
        comment: "Abu Garcia handle assembly service and lubrication.",
        total: 250,
        amountPaid: 0,
        pendingAmount: 250,
        items: [
            {
                id: "ROI-1045-1",
                service: maintenance,
                quantity: 1,
                unitPrice: 250,
                subtotal: 250,
            },
        ],
        payments: [],
    },
    "RO-1038": {
        client: {
            name: "Sofia Marin",
            alias: "Sofia M.",
            phone: "983-887-1038",
            email: "sofia.marin@example.com",
            comment: "Paid in full.",
        },
        createdBy: repairOrderUser,
        status: "COMPLETED",
        comment: "Okuma reel cleaning and lubrication completed.",
        total: 250,
        amountPaid: 250,
        pendingAmount: 0,
        items: [
            {
                id: "ROI-1038-1",
                service: maintenance,
                quantity: 1,
                unitPrice: 250,
                subtotal: 250,
            },
        ],
        payments: [
            {
                id: "ROP-1038-1",
                amount: 250,
                paymentMethod: "CARD",
                note: "Paid at pickup",
                createdAt: "2026-05-14",
            },
        ],
    },
    "RO-1039": {
        client: {
            name: "Diego Poot",
            alias: "Diego P.",
            phone: "983-492-1039",
            email: "diego.poot@example.com",
            comment: "Requested careful wrap color match.",
        },
        createdBy: repairOrderUser,
        status: "READY",
        comment: "Ugly Stik guide wrap repair is ready for pickup.",
        total: 320,
        amountPaid: 100,
        pendingAmount: 220,
        items: [
            {
                id: "ROI-1039-1",
                service: rodRepair,
                quantity: 1,
                unitPrice: 320,
                subtotal: 320,
            },
        ],
        payments: [
            {
                id: "ROP-1039-1",
                amount: 100,
                paymentMethod: "CASH",
                note: "Deposit",
                createdAt: "2026-05-12",
            },
        ],
    },
};

export const getRepairOrderDetail = (ticket: string) => repairOrderDetails[ticket] ?? null;

export const getRepairOrderCreatedAt = (ticket: string) =>
    repairOrderCreatedAtByTicket[ticket] ?? null;
