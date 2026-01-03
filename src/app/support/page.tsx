"use client";
import { useState } from "react";
import axios from "axios";

interface ChatMessage {
  text: string;
  isUser: boolean;
}

const SupportPage = () => {
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [showChat, setShowChat] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await axios.post("/api/ai-search", { query: userMessage });
      const { filters, wineries, count } = response.data;

      let botResponse = "";
      if (count > 0) {
        botResponse = `I found ${count} wineries matching your request. Here are a few: ${wineries.slice(0, 3).map((w: any) => w.name).join(", ")}.`;
      } else {
        botResponse = "I couldn't find any wineries matching that description. Try asking for 'Red wine in Calistoga' or 'Kid friendly wineries'.";
      }

      setChatMessages(prev => [...prev, { text: botResponse, isUser: false }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting to the Sommelier right now.", isUser: false }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const faqs = [
    {
      question: "How do I book a winery visit?",
      answer:
        "To book a winery visit, browse our homepage, apply filters, add wineries to your itinerary, and click 'Confirm Booking'.",
    },
    {
      question: "Can I modify or cancel my itinerary?",
      answer:
        "Yes, you can modify your itinerary before confirmation. After confirmation, changes/cancellations must be handled with the winery directly.",
    },
    {
      question: "How do I use Uber/Lyft for my itinerary?",
      answer:
        "After confirming your booking, you’ll have an option to book an Uber/Lyft for your first winery. You will also get ride links in the confirmation email.",
    },
    {
      question: "What types of wineries are listed on your website?",
      answer:
        "We feature boutique, luxury, organic, and family-friendly wineries. Use filters to find your preferred winery type.",
    },
    {
      question: "Do wineries charge tasting fees?",
      answer: "Yes, tasting fees vary by winery. The pricing information is available on each winery’s page.",
    },
    {
      question: "Can I contact a winery directly?",
      answer:
        "Yes, each winery listing includes contact details so you can call or email them for special requests or additional information.",
    },
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
      <h1 className="text-2xl md:text-4xl font-extrabold text-center text-primary mb-8">Support & Help Center</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          className="w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition duration-300"
          placeholder="Search for help..."
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
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">Contact Support</h2>
        <p className="mb-6 text-gray-600 text-sm md:text-base">
          If you need further assistance, feel free to reach out to us. Our support team is available via live chat, email, phone,
          or social media.
        </p>

        {/* Live Chat */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg text-primary mb-2">Live Chat 💬</h3>
          <p className="text-gray-600 mb-4 text-sm md:text-base">Available Monday–Friday, 9 AM–6 PM (PST)</p>
          <button
            className="bg-primary text-white py-2 px-6 rounded-lg hover:bg-secondary focus:ring-2 focus:ring-primary transition duration-300"
            onClick={() => setShowChat(true)}
          >
            Start Live Chat
          </button>
        </div>

        {showChat && (
          <div className="fixed bottom-5 right-5 w-80 md:w-96 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-200 flex flex-col max-h-[500px]">
            <div className="bg-primary text-white p-4 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold">NVW Consierge</h3>
                <p className="text-xs text-white/80">Typically replies in a few minutes</p>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-white hover:bg-white/20 rounded-full p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col space-y-4">
              <div className="flex justify-start">
                <div className="bg-gray-200 rounded-lg rounded-tl-none p-3 max-w-[80%] text-sm text-gray-800">
                  <p>Hello! 👋 Welcome to Napa Valley Wineries support. I can help find the perfect winery for you. Try asking "Find a kid-friendly winery in Calistoga".</p>
                </div>
              </div>
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-lg p-3 max-w-[80%] text-sm ${msg.isUser ? 'bg-primary text-white rounded-tr-none' : 'bg-gray-200 text-gray-800 rounded-tl-none'}`}>
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 rounded-lg rounded-tl-none p-3 text-sm text-gray-800">
                    <span className="loading loading-dots loading-xs"></span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t bg-white shrink-0">
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask for recommendations..."
                  className="flex-1 p-2 border rounded-md focus:outline-none focus:border-primary text-sm"
                  autoFocus
                />
                <button type="submit" disabled={isChatLoading} className="bg-primary text-white p-2 rounded-md hover:bg-primary-focus disabled:opacity-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Email Support */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg text-primary mb-2">Email Support 📧</h3>
          <p className="text-gray-600 text-sm md:text-base">
            Send us an email at <span className="font-bold text-primary">support@napavalleywineries.com</span>. We typically
            respond within 24 hours.
          </p>
        </div>

        {/* Phone Support */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg text-primary mb-2">Phone Support 📞</h3>
          <p className="text-gray-600 text-sm md:text-base">
            Call us at{" "}
            <a
              href="https://wa.me/19544222894"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-primary underline hover:text-secondary transition"
              title="Chat with us on WhatsApp"
            >
              +1 (954) 422-2894
            </a>
            . Available Monday–Friday, 10 AM–5 PM (PST).
          </p>
        </div>

        {/* Social Media */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg text-primary mb-2">Social Media 📱</h3>
          <p className="text-gray-600 text-sm md:text-base">Follow us for updates and support on:</p>
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
          <h2 className="text-xl md:text-3xl font-bold text-primary mb-4">Submit a Support Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-gray-700 text-sm md:text-base">
                Your Name
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
                Your Email
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
                Your Message
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
              Send Message
            </button>
          </form>
        </div>
        {/* Video Section */}
        {/* <div className="mt-10 w-full">
          <h3 className="text-xl lg:text-2xl font-bold text-primary mb-4">How to Book a Winery Visit</h3>
          <div className="relative w-full">
            <iframe
              className="inset-0 w-full rounded-lg"
              src="https://www.youtube.com/embed/Mf_nGEPIsQ8"
              title="Travel Agency Short Video Ad Sample - Video &amp; Animation Services, Video Experts"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen={true}
            ></iframe>
          </div>
        </div> */}
      </div>

      {/* Testimonials Section */}
      <div className="mt-10">
        <h3 className="text-xl lg:text-2xl font-bold text-primary mb-4">What Our Customers Say</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <p className="text-sm md:text-base text-gray-600 italic mb-4">
              "Booking my itinerary through this website made my Napa Valley experience unforgettable! The support was amazing when
              I had questions about tasting fees."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">JS</div>
              <div>
                <p className="font-semibold text-primary">Johan Surich</p>
                <p className="text-xs text-gray-500">New York, NY</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <p className="text-sm md:text-base text-gray-600 italic mb-4">
              "I organized a bachelorette party for 8 people and the AI recommendations were spot on! We found a hidden gem winery that wasn't even on our radar. The shuttle coordination was seamless."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-bold">EM</div>
              <div>
                <p className="font-semibold text-primary">Emily Martinez</p>
                <p className="text-xs text-gray-500">San Francisco, CA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
