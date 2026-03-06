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
  FaTimesCircle,
  FaWineBottle,
  FaImage,
  FaUserAlt
} from "react-icons/fa";
import { Winery, TastingInfo, FoodPairingOption } from "@/app/interfaces";
import Select from "react-select";
import { wineTypes, specialFeatures, avaOrder } from "@/data/data";
import { APIProvider } from "@vis.gl/react-google-maps";
import { AddressAutocomplete } from "@/components/common/AddressAutocomplete";

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
          if (!winery.images) winery.images = [];
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

  const handleImageUpload = async (file: File, tastingIndex?: number) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.url;

        setProfile(prev => {
          if (!prev) return prev;
          const newProfile = { ...prev };

          if (tastingIndex !== undefined) {
            // Tasting-specific image
            const newTastings = [...newProfile.tasting_info];
            if (!newTastings[tastingIndex].images) newTastings[tastingIndex].images = [];
            newTastings[tastingIndex].images.push(imageUrl);
            newProfile.tasting_info = newTastings;
          } else {
            // Main winery image
            if (!newProfile.images) newProfile.images = [];
            newProfile.images.push(imageUrl);
          }

          return newProfile;
        });

        toast.success('Image uploaded successfully!');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Error uploading image');
    }
  };

  const removeImage = (imageIndex: number, tastingIndex?: number) => {
    setProfile(prev => {
      if (!prev) return prev;
      const newProfile = { ...prev };

      if (tastingIndex !== undefined) {
        // Tasting-specific image
        const newTastings = [...newProfile.tasting_info];
        newTastings[tastingIndex].images.splice(imageIndex, 1);
        newProfile.tasting_info = newTastings;
      } else {
        // Main winery image
        if (newProfile.images) {
          newProfile.images.splice(imageIndex, 1);
        }
      }

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

  const toggleTastingArrayItem = (index: number, field: 'special_features' | 'wine_types', item: string) => {
    setProfile(prev => {
      if (!prev) return prev;
      const newProfile = JSON.parse(JSON.stringify(prev));
      const tasting = newProfile.tasting_info[index];
      const arr = tasting[field] || [];
      const idx = arr.indexOf(item);

      if (idx > -1) {
        arr.splice(idx, 1);
      } else {
        arr.push(item);
      }

      tasting[field] = arr;

      // Special handling: if Handicap Accessible is toggled in special_features, sync with amenities
      if (item === "Handicap Accessible") {
        newProfile.amenities.handicap_accessible = arr.includes("Handicap Accessible");
      }

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
      base_booking_fee: 0,
      additional_guest_fee: 0,
      free_guests_included: 0,
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
        max_guests_per_slot: 8,
        number_of_people: [],
        dynamic_pricing: { enabled: false, weekend_multiplier: 1.0 },
        available_slots: [],
        allow_excess_guests: false,
        excess_guest_multiplier: 1.5
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
                  <label htmlFor="wineryName" className="label font-bold text-gray-700">Winery Display Name</label>
                  <input
                    id="wineryName"
                    type="text" value={profile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="input input-bordered w-full focus:border-wine-primary"
                    placeholder="e.g. Napa Estate"
                  />
                </div>
                <div className="form-control">
                  <label htmlFor="wineryDescription" className="label font-bold text-gray-700">Official Description (for AI Search & Results)</label>
                  <textarea
                    id="wineryDescription"
                    value={profile.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="textarea textarea-bordered h-32 focus:border-wine-primary"
                    placeholder="Tell guests about your winery's unique experience..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label font-bold text-gray-700">Address</label>
                    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
                      <AddressAutocomplete
                        value={profile.location.address}
                        onChange={(address, lat, lng) => {
                          handleInputChange('location.address', address);
                          if (lat !== undefined) handleInputChange('location.latitude', lat);
                          if (lng !== undefined) handleInputChange('location.longitude', lng);
                        }}
                        className="input input-bordered focus:border-wine-primary"
                        placeholder="123 Wine Way, St. Helena, CA"
                      />
                    </APIProvider>
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

                {/* New Amenities Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-gray-50 p-4 rounded-xl">
                  <label className="label cursor-pointer flex gap-3">
                    <input
                      type="checkbox" checked={profile.amenities?.allows_children}
                      onChange={(e) => handleInputChange('amenities.allows_children', e.target.checked)}
                      className="checkbox checkbox-primary"
                    />
                    <span className="label-text font-bold text-gray-700">Allows Children</span>
                  </label>
                  <label className="label cursor-pointer flex gap-3">
                    <input
                      type="checkbox" checked={profile.amenities?.allows_non_drinkers}
                      onChange={(e) => handleInputChange('amenities.allows_non_drinkers', e.target.checked)}
                      className="checkbox checkbox-primary"
                    />
                    <span className="label-text font-bold text-gray-700">Non-Drinker Friendly</span>
                  </label>
                </div>

                {/* Featured Status (Admin Only Mock) */}
                {user?.role === 'admin' && (
                  <div className="mt-4 p-4 border-2 border-primary/20 rounded-xl bg-primary/5">
                    <label className="label cursor-pointer flex justify-between">
                      <span className="label-text font-black text-primary uppercase">Feature this Winery (Paid Status)</span>
                      <input
                        type="checkbox" checked={profile.is_featured}
                        onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                        className="toggle toggle-primary"
                      />
                    </label>
                  </div>
                )}
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

                {/* Main Winery Images */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <label className="label font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <FaImage className="text-wine-secondary" />
                    Main Winery Photos (Landing Page)
                  </label>

                  {/* Image Preview Grid */}
                  {profile.images && profile.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                      {profile.images.map((img, imgIdx) => (
                        <div key={imgIdx} className="relative group aspect-video">
                          <img
                            src={img}
                            alt={`Winery ${imgIdx + 1}`}
                            className="w-full h-full object-cover rounded-xl border border-gray-100 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(imgIdx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      id="main-image-upload"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                    <label
                      htmlFor="main-image-upload"
                      className="btn btn-outline btn-primary gap-2"
                    >
                      <FaPlus size={14} />
                      Upload Winery Photo
                    </label>
                    <p className="text-sm text-gray-500 italic">These images will show up on your public profile landing page.</p>
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                      <div className="form-control">
                        <label className="label text-xs font-bold uppercase text-gray-500">Free Guests Included</label>
                        <input
                          type="number" value={tasting.free_guests_included || 0}
                          onChange={(e) => handleTastingChange(idx, 'free_guests_included', Number(e.target.value))}
                          className="input input-bordered input-sm"
                          placeholder="0"
                          title="Guests included in base fee"
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="form-control">
                        <label className="label text-xs font-bold uppercase text-gray-500">Child Price ($)</label>
                        <input
                          type="number" value={tasting.child_price || 0}
                          onChange={(e) => handleTastingChange(idx, 'child_price', Number(e.target.value))}
                          className="input input-bordered input-sm"
                          placeholder="Default 0"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label text-xs font-bold uppercase text-gray-500">Non-Drinker Price ($)</label>
                        <input
                          type="number" value={tasting.non_drinker_price || 0}
                          onChange={(e) => handleTastingChange(idx, 'non_drinker_price', Number(e.target.value))}
                          className="input input-bordered input-sm"
                          placeholder="Default 0"
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
                      <div className="form-control col-span-2">
                        <label className="label text-xs font-bold uppercase text-gray-500">Wine Types</label>
                        <div className="flex flex-wrap gap-4 p-3 bg-white rounded-lg border border-gray-100">
                          {wineTypes.map(type => (
                            <label key={type} className="flex items-center gap-2 cursor-pointer text-sm">
                              <input
                                type="checkbox"
                                checked={tasting.wine_types?.includes(type)}
                                onChange={() => toggleTastingArrayItem(idx, 'wine_types', type)}
                                className="checkbox checkbox-primary checkbox-sm"
                              />
                              {type}
                            </label>
                          ))}
                        </div>
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
                      <div className="form-control">
                        <label className="label text-xs font-bold uppercase text-gray-500 flex justify-between">
                          <span>Allow Excess?</span>
                          <input
                            type="checkbox" checked={tasting.booking_info?.allow_excess_guests || false}
                            onChange={(e) => handleTastingChange(idx, 'booking_info.allow_excess_guests', e.target.checked)}
                            className="checkbox checkbox-xs"
                          />
                        </label>
                        {tasting.booking_info?.allow_excess_guests && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-bold text-gray-400">MULTIPLIER (X)</span>
                            <input
                              type="number" step="0.1" value={tasting.booking_info?.excess_guest_multiplier || 1.5}
                              onChange={(e) => handleTastingChange(idx, 'booking_info.excess_guest_multiplier', parseFloat(e.target.value))}
                              className="input input-bordered input-xs w-16"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="form-control col-span-2">
                        <label className="label text-xs font-bold uppercase text-gray-500">Special Features (Filtration Tags)</label>
                        <div className="flex flex-wrap gap-4 p-3 bg-white rounded-lg border border-gray-100">
                          {specialFeatures.map(feature => (
                            <label key={feature} className="flex items-center gap-2 cursor-pointer text-sm">
                              <input
                                type="checkbox"
                                checked={tasting.special_features?.includes(feature)}
                                onChange={() => toggleTastingArrayItem(idx, 'special_features', feature)}
                                className="checkbox checkbox-primary checkbox-sm"
                              />
                              {feature}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="form-control">
                        <label className="label text-xs font-bold uppercase text-gray-500">AVA Region</label>
                        <Select
                          options={avaOrder.map(ava => ({ value: ava, label: ava }))}
                          value={tasting.ava ? { value: tasting.ava, label: tasting.ava } : null}
                          onChange={(option: any) => handleTastingChange(idx, 'ava', option?.value || '')}
                          className="text-sm"
                          placeholder="Select AVA..."
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg border border-gray-100 mb-4">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-xs uppercase text-gray-500">
                          <input
                            type="checkbox" checked={tasting.tours?.available}
                            onChange={(e) => handleTastingChange(idx, 'tours.available', e.target.checked)}
                            className="checkbox checkbox-xs"
                          />
                          Tours Available?
                        </label>
                        {tasting.tours?.available && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Default Tour Price ($)</span>
                            <input
                              type="number" value={tasting.tours.tour_price}
                              onChange={(e) => handleTastingChange(idx, 'tours.tour_price', Number(e.target.value))}
                              className="input input-bordered input-xs w-16"
                              placeholder="0"
                            />
                          </div>
                        )}
                      </div>

                      {tasting.tours?.available && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Specific Tour Options</p>
                          {(tasting.tours.tour_options || []).map((tour, tIdx) => (
                            <div key={tIdx} className="flex gap-2 items-center">
                              <input
                                type="text" value={tour.description}
                                onChange={(e) => {
                                  const newOptions = [...tasting.tours.tour_options];
                                  newOptions[tIdx].description = e.target.value;
                                  handleTastingChange(idx, 'tours.tour_options', newOptions);
                                }}
                                className="input input-bordered input-xs flex-grow"
                                placeholder="Tour name..."
                              />
                              <input
                                type="number" value={tour.cost}
                                onChange={(e) => {
                                  const newOptions = [...tasting.tours.tour_options];
                                  newOptions[tIdx].cost = Number(e.target.value);
                                  handleTastingChange(idx, 'tours.tour_options', newOptions);
                                }}
                                className="input input-bordered input-xs w-16"
                                placeholder="$"
                              />
                              <button
                                onClick={() => {
                                  const newOptions = tasting.tours.tour_options.filter((_, i) => i !== tIdx);
                                  handleTastingChange(idx, 'tours.tour_options', newOptions);
                                }}
                                className="text-red-500 p-1"
                              ><FaTrash size={10} /></button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newOptions = [...(tasting.tours.tour_options || []), { description: "", cost: 0 }];
                              handleTastingChange(idx, 'tours.tour_options', newOptions);
                            }}
                            className="btn btn-xs btn-ghost gap-1 text-[10px]"
                          ><FaPlus /> Add Tour Option</button>
                        </div>
                      )}
                    </div>

                    {/* Food Pairings Manager */}
                    <div className="bg-white p-4 rounded-lg border border-gray-100 mb-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                        <FaWineBottle /> Food Pairing Options (Per Person)
                      </p>
                      <div className="space-y-2">
                        {(tasting.food_pairing_options || []).map((pairing, fIdx) => (
                          <div key={fIdx} className="flex gap-2 items-center">
                            <input
                              type="text" value={pairing.name}
                              onChange={(e) => {
                                const newOptions = [...tasting.food_pairing_options];
                                newOptions[fIdx].name = e.target.value;
                                handleTastingChange(idx, 'food_pairing_options', newOptions);
                              }}
                              className="input input-bordered input-xs flex-grow"
                              placeholder="Pairing name..."
                            />
                            <input
                              type="number" value={pairing.price}
                              onChange={(e) => {
                                const newOptions = [...tasting.food_pairing_options];
                                newOptions[fIdx].price = Number(e.target.value);
                                handleTastingChange(idx, 'food_pairing_options', newOptions);
                              }}
                              className="input input-bordered input-xs w-16"
                              placeholder="$"
                            />
                            <button
                              onClick={() => {
                                const newOptions = tasting.food_pairing_options.filter((_, i) => i !== fIdx);
                                handleTastingChange(idx, 'food_pairing_options', newOptions);
                              }}
                              className="text-red-500 p-1"
                            ><FaTrash size={10} /></button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newOptions = [...(tasting.food_pairing_options || []), { id: Math.random().toString(36).substr(2, 9), name: "", price: 0 }];
                            handleTastingChange(idx, 'food_pairing_options', newOptions);
                          }}
                          className="btn btn-xs btn-ghost gap-1 text-[10px]"
                        ><FaPlus /> Add Food Pairing</button>
                      </div>
                    </div>

                    {/* Other Features Manager */}
                    <div className="bg-white p-4 rounded-lg border border-gray-100 mb-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                        <FaPlus /> Other Features / Add-ons (Per Person)
                      </p>
                      <div className="space-y-2">
                        {(tasting.other_features || []).map((feature, oIdx) => (
                          <div key={oIdx} className="flex gap-2 items-center">
                            <input
                              type="text" value={feature.description}
                              onChange={(e) => {
                                const newOptions = [...tasting.other_features];
                                newOptions[oIdx].description = e.target.value;
                                handleTastingChange(idx, 'other_features', newOptions);
                              }}
                              className="input input-bordered input-xs flex-grow"
                              placeholder="Feature name..."
                            />
                            <input
                              type="number" value={feature.cost}
                              onChange={(e) => {
                                const newOptions = [...tasting.other_features];
                                newOptions[oIdx].cost = Number(e.target.value);
                                handleTastingChange(idx, 'other_features', newOptions);
                              }}
                              className="input input-bordered input-xs w-16"
                              placeholder="$"
                            />
                            <button
                              onClick={() => {
                                const newOptions = tasting.other_features.filter((_, i) => i !== oIdx);
                                handleTastingChange(idx, 'other_features', newOptions);
                              }}
                              className="text-red-500 p-1"
                            ><FaTrash size={10} /></button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newOptions = [...(tasting.other_features || []), { description: "", cost: 0, feature_id: Math.random().toString(36).substr(2, 9) }];
                            handleTastingChange(idx, 'other_features', newOptions);
                          }}
                          className="btn btn-xs btn-ghost gap-1 text-[10px]"
                        ><FaPlus /> Add Feature</button>
                      </div>
                    </div>

                    {/* Image Upload Section */}
                    <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                      <label className="label text-xs font-bold uppercase text-gray-500 mb-2">
                        <FaImage className="inline mr-2" />
                        Tasting Experience Images
                      </label>

                      {/* Image Preview Grid */}
                      {tasting.images && tasting.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          {tasting.images.map((img, imgIdx) => (
                            <div key={imgIdx} className="relative group">
                              <img
                                src={img}
                                alt={`Tasting ${idx + 1} - Image ${imgIdx + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(imgIdx, idx)}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Remove image"
                              >
                                <FaTrash size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload Button */}
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          id={`image-upload-${idx}`}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, idx);
                          }}
                        />
                        <label
                          htmlFor={`image-upload-${idx}`}
                          className="btn btn-sm btn-outline gap-2 cursor-pointer"
                        >
                          <FaPlus size={12} />
                          Add Image
                        </label>
                        <span className="text-xs text-gray-500">
                          {tasting.images?.length || 0} image(s)
                        </span>
                      </div>
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
                    placeholder="anabel@nvw.wine"
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

            {/* 7. Account Settings */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8">
              <h2 className="text-xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FaUserAlt className="text-gray-400" />
                Account & Security
              </h2>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Manage your login credentials, name, and phone number securely.
                </p>
                <button
                  onClick={() => router.push('/profile')}
                  className="w-full btn btn-outline btn-primary mt-4"
                >
                  Manage Profile & Password
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
