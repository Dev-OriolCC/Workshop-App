import { CreateRepairOrderModal } from "@/components/repair-orders/CreateRepairOrderModal";
import { useEffect } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import type {
    RepairOrderDraftPayload,
    ServiceSummary,
    UserSummary,
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

const currentUser: UserSummary = {
    id: 1,
    name: "Carmela",
    email: "carmela@workshop.test",
    phone: "9831808283",
};

const services: ServiceSummary[] = [
    {
        id: "1",
        name: "Reel repair",
        category: "REEL_REPAIR",
        price: 450,
        active: true,
    },
    {
        id: "2",
        name: "Rod repair",
        category: "ROD_REPAIR",
        price: 320,
        active: true,
    },
    {
        id: "3",
        name: "Maintenance",
        category: "MAINTENANCE",
        price: 250,
        active: true,
    },
    {
        id: "4",
        name: "Other service",
        category: "OTHER",
        price: 0,
        active: true,
    },
];

export default function RepairOrders() {
    const { setNavConfig, showModal, setShowModal } = useOutletContext<NavContext>();

    const handleCreateRepairOrder = (payload: RepairOrderDraftPayload) => {
        console.log("Repair Order Created:", payload);
    };

    useEffect(() => {
        setNavConfig({
            title: "Repair Orders",
            showOrdersTabs: true,
            section: "repair-orders",
        });
    }, [setNavConfig]);

    return (
        <div>
            <CreateRepairOrderModal
                open={showModal}
                onOpenChange={setShowModal}
                onSubmit={handleCreateRepairOrder}
                currentUser={currentUser}
                services={services}
            />
            <Outlet />
        </div>
    );
}
