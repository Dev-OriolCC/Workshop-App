import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CreateInstallmentModal } from "@/components/installments/CreateInstallmentModal";
import { Button } from "@/components/ui/button";
import {
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    Clock3,
    CreditCard,
    Package,
    Trash2,
    WalletCards,
} from "lucide-react";
import { useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import type {
    ClientDraft,
    InstallmentDraftPayload,
    InstallmentModalMode,
    InstallmentStatus,
    PaymentMethod,
    UserSummary,
} from "@/types/installments";

type InstallmentPayment = {
    id: string;
    amount: number;
    paymentMethod: PaymentMethod;
    note: string;
    createdAt: string;
};

type InstallmentRecord = {
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

const boardUser: UserSummary = {
    id: 1,
    name: "Carmela",
    email: "carmela@workshop.test",
    phone: "9831808283",
};

const initialInstallments: InstallmentRecord[] = [
    {
        id: "INS-2042",
        client: {
            name: "Jorge Cortes",
            alias: "Jorge C.",
            phone: "983-112-2042",
            email: "jorge.cortes@example.com",
            comment: "Prefers WhatsApp updates after 4 PM.",
        },
        createdBy: boardUser,
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
        createdBy: boardUser,
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
        createdBy: boardUser,
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

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);

const formatDate = (value: string) =>
    new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(value));

const getProgress = (installment: InstallmentRecord) => {
    if (installment.totalAmount <= 0) return 0;
    return Math.min(
        100,
        Math.round((installment.amountPaid / installment.totalAmount) * 100)
    );
};

const statusStyles: Record<InstallmentStatus, string> = {
    ACTIVE: "border-sky-200 bg-sky-50 text-sky-700",
    COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    DEFAULTED: "border-rose-200 bg-rose-50 text-rose-700",
};

const progressStyles: Record<InstallmentStatus, string> = {
    ACTIVE: "bg-sky-500",
    COMPLETED: "bg-emerald-500",
    DEFAULTED: "bg-rose-500",
};

const toDraftPayload = (installment: InstallmentRecord): InstallmentDraftPayload => ({
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

export default function InstallmentsBoard() {
    const [installments, setInstallments] = useState(initialInstallments);
    const [selectedInstallment, setSelectedInstallment] =
        useState<InstallmentRecord | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<InstallmentModalMode>("view");

    const deleteInstallment = (id: string) => {
        setInstallments((current) => current.filter((installment) => installment.id !== id));
    };

    const openInstallment = (installment: InstallmentRecord) => {
        setSelectedInstallment(installment);
        setModalMode("view");
        setModalOpen(true);
    };

    const handleModalOpenChange = (open: boolean) => {
        setModalOpen(open);
        if (!open) {
            setSelectedInstallment(null);
            setModalMode("view");
        }
    };

    const handleUpdateInstallment = (payload: InstallmentDraftPayload) => {
        console.log("Installment Updated:", payload);
    };

    return (
        <section className="space-y-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        Installment board
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Track article financing, payment progress, and paid-off records.
                    </p>
                </div>
                <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                    {installments.filter((installment) => installment.pendingAmount === 0).length} ready to archive
                </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                {installments.map((installment) => {
                    return (
                        <InstallmentTicketCard
                            key={installment.id}
                            installment={installment}
                            onOpen={openInstallment}
                            onDelete={deleteInstallment}
                        />
                    );
                })}
            </div>

            <CreateInstallmentModal
                open={modalOpen}
                onOpenChange={handleModalOpenChange}
                onSubmit={() => undefined}
                onUpdate={handleUpdateInstallment}
                currentUser={selectedInstallment?.createdBy ?? boardUser}
                mode={modalMode}
                onModeChange={setModalMode}
                initialValue={selectedInstallment ? toDraftPayload(selectedInstallment) : null}
            />
        </section>
    );
}

function InstallmentTicketCard({
    installment,
    onOpen,
    onDelete,
}: {
    installment: InstallmentRecord;
    onOpen: (installment: InstallmentRecord) => void;
    onDelete: (id: string) => void;
}) {
    const progress = getProgress(installment);
    const isPaid = installment.pendingAmount === 0 || progress === 100;
    const latestPayment = installment.payments.at(-1);

    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen(installment);
        }
    };

    return (
        <article
            role="button"
            tabIndex={0}
            aria-label={`Open details for ${installment.article}`}
            onClick={() => onOpen(installment)}
            onKeyDown={handleKeyDown}
            className="group overflow-hidden rounded-xl border border-border bg-background shadow-sm outline-none transition-all hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg hover:ring-4 hover:ring-violet-100 focus-visible:border-violet-400 focus-visible:ring-4 focus-visible:ring-violet-100"
        >
            <div className="flex flex-col gap-4 border-b border-border bg-muted/30 p-4 transition-colors group-hover:bg-violet-50/60 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-foreground px-2.5 py-1 text-xs font-semibold text-background">
                            {installment.id}
                        </span>
                        <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[installment.status]}`}
                        >
                            {installment.status}
                        </span>
                        {isPaid && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                <CheckCircle2 className="size-3.5" />
                                Ready to archive
                            </span>
                        )}
                    </div>
                    <div>
                        <h3 className="truncate text-lg font-bold text-foreground">
                            {installment.article}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {installment.client.name} · {installment.comment}
                        </p>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                    <CalendarDays className="size-4" />
                    Created {formatDate(installment.createdAt)}
                </div>
            </div>

            <div className="grid gap-3 p-4 md:grid-cols-4">
                <MetricCard
                    icon={<CircleDollarSign className="size-4" />}
                    label="Amount"
                    value={formatCurrency(installment.totalAmount)}
                />
                <MetricCard
                    icon={<WalletCards className="size-4" />}
                    label="Paid"
                    value={formatCurrency(installment.amountPaid)}
                />
                <MetricCard
                    icon={<Clock3 className="size-4" />}
                    label="Pending"
                    value={formatCurrency(installment.pendingAmount)}
                />
                <MetricCard
                    icon={<Package className="size-4" />}
                    label="Interest"
                    value={`${installment.interestRate}%`}
                />
            </div>

            <div className="space-y-3 px-4 pb-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-foreground">Progress</span>
                    <span className="font-semibold text-muted-foreground">{progress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                        className={`h-full rounded-full ${progressStyles[installment.status]}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CreditCard className="mt-0.5 size-4 shrink-0" />
                    <div>
                        <p>
                            {installment.payments.length} payment{installment.payments.length === 1 ? "" : "s"}
                        </p>
                        {latestPayment && (
                            <p className="text-xs">
                                Last: {formatCurrency(latestPayment.amount)} by {latestPayment.paymentMethod} · {latestPayment.note}
                            </p>
                        )}
                    </div>
                </div>

                <div onClick={(event) => event.stopPropagation()}>
                    {isPaid ? (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700">
                                    <Trash2 className="size-4" />
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete paid installment?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will remove {installment.article} from the static board.
                                        This does not call the backend yet.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        variant="destructive"
                                        onClick={() => onDelete(installment.id)}
                                    >
                                        Delete installment
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    ) : (
                        <Button variant="outline" disabled className="gap-2">
                            <Trash2 className="size-4" />
                            Pay off before deleting
                        </Button>
                    )}
                </div>
            </div>
        </article>
    );
}

function MetricCard({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-lg border border-border bg-muted/20 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                {icon}
                {label}
            </div>
            <p className="mt-2 text-base font-bold text-foreground">{value}</p>
        </div>
    );
}
