import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import MainLayout from "@/layouts/MainLayout";
import RepairOrders from "@/pages/RepairOrders";
import Installments from "@/pages/Installments";
import OrdersBoard from "@/pages/repair-orders/orders-board";
import OrdersEdit from "@/pages/repair-orders/orders-edit";
import OrdersHistory from "@/pages/repair-orders/orders-history";
import InstallmentsBoard from "@/pages/installments/installments-board";
import InstallmentsHistory from "@/pages/installments/installments-history";
import InstallmentsEdit from "@/pages/installments/installments-edit";

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
                        <Route path="edit/:repairOrderId" element={<OrdersEdit />} />
                    </Route>
                    <Route path="/installments" element={<Installments />}>
                        <Route index element={<InstallmentsBoard />} />
                        <Route path="board" element={<InstallmentsBoard />} />
                        <Route path="history" element={<InstallmentsHistory />} />
                        <Route path="edit/:installmentId" element={<InstallmentsEdit />} />
                    </Route>
                </Route>
            </Routes>
        </Router>
    );
}
