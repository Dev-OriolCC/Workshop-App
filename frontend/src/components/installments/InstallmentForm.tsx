import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/shared/DatePicker";
import { InternationalPhoneInput } from "@/components/shared/InternationalPhoneInput";
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
import toast from "react-hot-toast";
import type {
    ClientDraft,
    InstallmentDraftPayload,
    InstallmentPaymentDraft,
    InstallmentStatus,
    PaymentMethod,
    UserSummary,
} from "@/types/installments";

type PaymentForm = {
    id: string;
    amount: number;
    paymentMethod: PaymentMethod;
    note: string;
    createdAt: string;
};

type InstallmentFormProps = {
    currentUser: UserSummary;
    initialValue?: InstallmentDraftPayload | null;
    readOnly?: boolean;
    eyebrow: string;
    title: string;
    submitLabel?: string;
    cancelLabel?: string;
    onSubmit?: (payload: InstallmentDraftPayload) => void;
    onCancel?: () => void;
    onClose?: () => void;
    onEdit?: () => void;
    onSecondaryReadOnlyAction?: () => void;
    secondaryReadOnlyActionLabel?: string;
    showCloseButton?: boolean;
    installmentCreatedAt?: string;
    fieldsDisabled?: boolean;
    hideSubmit?: boolean;
    className?: string;
};

const emptyClient: ClientDraft = {
    name: "",
    alias: "",
    phone: "",
    email: "",
    comment: "",
};

const toDateInputValue = (value: string | Date) => {
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
};

const todayDateInputValue = () => toDateInputValue(new Date());

const createPayment = (): PaymentForm => ({
    id: `PAY-${crypto.randomUUID()}`,
    amount: 0,
    paymentMethod: "CASH",
    note: "",
    createdAt: todayDateInputValue(),
});

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);

