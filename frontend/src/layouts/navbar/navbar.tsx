import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NavigationSheet } from "@/components/navigation-sheet";
import { NavLink, useLocation } from "react-router-dom";
import { SquarePlusIcon } from "lucide-react";
import type { NavSection } from "@/layouts/MainLayout";

type NavbarProps = {
    title: string;
    showOrdersTabs: boolean;
    section: NavSection;
    showModal: boolean;
    setShowModal: (v: boolean) => void;
};

export default function NavBar({ title, showOrdersTabs, section, showModal, setShowModal }: NavbarProps) {
    const { pathname } = useLocation();
    const isOrdersBoardActive = pathname === "/repair-orders" || pathname === "/repair-orders/board";
    const isInstallmentsBoardActive = pathname === "/installments" || pathname === "/installments/board";
    const showRepairOrdersNav = section === "repair-orders" || showOrdersTabs;
    const showInstallmentsNav = section === "installments";
    const showSectionNav = showRepairOrdersNav || showInstallmentsNav;
    const boardTo = showInstallmentsNav ? "/installments" : "/repair-orders";
    const historyTo = showInstallmentsNav ? "/installments/history" : "/repair-orders/history";
    const boardLabel = showInstallmentsNav ? "Installments Board" : "Orders Board";
    const actionLabel = showInstallmentsNav ? "Create Installment" : "Create Repair Order";
    const isBoardActive = showInstallmentsNav ? isInstallmentsBoardActive : isOrdersBoardActive;

    const handleSectionAction = () => {
        if (showInstallmentsNav) {
            setShowModal(!showModal);
            return;
        }

        setShowModal(!showModal);
    };

    return (
        <nav className="sticky top-0 z-10 flex h-16 w-full items-center border-b bg-background px-4">
            <div className="flex h-full w-full items-center justify-between">
                {/* Left: Sidebar toggle + Page title */}
                <div className="flex items-center gap-3">
                    <SidebarTrigger />
                    <h2 className="text-lg font-semibold">{title}</h2>
                </div>

                <div className="flex items-center gap-3">
                    {showSectionNav && (
                        <div className="flex items-center gap-1 rounded-full border border-border bg-muted/50 p-1 shadow-sm">
                            <NavLink
                                to={boardTo}
                                className={() =>
                                    `rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                        isBoardActive
                                            ? "border border-border bg-background text-foreground shadow-sm"
                                            : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                                    }`
                                }
                            >
                                {boardLabel}
                            </NavLink>
                            <NavLink
                                to={historyTo}
                                className={({ isActive }) =>
                                    `rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                        isActive
                                            ? "border border-border bg-background text-foreground shadow-sm"
                                            : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                                    }`
                                }
                            >
                                History
                            </NavLink>
                        </div>
                    )}
                </div>


                {/* Right: Username button + Mobile Menu */}
                <div className="flex items-center gap-3">
                    {showSectionNav && (
                        <Button className="rounded-full " variant="outline" onClick={handleSectionAction} >
                            <SquarePlusIcon data-icon="inline-start" />
                            {actionLabel}
                        </Button>
                    )}
                    <Button className="rounded-full">Username</Button>

                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <NavigationSheet />
                    </div>
                </div>
            </div>
        </nav>
    );
}
