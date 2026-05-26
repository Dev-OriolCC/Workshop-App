import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Wrench } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        console.log("Forgot password draft:", {
            email,
        });
        toast.success("Password reset flow placeholder.");
    };

    return (
        <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10 text-foreground">
            <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-6 flex flex-col items-center text-center">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                        <Wrench className="size-6" />
                    </span>
                    <h1 className="mt-4 text-2xl font-bold tracking-tight text-card-foreground">
                        Reset your password
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Enter your email and we will continue the reset flow once authentication is connected.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="forgot-password-email">Email</Label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="forgot-password-email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="you@example.com"
                                autoComplete="email"
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full">
                        Continue
                    </Button>
                </form>

                <Link
                    to="/login"
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                    <ArrowLeft className="size-4" />
                    Back to login
                </Link>
            </section>
        </main>
    );
}
