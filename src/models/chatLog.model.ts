import mongoose, { Schema, Document } from "mongoose";

export interface IChatLog extends Document {
    userId?: string;
    userEmail?: string; // Optional, helps identify guest sessions if they provided email elsewhere
    messages: {
        role: "user" | "bot";
        content: string;
        timestamp: Date;
    }[];
    language: string; // "en" or "es"
    createdAt: Date;
    updatedAt: Date;
}

const ChatLogSchema = new Schema<IChatLog>(
    {
        userId: { type: String, required: false },
        userEmail: { type: String, required: false },
        messages: [
            {
                role: { type: String, enum: ["user", "bot"], required: true },
                content: { type: String, required: true },
                timestamp: { type: Date, default: Date.now },
            },
        ],
        language: { type: String, default: "en" },
    },
    { timestamps: true }
);

// Auto-delete logs after 30 days (2592000 seconds) to save database space
ChatLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export default mongoose.models.ChatLog || mongoose.model<IChatLog>("ChatLog", ChatLogSchema);
