import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
    try {
        const dbState = mongoose.connection.readyState;
        const isConnected = dbState === 1;

        return NextResponse.json({
            status: isConnected ? 'ok' : 'error',
            database: isConnected ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        }, { status: isConnected ? 200 : 503 });
    } catch (error) {
        return NextResponse.json({
            status: 'error',
            message: 'Health check failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}
