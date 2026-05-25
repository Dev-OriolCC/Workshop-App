import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ArrowRight, CircleDollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export type RangeKey = "3m" | "30d" | "7d";

export type SeriesPoint = {
    label: string;
    repairOrders: number;
    installments: number;
};

type StatCardProps = {
    label: string;
    value: string;
    detail: string;
    icon: ReactNode;
    tone: "violet" | "emerald" | "sky" | "amber" | "rose" | "slate";
};

const toneStyles: Record<StatCardProps["tone"], string> = {
    violet: "bg-violet-50 text-violet-700 ring-violet-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    sky: "bg-sky-50 text-sky-700 ring-sky-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function StatCard({ label, value, detail, icon, tone }: StatCardProps) {
    return (
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                        {value}
                    </p>
                </div>
                <span
                    className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-lg ring-1",
                        toneStyles[tone]
                    )}
                >
                    {icon}
                </span>
            </div>
            <p className="mt-3 text-sm text-slate-500">{detail}</p>
        </article>
    );
}

type RangeSelectorProps = {
    value: RangeKey;
    onChange: (value: RangeKey) => void;
};

const ranges: { value: RangeKey; label: string }[] = [
    { value: "3m", label: "Last 3 months" },
    { value: "30d", label: "Last 30 days" },
    { value: "7d", label: "Last 7 days" },
];

export function RangeSelector({ value, onChange }: RangeSelectorProps) {
    return (
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            {ranges.map((range) => (
                <button
                    key={range.value}
                    type="button"
                    onClick={() => onChange(range.value)}
                    className={cn(
                        "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                        value === range.value
                            ? "bg-white text-slate-950 shadow-sm"
                            : "text-slate-500 hover:text-slate-900"
                    )}
                >
                    {range.label}
                </button>
            ))}
        </div>
    );
}

type AreaChartPanelProps = {
    data: SeriesPoint[];
    range: RangeKey;
    onRangeChange: (value: RangeKey) => void;
};

export function AreaChartPanel({ data, range, onRangeChange }: AreaChartPanelProps) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-base font-semibold text-slate-950">
                        Activity trend
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Static comparison of repair orders and installments.
                    </p>
                </div>
                <RangeSelector value={range} onChange={onRangeChange} />
            </div>

            <div className="mt-6">
                <MiniAreaChart data={data} />
            </div>

            <div className="mt-5 flex flex-wrap gap-4 text-sm">
                <LegendItem color="bg-violet-500" label="Repair Orders" />
                <LegendItem color="bg-emerald-500" label="Installments" />
            </div>
        </section>
    );
}

