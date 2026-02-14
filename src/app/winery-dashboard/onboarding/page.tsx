"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";
import { FaWineGlassAlt, FaMapMarkerAlt, FaPhone, FaCheckCircle, FaImage, FaPlus, FaTrash } from "react-icons/fa";
import { APIProvider } from "@vis.gl/react-google-maps";
import { AddressAutocomplete } from "@/components/common/AddressAutocomplete";

export default function WineryOnboarding() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        address: "",
        latitude: 0,
        longitude: 0,
        phone: "",
        website: ""
    });
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        setUploading(true);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setImages(prev => [...prev, data.url]);
                toast.success('Image uploaded!');
            } else {
                toast.error('Failed to upload image');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Error uploading image');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Construct the payload matching the Schema
            const payload = {
                name: formData.name,
                description: formData.description,
                location: {
                    address: formData.address,
                    latitude: formData.latitude || 0,
                    longitude: formData.longitude || 0,
                    is_mountain_location: false
                },
                contact_info: {
                    phone: formData.phone,
                    email: user?.email || "",
                    website: formData.website
                },
                images: images,
                // Initialize with one default empty tasting so it's not empty
                tasting_info: [{
                    tasting_title: "Signature Tasting",
                    tasting_description: "Our flagship wine tasting experience.",
                    tasting_price: 50,
                    base_booking_fee: 50,
                    additional_guest_fee: 25,
                    free_guests_included: 1,
                    available_times: ["11:00", "13:00", "15:00"],
                    wine_types: ["Red", "White"],
                    booking_info: {
                        booking_enabled: true,
                        max_guests_per_slot: 8,
                        available_slots: [],
                        allow_excess_guests: false,
                        excess_guest_multiplier: 1.5
                    }
                }]
            };

            const res = await fetch("/api/winery-dashboard/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Welcome to the platform! Your winery is ready.");
                router.push("/winery-dashboard");
            } else {
                toast.error(data.error || "Failed to create winery");
            }
        } catch (error) {
            console.error("Onboarding error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <FaWineGlassAlt className="text-5xl text-primary" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Setup Your Winery
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Let's get your profile started so you can accept bookings.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Winery Name
                            </label>
                            <div className="mt-1">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    placeholder="e.g. Napa Valley Estate"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Short Description
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="description"
                                    name="description"
                                    required
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    placeholder="Tell us a bit about your history and wines..."
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                Address
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaMapMarkerAlt className="text-gray-400" />
                                </div>
                                <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
                                    <AddressAutocomplete
                                        value={formData.address}
                                        onChange={(address, lat, lng) => {
                                            setFormData({
                                                ...formData,
                                                address,
                                                latitude: lat || 0,
                                                longitude: lng || 0
                                            });
                                        }}
                                        className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                        placeholder="123 Main St, Napa, CA"
                                    />
                                </APIProvider>
                                {formData.latitude !== 0 && formData.longitude !== 0 && (
                                    <p className="mt-2 text-sm text-green-600 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a 1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Location confirmed: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Business Phone
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaPhone className="text-gray-400" />
                                </div>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                                    placeholder="+1 (707) 555-0123"
                                />
                            </div>
                        </div>

                        {/* Images */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Winery Photos
                            </label>

                            {images.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative group aspect-square">
                                            <img src={img} className="w-full h-full object-cover rounded-md border" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <FaTrash size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    id="onboarding-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleImageUpload(file);
                                    }}
                                />
                                <label
                                    htmlFor="onboarding-upload"
                                    className={`btn btn-outline btn-sm gap-2 ${uploading ? 'loading' : ''}`}
                                >
                                    <FaPlus size={12} />
                                    {uploading ? 'Uploading...' : 'Add Photo'}
                                </label>
                                <span className="text-xs text-gray-500 italic">Recommended for your landing page.</span>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
                            >
                                {loading ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                ) : (
                                    "Create Registry & Dashboard"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
