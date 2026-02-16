"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export const GlassCard = ({
    children,
    className,
    delay = 0,
    ...props
}: GlassCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay,
                ease: [0.23, 1, 0.32, 1]
            }}
            className={cn("glass-card", className)}
            {...props}
        >
            {children}
        </motion.div>
    );
};
