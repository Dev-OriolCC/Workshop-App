import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Outlet } from "react-router-dom";
import NavBar from "./navbar/navbar";
import { useState } from "react";

export default function MainLayout() {
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
