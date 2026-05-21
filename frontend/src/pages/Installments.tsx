import { CreateInstallmentModal } from "@/components/installments/CreateInstallmentModal";
import { useEffect } from "react";
import { Outlet, useLocation, useOutletContext } from "react-router-dom";
import type { NavSection } from "@/layouts/MainLayout";
import type { InstallmentDraftPayload, UserSummary } from "@/types/installments";

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

export default function Installments() {
    const { setNavConfig, showModal, setShowModal } = useOutletContext<NavContext>();
    const { pathname } = useLocation();
    const isEditRoute = pathname.startsWith("/installments/edit/");

    const handleCreateInstallment = (payload: InstallmentDraftPayload) => {
        console.log("Installment Created:", payload);
    };

    useEffect(() => {
        setNavConfig({
            title: isEditRoute ? "Edit Installment" : "Installments",
            showOrdersTabs: false,
            section: isEditRoute ? "none" : "installments",
        });
    }, [isEditRoute, setNavConfig]);

    return (
        <div>
            <CreateInstallmentModal
                open={showModal}
                onOpenChange={setShowModal}
                onSubmit={handleCreateInstallment}
                currentUser={currentUser}
            />
            <Outlet />
        </div>
    );
}
