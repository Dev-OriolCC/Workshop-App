import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import {
    CircleDollarSign,
    CreditCard,
    Package,
    Plus,
    Trash2,
    UserRound,
    X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type {
    ClientDraft,
    InstallmentDraftPayload,
    InstallmentPaymentDraft,
    InstallmentStatus,
    PaymentMethod,
    UserSummary,
} from "@/types/installments";

type CreateInstallmentModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (payload: InstallmentDraftPayload) => void;
    currentUser: UserSummary;
};

type PaymentForm = {
    id: string;
    amount: number;
    paymentMethod: PaymentMethod;
    note: string;
};

const emptyClient: ClientDraft = {
    name: "",
    alias: "",
    phone: "",
    email: "",
    comment: "",
};

const createPayment = (): PaymentForm => ({
    id: crypto.randomUUID(),
    amount: 0,
    paymentMethod: "CASH",
    note: "",
});

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);

export function CreateInstallmentModal({
    open,
    onOpenChange,
    onSubmit,
    currentUser,
}: CreateInstallmentModalProps) {
    const [client, setClient] = useState<ClientDraft>(emptyClient);
    const [article, setArticle] = useState("");
    const [comment, setComment] = useState("");
    const [interestRate, setInterestRate] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [status, setStatus] = useState<InstallmentStatus>("ACTIVE");
    const [payments, setPayments] = useState<PaymentForm[]>([]);
    const [error, setError] = useState("");

    const amountPaid = useMemo(
        () => payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
        [payments]
    );
    const pendingAmount = Math.max(totalAmount - amountPaid, 0);
    const progress = totalAmount > 0 ? Math.min(100, Math.round((amountPaid / totalAmount) * 100)) : 0;

    const resetForm = () => {
        setClient(emptyClient);
        setArticle("");
        setComment("");
        setInterestRate(0);
        setTotalAmount(0);
        setStatus("ACTIVE");
        setPayments([]);
        setError("");
    };

    useEffect(() => {
        if (open) {
            resetForm();
        }
    }, [open]);

    const updateClient = (field: keyof ClientDraft, value: string) => {
        setClient((current) => ({ ...current, [field]: value }));
    };

    const updatePayment = (
        id: string,
        field: keyof PaymentForm,
        value: string | number
    ) => {
        setPayments((current) =>
            current.map((payment) =>
                payment.id === id
                    ? {
                          ...payment,
                          [field]: field === "amount" ? Number(value) : value,
                      }
                    : payment
            )
        );
    };

    const validate = () => {
        if (!client.name.trim()) return "Client name is required.";
        if (!article.trim()) return "Article is required.";
        if (totalAmount <= 0) return "Total amount must be greater than 0.";
        if (interestRate < 0) return "Interest rate cannot be negative.";
        if (payments.some((payment) => payment.amount < 0)) {
            return "Payment amounts cannot be negative.";
        }
        return "";
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        const payload: InstallmentDraftPayload = {
            client: {
                name: client.name.trim(),
                alias: client.alias.trim(),
                phone: client.phone.trim(),
                email: client.email.trim(),
                comment: client.comment.trim(),
            },
            createdBy: currentUser,
            article: article.trim(),
            comment: comment.trim(),
            interestRate,
            totalAmount,
            amountPaid,
            pendingAmount,
            status,
            payments: payments.map((payment): InstallmentPaymentDraft => ({
                id: payment.id,
                amount: payment.amount,
                paymentMethod: payment.paymentMethod,
                note: payment.note.trim(),
            })),
        };

        onSubmit(payload);
        resetForm();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onClose={() => onOpenChange(false)} className="relative z-50">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-slate-950/45 backdrop-blur-[2px] transition-opacity data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
            />

            <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
                    <DialogPanel
                        transition
                        className="relative flex max-h-[92svh] w-full max-w-5xl transform flex-col overflow-hidden rounded-xl bg-white text-left shadow-2xl ring-1 ring-slate-900/10 transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in data-closed:sm:scale-95"
                    >
                        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        New financing ticket
                                    </p>
                                    <h2 className="mt-1 text-xl font-semibold text-slate-950">
                                        Create Installment
                                    </h2>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Select
                                        value={status}
                                        onValueChange={(value) => setStatus(value as InstallmentStatus)}
                                    >
                                        <SelectTrigger className="h-9 w-[145px] rounded-lg border-slate-200 bg-slate-50 text-xs font-semibold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="ACTIVE">Active</SelectItem>
                                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                                <SelectItem value="DEFAULTED">Defaulted</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600 sm:flex">
                                        <UserRound className="size-4 text-slate-400" />
                                        <span>Creator</span>
                                        <span className="font-semibold text-slate-900">
                                            {currentUser.name}
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full text-slate-500 hover:text-slate-950"
                                        onClick={() => onOpenChange(false)}
                                    >
                                        <X className="size-4" />
                                    </Button>
                                </div>
                            </header>

                            <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_21rem]">
                                <main className="space-y-5 p-5">
                                    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="mb-4 flex items-center gap-2">
                                            <UserRound className="size-4 text-violet-500" />
                                            <h3 className="text-sm font-semibold text-slate-950">
                                                Client information
                                            </h3>
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <FormField label="Client name" htmlFor="installment-client-name" required>
                                                <Input
                                                    id="installment-client-name"
                                                    value={client.name}
                                                    onChange={(event) => updateClient("name", event.target.value)}
                                                    placeholder="Marta Ruiz"
                                                    required
                                                />
                                            </FormField>
                                            <FormField label="Alias" htmlFor="installment-client-alias">
                                                <Input
                                                    id="installment-client-alias"
                                                    value={client.alias}
                                                    onChange={(event) => updateClient("alias", event.target.value)}
                                                    placeholder="Marta R."
                                                />
                                            </FormField>
                                            <FormField label="Phone" htmlFor="installment-client-phone">
                                                <Input
                                                    id="installment-client-phone"
                                                    value={client.phone}
                                                    onChange={(event) => updateClient("phone", event.target.value)}
                                                    placeholder="9831808283"
                                                />
                                            </FormField>
                                            <FormField label="Email" htmlFor="installment-client-email">
                                                <Input
                                                    id="installment-client-email"
                                                    type="email"
                                                    value={client.email}
                                                    onChange={(event) => updateClient("email", event.target.value)}
                                                    placeholder="client@example.com"
                                                />
                                            </FormField>
                                        </div>
                                        <FormField
                                            label="Client notes"
                                            htmlFor="installment-client-comment"
                                            className="mt-4"
                                        >
                                            <Textarea
                                                id="installment-client-comment"
                                                value={client.comment}
                                                onChange={(event) => updateClient("comment", event.target.value)}
                                                placeholder="Contact preferences or billing notes"
                                            />
                                        </FormField>
                                    </section>

                                    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="mb-4 flex items-center gap-2">
                                            <Package className="size-4 text-violet-500" />
                                            <h3 className="text-sm font-semibold text-slate-950">
                                                Installment details
                                            </h3>
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <FormField label="Article" htmlFor="installment-article" required>
                                                <Input
                                                    id="installment-article"
                                                    value={article}
                                                    onChange={(event) => setArticle(event.target.value)}
                                                    placeholder="Shimano Stella FK Reel"
                                                    required
                                                />
                                            </FormField>
                                            <FormField label="Interest rate" htmlFor="installment-interest">
                                                <Input
                                                    id="installment-interest"
                                                    type="number"
                                                    min={0}
                                                    step="0.01"
                                                    value={interestRate}
                                                    onChange={(event) => setInterestRate(Number(event.target.value))}
                                                />
                                            </FormField>
                                            <FormField label="Total amount" htmlFor="installment-total" required>
                                                <Input
                                                    id="installment-total"
                                                    type="number"
                                                    min={0}
                                                    step="0.01"
                                                    value={totalAmount}
                                                    onChange={(event) => setTotalAmount(Number(event.target.value))}
                                                    required
                                                />
                                            </FormField>
                                        </div>
                                        <FormField label="Installment notes" htmlFor="installment-comment" className="mt-4">
                                            <Textarea
                                                id="installment-comment"
                                                value={comment}
                                                onChange={(event) => setComment(event.target.value)}
                                                placeholder="Payment agreement, due dates, or special conditions"
                                                className="min-h-28"
                                            />
                                        </FormField>
                                    </section>

                                    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="mb-4 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="size-4 text-violet-500" />
                                                <h3 className="text-sm font-semibold text-slate-950">
                                                    Initial payments
                                                </h3>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="gap-2 rounded-full"
                                                onClick={() => setPayments((current) => [...current, createPayment()])}
                                            >
                                                <Plus className="size-4" />
                                                Add payment
                                            </Button>
                                        </div>

                                        {payments.length === 0 ? (
                                            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                                                Add an initial payment if the client pays now.
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {payments.map((payment) => (
                                                    <div key={payment.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                                        <div className="mb-3 flex items-center justify-between">
                                                            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
                                                                {payment.paymentMethod}
                                                            </span>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-8 rounded-full text-slate-400 hover:text-red-500"
                                                                onClick={() =>
                                                                    setPayments((current) =>
                                                                        current.filter((currentPayment) => currentPayment.id !== payment.id)
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </div>
                                                        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_2fr]">
                                                            <FormField label="Amount" htmlFor={`installment-payment-amount-${payment.id}`}>
                                                                <Input
                                                                    id={`installment-payment-amount-${payment.id}`}
                                                                    type="number"
                                                                    min={0}
                                                                    step="0.01"
                                                                    value={payment.amount}
                                                                    onChange={(event) =>
                                                                        updatePayment(payment.id, "amount", event.target.value)
                                                                    }
                                                                    className="bg-white"
                                                                />
                                                            </FormField>
                                                            <FormField label="Method" htmlFor={`installment-payment-method-${payment.id}`}>
                                                                <Select
                                                                    value={payment.paymentMethod}
                                                                    onValueChange={(value) =>
                                                                        updatePayment(
                                                                            payment.id,
                                                                            "paymentMethod",
                                                                            value as PaymentMethod
                                                                        )
                                                                    }
                                                                >
                                                                    <SelectTrigger
                                                                        id={`installment-payment-method-${payment.id}`}
                                                                        className="bg-white"
                                                                    >
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectGroup>
                                                                            <SelectItem value="CASH">Cash</SelectItem>
                                                                            <SelectItem value="TRANSFER">Transfer</SelectItem>
                                                                            <SelectItem value="CARD">Card</SelectItem>
                                                                        </SelectGroup>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormField>
                                                            <FormField label="Note" htmlFor={`installment-payment-note-${payment.id}`}>
                                                                <Input
                                                                    id={`installment-payment-note-${payment.id}`}
                                                                    value={payment.note}
                                                                    onChange={(event) =>
                                                                        updatePayment(payment.id, "note", event.target.value)
                                                                    }
                                                                    placeholder="Receipt or reference"
                                                                    className="bg-white"
                                                                />
                                                            </FormField>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </section>
                                </main>

                                <aside className="border-t border-slate-200 bg-slate-50/80 p-5 lg:border-l lg:border-t-0">
                                    <div className="space-y-5 lg:sticky lg:top-5">
                                        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                            <div className="mb-4 flex items-center gap-2">
                                                <CircleDollarSign className="size-4 text-violet-500" />
                                                <h3 className="text-sm font-semibold text-slate-950">
                                                    Financing summary
                                                </h3>
                                            </div>
                                            <div className="space-y-3 text-sm">
                                                <SummaryRow label="Total amount" value={formatCurrency(totalAmount)} strong />
                                                <SummaryRow label="Amount paid" value={formatCurrency(amountPaid)} />
                                                <SummaryRow label="Pending amount" value={formatCurrency(pendingAmount)} strong />
                                                <SummaryRow label="Interest rate" value={`${interestRate}%`} />
                                            </div>
                                            <div className="mt-5 space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium text-slate-700">Progress</span>
                                                    <span className="font-semibold text-slate-500">{progress}%</span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className="h-full rounded-full bg-violet-600"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </section>

                                        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <UserRound className="size-4 text-slate-400" />
                                                <span>Creator</span>
                                                <span className="font-semibold text-slate-950">{currentUser.name}</span>
                                            </div>
                                        </section>
                                    </div>
                                </aside>
                            </div>

                            {error && (
                                <div className="border-t border-red-100 bg-red-50 px-5 py-3 text-sm font-medium text-red-700">
                                    {error}
                                </div>
                            )}

                            <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end">
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
                                    Create Installment
                                </Button>
                            </footer>
                        </form>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}

type FormFieldProps = {
    label: string;
    htmlFor: string;
    children: ReactNode;
    className?: string;
    required?: boolean;
};

function FormField({ label, htmlFor, children, className, required }: FormFieldProps) {
    return (
        <label className={`block ${className ?? ""}`} htmlFor={htmlFor}>
            <span className="mb-2 block text-xs font-medium text-slate-500">
                {label}
                {required && <span className="text-red-500"> *</span>}
            </span>
            {children}
        </label>
    );
}

function SummaryRow({
    label,
    value,
    strong,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
            <span className="text-slate-500">{label}</span>
            <span className={strong ? "font-semibold text-slate-950" : "text-slate-700"}>
                {value}
            </span>
        </div>
    );
}
