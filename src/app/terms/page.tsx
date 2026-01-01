
"use client";

import React from "react";

export default function TermsOfService() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            <p className="mb-4 text-gray-600">Last Updated: January 1, 2026</p>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p className="text-gray-700">By accessing or using Napa Valley Wineries, you agree to be bound by these Terms of Service and our Privacy Policy.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">2. Age Requirement</h2>
                <p className="text-gray-700">You must be at least 21 years of age to use this platform to book wine tastings or purchase alcohol-related services.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">3. Messaging Terms (SMS)</h2>
                <p className="text-gray-700 mb-2">By opting in to receive SMS messages from us, you agree to the following:</p>
                <ul className="list-disc ml-6 space-y-2 text-gray-700">
                    <li><strong>Program Description:</strong> We send booking confirmations, reminders, and occasional alerts regarding your itinerary.</li>
                    <li><strong>Message Frequency:</strong> Frequency varies based on your booking activity.</li>
                    <li><strong>Cost:</strong> Message and data rates may apply.</li>
                    <li><strong>Opt-Out:</strong> You can cancel the SMS service at any time. Just text "STOP" to the short code. After you send the SMS message "STOP" to us, we will send you an SMS message to confirm that you have been unsubscribed. After this, you will no longer receive SMS messages from us. If you want to join again, just sign up as you did the first time and we will start sending SMS messages to you again.</li>
                    <li><strong>Help:</strong> If you are experiencing issues with the messaging program you can reply with the keyword HELP for more assistance, or you can get help directly at support@napavalleywineries.com.</li>
                    <li><strong>Carriers:</strong> Carriers are not liable for delayed or undelivered messages.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">4. Cancellations & Refunds</h2>
                <p className="text-gray-700">Cancellations must be made at least 24 hours in advance for a full refund. Specific wineries may have stricter policies which will be displayed at booking.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">5. Contact</h2>
                <p>Questions? Contact us at support@napavalleywineries.com.</p>
            </section>
        </div>
    );
}
