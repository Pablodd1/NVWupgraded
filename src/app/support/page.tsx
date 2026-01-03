
"use client";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

const SupportPage = () => {
  const { t, language } = useLanguage();
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const faqs = [
    {
      question: t("nav_bookings") === "Tus Reservas" ? "¿Cómo reservo una visita?" : "How do I book a winery visit?",
      answer: t("nav_bookings") === "Tus Reservas"
        ? "Para reservar, navega por nuestra página principal, aplica filtros, añade bodegas a tu itinerario y haz clic en 'Confirmar Reserva'."
        : "To book a winery visit, browse our homepage, apply filters, add wineries to your itinerary, and click 'Confirm Booking'."
    },
    {
      question: t("nav_bookings") === "Tus Reservas" ? "¿Puedo modificar o cancelar?" : "Can I modify or cancel my itinerary?",
      answer: t("nav_bookings") === "Tus Reservas"
        ? "Sí, puedes modificar tu itinerario antes de confirmar. Después, contacta con la bodega directamente."
        : "Yes, you can modify your itinerary before confirmation. After confirmation, changes/cancellations must be handled with the winery directly."
    }
  ];

  const handleSearchChange = (e: any) => setSearchQuery(e.target.value);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    alert("Thank you for your message. We will get back to you soon!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="container mx-auto bg-gray-50 rounded-lg mb-20 px-2 lg:px-20 py-6 top-10 md:top-20 relative">
      <h1 className="text-2xl md:text-4xl font-extrabold text-center text-primary mb-8">{t('support_title')}</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          className="w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition duration-300"
          placeholder={t('support_search_placeholder')}
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {/* FAQs Accordion */}
      <div className="space-y-4">
        {faqs
          .filter((faq) => faq.question.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((faq, index) => (
            <div key={index} className="border-b border-gray-200 hover:bg-gray-100 rounded-lg transition duration-200">
              <button
                className="w-full text-left p-2 lg:p-4 text-sm md:text-xl font-semibold text-primary hover:text-secondary focus:outline-none"
                onClick={() => setSelectedFaq(selectedFaq === index ? null : index)}
              >
                {faq.question}
              </button>
              {selectedFaq === index && (
                <div className="p-4 text-sm md:text-lg bg-gray-50 rounded-lg shadow-sm mt-2">{faq.answer}</div>
              )}
            </div>
          ))}
      </div>

      {/* Contact Support Section */}
      <div className="mt-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">{t('support_contact')}</h2>
        <p className="mb-6 text-gray-600 text-sm md:text-base">
          {t('support_contact_desc')}
        </p>

        {/* Live Chat */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg text-primary mb-2">{t('support_live_chat')}</h3>
          <p className="text-gray-600 mb-4 text-sm md:text-base">{t('support_live_chat_desc')}</p>
          <p className="text-sm text-gray-500 italic">
            {language === 'es'
              ? "Haz clic en el botón de chat (abajo derecha) para comenzar."
              : "Click the chat button in the bottom right corner to start."}
          </p>
        </div>

        {/* Email Support */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg text-primary mb-2">Email Support 📧</h3>
          <p className="text-gray-600 text-sm md:text-base">
            {language === 'es' ? 'Envíanos un correo a' : 'Send us an email at'} <span className="font-bold text-primary">support@napavalleywineries.com</span>.
          </p>
        </div>

        {/* Phone Support */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg text-primary mb-2">Phone Support 📞</h3>
          <p className="text-gray-600 text-sm md:text-base">
            {language === 'es' ? 'Llámanos al' : 'Call us at'}{" "}
            <a
              href="https://wa.me/19544222894"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-primary underline hover:text-secondary transition"
            >
              +1 (954) 422-2894
            </a>
          </p>
        </div>

        {/* Social Media */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg text-primary mb-2">Social Media 📱</h3>
          <ul className="flex space-x-4 mt-4 flex-wrap">
            <li>
              <a href="https://www.instagram.com/winesnvw/" target="_blank" className="text-primary hover:text-secondary">
                Instagram
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/company/winesnvw/" target="_blank" className="text-primary hover:text-secondary">
                LinkedIn
              </a>
            </li>
            <li>
              <a href="https://www.facebook.com/people/Wines-Nvw/pfbid02GokGEaA8ZzDCsbwijRW4WYCK4hp63H6W31PwmvPtn4yw69onT6w7gjKpnVWweyysl/" target="_blank" className="text-primary hover:text-secondary">
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="block lg:flex justify-between">
        {/* Contact Form */}
        <div className="mt-10 w-full">
          <h2 className="text-xl md:text-3xl font-bold text-primary mb-4">{t('support_contact')}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-gray-700 text-sm md:text-base">
                {language === 'es' ? 'Nombre' : 'Your Name'}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary mt-2"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-700 text-sm md:text-base">
                {language === 'es' ? 'Email' : 'Your Email'}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary mt-2"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-gray-700 text-sm md:text-base">
                {language === 'es' ? 'Mensaje' : 'Your Message'}
              </label>
              <textarea
                id="message"
                name="message"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary mt-2"
                value={formData.message}
                onChange={handleInputChange}
                rows={5}
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-primary text-white py-2 px-6 rounded-lg hover:bg-secondary focus:ring-2 focus:ring-primary transition duration-300"
            >
              {language === 'es' ? 'Enviar Mensaje' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;

