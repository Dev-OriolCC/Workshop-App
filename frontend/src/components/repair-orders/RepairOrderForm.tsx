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
    ClipboardList,
    Plus,
    Trash2,
    UserRound,
    Wrench,
    X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import toast from "react-hot-toast";
import type {
    ClientDraft,
    PaymentMethod,
    RepairOrderDraftPayload,
    RepairOrderPaymentDraft,
    RepairOrderStatus,
    ServiceSummary,
    UserSummary,
} from "@/types/repair-orders";

type ItemForm = {
    id: string;
    serviceId: string;
    quantity: number;
    unitPrice: number;
};

type PaymentForm = {
    id: string;
    amount: number;
    paymentMethod: PaymentMethod;
    note: string;
    createdAt: string;
};

type RepairOrderFormProps = {
    currentUser: UserSummary;
    services: ServiceSummary[];
    initialValue?: RepairOrderDraftPayload | null;
    readOnly?: boolean;
    eyebrow: string;
    title: string;
    submitLabel?: string;
    cancelLabel?: string;
    onSubmit?: (payload: RepairOrderDraftPayload) => void;
    onClose?: () => void;
    onSecondaryReadOnlyAction?: () => void;
    secondaryReadOnlyActionLabel?: string;
    onTertiaryReadOnlyAction?: () => void;
    tertiaryReadOnlyActionLabel?: string;
    showCloseButton?: boolean;
    repairOrderCreatedAt?: string;
    fieldsDisabled?: boolean;
    hideSubmit?: boolean;
};

const emptyClient: ClientDraft = {
    name: "",
    alias: "",
    phone: "",
    email: "",
    comment: "",
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);

const toDateInputValue = (value: string | Date) => {
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
};

const todayDateInputValue = () => toDateInputValue(new Date());

const createPayment = (): PaymentForm => ({
    id: crypto.randomUUID(),
    amount: 0,
    paymentMethod: "CASH",
    note: "",
    createdAt: todayDateInputValue(),
});

