"use client";

import { useState, useRef, useEffect } from "react";
import { FaComments, FaTimes, FaRobot } from "react-icons/fa";

interface Message {
    role: "user" | "assistant";
    content: string;
}

const FAQ_OPTIONS = {
    initial: {
        message: "Hello! I'm your virtual wine steward. Are you a guest looking for an experience, or a winery owner needing help?",
        options: [
            { label: "I am a Guest", next: "guest_main" },
            { label: "I am a Winery Owner", next: "owner_main" }
        ]
    },
    guest_main: {
        message: "Welcome! How can I help you today?",
        options: [
            { label: "How do I search for wineries?", next: "search_help" },
            { label: "How do I book a tasting?", next: "booking_help" },
            { label: "Where is my itinerary?", next: "itinerary_help" },
            { label: "Start Over", next: "initial" }
        ]
    },
    owner_main: {
        message: "Welcome, Winery Partner! What do you need assistance with?",
        options: [
            { label: "How do I set up a tasting package?", next: "tasting_setup" },
            { label: "How do I update my account?", next: "account_update" },
            { label: "How do I manage bookings?", next: "manage_bookings" },
            { label: "Start Over", next: "initial" }
        ]
    },
    search_help: {
        message: "Use the filters on the left side of the homepage to filter by Region (AVA), Wine Type, Price, or special features like 'Handicap Accessible' or 'Allows Children'.",
        options: [{ label: "Back to Options", next: "guest_main" }]
    },
    booking_help: {
        message: "Click on a winery card from the homepage, select an available date and time slot from their calendar, choose the number of guests, and proceed to checkout!",
        options: [{ label: "Back to Options", next: "guest_main" }]
    },
    itinerary_help: {
        message: "Click on the 'Itinerary' link in the top navigation bar to see all the wineries you've added and your confirmed bookings.",
        options: [{ label: "Back to Options", next: "guest_main" }]
    },
    tasting_setup: {
        message: "You can set up a tasting package by going to your Winery Dashboard -> Profile, and scrolling down to the 'Tasting Experiences' section. Click 'Add Package' to create a new one!",
        options: [{ label: "Back to Options", next: "owner_main" }]
    },
    account_update: {
        message: "To update your personal profile or password, go to the top right user menu and click on 'Profile', or go to the 'Account & Security' section at the bottom of your Winery Dashboard.",
        options: [{ label: "Back to Options", next: "owner_main" }]
    },
    manage_bookings: {
        message: "You can manage guest bookings from your Winery Dashboard under the 'Bookings' tab. You can approve or decline reservation requests there.",
        options: [{ label: "Back to Options", next: "owner_main" }]
    }
};

export default function VirtualAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: FAQ_OPTIONS.initial.message }
    ]);
    const [currentStep, setCurrentStep] = useState<keyof typeof FAQ_OPTIONS>("initial");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, currentStep]);

    const handleOptionClick = (option: { label: string; next: string }) => {
        // Add user's selected option as a message
        setMessages(prev => [...prev, { role: "user", content: option.label }]);

        // Get the next step
        const nextStepKey = option.next as keyof typeof FAQ_OPTIONS;
        const nextStep = FAQ_OPTIONS[nextStepKey];

        // Add the assistant's response with a small delay
        setTimeout(() => {
            setMessages(prev => [...prev, { role: "assistant", content: nextStep.message }]);
            setCurrentStep(nextStepKey);
        }, 400);
    };

    const currentOptions = FAQ_OPTIONS[currentStep]?.options || [];

    return (
        <div className="fixed bottom-24 md:bottom-6 right-6 z-30">
            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-primary text-white p-4 rounded-full shadow-xl shadow-primary/30 hover:scale-110 active:scale-95 transition-all outline-none"
                    title="Virtual Assistant"
                >
                    <FaComments size={24} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="w-80 sm:w-96 h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-berry-800 to-primary text-white p-4 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg font-serif flex items-center gap-2">
                                <FaRobot /> Napa Valley Assistant
                            </h3>
                            <p className="text-xs text-white/80">Guided Help & Support</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white transition-colors"
                            title="Close Chat"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${msg.role === "user"
                                        ? "bg-primary text-white rounded-br-none"
                                        : "bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-none"
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {/* Display Interactive Options at the end of the chat */}
                        <div className="flex flex-col items-end gap-2 mt-4 pb-2">
                            {currentOptions.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionClick(opt)}
                                    className="bg-gray-100 text-primary border border-gray-200 hover:bg-primary hover:text-white hover:border-primary transition-colors text-sm px-4 py-2 rounded-xl text-right animate-in fade-in max-w-[90%]"
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        <div ref={messagesEndRef} />
                    </div>
                </div>
            )}
        </div>
    );
}
