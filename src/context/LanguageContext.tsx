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

        // Winery Detail
        "auth_overlay_title": "Unlock Exclusive Access",
        "auth_overlay_desc": "Sign up or log in to view exclusive winery details, book tastings, and create your personalized itinerary.",
        "auth_back_to_search": "Back to Search",

        // Support
        "support_title": "Support & Help Center",
        "support_search_placeholder": "Search for help...",
        "support_contact": "Contact Support",
        "support_contact_desc": "If you need further assistance, feel free to reach out to us. Our support team is available via live chat, email, phone, or social media.",
        "support_live_chat": "Live Chat 💬",
        "support_live_chat_desc": "Available Monday–Friday, 9 AM–6 PM (PST)",

        // Auth Modal
        "auth_unlock_cellar": "Unlock the Cellar",
        "auth_join_club": "Join the Club",
        "auth_partner_portal": "Partner Portal",
        "auth_welcome_back": "Welcome back to your Napa Valley experience.",
        "auth_create_profile": "Create your Sommelier Profile to book tastings and curate your journey.",
        "auth_register_vineyard": "Register your vineyard to manage bookings and reach new guests.",
        "auth_first_name": "First Name (Vintage)",
        "auth_last_name": "Last Name",
        "auth_email": "Email Address",
        "auth_phone": "Phone (for reservations)",
        "auth_password": "Secret Password",
        "auth_forgot_password": "Forgot Password?",
        "auth_marketing_consent": "Send me exclusive wine drops and event invites.",
        "auth_sms_consent": "Text me booking confirmations.",
        "auth_sms_disclaimer": "Reply STOP to unsubscribe at any time. Msg & data rates may apply. See Privacy Policy.",
        "auth_just_browsing": "Just Browsing",
        "auth_open_cellar": "Open Cellar",
        "auth_mint_membership": "Mint Membership",
        "auth_request_access": "Request Partner Access",
        "auth_new_to_valley": "New to the Valley?",
        "auth_get_on_list": "Get on the List",
        "auth_have_pass": "Have a pass already?",
        "auth_login_here": "Login Here",
        "auth_is_winery_owner": "Are you a Winery Owner?",
        "auth_register_winery": "Register your Vineyard",
        "auth_not_winery": "Not a winery?",
        "auth_back_to_login": "Back to Guest Login",

        // Itinerary
        "itinerary_title": "Your Itinerary",
        "itinerary_subtitle": "Plan your perfect wine-tasting experience.",
        "itinerary_empty": "Your itinerary is empty",
        "itinerary_empty_desc": "Start adding wineries to create your perfect wine tour!",
        "itinerary_browse": "Browse Wineries",
        "itinerary_clear_all": "Clear All",
        "itinerary_back": "Back to Wineries",
        "itinerary_success_title": "Your Itinerary has been Sent! 🍇",
        "itinerary_success_desc1": "We've delivered your requests to each winery. They will review and confirm your slots shortly.",
        "itinerary_success_desc2": "Get ready for a premium Napa Valley experience!",
        "itinerary_success_email": "A summary has been sent to your email. You will receive individual confirmation emails as each winery approves your request.",
        "itinerary_next_steps": "What’s Next?",
        "itinerary_step1": "📍 Review your itinerary details in your email.",
        "itinerary_step2": "🍷 Make sure to bring your ID if required by the wineries.",
        "itinerary_step3": "🚗 Need a ride? Book an Uber below.",
        "itinerary_step4": "📸 Don’t forget to take pictures and share your experience!",
        "itinerary_book_uber": "🚗 Book an Uber",
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

        // Winery Detail
        "auth_overlay_title": "Desbloquea Acceso Exclusivo",
        "auth_overlay_desc": "Regístrate o inicia sesión para ver detalles exclusivos de la bodega, reservar catas y crear tu itinerario personalizado.",
        "auth_back_to_search": "Volver a la Búsqueda",

        // Support
        "support_title": "Centro de Ayuda y Soporte",
        "support_search_placeholder": "Buscar ayuda...",
        "support_contact": "Contactar Soporte",
        "support_contact_desc": "Si necesitas más ayuda, no dudes en contactarnos. Nuestro equipo está disponible vía chat, email, teléfono o redes sociales.",
        "support_live_chat": "Chat en Vivo 💬",
        "support_live_chat_desc": "Disponible Lunes-Viernes, 9 AM–6 PM (PST)",

        // Auth Modal
        "auth_unlock_cellar": "Abre la Bodega",
        "auth_join_club": "Únete al Club",
        "auth_partner_portal": "Portal de Socios",
        "auth_welcome_back": "Bienvenido de nuevo a tu experiencia en Napa Valley.",
        "auth_create_profile": "Crea tu Perfil de Sommelier para reservar catas y organizar tu viaje.",
        "auth_register_vineyard": "Registra tu viñedo para gestionar reservas y llegar a nuevos huéspedes.",
        "auth_first_name": "Nombre (Vintage)",
        "auth_last_name": "Apellido",
        "auth_email": "Correo Electrónico",
        "auth_phone": "Teléfono (para reservas)",
        "auth_password": "Contraseña Secreta",
        "auth_forgot_password": "¿Olvidaste tu contraseña?",
        "auth_marketing_consent": "Envíame ofertas exclusivas de vinos e invitaciones a eventos.",
        "auth_sms_consent": "Envíame confirmaciones de reserva por SMS.",
        "auth_sms_disclaimer": "Responde STOP para darte de baja en cualquier momento. Pueden aplicarse tarifas de mensajes y datos. Consulta la Política de Privacidad.",
        "auth_just_browsing": "Solo Explorando",
        "auth_open_cellar": "Abrir Bodega",
        "auth_mint_membership": "Obtener Membresía",
        "auth_request_access": "Solicitar Acceso de Socio",
        "auth_new_to_valley": "¿Nuevo en el Valle?",
        "auth_get_on_list": "Entrar en la Lista",
        "auth_have_pass": "¿Ya tienes un pase?",
        "auth_login_here": "Inicia Sesión Aquí",
        "auth_is_winery_owner": "¿Eres dueño de una bodega?",
        "auth_register_winery": "Registra tu Viñedo",
        "auth_not_winery": "¿No eres una bodega?",
        "auth_back_to_login": "Volver al Inicio de Sesión",

        // Itinerary
        "itinerary_title": "Tu Itinerario",
        "itinerary_subtitle": "Planifica tu experiencia perfecta de cata de vinos.",
        "itinerary_empty": "Tu itinerario está vacío",
        "itinerary_empty_desc": "¡Comienza a añadir bodegas para crear tu tour de vinos perfecto!",
        "itinerary_browse": "Explorar Bodegas",
        "itinerary_clear_all": "Borrar Todo",
        "itinerary_back": "Volver a Bodegas",
        "itinerary_success_title": "¡Tu Itinerario ha sido Enviado! 🍇",
        "itinerary_success_desc1": "Hemos entregado tus solicitudes a cada bodega. Revisarán y confirmarán tus horarios pronto.",
        "itinerary_success_desc2": "¡Prepárate para una experiencia premium en Napa Valley!",
        "itinerary_success_email": "Se ha enviado un resumen a tu correo electrónico. Recibirás correos de confirmación individuales a medida que cada bodega apruebe tu solicitud.",
        "itinerary_next_steps": "¿Qué sigue?",
        "itinerary_step1": "📍 Revisa los detalles de tu itinerario en tu correo electrónico.",
        "itinerary_step2": "🍷 Asegúrate de traer tu identificación si las bodegas lo requieren.",
        "itinerary_step3": "🚗 ¿Necesitas transporte? Reserva un Uber a continuación.",
        "itinerary_step4": "📸 ¡No olvides tomar fotos y compartir tu experiencia!",
        "itinerary_book_uber": "🚗 Reservar un Uber",
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
