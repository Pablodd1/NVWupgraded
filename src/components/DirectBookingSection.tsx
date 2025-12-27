"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Winery {
    _id: string;
    name: string;
    description: string;
    location: {
        address: string;
    };
    contact_info: {
        website?: string;
    };
    tasting_info: Array<{
        tasting_title: string;
        tasting_description: string;
        tasting_price: number;
        images: string[];
    }>;
    payment_method?: {
        type: string;
        external_booking_link?: string;
    };
}

export default function DirectBookingSection() {
    const [externalWineries, setExternalWineries] = useState<Winery[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExternalBookingWineries();
    }, []);

    const fetchExternalBookingWineries = async () => {
        try {
            const response = await fetch("/api/winery");
            const data = await response.json();

            // Filter wineries that have external booking
            const external = data.wineries?.filter(
                (w: Winery) => w.payment_method?.type === "external_booking"
            ) || [];

            setExternalWineries(external);
        } catch (error) {
            console.error("Failed to fetch wineries:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (externalWineries.length === 0) {
        return null; // Don't show section if no external booking wineries
    }

    return (
        <section className="py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <div className="inline-block mb-4">
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                            🔗 Direct Booking Available
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Book Directly with Wineries
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        These wineries offer direct booking through their own systems.
                        We'll track your reservation and keep you updated!
                    </p>
                </div>

                {/* Wineries Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {externalWineries.map((winery) => {
                        const firstTasting = winery.tasting_info[0];
                        const imageUrl = firstTasting?.images[0] || "/placeholder-winery.jpg";
                        const externalLink = winery.payment_method?.external_booking_link || winery.contact_info?.website || "#";

                        return (
                            <div
                                key={winery._id}
                                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-purple-100 hover:border-purple-300"
                            >
                                {/* Image */}
                                <div className="relative h-56 overflow-hidden">
                                    <Image
                                        src={imageUrl}
                                        alt={winery.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 right-4">
                                        <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                            External Booking
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h3 className="text-2xl font-bold text-white mb-1">
                                            {winery.name}
                                        </h3>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {winery.description}
                                    </p>

                                    {firstTasting && (
                                        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                                            <p className="text-sm font-semibold text-purple-900 mb-1">
                                                {firstTasting.tasting_title}
                                            </p>
                                            <p className="text-xs text-purple-700">
                                                From ${firstTasting.tasting_price}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center text-sm text-gray-500 mb-4">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="line-clamp-1">{winery.location.address}</span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <a
                                            href={externalLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl font-semibold text-center hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg"
                                        >
                                            Book Direct →
                                        </a>
                                        <Link
                                            href={`/winery/${winery._id}`}
                                            className="px-4 py-3 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-300"
                                        >
                                            Details
                                        </Link>
                                    </div>

                                    <p className="text-xs text-gray-500 mt-3 text-center">
                                        ✓ Tracked in your account • ✓ Email confirmations
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Info Banner */}
                <div className="mt-12 max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-100">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-gray-900 mb-2">
                                How Direct Booking Works
                            </h4>
                            <ul className="space-y-2 text-gray-600">
                                <li className="flex items-start">
                                    <span className="text-purple-600 mr-2">1.</span>
                                    <span>Click "Book Direct" to visit the winery's booking page</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-purple-600 mr-2">2.</span>
                                    <span>Complete your booking on their website</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-purple-600 mr-2">3.</span>
                                    <span>We'll track your reservation and send you confirmations</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-purple-600 mr-2">4.</span>
                                    <span>View all your bookings (including external ones) in your account</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
