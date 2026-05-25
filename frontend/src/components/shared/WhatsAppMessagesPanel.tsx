import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send } from "lucide-react";
import { useState } from "react";

type WhatsAppMessage = {
    id: string;
    date: string;
    text: string;
};

const initialMessages: WhatsAppMessage[] = [
    {
        id: "MSG-1001",
        date: "2026-05-18T11:05:00",
        text: "Hello, your order is active. We will send updates as work progresses.",
    },
    {
        id: "MSG-1002",
        date: "2026-05-20T09:30:00",
        text: "Your latest status has been updated. Please contact us if you have questions.",
    },
];

const formatDateTime = (value: string) =>
    new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(value));

export function WhatsAppMessagesPanel() {
    const [message, setMessage] = useState("");
    const [history, setHistory] = useState(initialMessages);

    const handleSendMessage = () => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage) return;

        const nextMessage: WhatsAppMessage = {
            id: `MSG-${crypto.randomUUID()}`,
            date: new Date().toISOString(),
            text: trimmedMessage,
        };

        setHistory((current) => [nextMessage, ...current]);
        setMessage("");
        console.log("OpenWA message draft:", nextMessage);
    };

    return (
        <aside className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <MessageCircle className="size-5" />
                </span>
                <div>
                    <h2 className="text-base font-semibold text-slate-950">
                        WhatsApp Messages
                    </h2>
                    <p className="text-xs text-slate-500">
                        Static message workspace for future OpenWA integration.
                    </p>
                </div>
            </div>

            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <Textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Write a short WhatsApp message"
                    className="min-h-28 bg-white"
                />
                <Button
                    type="button"
                    className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleSendMessage}
                >
                    <Send className="size-4" />
                    Send Message
                </Button>
            </div>

            <section className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-950">History</h3>
                <div className="space-y-3">
                    {history.map((historyItem) => (
                        <article
                            key={historyItem.id}
                            className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                        >
                            <p className="text-xs font-medium text-slate-500">
                                {formatDateTime(historyItem.date)}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-700">
                                {historyItem.text}
                            </p>
                        </article>
                    ))}
                </div>
            </section>
        </aside>
    );
}