export function InstallmentForm({
    currentUser,
    initialValue,
    readOnly = false,
    eyebrow,
    title,
    submitLabel = "Create Installment",
    cancelLabel = "Cancel",
    onSubmit,
    onCancel,
    onClose,
    onEdit,
    onSecondaryReadOnlyAction,
    secondaryReadOnlyActionLabel,
    showCloseButton = false,
    installmentCreatedAt,
    fieldsDisabled = false,
    hideSubmit = false,
    className,
}: InstallmentFormProps) {
    const [client, setClient] = useState<ClientDraft>({ ...emptyClient });
    const [article, setArticle] = useState("");
    const [comment, setComment] = useState("");
    const [interestRate, setInterestRate] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [status, setStatus] = useState<InstallmentStatus>("ACTIVE");
    const [payments, setPayments] = useState<PaymentForm[]>([]);

    const amountPaid = useMemo(
        () => payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
        [payments]
    );
    const pendingAmount = Math.max(totalAmount - amountPaid, 0);
    const progress =
        totalAmount > 0 ? Math.min(100, Math.round((amountPaid / totalAmount) * 100)) : 0;
    const creator = initialValue?.createdBy ?? currentUser;
    const installmentDate = toDateInputValue(installmentCreatedAt ?? new Date());
    const controlsDisabled = readOnly || fieldsDisabled;

    const resetForm = () => {
        setClient({ ...emptyClient });
        setArticle("");
        setComment("");
        setInterestRate(0);
        setTotalAmount(0);
        setStatus("ACTIVE");
        setPayments([]);
    };

    const hydrateForm = (value: InstallmentDraftPayload) => {
        setClient({ ...value.client });
        setArticle(value.article);
        setComment(value.comment);
        setInterestRate(value.interestRate);
        setTotalAmount(value.totalAmount);
        setStatus(value.status);
        setPayments(
            value.payments.map((payment) => ({
                ...payment,
                createdAt: toDateInputValue(payment.createdAt),
            }))
        );
    };

    useEffect(() => {
        if (initialValue) {
            hydrateForm(initialValue);
            return;
        }

        resetForm();
    }, [initialValue]);

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
        if (
            payments.some(
                (payment) =>
                    payment.createdAt &&
                    installmentDate &&
                    payment.createdAt < installmentDate
            )
        ) {
            return "Payment date cannot be before the installment date.";
        }
        return "";
    };

    const buildPayload = (): InstallmentDraftPayload => ({
        client: {
            name: client.name.trim(),
            alias: client.alias.trim(),
            phone: client.phone.trim(),
            email: client.email.trim(),
            comment: client.comment.trim(),
        },
        createdBy: creator,
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
            createdAt: payment.createdAt,
        })),
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (readOnly) return;

        const validationError = validate();
        if (validationError) {
            toast.error(validationError);
            return;
        }

        onSubmit?.(buildPayload());
    };

    return (
        <form onSubmit={handleSubmit} className={`flex min-h-0 flex-1 flex-col ${className ?? ""}`}>
            <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {eyebrow}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-card-foreground">{title}</h2>
                </div>
                <div className="flex items-center gap-3">
                    <Select
                        value={status}
                        onValueChange={(value) => setStatus(value as InstallmentStatus)}
                        disabled={controlsDisabled}
                    >
                        <SelectTrigger className="h-9 w-[145px] rounded-lg border-border bg-muted/50 text-xs font-semibold">
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
                    <div className="hidden items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground sm:flex">
                        <UserRound className="size-4 text-muted-foreground" />
                        <span>Creator</span>
                        <span className="font-semibold text-card-foreground">{creator.name}</span>
                    </div>
                    {showCloseButton && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="rounded-full text-muted-foreground hover:text-foreground"
                            onClick={onClose}
                        >
                            <X className="size-4" />
                        </Button>
                    )}
                </div>
            </header>

            <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_21rem]">
                <main className="space-y-5 p-5">
                    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <UserRound className="size-4 text-violet-500" />
                            <h3 className="text-sm font-semibold text-card-foreground">Client information</h3>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField label="Client name" htmlFor="installment-client-name" required>
                                <Input
                                    id="installment-client-name"
                                    value={client.name}
                                    onChange={(event) => updateClient("name", event.target.value)}
                                    placeholder="Marta Ruiz"
                                    required
                                    disabled={controlsDisabled}
                                />
                            </FormField>
                            <FormField label="Alias" htmlFor="installment-client-alias">
                                <Input
                                    id="installment-client-alias"
                                    value={client.alias}
                                    onChange={(event) => updateClient("alias", event.target.value)}
                                    placeholder="Marta R."
                                    disabled={controlsDisabled}
                                />
                            </FormField>
                            <FormField label="Phone" htmlFor="installment-client-phone">
                                <InternationalPhoneInput
                                    id="installment-client-phone"
                                    value={client.phone}
                                    onChange={(value) => updateClient("phone", value)}
                                    placeholder="+52 983 180 8283"
                                    disabled={controlsDisabled}
                                    readOnly={controlsDisabled}
                                />
                            </FormField>
                            <FormField label="Email" htmlFor="installment-client-email">
                                <Input
                                    id="installment-client-email"
                                    type="email"
                                    value={client.email}
                                    onChange={(event) => updateClient("email", event.target.value)}
                                    placeholder="client@example.com"
                                    disabled={controlsDisabled}
                                />
                            </FormField>
                        </div>
                        <FormField label="Client notes" htmlFor="installment-client-comment" className="mt-4">
                            <Textarea
                                id="installment-client-comment"
                                value={client.comment}
                                onChange={(event) => updateClient("comment", event.target.value)}
                                placeholder="Contact preferences or billing notes"
                                disabled={controlsDisabled}
                            />
                        </FormField>
                    </section>

                    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <Package className="size-4 text-violet-500" />
                            <h3 className="text-sm font-semibold text-card-foreground">Installment details</h3>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField label="Article" htmlFor="installment-article" required>
                                <Input
                                    id="installment-article"
                                    value={article}
                                    onChange={(event) => setArticle(event.target.value)}
                                    placeholder="Shimano Stella FK Reel"
                                    required
                                    disabled={controlsDisabled}
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
                                    disabled={controlsDisabled}
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
                                    disabled={controlsDisabled}
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
                                disabled={controlsDisabled}
                            />
                        </FormField>
                    </section>

                    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <CreditCard className="size-4 text-violet-500" />
                                <h3 className="text-sm font-semibold text-card-foreground">Payments</h3>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-2 rounded-full"
                                onClick={() => setPayments((current) => [...current, createPayment()])}
                                disabled={controlsDisabled}
                            >
                                <Plus className="size-4" />
                                Add payment
                            </Button>
                        </div>

                        {payments.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                                Add a payment if the client pays now.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {payments.map((payment) => (
                                    <div key={payment.id} className="rounded-lg border border-border bg-muted/40 p-3">
                                        <div className="mb-3 flex items-center justify-between">
                                            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
                                                {payment.paymentMethod}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="size-8 rounded-full text-muted-foreground hover:text-red-500"
                                                onClick={() =>
                                                    setPayments((current) =>
                                                        current.filter((currentPayment) => currentPayment.id !== payment.id)
                                                    )
                                                }
                                                disabled={controlsDisabled}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_2fr]">
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
                                                    className="bg-background"
                                                    disabled={controlsDisabled}
                                                />
                                            </FormField>
                                            <FormField label="Date" htmlFor={`installment-payment-date-${payment.id}`}>
                                                <DatePicker
                                                    id={`installment-payment-date-${payment.id}`}
                                                    value={payment.createdAt}
                                                    onChange={(value) =>
                                                        updatePayment(payment.id, "createdAt", value)
                                                    }
                                                    disabled={controlsDisabled}
                                                />
                                            </FormField>
                                            <FormField label="Method" htmlFor={`installment-payment-method-${payment.id}`}>
                                                <Select
                                                    value={payment.paymentMethod}
                                                    onValueChange={(value) =>
                                                        updatePayment(payment.id, "paymentMethod", value as PaymentMethod)
                                                    }
                                                    disabled={controlsDisabled}
                                                >
                                                    <SelectTrigger id={`installment-payment-method-${payment.id}`} className="bg-background">
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
                                                    className="bg-background"
                                                    disabled={controlsDisabled}
                                                />
                                            </FormField>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </main>

                <aside className="border-t border-border bg-muted/30 p-5 lg:border-l lg:border-t-0">
                    <div className="space-y-5 lg:sticky lg:top-5">
                        <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <CircleDollarSign className="size-4 text-violet-500" />
                                <h3 className="text-sm font-semibold text-card-foreground">Financing summary</h3>
                            </div>
                            <div className="space-y-3 text-sm">
                                <SummaryRow label="Total amount" value={formatCurrency(totalAmount)} strong />
                                <SummaryRow label="Amount paid" value={formatCurrency(amountPaid)} />
                                <SummaryRow label="Pending amount" value={formatCurrency(pendingAmount)} strong />
                                <SummaryRow label="Interest rate" value={`${interestRate}%`} />
                            </div>
                            <div className="mt-5 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-card-foreground">Progress</span>
                                    <span className="font-semibold text-muted-foreground">{progress}%</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-violet-600"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <UserRound className="size-4 text-muted-foreground" />
                                <span>Creator</span>
                                <span className="font-semibold text-card-foreground">{creator.name}</span>
                            </div>
                        </section>
                    </div>
                </aside>
            </div>

            <footer className="flex flex-col-reverse gap-3 border-t border-border bg-card px-5 py-4 sm:flex-row sm:justify-end">
                {readOnly ? (
                    <>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        {secondaryReadOnlyActionLabel && (
                            <Button type="button" variant="outline" onClick={onSecondaryReadOnlyAction}>
                                {secondaryReadOnlyActionLabel}
                            </Button>
                        )}
                        <Button type="button" className="bg-violet-600 hover:bg-violet-700" onClick={onEdit}>
                            Edit
                        </Button>
                    </>
                ) : (
                    <>
                        <Button type="button" variant="outline" onClick={onCancel}>
                            {cancelLabel}
                        </Button>
                        {!hideSubmit && (
                            <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
                                {submitLabel}
                            </Button>
                        )}
                    </>
                )}
            </footer>
        </form>
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
            <span className="mb-2 block text-xs font-medium text-muted-foreground">
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
        <div className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
            <span className="text-muted-foreground">{label}</span>
            <span className={strong ? "font-semibold text-card-foreground" : "text-muted-foreground"}>
                {value}
            </span>
        </div>
    );
}
