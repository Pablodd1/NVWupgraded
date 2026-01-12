"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useLanguage } from "@/context/LanguageContext";

interface ChatMessage {
    text: string;
    isUser: boolean;
}

export default function ChatWidget() {
    const { t, language } = useLanguage();
    const [showChat, setShowChat] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [isChatLoading, setIsChatLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [lastSearchResults, setLastSearchResults] = useState<any[]>([]);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages, showChat]);

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMessage = chatInput;
        setChatMessages(prev => [...prev, { text: userMessage, isUser: true }]);
        setChatInput("");
        setIsChatLoading(true);

        try {
            // 1. Send to AI with history and context
            const payload = {
                query: userMessage,
                history: chatMessages.slice(-5), // Send last 5 messages for context
                context: lastSearchResults.slice(0, 5) // Send top 5 previous results for reference
            };

            const response = await axios.post("/api/ai-search", payload);
            const { filters, wineries, count, message } = response.data;

            // Update context if new results found
            if (wineries && wineries.length > 0) {
                setLastSearchResults(wineries);
            }

            let botResponse = message;

            // Fallback if no AI message generated (backwards compatibility)
            if (!botResponse) {
                if (count > 0) {
                    if (language === 'es') {
                        botResponse = `Encontré ${count} bodegas que coinciden con tu búsqueda. Aquí tienes algunas: ${wineries.slice(0, 3).map((w: any) => w.name).join(", ")}.`;
                    } else {
                        botResponse = `I found ${count} wineries matching your request. Here are a few: ${wineries.slice(0, 3).map((w: any) => w.name).join(", ")}.`;
                    }
                } else {
                    if (language === 'es') {
                        botResponse = "No pude encontrar ninguna bodega que coincida con esa descripción. Intenta preguntar por 'Vino tinto en Calistoga' o 'Bodegas para niños'.";
                    } else {
                        botResponse = "I couldn't find any wineries matching that description. Try asking for 'Red wine in Calistoga' or 'Kid friendly wineries'.";
                    }
                }
            }

            setChatMessages(prev => [...prev, { text: botResponse, isUser: false }]);

            // 2. Log interaction
            axios.post("/api/chat/log", {
                messages: [
                    ...chatMessages.slice(-5),
                    { role: "user", content: userMessage },
                    { role: "bot", content: botResponse }
                ],
                language
            }).catch(err => console.error("Failed to log chat:", err));

        } catch (error) {
            console.error("Chat error:", error);
            setChatMessages(prev => [...prev, { text: t("chat_error"), isUser: false }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            {!showChat && (
                <button
                    onClick={() => setShowChat(true)}
                    className="fixed bottom-28 md:bottom-5 right-5 h-14 w-14 rounded-full bg-primary text-white shadow-lg hover:bg-secondary transition-all z-50 flex items-center justify-center transform hover:scale-110"
                    aria-label="Open Chat"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </button>
            )}

            {/* Chat Window */}
            {showChat && (
                <div className="fixed bottom-20 md:bottom-5 right-5 w-80 md:w-96 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-200 flex flex-col max-h-[500px] animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-primary text-white p-4 flex justify-between items-center shrink-0 shadow-md">
                        <div>
                            <h3 className="font-bold flex items-center gap-2">
                                {t("chat_title")}
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                            </h3>
                            <p className="text-xs text-white/80">{t("chat_subtitle")}</p>
                        </div>
                        <button
                            onClick={() => setShowChat(false)}
                            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col space-y-4 min-h-[300px]">
                        {/* Welcome Message */}
                        <div className="flex justify-start">
                            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-3 max-w-[85%] text-sm text-gray-800 shadow-sm">
                                <p>{t("chat_welcome")}</p>
                            </div>
                        </div>

                        {/* Chat History */}
                        {chatMessages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                                <div className={`rounded-2xl p-3 max-w-[85%] text-sm shadow-sm ${msg.isUser
                                    ? 'bg-primary text-white rounded-tr-none'
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                                    }`}>
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        ))}

                        {/* Loading Indicator */}
                        {isChatLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-3 text-sm text-gray-800 shadow-sm">
                                    <span className="loading loading-dots loading-sm text-primary"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t bg-white shrink-0">
                        <form onSubmit={handleChatSubmit} className="flex gap-2">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder={t("chat_placeholder")}
                                className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all shadow-inner"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={isChatLoading || !chatInput.trim()}
                                className="bg-primary text-white p-3 rounded-full hover:bg-secondary disabled:opacity-50 disabled:hover:bg-primary transition-all shadow-md active:scale-95"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
