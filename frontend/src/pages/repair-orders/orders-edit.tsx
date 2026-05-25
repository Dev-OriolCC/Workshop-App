import { RepairOrderForm } from "@/components/repair-orders/RepairOrderForm";
import {
    getRepairOrderCreatedAt,
    getRepairOrderDetail,
    repairOrderServices,
    repairOrderUser,
} from "@/data/repair-orders";
import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { RepairOrderDraftPayload } from "@/types/repair-orders";

type RepairOrderEditLocationState = {
    repairOrder?: RepairOrderDraftPayload;
    repairOrderId?: string;
    repairOrderCreatedAt?: string | null;
};

export default function OrdersEdit() {
    const navigate = useNavigate();
    const { repairOrderId } = useParams();
    const location = useLocation();
    const state = location.state as RepairOrderEditLocationState | null;

    const initialValue = useMemo(() => {
        if (state?.repairOrder) return state.repairOrder;
        return repairOrderId ? getRepairOrderDetail(repairOrderId) : null;
    }, [repairOrderId, state]);

    const repairOrderCreatedAt = useMemo(() => {
        if (state?.repairOrderCreatedAt) return state.repairOrderCreatedAt;
        return repairOrderId ? getRepairOrderCreatedAt(repairOrderId) : null;
    }, [repairOrderId, state]);

    const handleUpdate = (payload: RepairOrderDraftPayload) => {
        console.log("Repair Order Update Draft:", {
            repairOrderId: state?.repairOrderId ?? repairOrderId,
            payload,
        });
    };

    if (!initialValue) {
        return (
            <section className="mx-auto max-w-4xl rounded-xl border border-border bg-background p-6 shadow-sm">
                <h2 className="text-xl font-bold text-foreground">Repair order not found</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    The selected static repair order could not be loaded.
                </p>
                <button
                    type="button"
                    className="mt-5 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
                    onClick={() => navigate("/repair-orders/board")}
                >
                    Go Back
                </button>
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-6xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <RepairOrderForm
                currentUser={initialValue.createdBy ?? repairOrderUser}
                services={repairOrderServices}
                initialValue={initialValue}
                eyebrow="Repair order workspace"
                title="Edit Repair Order"
                submitLabel="Update"
                cancelLabel="Go Back"
                onSubmit={handleUpdate}
                onClose={() => navigate("/repair-orders/board")}
                repairOrderCreatedAt={repairOrderCreatedAt ?? undefined}
            />
        </section>
    );
}
