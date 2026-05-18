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
    ClipboardList,
    Plus,
    Trash2,
    UserRound,
    Wrench,
    X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type {
    ClientDraft,
    PaymentMethod,
    RepairOrderDraftPayload,
    RepairOrderPaymentDraft,
    RepairOrderStatus,
    ServiceSummary,
    UserSummary,
} from "@/types/repair-orders";

type CreateRepairOrderModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (payload: RepairOrderDraftPayload) => void;
    currentUser: UserSummary;
    services: ServiceSummary[];
};

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

const createPayment = (): PaymentForm => ({
    id: crypto.randomUUID(),
    amount: 0,
    paymentMethod: "CASH",
    note: "",
});

export function CreateRepairOrderModal({
    open,
    onOpenChange,
    onSubmit,
    currentUser,
    services,
}: CreateRepairOrderModalProps) {
    const firstService = services[0];

    const createItem = (): ItemForm => ({
        id: crypto.randomUUID(),
        serviceId: firstService?.id ?? "",
        quantity: 1,
        unitPrice: firstService?.price ?? 0,
    });

    const [client, setClient] = useState<ClientDraft>(emptyClient);
    const [status, setStatus] = useState<RepairOrderStatus>("PENDING");
    const [comment, setComment] = useState("");
    const [items, setItems] = useState<ItemForm[]>([createItem()]);
    const [payments, setPayments] = useState<PaymentForm[]>([]);
    const [error, setError] = useState("");

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

    const resetForm = () => {
        setClient(emptyClient);
        setStatus("PENDING");
        setComment("");
        setItems([createItem()]);
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
        return "";
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        const payload: RepairOrderDraftPayload = {
            client: {
                name: client.name.trim(),
                alias: client.alias.trim(),
                phone: client.phone.trim(),
                email: client.email.trim(),
                comment: client.comment.trim(),
            },
            createdBy: currentUser,
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
                        className="relative flex max-h-[92svh] w-full max-w-6xl transform flex-col overflow-hidden rounded-xl bg-white text-left shadow-2xl ring-1 ring-slate-900/10 transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in data-closed:sm:scale-95"
                    >
                        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        New ticket
                                    </p>
                                    <h2 className="mt-1 text-xl font-semibold text-slate-950">
                                        Create Repair Order
                                    </h2>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Select
                                        value={status}
                                        onValueChange={(value) => setStatus(value as RepairOrderStatus)}
                                    >
                                        <SelectTrigger className="h-9 w-[150px] rounded-lg border-slate-200 bg-slate-50 text-xs font-semibold">
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

                            <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_22rem]">
                                <main className="space-y-5 p-5">
                                    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="mb-4 flex items-center gap-2">
                                            <UserRound className="size-4 text-violet-500" />
                                            <h3 className="text-sm font-semibold text-slate-950">
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
                                                />
                                            </FormField>
                                            <FormField label="Alias" htmlFor="repairorder-client-alias">
                                                <Input
                                                    id="repairorder-client-alias"
                                                    value={client.alias}
                                                    onChange={(event) => updateClient("alias", event.target.value)}
                                                    placeholder="Jorge C."
                                                />
                                            </FormField>
                                            <FormField label="Phone" htmlFor="repairorder-client-phone">
                                                <Input
                                                    id="repairorder-client-phone"
                                                    value={client.phone}
                                                    onChange={(event) => updateClient("phone", event.target.value)}
                                                    placeholder="9831808283"
                                                />
                                            </FormField>
                                            <FormField label="Email" htmlFor="repairorder-client-email">
                                                <Input
                                                    id="repairorder-client-email"
                                                    type="email"
                                                    value={client.email}
                                                    onChange={(event) => updateClient("email", event.target.value)}
                                                    placeholder="client@example.com"
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
                                            />
                                        </FormField>
                                    </section>

                                    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="mb-4 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <Wrench className="size-4 text-violet-500" />
                                                <h3 className="text-sm font-semibold text-slate-950">
                                                    Repair items
                                                </h3>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="gap-2 rounded-full"
                                                onClick={() => setItems((current) => [...current, createItem()])}
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
                                                        className="rounded-lg border border-slate-200 bg-slate-50/70 p-3"
                                                    >
                                                        <div className="mb-3 flex items-center justify-between">
                                                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                Item {index + 1}
                                                            </span>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-8 rounded-full text-slate-400 hover:text-red-500"
                                                                disabled={items.length === 1}
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
                                                                >
                                                                    <SelectTrigger id={`service-${item.id}`} className="bg-white">
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
                                                                    className="bg-white text-xs font-medium text-slate-500"
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
                                                                    className="bg-white"
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
                                                                    className="bg-white"
                                                                />
                                                            </FormField>
                                                            <div>
                                                                <p className="mb-2 text-xs font-medium text-slate-500">Subtotal</p>
                                                                <div className="flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950">
                                                                    {formatCurrency(subtotal)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>

                                    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="mb-4 flex items-center gap-2">
                                            <ClipboardList className="size-4 text-violet-500" />
                                            <h3 className="text-sm font-semibold text-slate-950">
                                                Order notes
                                            </h3>
                                        </div>
                                        <Textarea
                                            value={comment}
                                            onChange={(event) => setComment(event.target.value)}
                                            placeholder="Describe symptoms, promised work, parts needed, or pickup agreement"
                                            className="min-h-28"
                                        />
                                    </section>
                                </main>

                                <aside className="border-t border-slate-200 bg-slate-50/80 p-5 lg:border-l lg:border-t-0">
                                    <div className="space-y-5 lg:sticky lg:top-5">
                                        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                            <div className="mb-4 flex items-center gap-2">
                                                <CircleDollarSign className="size-4 text-violet-500" />
                                                <h3 className="text-sm font-semibold text-slate-950">
                                                    Payment summary
                                                </h3>
                                            </div>
                                            <div className="space-y-3 text-sm">
                                                <SummaryRow label="Total" value={formatCurrency(total)} strong />
                                                <SummaryRow label="Amount paid" value={formatCurrency(amountPaid)} />
                                                <SummaryRow label="Pending" value={formatCurrency(pendingAmount)} strong />
                                            </div>
                                        </section>

                                        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                            <div className="mb-4 flex items-center justify-between gap-3">
                                                <h3 className="text-sm font-semibold text-slate-950">Payments</h3>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-2 rounded-full"
                                                    onClick={() => setPayments((current) => [...current, createPayment()])}
                                                >
                                                    <Plus className="size-4" />
                                                    Add
                                                </Button>
                                            </div>

                                            {payments.length === 0 ? (
                                                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                                                    No payment yet. Add one if the client pays an advance.
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
                                                                            current.filter(
                                                                                (currentPayment) => currentPayment.id !== payment.id
                                                                            )
                                                                        )
                                                                    }
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
                                                                        className="bg-white"
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
                                                                    >
                                                                        <SelectTrigger id={`payment-method-${payment.id}`} className="bg-white">
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
                                                                        className="min-h-20 bg-white"
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
                                    Create Repair Order
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
