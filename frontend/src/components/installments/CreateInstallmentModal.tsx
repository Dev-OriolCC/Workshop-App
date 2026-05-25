import { InstallmentForm } from "@/components/installments/InstallmentForm";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import type {
    InstallmentDraftPayload,
    InstallmentModalMode,
    UserSummary,
} from "@/types/installments";

type CreateInstallmentModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (payload: InstallmentDraftPayload) => void;
    currentUser: UserSummary;
    mode?: InstallmentModalMode;
    initialValue?: InstallmentDraftPayload | null;
    onUpdate?: (payload: InstallmentDraftPayload) => void;
    onModeChange?: (mode: InstallmentModalMode) => void;
    onEdit?: () => void;
    onSendWhatsApp?: () => void;
    installmentCreatedAt?: string;
};

export function CreateInstallmentModal({
    open,
    onOpenChange,
    onSubmit,
    currentUser,
    mode = "create",
    initialValue,
    onUpdate,
    onModeChange,
    onEdit,
    onSendWhatsApp,
    installmentCreatedAt,
}: CreateInstallmentModalProps) {
    const isViewMode = mode === "view";
    const isEditMode = mode === "edit";

    const handleEdit = () => {
        if (onEdit) {
            onEdit();
            return;
        }

        onModeChange?.("edit");
    };

    const handleSubmit = (payload: InstallmentDraftPayload) => {
        if (isEditMode) {
            onUpdate?.(payload);
            onModeChange?.("view");
            return;
        }

        onSubmit(payload);
        onOpenChange(false);
    };

    const handleCancel = () => {
        if (isEditMode) {
            onModeChange?.("view");
            return;
        }

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
                        className="relative flex max-h-[92svh] w-full max-w-5xl transform flex-col overflow-hidden rounded-xl bg-card text-left text-card-foreground shadow-2xl ring-1 ring-border transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in data-closed:sm:scale-95"
                    >
                        <InstallmentForm
                            currentUser={currentUser}
                            initialValue={initialValue}
                            readOnly={isViewMode}
                            eyebrow={mode === "create" ? "New financing ticket" : "Installment record"}
                            title={mode === "create" ? "Create Installment" : "Installment Details"}
                            submitLabel={isEditMode ? "Update Installment" : "Create Installment"}
                            cancelLabel="Cancel"
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            onClose={() => onOpenChange(false)}
                            onEdit={handleEdit}
                            onSecondaryReadOnlyAction={onSendWhatsApp}
                            secondaryReadOnlyActionLabel={
                                onSendWhatsApp ? "Send WhatsApp Message" : undefined
                            }
                            showCloseButton
                            installmentCreatedAt={installmentCreatedAt}
                        />
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}
