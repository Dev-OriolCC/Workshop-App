import { RepairOrderForm } from "@/components/repair-orders/RepairOrderForm";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import type {
    RepairOrderDraftPayload,
    ServiceSummary,
    UserSummary,
} from "@/types/repair-orders";

type RepairOrderModalMode = "create" | "view";

type CreateRepairOrderModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (payload: RepairOrderDraftPayload) => void;
    currentUser: UserSummary;
    services: ServiceSummary[];
    mode?: RepairOrderModalMode;
    initialValue?: RepairOrderDraftPayload | null;
    repairOrderCreatedAt?: string | null;
    onEdit?: () => void;
    onSendWhatsApp?: () => void;
};

export function CreateRepairOrderModal({
    open,
    onOpenChange,
    onSubmit,
    currentUser,
    services,
    mode = "create",
    initialValue,
    repairOrderCreatedAt,
    onEdit,
    onSendWhatsApp,
}: CreateRepairOrderModalProps) {
    const isViewMode = mode === "view";

    const handleSubmit = (payload: RepairOrderDraftPayload) => {
        onSubmit(payload);
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
                        className="relative flex max-h-[92svh] w-full max-w-6xl transform flex-col overflow-hidden rounded-xl bg-card text-left text-card-foreground shadow-2xl ring-1 ring-border transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in data-closed:sm:scale-95"
                    >
                        <RepairOrderForm
                            currentUser={currentUser}
                            services={services}
                            initialValue={isViewMode ? initialValue : null}
                            readOnly={isViewMode}
                            eyebrow={isViewMode ? "Repair order record" : "New ticket"}
                            title={isViewMode ? "Repair Order Details" : "Create Repair Order"}
                            submitLabel="Create Repair Order"
                            cancelLabel="Cancel"
                            onSubmit={handleSubmit}
                            onClose={() => onOpenChange(false)}
                            onSecondaryReadOnlyAction={onSendWhatsApp}
                            secondaryReadOnlyActionLabel={
                                isViewMode && onSendWhatsApp ? "Send WhatsApp Message" : undefined
                            }
                            onTertiaryReadOnlyAction={onEdit}
                            tertiaryReadOnlyActionLabel={isViewMode && onEdit ? "Edit" : undefined}
                            showCloseButton
                            repairOrderCreatedAt={repairOrderCreatedAt ?? undefined}
                        />
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}
