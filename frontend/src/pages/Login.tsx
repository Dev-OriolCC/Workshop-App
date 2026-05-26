import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LockKeyhole, Mail, Wrench } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function Login() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        console.log("Login draft:", {
            identifier,
            password,
        });
        toast.success("Login flow placeholder.");
    };

    return (
        <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10 text-foreground">
            <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-6 flex flex-col items-center text-center">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                        <Wrench className="size-6" />
                    </span>
                    <h1 className="mt-4 text-2xl font-bold tracking-tight text-card-foreground">
                        Workshop
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Sign in to manage repair orders, installments, and customer activity.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="login-identifier">Email or username</Label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="login-identifier"
                                value={identifier}
                                onChange={(event) => setIdentifier(event.target.value)}
                                placeholder="you@example.com"
                                autoComplete="username"
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <Label htmlFor="login-password">Password</Label>
                            <Link
                                to="/forgot-password"
                                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="login-password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full">
                        Login
                    </Button>
                </form>
            </section>
        </main>
    );
}
