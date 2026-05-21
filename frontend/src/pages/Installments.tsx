import { useEffect } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import type { NavSection } from "@/layouts/MainLayout";

type NavContext = {
    setNavConfig: React.Dispatch<
        React.SetStateAction<{
            title: string;
            showOrdersTabs: boolean;
            section: NavSection;
        }>
    >;
};

export default function Installments() {
    const { setNavConfig } = useOutletContext<NavContext>();

    useEffect(() => {
        setNavConfig({
            title: "Installments",
            showOrdersTabs: false,
            section: "installments",
        });
    }, [setNavConfig]);

    return (
        <div>
            <Outlet />
        </div>
    );
}
