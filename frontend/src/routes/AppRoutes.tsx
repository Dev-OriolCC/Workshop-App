import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import MainLayout from "@/layouts/MainLayout";
import RepairOrders from "@/pages/RepairOrders";
import Installments from "@/pages/Installments";
import OrdersBoard from "@/pages/repair-orders/orders-board";
import OrdersHistory from "@/pages/repair-orders/orders-history";
import InstallmentsBoard from "@/pages/installments/installments-board";
import InstallmentsHistory from "@/pages/installments/installments-history";

export default function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/repair-orders" element={<RepairOrders />}>
                        <Route index element={<OrdersBoard />} />
                        <Route path="board" element={<OrdersBoard />} />
                        <Route path="history" element={<OrdersHistory />} />
                    </Route>
                    <Route path="/installments" element={<Installments />}>
                        <Route index element={<InstallmentsBoard />} />
                        <Route path="board" element={<InstallmentsBoard />} />
                        <Route path="history" element={<InstallmentsHistory />} />
                    </Route>
                </Route>
            </Routes>
        </Router>
    );
}
