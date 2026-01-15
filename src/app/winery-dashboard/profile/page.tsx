"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaWineGlass,
  FaPlus,
  FaTrash,
  FaCar,
  FaCreditCard,
  FaLink,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";
import { Winery, TastingInfo, FoodPairingOption } from "@/app/interfaces";

export default function WineryProfile() {
  const { user, loading, fetchUser } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<Winery | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      fetchUser();
    }
  }, [loading, user, fetchUser]);

  useEffect(() => {
    if (!loading && user && user.role !== "winery") {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/winery-dashboard/profile");
        if (response.ok) {
          const data = await response.json();
          // Normalize data for the form
          const winery = data.winery;

          // Ensure structure matches interface and schema
          if (!winery.location) {
            winery.location = { address: "", latitude: 0, longitude: 0, is_mountain_location: false };
          } else {
            // Map 'lat'/'long' to 'latitude'/'longitude' if coming from old structure
            if (winery.location.lat !== undefined) winery.location.latitude = winery.location.lat;
            if (winery.location.long !== undefined) winery.location.longitude = winery.location.long;
            if (winery.location.latitude === undefined) winery.location.latitude = 0;
            if (winery.location.longitude === undefined) winery.location.longitude = 0;
            if (winery.location.is_mountain_location === undefined) winery.location.is_mountain_location = false;
          }

          if (!winery.contact_info) winery.contact_info = { phone: "", email: "", website: "" };
          if (!winery.amenities) winery.amenities = { handicap_accessible: false };
          if (!winery.transportation) winery.transportation = { uber_availability: false, lyft_availability: false, distance_from_user: 0 };
          if (!winery.payment_method) winery.payment_method = { type: 'pay_winery' };
          if (!winery.tasting_info) winery.tasting_info = [];

          setProfile(winery);
        } else {
          toast.error("Failed to load profile");
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Error loading profile");
      } finally {
        setLoadingProfile(false);
      }
    };

    if (user?.role === "winery") {
      fetchProfile();
    }
  }, [user]);

  const handleInputChange = (path: string, value: any) => {
    setProfile(prev => {
      if (!prev) return prev;
      const newProfile = JSON.parse(JSON.stringify(prev)); // Deep clone

      const keys = path.split('.');
      let current = newProfile;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;

      return newProfile;
    });
  };

  const handleTastingChange = (index: number, field: string, value: any) => {
    setProfile(prev => {
      if (!prev) return prev;
      const newProfile = { ...prev };
      const newTastings = [...newProfile.tasting_info];
      const keys = field.split('.');

      let current: any = newTastings[index];
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;

      newProfile.tasting_info = newTastings;
      return newProfile;
    });
  };

  const addTasting = () => {
    if (!profile) return;
    // Empty tasting template - winery owner fills in all details
    const newTasting: TastingInfo = {
      tasting_title: "",
      tasting_description: "",
      ava: "",
      tasting_price: 0,
      available_times: [],
      wine_types: [],
      number_of_wines_per_tasting: 0,
      special_features: [],
      images: [],
      food_pairing_options: [],
      tours: { available: false, tour_price: 0, tour_options: [] },
      wine_details: [],
      booking_info: {
        booking_enabled: true,
        max_guests_per_slot: 0,
        number_of_people: [],
        dynamic_pricing: { enabled: false, weekend_multiplier: 1.0 },
        available_slots: []
      },
      other_features: []
    };
    setProfile({
      ...profile,
      tasting_info: [...profile.tasting_info, newTasting]
    });
  };

  const removeTasting = (index: number) => {
    if (!profile) return;
    const newTastings = profile.tasting_info.filter((_, i) => i !== index);
    setProfile({ ...profile, tasting_info: newTastings });
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const response = await fetch("/api/winery-dashboard/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        toast.success("Everything updated! Your winery UI reflects these changes now.");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingProfile || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-gray-600">Syncing with system...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-20 md:pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-serif font-bold text-gray-900">{profile.name || "Winery Dashboard"}</h1>
            <p className="text-gray-600 mt-1">Full Control: Experience, Filtration, Transport & Payments</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.push("/winery-dashboard")} className="btn btn-ghost">Dashboard Overview</button>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary px-8">
              {saving ? <span className="loading loading-spinner loading-xs"></span> : "Save All Changes"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Controls - Left Side */}
          <div className="lg:col-span-2 space-y-8">

            {/* 1. Basic & Location */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-serif font-bold text-wine-primary mb-6 flex items-center gap-2">
                <FaMapMarkerAlt className="text-wine-secondary" />
                Identity & Location
              </h2>
              <div className="space-y-6">
                <div className="form-control">
                  <label className="label font-bold text-gray-700">Winery Display Name</label>
                  <input
                    type="text" value={profile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="input input-bordered w-full focus:border-wine-primary"
                    placeholder="e.g. Napa Estate"
                    aria-label="Winery Display Name"
                  />
                </div>
                <div className="form-control">
                  <label className="label font-bold text-gray-700">Official Description (for AI Search & Results)</label>
                  <textarea
                    value={profile.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="textarea textarea-bordered h-32 focus:border-wine-primary"
                    placeholder="Tell guests about your winery's unique experience..."
                    aria-label="Winery Description"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label font-bold text-gray-700">Address</label>
                    <input
                      type="text" value={profile.location.address}
                      onChange={(e) => handleInputChange('location.address', e.target.value)}
                      className="input input-bordered focus:border-wine-primary"
                      placeholder="123 Wine Way, St. Helena, CA"
                      aria-label="Street Address"
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-8">
                    <label className="label cursor-pointer flex gap-3">
                      <input
                        type="checkbox" checked={profile.location.is_mountain_location}
                        onChange={(e) => handleInputChange('location.is_mountain_location', e.target.checked)}
                        className="checkbox checkbox-primary"
                      />
                      <span className="label-text font-semibold">Mountain Location (Filtration Tag)</span>
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label font-bold text-gray-700">Latitude</label>
                    <input
                      type="number" step="any" value={profile.location.latitude}
                      onChange={(e) => handleInputChange('location.latitude', parseFloat(e.target.value))}
                      className="input input-bordered focus:border-wine-primary"
                      placeholder="38.5025"
                      aria-label="Latitude"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label font-bold text-gray-700">Longitude</label>
                    <input
                      type="number" step="any" value={profile.location.longitude}
                      onChange={(e) => handleInputChange('location.longitude', parseFloat(e.target.value))}
                      className="input input-bordered focus:border-wine-primary"
                      placeholder="-122.4656"
                      aria-label="Longitude"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Tasting Packages (UX & Filtration Management) */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold text-wine-primary flex items-center gap-2">
                  <FaWineGlass className="text-wine-secondary" />
                  Tasting Experiences
                </h2>
                <button onClick={addTasting} className="btn btn-outline btn-sm gap-2">
                  <FaPlus /> Add Package
                </button>
              </div>

              <div className="space-y-8">
                {profile.tasting_info.map((tasting, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-xl p-6 relative bg-gray-50/50">
                    <button
                      onClick={() => removeTasting(idx)}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-2"
                      title="Remove Tasting Package"
                      aria-label="Remove Tasting Package"
                    >
                      <FaTrash size={18} />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="form-control">
                        <label className="label text-xs font-bold uppercase text-gray-500">Base Booking Fee ($)</label>
                        <input
                          type="number" value={tasting.base_booking_fee || 0}
                          onChange={(e) => handleTastingChange(idx, 'base_booking_fee', Number(e.target.value))}
                          className="input input-bordered input-sm"
                          placeholder="0"
                          aria-label="Base Booking Fee"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label text-xs font-bold uppercase text-gray-500">Additional Guest Fee ($)</label>
                        <input
                          type="number" value={tasting.additional_guest_fee || 0}
                          onChange={(e) => handleTastingChange(idx, 'additional_guest_fee', Number(e.target.value))}
                          className="input input-bordered input-sm"
                          placeholder="0"
                          aria-label="Additional Guest Fee"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="form-control">
                        <label className="label text-xs font-bold uppercase text-gray-500">Tasting Title</label>
                        <input
                          type="text" value={tasting.tasting_title}
                          onChange={(e) => handleTastingChange(idx, 'tasting_title', e.target.value)}
                          className="input input-bordered input-sm font-bold"
                          placeholder="e.g. Reserve Flight"
                          aria-label="Tasting Title"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label text-xs font-bold uppercase text-gray-500">Old Tasting Price (Legacy) ($)</label>
                        <input
                          type="number" value={tasting.tasting_price}
                          onChange={(e) => handleTastingChange(idx, 'tasting_price', Number(e.target.value))}
                          className="input input-bordered input-sm opacity-50"
                          placeholder="0"
                          aria-label="Legacy Tasting Price"
                        />
                      </div>
                    </div>

                    <div className="form-control mb-4">
                      <label className="label text-xs font-bold uppercase text-gray-500">Description</label>
                      <textarea
                        value={tasting.tasting_description}
                        onChange={(e) => handleTastingChange(idx, 'tasting_description', e.target.value)}
                        className="textarea textarea-bordered textarea-sm h-20"
                        placeholder="What should guests expect?"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="form-control">
                        <label className="label text-xs font-bold uppercase text-gray-500">Wine Types (e.g. Cabernet, Rose)</label>
                        <input
                          type="text" value={tasting.wine_types?.join(', ') || ''}
                          onChange={(e) => handleTastingChange(idx, 'wine_types', e.target.value.split(',').map(s => s.trim()))}
                          className="input input-bordered input-sm"
                          placeholder="Red, White, Rosé"
                          aria-label="Wine Types"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label text-xs font-bold uppercase text-gray-500">Max Guests</label>
                        <input
                          type="number" value={tasting.booking_info?.max_guests_per_slot || ''}
                          onChange={(e) => handleTastingChange(idx, 'booking_info.max_guests_per_slot', parseInt(e.target.value))}
                          className="input input-bordered input-sm"
                          placeholder="e.g. 8"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="form-control">
                        <label className="label text-xs font-bold uppercase text-gray-500">Special Features (e.g. Organic, Sustainable)</label>
                        <input
                          type="text" value={tasting.special_features?.join(', ') || ''}
                          onChange={(e) => handleTastingChange(idx, 'special_features', e.target.value.split(',').map(s => s.trim()))}
                          className="input input-bordered input-sm"
                          placeholder="Cave Tour, Great Views"
                          aria-label="Special Features"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label text-xs font-bold uppercase text-gray-500">AVA Region</label>
                        <input
                          type="text" value={tasting.ava}
                          onChange={(e) => handleTastingChange(idx, 'ava', e.target.value)}
                          className="input input-bordered input-sm"
                          placeholder="e.g. Rutherford"
                          aria-label="AVA Region"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-6 p-3 bg-white rounded-lg border border-gray-100">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-xs uppercase text-gray-500">
                        <input
                          type="checkbox" checked={tasting.tours?.available}
                          onChange={(e) => handleTastingChange(idx, 'tours.available', e.target.checked)}
                          className="checkbox checkbox-xs"
                        />
                        Tour Included?
                      </label>
                      {tasting.tours?.available && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase text-gray-500">Tour Price ($)</span>
                          <input
                            type="number" value={tasting.tours.tour_price}
                            onChange={(e) => handleTastingChange(idx, 'tours.tour_price', Number(e.target.value))}
                            className="input input-bordered input-xs w-20"
                            placeholder="0"
                            aria-label="Tour Price"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Controls - Right Side */}
          <div className="space-y-8">

            {/* 3. Payment Method (Business Control) */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-serif font-bold text-wine-primary mb-6 flex items-center gap-2">
                <FaCreditCard className="text-wine-secondary" />
                Payment & Billing
              </h2>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label font-bold text-gray-700">Payment Strategy</label>
                  <select
                    value={profile.payment_method?.type || 'pay_winery'}
                    onChange={(e) => handleInputChange('payment_method.type', e.target.value)}
                    className="select select-bordered w-full"
                    aria-label="Payment Strategy"
                  >
                    <option value="pay_stripe">In-App Payment (Pre-paid / Stripe)</option>
                    <option value="external_booking">External Booking Link</option>
                    <option value="pay_winery">Pay at Winery (Cash/Card on site)</option>
                  </select>
                </div>

                {profile.payment_method?.type === 'external_booking' && (
                  <div className="form-control">
                    <label className="label font-bold text-gray-700">Booking URL</label>
                    <div className="flex gap-2">
                      <span className="btn btn-ghost btn-sm btn-circle"><FaLink /></span>
                      <input
                        type="url" value={profile.payment_method?.external_booking_link}
                        onChange={(e) => handleInputChange('payment_method.external_booking_link', e.target.value)}
                        className="input input-bordered input-sm flex-grow"
                        placeholder="https://tock.com/your-winery"
                      />
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-500">
                  <p className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" />
                    Payments flow directly to your configuration.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. Special Features (Filtration & UX) */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-serif font-bold text-wine-primary mb-6 flex items-center gap-2">
                <FaPlus className="text-wine-secondary" />
                Special Features
              </h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl cursor-pointer">
                  <span className="font-semibold text-gray-700">Handicap Accessible</span>
                  <input
                    type="checkbox" checked={profile.amenities.handicap_accessible}
                    onChange={(e) => handleInputChange('amenities.handicap_accessible', e.target.checked)}
                    className="toggle toggle-primary"
                  />
                </label>
              </div>
            </section>


            {/* 5. Transportation (Directions & Booking) */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-serif font-bold text-wine-primary mb-6 flex items-center gap-2">
                <FaCar className="text-wine-secondary" />
                Transportation Access
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" className="w-8 h-4 object-contain grayscale" alt="Uber Logo" />
                    <span className="font-semibold text-gray-700">Uber Availability</span>
                  </div>
                  <input
                    type="checkbox" checked={profile.transportation.uber_availability}
                    onChange={(e) => handleInputChange('transportation.uber_availability', e.target.checked)}
                    className="toggle toggle-info"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/a0/Lyft_logo.svg/2560px-Lyft_logo.svg.png" className="w-8 h-4 object-contain grayscale" alt="Lyft Logo" />
                    <span className="font-semibold text-gray-700">Lyft Availability</span>
                  </div>
                  <input
                    type="checkbox" checked={profile.transportation.lyft_availability}
                    onChange={(e) => handleInputChange('transportation.lyft_availability', e.target.checked)}
                    className="toggle toggle-secondary"
                  />
                </div>
              </div>
            </section>

            {/* 6. Contact & Support */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FaPhoneAlt className="text-gray-400" />
                Public Contact
              </h2>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label text-xs font-bold uppercase text-gray-500">Phone</label>
                  <input
                    type="tel" value={profile.contact_info.phone}
                    onChange={(e) => handleInputChange('contact_info.phone', e.target.value)}
                    className="input input-bordered input-sm"
                    placeholder="+1 (707) 123-4567"
                    aria-label="Public Phone Number"
                  />
                </div>
                <div className="form-control">
                  <label className="label text-xs font-bold uppercase text-gray-500">Email</label>
                  <input
                    type="email" value={profile.contact_info.email}
                    onChange={(e) => handleInputChange('contact_info.email', e.target.value)}
                    className="input input-bordered input-sm"
                    placeholder="concierge@winery.com"
                    aria-label="Public Email Address"
                  />
                </div>
                <div className="form-control">
                  <label className="label text-xs font-bold uppercase text-gray-500">Website</label>
                  <input
                    type="url" value={profile.contact_info.website}
                    onChange={(e) => handleInputChange('contact_info.website', e.target.value)}
                    className="input input-bordered input-sm"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
