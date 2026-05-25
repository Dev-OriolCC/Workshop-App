import { InstallmentForm } from "@/components/installments/InstallmentForm";
import { WhatsAppMessagesPanel } from "@/components/installments/WhatsAppMessagesPanel";
import {
    findInstallmentById,
    installmentUser,
    toInstallmentDraftPayload,
} from "@/data/installments";
import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { InstallmentDraftPayload } from "@/types/installments";

type InstallmentEditLocationState = {
    installment?: InstallmentDraftPayload;
    installmentId?: string;
    installmentCreatedAt?: string;
    viewMode?: "edit" | "whatsapp";
};

export default function InstallmentsEdit() {
    const navigate = useNavigate();
    const { installmentId } = useParams();
    const location = useLocation();
    const state = location.state as InstallmentEditLocationState | null;

    const initialValue = useMemo(() => {
        if (state?.installment) return state.installment;

        const fallbackInstallment = findInstallmentById(installmentId);
        return fallbackInstallment ? toInstallmentDraftPayload(fallbackInstallment) : null;
    }, [installmentId, state]);
    const installmentCreatedAt =
        state?.installmentCreatedAt ?? findInstallmentById(installmentId)?.createdAt;
    const isWhatsAppMode = state?.viewMode === "whatsapp";

    const handleUpdate = (payload: InstallmentDraftPayload) => {
        console.log("Installment Update Draft:", {
            installmentId: state?.installmentId ?? installmentId,
            payload,
        });
    };

    if (!initialValue) {
        return (
            <section className="mx-auto max-w-4xl rounded-xl border border-border bg-background p-6 shadow-sm">
                <h2 className="text-xl font-bold text-foreground">Installment not found</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    The selected static installment could not be loaded.
                </p>
                <button
                    type="button"
                    className="mt-5 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
                    onClick={() => navigate("/installments/board")}
                >
                    Go Back
                </button>
            </section>
        );
    }

    return (
        <section className="mx-auto grid max-w-7xl gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <InstallmentForm
                    currentUser={initialValue.createdBy ?? installmentUser}
                    initialValue={initialValue}
                    eyebrow={
                        isWhatsAppMode
                            ? "WhatsApp message workspace"
                            : "Installment workspace"
                    }
                    title={isWhatsAppMode ? "Installment Details" : "Edit Installment"}
                    submitLabel="Update"
                    cancelLabel="Go Back"
                    onSubmit={handleUpdate}
                    onCancel={() => navigate("/installments/board")}
                    installmentCreatedAt={installmentCreatedAt}
                    fieldsDisabled={isWhatsAppMode}
                    hideSubmit={isWhatsAppMode}
                />
            </div>
            <WhatsAppMessagesPanel />
        </section>
    );
}
