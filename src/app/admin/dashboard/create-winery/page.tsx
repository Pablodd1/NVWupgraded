"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";
import { FaWineGlass, FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe } from "react-icons/fa";

export default function CreateWineryAccount() {
  const { user, loading, fetchUser } = useAuthStore();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    // User account details
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    
    // Winery details
    wineryName: "",
    wineryAddress: "",
    wineryLat: "",
    wineryLong: "",
    wineryPhone: "",
    wineryEmail: "",
    wineryWebsite: "",
    wineryDescription: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      fetchUser();
    }
  }, [loading, user, fetchUser]);

  useEffect(() => {
    if (!loading && user && user.role !== "admin") {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error("Please fill in all required user fields (First Name, Last Name, Email, Password)");
      return false;
    }

    if (!formData.phone) {
      toast.error("Phone number is required");
      return false;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    if (!formData.wineryName || !formData.wineryAddress) {
      toast.error("Please fill in winery name and address");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/create-winery-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Winery account created successfully!");
        
        // Show credentials to admin
        alert(`Account Created!\n\nEmail: ${formData.email}\nPassword: ${formData.password}\n\nPlease share these credentials with the winery owner.`);
        
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          phone: "",
          wineryName: "",
          wineryAddress: "",
          wineryLat: "",
          wineryLong: "",
          wineryPhone: "",
          wineryEmail: "",
          wineryWebsite: "",
          wineryDescription: "",
        });
        
        // Redirect to users page
        router.push("/admin/dashboard/users");
      } else {
        const error = await response.json();
        const errMsg = error.message || "Failed to create winery account";
        console.error("Server Error:", errMsg);
        setErrorMessage(errMsg);
        toast.error(errMsg);
      }
    } catch (error: any) {
      console.error("Failed to create winery account:", error);
      const errMsg = `Network Error: ${error.message || "Unknown error"}`;
      setErrorMessage(errMsg);
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20 pb-20 md:pb-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Winery Account</h1>
            <p className="mt-2 text-gray-600">Set up a new winery owner account</p>
          </div>
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="btn btn-ghost btn-sm"
          >
            ← Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Owner Account Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FaUser className="text-2xl text-blue-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Owner Account Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="John"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Smith"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="owner@winery.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Min 6 characters"
                  minLength={6}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Re-enter password"
                  minLength={6}
                  required
                />
              </div>
            </div>
          </div>

          {/* Winery Details Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FaWineGlass className="text-2xl text-purple-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Winery Details</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Winery Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.wineryName}
                  onChange={(e) => handleInputChange('wineryName', e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Napa Valley Wines"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.wineryDescription}
                  onChange={(e) => handleInputChange('wineryDescription', e.target.value)}
                  className="textarea textarea-bordered w-full h-32"
                  placeholder="Describe the winery, its history, and specialties..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaMapMarkerAlt className="inline mr-2" />
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.wineryAddress}
                    onChange={(e) => handleInputChange('wineryAddress', e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="123 Vineyard Lane, Napa, CA 94558"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude (optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.wineryLat}
                    onChange={(e) => handleInputChange('wineryLat', e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="38.5025"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude (optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.wineryLong}
                    onChange={(e) => handleInputChange('wineryLong', e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="-122.2654"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaPhone className="inline mr-2" />
                    Winery Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.wineryPhone}
                    onChange={(e) => handleInputChange('wineryPhone', e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="+1 (555) 987-6543"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaEnvelope className="inline mr-2" />
                    Winery Email
                  </label>
                  <input
                    type="email"
                    value={formData.wineryEmail}
                    onChange={(e) => handleInputChange('wineryEmail', e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="info@winery.com"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaGlobe className="inline mr-2" />
                    Website
                  </label>
                  <input
                    type="text"
                    value={formData.wineryWebsite}
                    onChange={(e) => handleInputChange('wineryWebsite', e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="winery.com or www.winery.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter domain (e.g., winery.com, www.winery.com)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push("/admin/dashboard")}
              className="btn btn-ghost"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  <FaWineGlass className="mr-2" />
                  Create Winery Account
                </>
              )}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Important Notes:</h3>
          <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
            <li>The winery owner will receive login credentials to manage their winery</li>
            <li>They can update winery details, manage inventory, and handle bookings</li>
            <li>Make sure to securely share the login credentials with the owner</li>
            <li>The owner can change their password after first login</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
