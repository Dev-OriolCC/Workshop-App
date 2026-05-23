import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { initialInstallments } from "@/data/installments";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

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

const statusStyles: Record<string, string> = {
    ACTIVE: "border-sky-200 bg-sky-50 text-sky-700",
    COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    DEFAULTED: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function InstallmentsHistory() {
    const [search, setSearch] = useState("");

    const filteredRecords = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return [...initialInstallments]
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .filter((record) => {
                if (!normalizedSearch) return true;

                const searchableText = [
                    record.id,
                    record.client.name,
                    record.client.phone,
                    record.article,
                    record.status,
                    formatDate(record.createdAt),
                    formatCurrency(record.totalAmount),
                    formatCurrency(record.amountPaid),
                    formatCurrency(record.pendingAmount),
                    String(record.totalAmount),
                    String(record.amountPaid),
                    String(record.pendingAmount),
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
                    <h2 className="text-lg font-semibold text-foreground">
                        Installments history
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Review installment plans, balances, and payment progress.
                    </p>
                </div>
                <div className="relative w-full sm:max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search installments"
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Paid</TableHead>
                            <TableHead className="text-right">Pending</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRecords.length > 0 ? (
                            filteredRecords.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-semibold text-foreground">
                                        {record.id}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-foreground">
                                            {record.client.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {record.client.phone}
                                        </div>
                                    </TableCell>
                                    <TableCell>{record.article}</TableCell>
                                    <TableCell className="text-right font-semibold">
                                        {formatCurrency(record.totalAmount)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(record.amountPaid)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(record.pendingAmount)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatDate(record.createdAt)}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                                statusStyles[record.status]
                                            }`}
                                        >
                                            {record.status}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No installment history matches your search.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </section>
    );
}
