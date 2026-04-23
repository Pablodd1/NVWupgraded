
"use client";

import React from "react";

export default function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <p className="mb-4 text-gray-600">Last Updated: January 1, 2026</p>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
                <p className="mb-2">We collect information you provide directly to us, such as when you create an account, book a tasting, or subscribe to our newsletter.</p>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                    <li>Name and contact information (email, phone number)</li>
                    <li>Booking details and preferences</li>
                    <li>Payment information (processed securely by Stripe)</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
                <p className="mb-2">We use your information to:</p>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                    <li>Process and confirm your winery reservations</li>
                    <li>Send you booking confirmations and updates via email or SMS (if opted in)</li>
                    <li>Improve our platform and user experience</li>
                </ul>
            </section>

            <section className="mb-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h2 className="text-xl font-semibold mb-3 text-blue-900">3. SMS & Messaging Data</h2>
                <p className="mb-4 text-gray-700">
                    We value your privacy. <strong>We will never share, sell, or rent your phone number or SMS consent status to third parties for marketing purposes.</strong>
                </p>
                <p className="text-gray-700">
                    Your phone number is used solely for transactional notifications about your bookings (e.g., confirmations, reminders, cancellations) and, if you explicitly opt-in, for exclusive offers from Napa Valley Wineries.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">4. Your Choices</h2>
                <p className="mb-2">You can manage your communication preferences at any time:</p>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                    <li><strong>Email:</strong> Click "Unsubscribe" in any marketing email.</li>
                    <li><strong>SMS:</strong> Reply "STOP" to any message to opt out immediately. Reply "HELP" for assistance.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">5. Contact Us</h2>
                <p>If you have questions about this policy, please contact us at anabel@nvw.wine.</p>
            </section>
        </div>
    );
}
