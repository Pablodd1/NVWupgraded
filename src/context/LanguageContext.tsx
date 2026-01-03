"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "es";

interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations: Record<Language, Record<string, string>> = {
    en: {
        // General
        "welcome": "Welcome",
        "search": "Search",
        "loading": "Loading...",

        // Auth
        "sign_in": "Sign In",
        "sign_out": "Sign Out",

        // Nav
        "nav_bookings": "Your Bookings",
        "nav_support": "Support",
        "nav_contact": "Contact",
        "nav_admin": "Admin Dashboard",
        "nav_itinerary": "Itinerary",

        // Chat
        "chat_title": "NVW Concierge",
        "chat_subtitle": "Typically replies in a few minutes",
        "chat_placeholder": "Ask for recommendations...",
        "chat_welcome": "Hello! 👋 Welcome to Napa Valley Wineries support. I can help find the perfect winery for you. Try asking 'Find a kid-friendly winery in Calistoga'.",
        "chat_error": "Sorry, I'm having trouble connecting to the Sommelier right now.",
        "chat_open_button": "Start Live Chat",

        // Support
        "support_title": "Support & Help Center",
        "support_search_placeholder": "Search for help...",
        "support_contact": "Contact Support",
        "support_contact_desc": "If you need further assistance, feel free to reach out to us. Our support team is available via live chat, email, phone, or social media.",
        "support_live_chat": "Live Chat 💬",
        "support_live_chat_desc": "Available Monday–Friday, 9 AM–6 PM (PST)",
    },
    es: {
        // General
        "welcome": "Bienvenido",
        "search": "Buscar",
        "loading": "Cargando...",

        // Auth
        "sign_in": "Iniciar Sesión",
        "sign_out": "Cerrar Sesión",

        // Nav
        "nav_bookings": "Tus Reservas",
        "nav_support": "Soporte",
        "nav_contact": "Contacto",
        "nav_admin": "Panel de Admin",
        "nav_itinerary": "Itinerario",

        // Chat
        "chat_title": "Conserje NVW",
        "chat_subtitle": "Responde en unos minutos",
        "chat_placeholder": "Pide recomendaciones...",
        "chat_welcome": "¡Hola! 👋 Bienvenido al soporte de Napa Valley Wineries. Puedo ayudarte a encontrar la bodega perfecta. Intenta preguntar 'Encuentra una bodega familiar en Calistoga'.",
        "chat_error": "Lo siento, tengo problemas para conectar con el Sommelier en este momento.",
        "chat_open_button": "Iniciar Chat",

        // Support
        "support_title": "Centro de Ayuda y Soporte",
        "support_search_placeholder": "Buscar ayuda...",
        "support_contact": "Contactar Soporte",
        "support_contact_desc": "Si necesitas más ayuda, no dudes en contactarnos. Nuestro equipo está disponible vía chat, email, teléfono o redes sociales.",
        "support_live_chat": "Chat en Vivo 💬",
        "support_live_chat_desc": "Disponible Lunes-Viernes, 9 AM–6 PM (PST)",
    }
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguage] = useState<Language>("en");

    // Load from localStorage if available
    useEffect(() => {
        const saved = localStorage.getItem("nvw-language") as Language;
        if (saved && (saved === "en" || saved === "es")) {
            setLanguage(saved);
        }
    }, []);

    const toggleLanguage = () => {
        setLanguage((prev) => {
            const newLang = prev === "en" ? "es" : "en";
            localStorage.setItem("nvw-language", newLang);
            return newLang;
        });
    };

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
