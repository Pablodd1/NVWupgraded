import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/dbConnect';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        let isConnected = mongoose.connection.readyState === 1;
        if (!isConnected && (process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGO_URI)) {
            try {
                await dbConnect();
                isConnected = mongoose.connection.readyState === 1;
            } catch (dbErr) {
                console.warn("Healthcheck DB ping failed:", dbErr);
            }
        }

        const subsystems = {
            database: isConnected ? 'connected' : 'disconnected',
            jwtAuth: Boolean(process.env.JWT_SECRET),
            resendEmail: Boolean(process.env.RESEND_API_KEY),
            stripePayments: Boolean(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
            stripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
            geminiAI: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY),
            imgbbCDN: Boolean(process.env.IMGBB_API_KEY),
        };

        const overallStatus = isConnected && subsystems.jwtAuth ? 'ok' : 'degraded';

        return NextResponse.json({
            status: overallStatus,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            subsystems,
        }, { status: overallStatus === 'ok' ? 200 : 503 });
    } catch (error) {
        return NextResponse.json({
            status: 'error',
            message: 'Health check failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}
