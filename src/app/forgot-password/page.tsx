"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (res.ok) {
                setStatus("success");
            } else {
                setStatus("error");
                setMessage(data.error || "Something went wrong.");
            }
        } catch (err) {
            setStatus("error");
            setMessage("Network error. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-[#E8DED5]">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif text-[#6B1E23] mb-2">Forgot Password?</h1>
                    <p className="text-gray-600">Enter your email to receive a reset link.</p>
                </div>

                {status === "success" ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-50 border border-green-200 p-6 rounded-xl text-center"
                    >
                        <h3 className="text-green-800 font-bold mb-2">Check your email!</h3>
                        <p className="text-green-700 text-sm mb-4">
                            If an account exists for <strong>{email}</strong>, we've sent you a reset link.
                        </p>
                        <Link href="/" className="text-[#6B1E23] font-semibold hover:underline">
                            Back to Home
                        </Link>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B1E23] focus:border-transparent transition-all"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                            {status === "loading" ? "Sending..." : "Send Reset Link"}
                        </button>

                        <div className="text-center mt-4">
                            <Link href="/" className="text-sm text-gray-500 hover:text-[#6B1E23]">
                                Remember your password? Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
