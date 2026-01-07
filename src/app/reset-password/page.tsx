"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setStatus("error");
            setMessage("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setStatus("error");
            setMessage("Password must be at least 6 characters");
            return;
        }

        setStatus("loading");
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password }),
            });
            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setTimeout(() => router.push("/?login=true"), 3000);
            } else {
                setStatus("error");
                setMessage(data.error || "Token invalid or expired");
            }
        } catch (err) {
            setStatus("error");
            setMessage("Something went wrong");
        }
    };

    if (!token) {
        return (
            <div className="text-center">
                <h2 className="text-xl font-bold text-red-600 mb-4">Invalid Link</h2>
                <p className="text-gray-600 mb-6">This password reset link is missing a valid token.</p>
                <Link href="/forgot-password" className="text-[#6B1E23] underline">Request a new link</Link>
            </div>
        );
    }

    return (
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-[#E8DED5]">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-serif text-[#6B1E23] mb-2">Set New Password</h1>
                <p className="text-gray-600">Enter your new secure password below.</p>
            </div>

            {status === "success" ? (
                <div className="text-center bg-green-50 p-6 rounded-xl border border-green-200">
                    <h3 className="text-green-800 font-bold text-lg mb-2">Password Updated! 🎉</h3>
                    <p className="text-green-700">Redirecting to login...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B1E23] focus:border-transparent transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B1E23] focus:border-transparent transition-all"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    {status === "error" && (
                        <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full bg-[#6B1E23] text-white py-3 rounded-lg font-semibold hover:bg-[#8B2530] transition-colors disabled:opacity-50"
                    >
                        {status === "loading" ? "Updating..." : "Update Password"}
                    </button>
                </form>
            )}
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-[#6B1E23]">Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
