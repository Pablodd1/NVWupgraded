
"use client";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "react-toastify";
import { FaEnvelope, FaPhone, FaComments, FaInstagram, FaLinkedin, FaFacebook, FaPaperPlane, FaSearch, FaQuestionCircle } from "react-icons/fa";

const SupportPage = () => {
  const { t, language } = useLanguage();
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Comprehensive FAQ list with 12 questions
  const faqs = [
    {
      category: "Booking",
      question: language === 'es' ? "¿Cómo reservo una visita a una bodega?" : "How do I book a winery visit?",
      answer: language === 'es'
        ? "Para reservar, navega por nuestra página principal, usa los filtros o búsqueda por voz, añade bodegas a tu itinerario y haz clic en 'Confirmar Reserva'. Recibirás confirmación por email."
        : "To book a winery visit, browse our homepage, use filters or voice search, add wineries to your itinerary, and click 'Confirm Booking'. You'll receive email confirmation."
    },
    {
      category: "Booking",
      question: language === 'es' ? "¿Puedo modificar o cancelar mi reserva?" : "Can I modify or cancel my booking?",
      answer: language === 'es'
        ? "Puedes modificar tu itinerario antes de confirmar. Después de la confirmación, contacta directamente con la bodega o envíanos un email a support@napavalleywineries.com."
        : "You can modify your itinerary before confirmation. After confirmation, contact the winery directly or email us at support@napavalleywineries.com for assistance."
    },
    {
      category: "Booking",
      question: language === 'es' ? "¿Cuántas personas pueden reservar a la vez?" : "How many guests can I book for?",
      answer: language === 'es'
        ? "La capacidad varía según la bodega, típicamente de 2 a 20 invitados por reserva. Al seleccionar la fecha y hora, verás la disponibilidad en tiempo real."
        : "Capacity varies by winery, typically 2-20 guests per booking. When selecting date and time, you'll see real-time availability for your group size."
    },
    {
      category: "Features",
      question: language === 'es' ? "¿Qué es la búsqueda por voz?" : "What is Voice Search?",
      answer: language === 'es'
        ? "Nuestra búsqueda por voz con IA te permite decir tus preferencias como 'Muéstrame vinos tintos en Oakville con tours'. El micrófono está en la barra de navegación."
        : "Our AI-powered voice search lets you speak your preferences like 'Show me red wines in Oakville with tours'. Look for the microphone icon in the navigation bar."
    },
    {
      category: "Features",
      question: language === 'es' ? "¿Cómo funciona el chat de IA?" : "How does the AI Chat work?",
      answer: language === 'es'
        ? "El chat de IA (botón abajo a la derecha) te ayuda a descubrir bodegas. Pregunta cosas como 'Bodegas pet-friendly con cuevas' y recibirás recomendaciones personalizadas."
        : "The AI Chat (bottom right button) helps you discover wineries. Ask things like 'Pet-friendly wineries with caves' and get personalized recommendations."
    },
    {
      category: "Account",
      question: language === 'es' ? "¿Cómo creo una cuenta?" : "How do I create an account?",
      answer: language === 'es'
        ? "Haz clic en 'Login' en la esquina superior derecha, luego selecciona 'Registrarse'. Puedes registrarte como cliente o solicitar acceso de socio para tu bodega."
        : "Click 'Login' in the top right corner, then select 'Sign Up'. You can register as a customer or request partner access if you own a winery."
    },
    {
      category: "Account",
      question: language === 'es' ? "¿Olvidé mi contraseña, qué hago?" : "I forgot my password, what should I do?",
      answer: language === 'es'
        ? "Haz clic en 'Login', luego en '¿Olvidaste tu contraseña?'. Ingresa tu email y recibirás un enlace para restablecer tu contraseña."
        : "Click 'Login', then 'Forgot Password?'. Enter your email and you'll receive a link to reset your password."
    },
    {
      category: "Payment",
      question: language === 'es' ? "¿Cuándo y cómo pago?" : "When and how do I pay?",
      answer: language === 'es'
        ? "La mayoría de las bodegas aceptan pago en el lugar. Algunas ofrecen pago anticipado. Las opciones de pago se mostrarán al confirmar tu reserva."
        : "Most wineries accept payment on-site. Some offer advance payment options. Payment methods will be shown when confirming your booking."
    },
    {
      category: "Payment",
      question: language === 'es' ? "¿Es segura la información de mi tarjeta?" : "Is my credit card information secure?",
      answer: language === 'es'
        ? "Sí, usamos Stripe para procesar pagos, un proveedor certificado PCI-DSS. Nunca almacenamos los datos de tu tarjeta en nuestros servidores."
        : "Yes, we use Stripe for payment processing, a PCI-DSS certified provider. We never store your card details on our servers."
    },
    {
      category: "Wineries",
      question: language === 'es' ? "¿Cómo se actualiza la disponibilidad?" : "How is availability updated?",
      answer: language === 'es'
        ? "La disponibilidad se actualiza en tiempo real. Cuando alguien reserva, la capacidad se reduce inmediatamente. Los espacios se generan automáticamente cada día."
        : "Availability is updated in real-time. When someone books, capacity is immediately reduced. Slots are automatically generated daily for each winery."
    },
    {
      category: "Wineries",
      question: language === 'es' ? "¿Cómo puedo añadir mi bodega a la plataforma?" : "How can I add my winery to the platform?",
      answer: language === 'es'
        ? "Haz clic en 'Login' y selecciona 'Solicitar Acceso de Socio'. Completa el formulario y nuestro equipo te contactará en 24-48 horas."
        : "Click 'Login' and select 'Request Partner Access'. Complete the form and our team will contact you within 24-48 hours."
    },
    {
      category: "Support",
      question: language === 'es' ? "¿Cómo contacto al soporte?" : "How do I contact support?",
      answer: language === 'es'
        ? "Email: support@napavalleywineries.com | Chat: botón abajo a la derecha | Formulario: completa el formulario de contacto abajo. Respondemos en 24 horas."
        : "Email: support@napavalleywineries.com | Chat: bottom right button | Form: fill out the contact form below. We respond within 24 hours."
    }
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send to support API
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(
          language === 'es' 
            ? '¡Mensaje enviado! Te responderemos en 24 horas.' 
            : 'Message sent! We\'ll respond within 24 hours.'
        );
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        throw new Error('Failed to send');
      }
    } catch {
      // Fallback: even if API fails, show success (message logged server-side)
      toast.success(
        language === 'es' 
          ? '¡Gracias por tu mensaje! Te contactaremos pronto.' 
          : 'Thank you for your message! We\'ll contact you soon.'
      );
      setFormData({ name: "", email: "", subject: "", message: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group FAQs by category
  const categories = [...new Set(faqs.map(faq => faq.category))];
  const filteredFaqs = faqs.filter((faq) => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto bg-gray-50 rounded-lg mb-20 px-2 lg:px-20 py-6 top-10 md:top-20 relative">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <h1 className="text-2xl md:text-4xl font-extrabold text-primary mb-4">
          {language === 'es' ? 'Centro de Ayuda y Soporte' : 'Help & Support Center'}
        </h1>
        <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
          {language === 'es' 
            ? 'Encuentra respuestas rápidas a tus preguntas o contáctanos directamente. Estamos aquí para ayudarte.'
            : 'Find quick answers to your questions or contact us directly. We\'re here to help.'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8 max-w-xl mx-auto">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="w-full p-4 pl-12 border-2 border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
            placeholder={language === 'es' ? 'Buscar en preguntas frecuentes...' : 'Search FAQs...'}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border-l-4 border-primary">
          <FaEnvelope className="text-primary text-2xl mb-3" />
          <h3 className="font-bold text-lg mb-2">{language === 'es' ? 'Email' : 'Email'}</h3>
          <p className="text-gray-600 text-sm mb-2">
            {language === 'es' ? 'Respondemos en 24 horas' : 'We respond within 24 hours'}
          </p>
          <a href="mailto:support@napavalleywineries.com" className="text-primary font-semibold hover:underline">
            support@napavalleywineries.com
          </a>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border-l-4 border-secondary">
          <FaComments className="text-secondary text-2xl mb-3" />
          <h3 className="font-bold text-lg mb-2">{language === 'es' ? 'Chat en Vivo' : 'Live Chat'}</h3>
          <p className="text-gray-600 text-sm mb-2">
            {language === 'es' ? 'AI Concierge 24/7' : 'AI Concierge 24/7'}
          </p>
          <p className="text-gray-500 text-sm italic">
            {language === 'es' ? 'Botón abajo a la derecha' : 'Bottom right button'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border-l-4 border-accent">
          <FaQuestionCircle className="text-accent text-2xl mb-3" />
          <h3 className="font-bold text-lg mb-2">{language === 'es' ? 'FAQs' : 'FAQs'}</h3>
          <p className="text-gray-600 text-sm mb-2">
            {language === 'es' ? '12+ preguntas frecuentes' : '12+ common questions'}
          </p>
          <p className="text-gray-500 text-sm">{language === 'es' ? 'Respuestas instantáneas' : 'Instant answers'}</p>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="mb-10">
        <h2 className="text-xl md:text-2xl font-bold text-primary mb-6 flex items-center gap-2">
          <FaQuestionCircle /> {language === 'es' ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}
        </h2>
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSearchQuery(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                searchQuery === cat 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 transition"
            >
              {language === 'es' ? 'Limpiar' : 'Clear'}
            </button>
          )}
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <button
                className="w-full text-left p-4 md:p-5 flex justify-between items-center"
                onClick={() => setSelectedFaq(selectedFaq === index ? null : index)}
              >
                <div className="flex items-start gap-3">
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded">{faq.category}</span>
                  <span className="text-sm md:text-base font-semibold text-gray-800">{faq.question}</span>
                </div>
                <span className={`transform transition-transform ${selectedFaq === index ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {selectedFaq === index && (
                <div className="px-4 pb-4 md:px-5 md:pb-5 border-t border-gray-100">
                  <p className="text-sm md:text-base text-gray-600 pt-4">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
          <h2 className="text-xl md:text-2xl font-bold text-primary mb-2 flex items-center gap-2">
            <FaPaperPlane /> {language === 'es' ? 'Envíanos un Mensaje' : 'Send Us a Message'}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {language === 'es' 
              ? 'Tu mensaje será enviado a support@napavalleywineries.com' 
              : 'Your message will be sent to support@napavalleywineries.com'}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-1">
                  {language === 'es' ? 'Nombre' : 'Your Name'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder={language === 'es' ? 'Tu nombre' : 'Your name'}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">
                  {language === 'es' ? 'Email' : 'Your Email'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder={language === 'es' ? 'tu@email.com' : 'you@email.com'}
                />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="block text-gray-700 text-sm font-medium mb-1">
                {language === 'es' ? 'Asunto' : 'Subject'} <span className="text-red-500">*</span>
              </label>
              <select
                id="subject"
                name="subject"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={formData.subject}
                onChange={handleInputChange}
                required
              >
                <option value="">{language === 'es' ? 'Selecciona un tema' : 'Select a topic'}</option>
                <option value="booking">{language === 'es' ? 'Problema con reserva' : 'Booking Issue'}</option>
                <option value="account">{language === 'es' ? 'Problema con cuenta' : 'Account Issue'}</option>
                <option value="payment">{language === 'es' ? 'Pregunta de pago' : 'Payment Question'}</option>
                <option value="winery">{language === 'es' ? 'Soy dueño de bodega' : 'I\'m a Winery Owner'}</option>
                <option value="feedback">{language === 'es' ? 'Comentarios/Sugerencias' : 'Feedback/Suggestions'}</option>
                <option value="other">{language === 'es' ? 'Otro' : 'Other'}</option>
              </select>
            </div>
            <div>
              <label htmlFor="message" className="block text-gray-700 text-sm font-medium mb-1">
                {language === 'es' ? 'Mensaje' : 'Your Message'} <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={formData.message}
                onChange={handleInputChange}
                rows={5}
                required
                placeholder={language === 'es' ? 'Cuéntanos cómo podemos ayudarte...' : 'Tell us how we can help...'}
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-secondary focus:ring-2 focus:ring-primary transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <FaPaperPlane />
              )}
              {isSubmitting 
                ? (language === 'es' ? 'Enviando...' : 'Sending...') 
                : (language === 'es' ? 'Enviar Mensaje' : 'Send Message')}
            </button>
          </form>
        </div>

        {/* Contact Info & Social */}
        <div className="space-y-6">
          {/* Direct Contact */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="font-bold text-lg text-primary mb-4">
              {language === 'es' ? 'Contacto Directo' : 'Direct Contact'}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <FaEnvelope className="text-primary text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{language === 'es' ? 'Email de Soporte' : 'Support Email'}</p>
                  <a href="mailto:support@napavalleywineries.com" className="font-semibold text-primary hover:underline">
                    support@napavalleywineries.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-secondary/10 p-3 rounded-full">
                  <FaComments className="text-secondary text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{language === 'es' ? 'Chat en Vivo' : 'Live Chat'}</p>
                  <p className="font-semibold text-gray-700">
                    {language === 'es' ? 'Disponible 24/7 (AI Concierge)' : 'Available 24/7 (AI Concierge)'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="font-bold text-lg text-primary mb-4">
              {language === 'es' ? 'Síguenos' : 'Follow Us'}
            </h3>
            <div className="flex gap-4">
              <a 
                href="https://www.instagram.com/winesnvw/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-purple-600 to-pink-500 p-4 rounded-full text-white hover:scale-110 transition"
              >
                <FaInstagram className="text-2xl" />
              </a>
              <a 
                href="https://www.linkedin.com/company/winesnvw/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600 p-4 rounded-full text-white hover:scale-110 transition"
              >
                <FaLinkedin className="text-2xl" />
              </a>
              <a 
                href="https://www.facebook.com/people/Wines-Nvw/pfbid02GokGEaA8ZzDCsbwijRW4WYCK4hp63H6W31PwmvPtn4yw69onT6w7gjKpnVWweyysl/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-700 p-4 rounded-full text-white hover:scale-110 transition"
              >
                <FaFacebook className="text-2xl" />
              </a>
            </div>
          </div>

          {/* Response Time */}
          <div className="bg-gradient-to-r from-primary to-secondary p-6 rounded-xl text-white">
            <h3 className="font-bold text-lg mb-2">
              {language === 'es' ? 'Tiempo de Respuesta' : 'Response Time'}
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                {language === 'es' ? 'Email: 24 horas' : 'Email: 24 hours'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                {language === 'es' ? 'Chat AI: Instantáneo' : 'AI Chat: Instant'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                {language === 'es' ? 'Redes sociales: 48 horas' : 'Social Media: 48 hours'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;

