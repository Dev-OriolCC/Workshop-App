import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./navbar/navbar";
import { useState } from "react";

const pageTitles: Record<string, string> = {
    "/": "Home",
    "/repair-orders": "Repair Orders",
    "/installments": "Installments",
};

export default function MainLayout() {
    const { pathname } = useLocation();
    //const title = pageTitles[pathname] ?? "Workshop App";
    const [navConfig, setNavConfig] = useState({
        title: "",
        showOrdersTabs: false,
    });

    const [showModal, setShowModal] = useState(false);

    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="flex flex-1 flex-col min-h-svh w-full overflow-auto">
                <NavBar {...navConfig} 
                    showModal = {showModal}  
                    setShowModal = {setShowModal} 
                />
                <div className="flex-1 p-6">
                    <Outlet context={{ setNavConfig, showModal, setShowModal }} />
                </div>
            </main>
        </SidebarProvider>
    );
}