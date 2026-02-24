import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

type NavContext = {
    setNavConfig: React.Dispatch<
        React.SetStateAction<{
            title: string;
            showOrdersTabs: boolean;
        }>
    >;
};

export default function Home() {
    const { setNavConfig } = useOutletContext<NavContext>();

    useEffect(() => {
        setNavConfig({
            title: "Home",
            showOrdersTabs: false,
        });
    }, []);
    return (
        <div className="flex min-h-full flex-col items-center justify-center">
            <Button>Click me</Button>
        </div>
    );
}
