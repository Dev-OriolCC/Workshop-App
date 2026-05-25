import { Component } from "@/components/kanban"
import { getRepairOrderDetail } from "@/data/repair-orders";
import { useOutletContext } from "react-router-dom";
import type { RepairOrderDraftPayload } from "@/types/repair-orders";
import type { CardType } from "@/components/kanban";

type RepairOrdersBoardContext = {
    openRepairOrderDetails: (payload: RepairOrderDraftPayload, repairOrderId: string) => void;
};

export default function OrdersBoard() {
    const { openRepairOrderDetails } = useOutletContext<RepairOrdersBoardContext>();

    const handleOpenCard = (card: CardType) => {
        const payload = getRepairOrderDetail(card.ticket);
        if (!payload) return;
        openRepairOrderDetails(payload, card.ticket);
    };

    return (
        <Component onOpenCard={handleOpenCard} />
    )
}
