import { CreateRepairOrderModal } from "@/components/repair-orders/CreateRepairOrderModal";
import {
    repairOrderServices,
    repairOrderUser,
} from "@/data/repair-orders";
import { useEffect, useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
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
    const [modalMode, setModalMode] = useState<"create" | "view">("create");
    const [selectedRepairOrder, setSelectedRepairOrder] =
        useState<RepairOrderDraftPayload | null>(null);

    const handleCreateRepairOrder = (payload: RepairOrderDraftPayload) => {
        console.log("Repair Order Created:", payload);
    };

    const openRepairOrderDetails = (payload: RepairOrderDraftPayload) => {
        setSelectedRepairOrder(payload);
        setModalMode("view");
        setShowModal(true);
    };

    const handleOpenChange = (open: boolean) => {
        setShowModal(open);
        if (!open) {
            setSelectedRepairOrder(null);
            setModalMode("create");
        }
    };

    useEffect(() => {
        setNavConfig({
            title: "Repair Orders",
            showOrdersTabs: true,
            section: "repair-orders",
        });
    }, [setNavConfig]);

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
            />
            <Outlet context={{ openRepairOrderDetails }} />
        </div>
    );
}