export function RepairOrderForm({
    currentUser,
    services,
    initialValue,
    readOnly = false,
    eyebrow,
    title,
    submitLabel = "Create Repair Order",
    cancelLabel = "Cancel",
    onSubmit,
    onClose,
    onSecondaryReadOnlyAction,
    secondaryReadOnlyActionLabel,
    onTertiaryReadOnlyAction,
    tertiaryReadOnlyActionLabel,
    showCloseButton = false,
    repairOrderCreatedAt,
    fieldsDisabled = false,
    hideSubmit = false,
}: RepairOrderFormProps) {
    const firstService = services[0];

    const createItem = (): ItemForm => ({
        id: crypto.randomUUID(),
        serviceId: firstService?.id ?? "",
        quantity: 1,
        unitPrice: firstService?.price ?? 0,
    });

    const [client, setClient] = useState<ClientDraft>({ ...emptyClient });
    const [status, setStatus] = useState<RepairOrderStatus>("PENDING");
    const [comment, setComment] = useState("");
    const [items, setItems] = useState<ItemForm[]>([createItem()]);
    const [payments, setPayments] = useState<PaymentForm[]>([]);

    const getService = (serviceId: string) =>
        services.find((service) => service.id === serviceId) ?? firstService;

    const total = useMemo(
        () =>
            items.reduce(
                (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
                0
            ),
        [items]
    );

    const amountPaid = useMemo(
        () => payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
        [payments]
    );

    const pendingAmount = Math.max(total - amountPaid, 0);
    const creator = initialValue?.createdBy ?? currentUser;
    const repairOrderDate = toDateInputValue(repairOrderCreatedAt ?? new Date());
    const controlsDisabled = readOnly || fieldsDisabled;

    const resetForm = () => {
        setClient({ ...emptyClient });
        setStatus("PENDING");
        setComment("");
        setItems([createItem()]);
        setPayments([]);
    };

    const hydrateForm = (value: RepairOrderDraftPayload) => {
        setClient({ ...value.client });
        setStatus(value.status);
        setComment(value.comment);
        setItems(
            value.items.map((item) => ({
                id: item.id,
                serviceId: item.service.id,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            }))
        );
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

    const updateItem = (id: string, field: keyof ItemForm, value: string | number) => {
        setItems((current) =>
            current.map((item) => {
                if (item.id !== id) return item;

                if (field === "serviceId") {
                    const service = getService(String(value));
                    return {
                        ...item,
                        serviceId: service?.id ?? "",
                        unitPrice: service?.price ?? 0,
                    };
                }

                return {
                    ...item,
                    [field]: Number(value),
                };
            })
        );
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
        if (items.length === 0) return "At least one repair item is required.";
        if (items.some((item) => !item.serviceId || item.quantity < 1 || item.unitPrice < 0)) {
            return "Each item needs a service, quantity of at least 1, and a non-negative unit price.";
        }
        if (payments.some((payment) => payment.amount < 0)) {
            return "Payment amounts cannot be negative.";
        }
        if (
            payments.some(
                (payment) =>
                    payment.createdAt &&
                    repairOrderDate &&
                    payment.createdAt < repairOrderDate
            )
        ) {
            return "Payment date cannot be before the repair order date.";
        }
        return "";
    };

    const buildPayload = (): RepairOrderDraftPayload => ({
        client: {
            name: client.name.trim(),
            alias: client.alias.trim(),
            phone: client.phone.trim(),
            email: client.email.trim(),
            comment: client.comment.trim(),
        },
        createdBy: creator,
        status,
        comment: comment.trim(),
        total,
        amountPaid,
        pendingAmount,
        items: items.map((item) => {
            const service = getService(item.serviceId);
            return {
                id: item.id,
                service,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.quantity * item.unitPrice,
            };
        }),
        payments: payments.map((payment): RepairOrderPaymentDraft => ({
            id: payment.id,
            amount: payment.amount,
            paymentMethod: payment.paymentMethod,
            note: payment.note.trim(),
            createdAt: payment.createdAt,
        })),
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (controlsDisabled) return;

        const validationError = validate();
        if (validationError) {
            toast.error(validationError);
            return;
        }

        onSubmit?.(buildPayload());
    };

    return (
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {eyebrow}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-card-foreground">
                        {title}
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    <Select
                        value={status}
                        onValueChange={(value) => setStatus(value as RepairOrderStatus)}
                        disabled={controlsDisabled}
                    >
                        <SelectTrigger className="h-9 w-[150px] rounded-lg border-border bg-muted/50 text-xs font-semibold">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                                <SelectItem value="READY">Ready</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
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

            <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_22rem]">
                <main className="space-y-5 p-5">
                    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <UserRound className="size-4 text-violet-500" />
                            <h3 className="text-sm font-semibold text-card-foreground">
                                Client information
                            </h3>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField label="Client name" htmlFor="repairorder-client-name" required>
                                <Input
                                    id="repairorder-client-name"
                                    value={client.name}
                                    onChange={(event) => updateClient("name", event.target.value)}
                                    placeholder="Jorge Cortes"
                                    required
                                    disabled={controlsDisabled}
                                />
                            </FormField>
                            <FormField label="Alias" htmlFor="repairorder-client-alias">
                                <Input
                                    id="repairorder-client-alias"
                                    value={client.alias}
                                    onChange={(event) => updateClient("alias", event.target.value)}
                                    placeholder="Jorge C."
                                    disabled={controlsDisabled}
                                />
                            </FormField>
                            <FormField label="Phone" htmlFor="repairorder-client-phone">
                                <InternationalPhoneInput
                                    id="repairorder-client-phone"
                                    value={client.phone}
                                    onChange={(value) => updateClient("phone", value)}
                                    placeholder="+52 983 180 8283"
                                    disabled={controlsDisabled}
                                    readOnly={controlsDisabled}
                                />
                            </FormField>
                            <FormField label="Email" htmlFor="repairorder-client-email">
                                <Input
                                    id="repairorder-client-email"
                                    type="email"
                                    value={client.email}
                                    onChange={(event) => updateClient("email", event.target.value)}
                                    placeholder="client@example.com"
                                    disabled={controlsDisabled}
                                />
                            </FormField>
                        </div>
                        <FormField
                            label="Client notes"
                            htmlFor="repairorder-client-comment"
                            className="mt-4"
                        >
                            <Textarea
                                id="repairorder-client-comment"
                                value={client.comment}
                                onChange={(event) => updateClient("comment", event.target.value)}
                                placeholder="Preferences, pickup details, or contact notes"
                                disabled={controlsDisabled}
                            />
                        </FormField>
                    </section>

                    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <Wrench className="size-4 text-violet-500" />
                                <h3 className="text-sm font-semibold text-card-foreground">
                                    Repair items
                                </h3>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-2 rounded-full"
                                onClick={() => setItems((current) => [...current, createItem()])}
                                disabled={controlsDisabled}
                            >
                                <Plus className="size-4" />
                                Add item
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => {
                                const service = getService(item.serviceId);
                                const subtotal = item.quantity * item.unitPrice;

                                return (
                                    <div
                                        key={item.id}
                                        className="rounded-lg border border-border bg-muted/40 p-3"
                                    >
                                        <div className="mb-3 flex items-center justify-between">
                                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                Item {index + 1}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="size-8 rounded-full text-muted-foreground hover:text-red-500"
                                                disabled={controlsDisabled || items.length === 1}
                                                onClick={() =>
                                                    setItems((current) =>
                                                        current.filter((currentItem) => currentItem.id !== item.id)
                                                    )
                                                }
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_1fr_0.8fr_0.8fr_0.8fr]">
                                            <FormField label="Service" htmlFor={`service-${item.id}`}>
                                                <Select
                                                    value={item.serviceId}
                                                    onValueChange={(value) => updateItem(item.id, "serviceId", value)}
                                                    disabled={controlsDisabled}
                                                >
                                                    <SelectTrigger id={`service-${item.id}`} className="bg-background">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {services
                                                                .filter((serviceOption) => serviceOption.active)
                                                                .map((serviceOption) => (
                                                                    <SelectItem key={serviceOption.id} value={serviceOption.id}>
                                                                        {serviceOption.name}
                                                                    </SelectItem>
                                                                ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </FormField>
                                            <FormField label="Category" htmlFor={`category-${item.id}`}>
                                                <Input
                                                    id={`category-${item.id}`}
                                                    value={service?.category.replace("_", " ") ?? ""}
                                                    readOnly
                                                    className="bg-background text-xs font-medium text-muted-foreground"
                                                />
                                            </FormField>
                                            <FormField label="Qty" htmlFor={`quantity-${item.id}`}>
                                                <Input
                                                    id={`quantity-${item.id}`}
                                                    type="number"
                                                    min={1}
                                                    value={item.quantity}
                                                    onChange={(event) => updateItem(item.id, "quantity", event.target.value)}
                                                    required
                                                    className="bg-background"
                                                    disabled={controlsDisabled}
                                                />
                                            </FormField>
                                            <FormField label="Unit price" htmlFor={`unit-price-${item.id}`}>
                                                <Input
                                                    id={`unit-price-${item.id}`}
                                                    type="number"
                                                    min={0}
                                                    step="0.01"
                                                    value={item.unitPrice}
                                                    onChange={(event) => updateItem(item.id, "unitPrice", event.target.value)}
                                                    required
                                                    className="bg-background"
                                                    disabled={controlsDisabled}
                                                />
                                            </FormField>
                                            <div>
                                                <p className="mb-2 text-xs font-medium text-muted-foreground">Subtotal</p>
                                                <div className="flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm font-semibold text-card-foreground">
                                                    {formatCurrency(subtotal)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <ClipboardList className="size-4 text-violet-500" />
                            <h3 className="text-sm font-semibold text-card-foreground">
                                Order notes
                            </h3>
                        </div>
                        <Textarea
                            value={comment}
                            onChange={(event) => setComment(event.target.value)}
                            placeholder="Describe symptoms, promised work, parts needed, or pickup agreement"
                            className="min-h-28"
                            disabled={controlsDisabled}
                        />
                    </section>
                </main>

                <aside className="border-t border-border bg-muted/30 p-5 lg:border-l lg:border-t-0">
                    <div className="space-y-5 lg:sticky lg:top-5">
                        <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <CircleDollarSign className="size-4 text-violet-500" />
                                <h3 className="text-sm font-semibold text-card-foreground">
                                    Payment summary
                                </h3>
                            </div>
                            <div className="space-y-3 text-sm">
                                <SummaryRow label="Total" value={formatCurrency(total)} strong />
                                <SummaryRow label="Amount paid" value={formatCurrency(amountPaid)} />
                                <SummaryRow label="Pending" value={formatCurrency(pendingAmount)} strong />
                            </div>
                        </section>

                        <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h3 className="text-sm font-semibold text-card-foreground">Payments</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 rounded-full"
                                    onClick={() => setPayments((current) => [...current, createPayment()])}
                                    disabled={controlsDisabled}
                                >
                                    <Plus className="size-4" />
                                    Add
                                </Button>
                            </div>

                            {payments.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                                    No payment yet. Add one if the client pays an advance.
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
                                                            current.filter(
                                                                (currentPayment) => currentPayment.id !== payment.id
                                                            )
                                                        )
                                                    }
                                                    disabled={controlsDisabled}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                            <div className="space-y-3">
                                                <FormField label="Amount" htmlFor={`payment-amount-${payment.id}`}>
                                                    <Input
                                                        id={`payment-amount-${payment.id}`}
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
                                                <FormField label="Date" htmlFor={`payment-date-${payment.id}`}>
                                                    <DatePicker
                                                        id={`payment-date-${payment.id}`}
                                                        value={payment.createdAt}
                                                        onChange={(value) =>
                                                            updatePayment(payment.id, "createdAt", value)
                                                        }
                                                        disabled={controlsDisabled}
                                                    />
                                                </FormField>
                                                <FormField label="Method" htmlFor={`payment-method-${payment.id}`}>
                                                    <Select
                                                        value={payment.paymentMethod}
                                                        onValueChange={(value) =>
                                                            updatePayment(
                                                                payment.id,
                                                                "paymentMethod",
                                                                value as PaymentMethod
                                                            )
                                                        }
                                                        disabled={controlsDisabled}
                                                    >
                                                        <SelectTrigger id={`payment-method-${payment.id}`} className="bg-background">
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
                                                <FormField label="Note" htmlFor={`payment-note-${payment.id}`}>
                                                    <Textarea
                                                        id={`payment-note-${payment.id}`}
                                                        value={payment.note}
                                                        onChange={(event) =>
                                                            updatePayment(payment.id, "note", event.target.value)
                                                        }
                                                        placeholder="Reference, authorization, or cashier note"
                                                        className="min-h-20 bg-background"
                                                        disabled={controlsDisabled}
                                                    />
                                                </FormField>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </aside>
            </div>

            <footer className="flex flex-col-reverse gap-3 border-t border-border bg-card px-5 py-4 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={onClose}>
                    {readOnly ? "Close" : cancelLabel}
                </Button>
                {readOnly && secondaryReadOnlyActionLabel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onSecondaryReadOnlyAction}
                    >
                        {secondaryReadOnlyActionLabel}
                    </Button>
                )}
                {readOnly && tertiaryReadOnlyActionLabel && (
                    <Button
                        type="button"
                        className="bg-violet-600 hover:bg-violet-700"
                        onClick={onTertiaryReadOnlyAction}
                    >
                        {tertiaryReadOnlyActionLabel}
                    </Button>
                )}
                {!readOnly && !hideSubmit && (
                    <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
                        {submitLabel}
                    </Button>
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
