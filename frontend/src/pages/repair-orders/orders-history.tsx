import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

type RepairOrderHistoryRecord = {
    id: string;
    clientName: string;
    date: string;
    phone: string;
    serviceName: string;
    total: number;
};

const repairOrderHistory: RepairOrderHistoryRecord[] = [
    {
        id: "RO-1058",
        clientName: "Marta Ruiz",
        date: "2026-05-18T10:15:00",
        phone: "983-180-8283",
        serviceName: "Reel repair",
        total: 450,
    },
    {
        id: "RO-1054",
        clientName: "Jorge Cortes",
        date: "2026-05-16T15:30:00",
        phone: "983-245-1180",
        serviceName: "Maintenance",
        total: 250,
    },
    {
        id: "RO-1049",
        clientName: "Ana Medina",
        date: "2026-05-12T09:00:00",
        phone: "983-552-7104",
        serviceName: "Rod repair",
        total: 320,
    },
];

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);

const formatDate = (value: string) =>
    new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(value));

export default function OrdersHistory() {
    const [search, setSearch] = useState("");

    const filteredRecords = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return [...repairOrderHistory]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .filter((record) => {
                if (!normalizedSearch) return true;

                const searchableText = [
                    record.clientName,
                    formatDate(record.date),
                    record.phone,
                    record.serviceName,
                    formatCurrency(record.total),
                    String(record.total),
                ]
                    .join(" ")
                    .toLowerCase();

                return searchableText.includes(normalizedSearch);
            });
    }, [search]);

    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Repair order history</h2>
                    <p className="text-sm text-muted-foreground">
                        Review completed and historical repair orders.
                    </p>
                </div>
                <div className="relative w-full sm:max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search history"
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Client Name</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Repair Item Service</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRecords.length > 0 ? (
                            filteredRecords.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-medium text-foreground">
                                        {record.clientName}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatDate(record.date)}
                                    </TableCell>
                                    <TableCell>{record.phone}</TableCell>
                                    <TableCell>{record.serviceName}</TableCell>
                                    <TableCell className="text-right font-semibold">
                                        {formatCurrency(record.total)}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No repair order history matches your search.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </section>
    );
}
