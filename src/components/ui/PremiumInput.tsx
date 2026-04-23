"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: React.ReactNode;
    error?: string;
    helperText?: string;
}

export const PremiumInput = React.forwardRef<HTMLInputElement, PremiumInputProps>(
    ({ label, icon, error, helperText, className, type, ...props }, ref) => {
        return (
            <div className="space-y-1.5 w-full group">
                <label className="text-sm font-semibold text-gray-700 ml-1 transition-colors group-focus-within:text-primary">
                    {label}
                </label>
                <div className="relative flex items-center">
                    {icon && (
                        <div className="absolute left-3 text-gray-400 transition-colors group-focus-within:text-primary pointer-events-none">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        type={type}
                        className={cn(
                            "w-full bg-white/50 border border-gray-200 rounded-xl py-2.5 transition-all duration-200",
                            "focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none",
                            "placeholder:text-gray-400 text-gray-900",
                            icon && "pl-10 pr-4",
                            !icon && "px-4",
                            error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
                            className
                        )}
                        {...props}
                    />
                </div>
                {(error || helperText) && (
                    <p className={cn("text-xs ml-1", error ? "text-red-500" : "text-gray-500")}>
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

PremiumInput.displayName = "PremiumInput";