function MiniAreaChart({ data }: { data: SeriesPoint[] }) {
    const width = 720;
    const height = 260;
    const padding = 28;
    const maxValue = Math.max(
        1,
        ...data.flatMap((point) => [point.repairOrders, point.installments])
    );

    const xFor = (index: number) =>
        padding + (index * (width - padding * 2)) / Math.max(1, data.length - 1);
    const yFor = (value: number) =>
        height - padding - (value / maxValue) * (height - padding * 2);

    const linePath = (key: "repairOrders" | "installments") =>
        data
            .map((point, index) => `${index === 0 ? "M" : "L"} ${xFor(index)} ${yFor(point[key])}`)
            .join(" ");

    const areaPath = (key: "repairOrders" | "installments") => {
        const line = linePath(key);
        const lastX = xFor(data.length - 1);
        const firstX = xFor(0);
        const baseY = height - padding;
        return `${line} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
    };

    return (
        <div className="w-full overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                role="img"
                aria-label="Repair order and installment activity area chart"
                className="h-[260px] w-full"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="repairGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.03" />
                    </linearGradient>
                    <linearGradient id="installmentGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.26" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.03" />
                    </linearGradient>
                </defs>

                {[0, 1, 2, 3].map((line) => {
                    const y = padding + (line * (height - padding * 2)) / 3;
                    return (
                        <line
                            key={line}
                            x1={padding}
                            x2={width - padding}
                            y1={y}
                            y2={y}
                            stroke="#e2e8f0"
                            strokeWidth="1"
                        />
                    );
                })}

                <path d={areaPath("repairOrders")} fill="url(#repairGradient)" />
                <path d={areaPath("installments")} fill="url(#installmentGradient)" />
                <path
                    d={linePath("repairOrders")}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4"
                />
                <path
                    d={linePath("installments")}
                    fill="none"
                    stroke="#10b981"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4"
                />

                {data.map((point, index) => (
                    <g key={point.label}>
                        <circle cx={xFor(index)} cy={yFor(point.repairOrders)} r="4" fill="#8b5cf6" />
                        <circle cx={xFor(index)} cy={yFor(point.installments)} r="4" fill="#10b981" />
                        <text
                            x={xFor(index)}
                            y={height - 8}
                            textAnchor="middle"
                            className="fill-slate-500 text-[11px] font-medium"
                        >
                            {point.label}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
}

type DonutChartProps = {
    paid: number;
    owed: number;
    formatCurrency: (value: number) => string;
};

export function DonutChartPanel({ paid, owed, formatCurrency }: DonutChartProps) {
    const total = paid + owed;
    const paidPercent = total > 0 ? Math.round((paid / total) * 100) : 0;
    const owedPercent = 100 - paidPercent;
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const paidDash = (paidPercent / 100) * circumference;

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
                <CircleDollarSign className="size-4 text-emerald-600" />
                <h2 className="text-base font-semibold text-slate-950">
                    Installment money
                </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">Paid vs owed balance.</p>

            <div className="mt-6 flex flex-col items-center gap-5 sm:flex-row">
                <div className="relative size-40">
                    <svg viewBox="0 0 140 140" className="size-40 -rotate-90">
                        <circle
                            cx="70"
                            cy="70"
                            r={radius}
                            fill="none"
                            stroke="#f97316"
                            strokeWidth="16"
                        />
                        <circle
                            cx="70"
                            cy="70"
                            r={radius}
                            fill="none"
                            stroke="#10b981"
                            strokeDasharray={`${paidDash} ${circumference}`}
                            strokeLinecap="round"
                            strokeWidth="16"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-slate-950">{paidPercent}%</span>
                        <span className="text-xs font-medium text-slate-500">paid</span>
                    </div>
                </div>

                <div className="w-full space-y-3">
                    <MoneyRow color="bg-emerald-500" label="Paid" value={formatCurrency(paid)} detail={`${paidPercent}%`} />
                    <MoneyRow color="bg-orange-500" label="Owed" value={formatCurrency(owed)} detail={`${owedPercent}%`} />
                    <Separator />
                    <MoneyRow color="bg-slate-500" label="Total" value={formatCurrency(total)} detail="100%" />
                </div>
            </div>
        </section>
    );
}

type DistributionPanelProps = {
    title: string;
    description: string;
    items: { label: string; value: number; color: string }[];
};

export function DistributionPanel({ title, description, items }: DistributionPanelProps) {
    const total = Math.max(1, items.reduce((sum, item) => sum + item.value, 0));

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
            <div className="mt-5 space-y-4">
                {items.map((item) => {
                    const width = Math.round((item.value / total) * 100);
                    return (
                        <div key={item.label}>
                            <div className="mb-2 flex items-center justify-between text-sm">
                                <span className="font-medium text-slate-700">{item.label}</span>
                                <span className="font-semibold text-slate-500">{item.value}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className={cn("h-full rounded-full", item.color)}
                                    style={{ width: `${width}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

type HistoryLinkCardProps = {
    title: string;
    description: string;
    to: string;
    icon: ReactNode;
};

export function HistoryLinkCard({ title, description, to, icon }: HistoryLinkCardProps) {
    return (
        <Link
            to={to}
            className="group flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm outline-none transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-violet-300"
        >
            <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    {icon}
                </span>
                <div>
                    <h3 className="font-semibold text-slate-950">{title}</h3>
                    <p className="text-sm text-slate-500">{description}</p>
                </div>
            </div>
            <ArrowRight className="size-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-violet-600" />
        </Link>
    );
}

type RecentActivityProps = {
    items: { label: string; detail: string; value: string; tone: string }[];
};

export function RecentActivity({ items }: RecentActivityProps) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">Recent activity</h2>
            <p className="mt-1 text-sm text-slate-500">
                A quick look at static records from this workspace.
            </p>
            <div className="mt-5 divide-y divide-slate-100">
                {items.map((item) => (
                    <div key={`${item.label}-${item.detail}`} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">{item.label}</p>
                            <p className="truncate text-xs text-slate-500">{item.detail}</p>
                        </div>
                        <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", item.tone)}>
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <span className="inline-flex items-center gap-2 text-slate-600">
            <span className={cn("size-2.5 rounded-full", color)} />
            {label}
        </span>
    );
}

function MoneyRow({
    color,
    label,
    value,
    detail,
}: {
    color: string;
    label: string;
    value: string;
    detail: string;
}) {
    return (
        <div className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
                <span className={cn("size-2.5 rounded-full", color)} />
                <span className="font-medium text-slate-600">{label}</span>
            </div>
            <div className="text-right">
                <p className="font-semibold text-slate-950">{value}</p>
                <p className="text-xs text-slate-500">{detail}</p>
            </div>
        </div>
    );
}

export { Button };
