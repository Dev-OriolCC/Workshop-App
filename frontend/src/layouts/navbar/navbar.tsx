import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NavigationSheet } from "@/components/navigation-sheet";
import { NavLink } from "react-router-dom";
import { SquarePlusIcon } from "lucide-react";

type NavbarProps = {
    title: string;
    showOrdersTabs: boolean;
    showModal: boolean;
    setShowModal: (v: boolean) => void;
};

export default function NavBar({ title, showOrdersTabs, showModal, setShowModal }: NavbarProps) {


    return (
        <nav className="sticky top-0 z-10 flex h-16 w-full items-center border-b bg-background px-4">
            <div className="flex h-full w-full items-center justify-between">
                {/* Left: Sidebar toggle + Page title */}
                <div className="flex items-center gap-3">
                    <SidebarTrigger />
                    <h2 className="text-lg font-semibold">{title}</h2>
                </div>

                <div className="flex items-center gap-3">
                    {showOrdersTabs && (
                        <>
                            <NavLink to="/repair-orders/board" className={({ isActive }) => isActive ? " active " : " text-muted "}>Orders Board</NavLink>
                            <NavLink to="/repair-orders/history" className={({ isActive }) => isActive ? " active " : " text-muted "}>History</NavLink>
                        </>
                    )}
                </div>


                {/* Right: Username button + Mobile Menu */}
                <div className="flex items-center gap-3">
                    {showOrdersTabs && (
                        <Button className="rounded-full " variant="outline" onClick={() => setShowModal(!showModal)} >
                            <SquarePlusIcon data-icon="inline-start" />
                            Create Repair Order
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