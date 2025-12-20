"use client";
import { useState } from "react";
import { FaTiktok, FaInstagram, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuthStore } from "@/store/authStore";
import { SessionStorageService } from "@/lib/localstorage.config";

interface ModalProps {
  setShowPopup: React.Dispatch<React.SetStateAction<boolean>>;
  showLoginForm?: Boolean;
}

const AuthModal = ({ setShowPopup, showLoginForm = false }: ModalProps) => {
  const [isLoginMode, setIsLoginMode] = useState(showLoginForm);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", password: "", phone: "", dateOfBirth: "" });
  const [showPassword, setShowPassword] = useState(false); // For toggling password visibility
  const { login, register, error, user } = useAuthStore();

  const handleGuestMode = () => {
    SessionStorageService.setConfig({ isGuest: true });
    setShowPopup(false);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (isLoginMode) {
      const response = await login(formData.email, formData.password);
      console.log("User logged in:", user);
      if (response.success) {
        setShowPopup(false);
      }
    } else {
      const response = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
      });
      if (response.success) {
        setShowPopup(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-xl max-w-lg w-full relative max-h-[95vh] overflow-y-auto">
          <h2 className="text-center md:text-2xl text-xl font-bold text-primary mb-4">
            {isLoginMode ? "Login to Your Account" : "Join Napa Valley Wineries"}
          </h2>
          <p className="text-center text-sm text-neutral mb-6">
            {isLoginMode
              ? "Enter your credentials to login"
              : "Sign up to explore Napa Valley’s finest wineries or continue as a guest."}
          </p>

          <div className="flex gap-4 justify-center md:mb-8 mb-4">
            <button className="btn btn-outline flex items-center gap-3 px-4 py-2 rounded-xl border-2 border-[#E4405F] text-[#E4405F] hover:border-[#E4405F] hover:bg-[#E4405F] hover:text-white focus:outline-none focus:border-[#E4405F] focus:ring-2 focus:ring-[#E4405F] transition-all transform active:scale-95">
              <FaInstagram size={25} />
            </button>

            <button className="btn btn-outline flex items-center gap-3 px-4 py-2 rounded-xl border-2 border-[#000000] text-[#000000] hover:border-[#000000] hover:bg-[#000000] hover:text-white focus:outline-none focus:border-[#000000] focus:ring-2 focus:ring-[#000000] transition-all transform active:scale-95">
              <FaTiktok size={25} />
            </button>
          </div>

          {error && <p className="text-red-600 text-sm text-center mb-2">All fields are required: firstName, lastName, email, phone, password</p>}

          <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
            {!isLoginMode && (
              <>
                <input
                  type="text"
                  placeholder="First Name"
                  name="firstName"
                  value={formData.firstName}
                  className="input input-bordered w-full text-neutral focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all py-3 px-4 rounded-xl shadow-md"
                  required
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  className="input input-bordered w-full text-neutral focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all py-3 px-4 rounded-xl shadow-md"
                  required
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
                <input
                  type="date"
                  placeholder="Date of Birth (MM/DD/YYYY)"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  className="input input-bordered w-full text-neutral focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all py-3 px-4 rounded-xl shadow-md"
                  required
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
                <div className="text-xs text-gray-600">
                  You must be 21 or older to book wine tastings and alcohol-related services.
                </div>
              </>
            )}
            <input
              type="email"
              placeholder="Email Address"
              className="input input-bordered w-full text-neutral focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all py-3 px-4 rounded-xl shadow-md"
              required
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {!isLoginMode && (
              <input
                type="tel"
                placeholder="Phone Number"
                name="phone"
                value={formData.phone}
                className="input input-bordered w-full text-neutral focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all py-3 px-4 rounded-xl shadow-md"
                required
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            )}
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"} // Toggle between text and password
                placeholder="Password"
                name="password"
                className="input input-bordered w-full text-neutral focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all py-3 px-4 rounded-xl shadow-md"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <span
                className="absolute right-4 top-3 cursor-pointer text-neutral"
                onClick={() => setShowPassword(!showPassword)} // Toggle visibility
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-10">
              <button
                type="button"
                onClick={handleGuestMode}
                className="btn btn-outline w-full sm:w-auto rounded-xl font-semibold hover:bg-base-400 transition-all active:scale-95"
              >
                Continue as Guest
              </button>
              <button
                type="submit"
                className="btn btn-primary w-full sm:w-auto rounded-xl font-semibold hover:bg-primary-focus transition-all active:scale-95"
              >
                {isLoginMode ? "Login" : "Create Account"}
              </button>
            </div>
          </form>

          <p className="text-center mt-4">
            {isLoginMode ? "Don't have an account?" : "Already have an account?"}
            <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-primary ml-2 font-semibold">
              {isLoginMode ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
