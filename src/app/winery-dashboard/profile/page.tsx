"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";

interface WineryProfile {
  _id: string;
  name: string;
  location: {
    address: string;
    lat: number;
    long: number;
  };
  contact_info: {
    phone: string;
    email: string;
    website: string;
  };
  description: string;
  opening_hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
}

export default function WineryProfile() {
  const { user, loading, fetchUser } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<WineryProfile | null>(null);
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
          setProfile(data.winery);
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

  const handleInputChange = (field: string, value: any) => {
    setProfile(prev => {
      if (!prev) return prev;
      
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof WineryProfile] as any),
            [child]: value
          }
        };
      }
      
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const response = await fetch("/api/winery-dashboard/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
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
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">No winery profile found. Please contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20 pb-20 md:pb-4">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Winery Profile</h1>
            <p className="mt-2 text-gray-600">Update your winery information</p>
          </div>
          <button
            onClick={() => router.push("/winery-dashboard")}
            className="btn btn-ghost btn-sm"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Winery Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Enter winery name"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={profile.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="textarea textarea-bordered w-full h-32"
                  placeholder="Describe your winery..."
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={profile.location.address}
                  onChange={(e) => handleInputChange('location.address', e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Enter address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={profile.location.lat}
                  onChange={(e) => handleInputChange('location.lat', parseFloat(e.target.value))}
                  className="input input-bordered w-full"
                  placeholder="Latitude"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={profile.location.long}
                  onChange={(e) => handleInputChange('location.long', parseFloat(e.target.value))}
                  className="input input-bordered w-full"
                  placeholder="Longitude"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={profile.contact_info.phone}
                  onChange={(e) => handleInputChange('contact_info.phone', e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.contact_info.email}
                  onChange={(e) => handleInputChange('contact_info.email', e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={profile.contact_info.website}
                  onChange={(e) => handleInputChange('contact_info.website', e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Website URL"
                />
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Opening Hours</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                <div key={day}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {day}
                  </label>
                  <input
                    type="text"
                    value={profile.opening_hours?.[day as keyof typeof profile.opening_hours] || ''}
                    onChange={(e) => handleInputChange(`opening_hours.${day}`, e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="e.g., 10:00 AM - 6:00 PM"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
