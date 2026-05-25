import { CreateRepairOrderModal } from "@/components/repair-orders/CreateRepairOrderModal";
import {
    getRepairOrderCreatedAt,
    repairOrderServices,
    repairOrderUser,
} from "@/data/repair-orders";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, useOutletContext } from "react-router-dom";
import type {
    RepairOrderDraftPayload,
} from "@/types/repair-orders";
import type { NavSection } from "@/layouts/MainLayout";

type NavContext = {
    setNavConfig: React.Dispatch<
        React.SetStateAction<{
            title: string;
            showOrdersTabs: boolean;
            section: NavSection;
        }>
    >;
    showModal: boolean;
    setShowModal: (v: boolean) => void;
};

export default function RepairOrders() {
    const { setNavConfig, showModal, setShowModal } = useOutletContext<NavContext>();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const isEditRoute = pathname.startsWith("/repair-orders/edit/");
    const [modalMode, setModalMode] = useState<"create" | "view">("create");
    const [selectedRepairOrder, setSelectedRepairOrder] =
        useState<RepairOrderDraftPayload | null>(null);
    const [selectedRepairOrderId, setSelectedRepairOrderId] = useState<string | null>(null);
    const [selectedRepairOrderCreatedAt, setSelectedRepairOrderCreatedAt] =
        useState<string | null>(null);

    const handleCreateRepairOrder = (payload: RepairOrderDraftPayload) => {
        console.log("Repair Order Created:", payload);
    };

    const openRepairOrderDetails = (payload: RepairOrderDraftPayload, repairOrderId: string) => {
        setSelectedRepairOrder(payload);
        setSelectedRepairOrderId(repairOrderId);
        setSelectedRepairOrderCreatedAt(getRepairOrderCreatedAt(repairOrderId));
        setModalMode("view");
        setShowModal(true);
    };

    const handleEditRepairOrder = () => {
        if (!selectedRepairOrder || !selectedRepairOrderId) return;

        setShowModal(false);
        navigate(`/repair-orders/edit/${selectedRepairOrderId}`, {
            state: {
                repairOrder: selectedRepairOrder,
                repairOrderId: selectedRepairOrderId,
                repairOrderCreatedAt: selectedRepairOrderCreatedAt,
            },
        });
    };

    const handleOpenChange = (open: boolean) => {
        setShowModal(open);
        if (!open) {
            setSelectedRepairOrder(null);
            setSelectedRepairOrderId(null);
            setSelectedRepairOrderCreatedAt(null);
            setModalMode("create");
        }
    };

    useEffect(() => {
        setNavConfig({
            title: isEditRoute ? "Edit Repair Order" : "Repair Orders",
            showOrdersTabs: !isEditRoute,
            section: isEditRoute ? "none" : "repair-orders",
        });
    }, [isEditRoute, setNavConfig]);

    useEffect(() => {
        if (showModal && !selectedRepairOrder) {
            setModalMode("create");
        }
    }, [selectedRepairOrder, showModal]);

    return (
        <div>
            <CreateRepairOrderModal
                open={showModal}
                onOpenChange={handleOpenChange}
                onSubmit={handleCreateRepairOrder}
                currentUser={repairOrderUser}
                services={repairOrderServices}
                mode={modalMode}
                initialValue={selectedRepairOrder}
                repairOrderCreatedAt={selectedRepairOrderCreatedAt}
                onEdit={handleEditRepairOrder}
            />
            <Outlet context={{ openRepairOrderDetails }} />
        </div>
    );
}
