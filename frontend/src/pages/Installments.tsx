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

export default function Installments() {
    const { setNavConfig } = useOutletContext<NavContext>();

    useEffect(() => {
        setNavConfig({
            title: "Installments",
            showOrdersTabs: false,
        });
    }, []);
    return (
        <div>
            <p className="text-muted-foreground">Installments content will go here.</p>
        </div>
    );
}
