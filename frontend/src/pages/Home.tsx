import {
    AreaChartPanel,
    DistributionPanel,
    DonutChartPanel,
    HistoryLinkCard,
    RecentActivity,
    StatCard,
    type RangeKey,
    type SeriesPoint,
} from "@/components/home/dashboard-widgets";
import { repairOrderCreatedAtByTicket, repairOrderDetails } from "@/data/repair-orders";
import { initialInstallments } from "@/data/installments";
import type { NavSection } from "@/layouts/MainLayout";
import {
    CalendarClock,
    ClipboardList,
    CreditCard,
    History,
    PackageCheck,
    ReceiptText,
    Search,
    WalletCards,
    Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

type NavContext = {
    setNavConfig: React.Dispatch<
        React.SetStateAction<{
            title: string;
            showOrdersTabs: boolean;
            section: NavSection;
        }>
    >;
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);

const formatDateTime = (value: Date) =>
    new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(value);

const trendData: Record<RangeKey, SeriesPoint[]> = {
    "3m": [
        { label: "Mar", repairOrders: 12, installments: 5 },
        { label: "Apr", repairOrders: 18, installments: 7 },
        { label: "May", repairOrders: 24, installments: 9 },
    ],
    "30d": [
        { label: "W1", repairOrders: 5, installments: 2 },
        { label: "W2", repairOrders: 8, installments: 3 },
        { label: "W3", repairOrders: 6, installments: 4 },
        { label: "W4", repairOrders: 10, installments: 5 },
    ],
    "7d": [
        { label: "Mon", repairOrders: 2, installments: 1 },
        { label: "Tue", repairOrders: 4, installments: 1 },
        { label: "Wed", repairOrders: 3, installments: 2 },
        { label: "Thu", repairOrders: 5, installments: 1 },
        { label: "Fri", repairOrders: 4, installments: 3 },
        { label: "Sat", repairOrders: 2, installments: 1 },
        { label: "Sun", repairOrders: 3, installments: 0 },
    ],
};

export default function Home() {
    const { setNavConfig } = useOutletContext<NavContext>();
    const [now, setNow] = useState(() => new Date());
    const [range, setRange] = useState<RangeKey>("30d");

    useEffect(() => {
        setNavConfig({
            title: "Home",
            showOrdersTabs: false,
            section: "none",
        });
    }, [setNavConfig]);

    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), 60_000);
        return () => window.clearInterval(timer);
    }, []);

    const metrics = useMemo(() => {
        const repairOrders = Object.entries(repairOrderDetails).map(([ticket, order]) => ({
            ticket,
            createdAt: repairOrderCreatedAtByTicket[ticket],
            ...order,
        }));
        const repairRevenue = repairOrders.reduce((sum, order) => sum + order.total, 0);
        const repairPaid = repairOrders.reduce((sum, order) => sum + order.amountPaid, 0);
        const installmentTotal = initialInstallments.reduce(
            (sum, installment) => sum + installment.totalAmount,
            0
        );
        const installmentPaid = initialInstallments.reduce(
            (sum, installment) => sum + installment.amountPaid,
            0
        );
        const installmentOwed = initialInstallments.reduce(
            (sum, installment) => sum + installment.pendingAmount,
            0
        );

        return {
            repairOrders,
            totalRepairOrders: repairOrders.length,
            totalInstallments: initialInstallments.length,
            repairRevenue,
            repairPaid,
            installmentTotal,
            installmentPaid,
            installmentOwed,
        };
    }, []);

    const repairStatusItems = useMemo(() => {
        const counts = metrics.repairOrders.reduce<Record<string, number>>((current, order) => {
            current[order.status] = (current[order.status] ?? 0) + 1;
            return current;
        }, {});

        return [
            { label: "Pending", value: counts.PENDING ?? 0, color: "bg-amber-500" },
            { label: "In progress", value: counts.IN_PROGRESS ?? 0, color: "bg-sky-500" },
            { label: "Ready", value: counts.READY ?? 0, color: "bg-violet-500" },
            { label: "Completed", value: counts.COMPLETED ?? 0, color: "bg-emerald-500" },
        ];
    }, [metrics.repairOrders]);

    const installmentStatusItems = useMemo(() => {
        const counts = initialInstallments.reduce<Record<string, number>>((current, installment) => {
            current[installment.status] = (current[installment.status] ?? 0) + 1;
            return current;
        }, {});

        return [
            { label: "Active", value: counts.ACTIVE ?? 0, color: "bg-sky-500" },
            { label: "Completed", value: counts.COMPLETED ?? 0, color: "bg-emerald-500" },
            { label: "Defaulted", value: counts.DEFAULTED ?? 0, color: "bg-rose-500" },
        ];
    }, []);

    const recentActivity = useMemo(() => {
        const repairItems = metrics.repairOrders
            .map((order) => ({
                date: order.createdAt,
                label: `${order.ticket} · ${order.client.name}`,
                detail: order.items[0]?.service.name ?? "Repair order",
                value: order.status.replace("_", " "),
                tone: "bg-violet-50 text-violet-700",
            }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3);

        const installmentItems = initialInstallments
            .map((installment) => ({
                date: installment.createdAt,
                label: `${installment.id} · ${installment.client.name}`,
                detail: installment.article,
                value: formatCurrency(installment.pendingAmount),
                tone:
                    installment.pendingAmount === 0
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-orange-50 text-orange-700",
            }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 2);

        return [...repairItems, ...installmentItems]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
    }, [metrics.repairOrders]);

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-700">
                            <CalendarClock className="size-4" />
                            {formatDateTime(now)}
                        </div>
                        <h1 className="mt-4 text-3xl font-bold tracking-tight text-card-foreground">
                            Welcome back to Workshop
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                            Monitor repair orders, installment balances, and customer activity from one clean workspace.
                        </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <HistoryLinkCard
                            title="Repair history"
                            description="Search completed and active orders"
                            to="/repair-orders/history"
                            icon={<Search className="size-5" />}
                        />
                        <HistoryLinkCard
                            title="Installment history"
                            description="Find financing records"
                            to="/installments/history"
                            icon={<History className="size-5" />}
                        />
                    </div>
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                    label="Total Repair Orders"
                    value={String(metrics.totalRepairOrders)}
                    detail={`${formatCurrency(metrics.repairPaid)} collected from repair tickets`}
                    icon={<Wrench className="size-5" />}
                    tone="violet"
                />
                <StatCard
                    label="Total Installments"
                    value={String(metrics.totalInstallments)}
                    detail={`${formatCurrency(metrics.installmentOwed)} currently owed`}
                    icon={<CreditCard className="size-5" />}
                    tone="sky"
                />
                <StatCard
                    label="Repair Revenue"
                    value={formatCurrency(metrics.repairRevenue)}
                    detail="Static total from current repair orders"
                    icon={<ReceiptText className="size-5" />}
                    tone="emerald"
                />
                <StatCard
                    label="Installment Value"
                    value={formatCurrency(metrics.installmentTotal)}
                    detail="Total active financing portfolio"
                    icon={<WalletCards className="size-5" />}
                    tone="amber"
                />
                <StatCard
                    label="Installments Paid"
                    value={formatCurrency(metrics.installmentPaid)}
                    detail="Collected across static installment records"
                    icon={<PackageCheck className="size-5" />}
                    tone="emerald"
                />
                <StatCard
                    label="Open Balances"
                    value={formatCurrency(metrics.installmentOwed)}
                    detail="Pending installment amount"
                    icon={<ClipboardList className="size-5" />}
                    tone="rose"
                />
            </section>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(22rem,0.9fr)]">
                <AreaChartPanel
                    data={trendData[range]}
                    range={range}
                    onRangeChange={setRange}
                />
                <DonutChartPanel
                    paid={metrics.installmentPaid}
                    owed={metrics.installmentOwed}
                    formatCurrency={formatCurrency}
                />
            </section>

            <section className="grid gap-5 xl:grid-cols-3">
                <DistributionPanel
                    title="Repair order statuses"
                    description="Current static board workflow."
                    items={repairStatusItems}
                />
                <DistributionPanel
                    title="Installment statuses"
                    description="Financing health summary."
                    items={installmentStatusItems}
                />
                <RecentActivity items={recentActivity} />
            </section>
        </div>
    );
}
