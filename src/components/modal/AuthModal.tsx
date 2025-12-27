"use client";
import { useState } from "react";
import { FaTiktok, FaInstagram, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuthStore } from "@/store/authStore";
import { SessionStorageService } from "@/lib/localstorage.config";

interface ModalProps {
  setShowPopup: React.Dispatch<React.SetStateAction<boolean>>;
  showLoginForm?: boolean;
}

const AuthModal = ({ setShowPopup, showLoginForm = false }: ModalProps) => {
  const [step, setStep] = useState<"age-verification" | "auth">("age-verification");
  const [isLoginMode, setIsLoginMode] = useState(showLoginForm);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    dateOfBirth: "",
    marketingConsent: false,
    smsConsent: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, error, loading: isSubmitting } = useAuthStore();
  const [ageError, setAgeError] = useState("");

  const handleGuestMode = () => {
    SessionStorageService.setConfig({ isGuest: true });
    setShowPopup(false);
  };

  const handleAgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dob = new Date(formData.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 21) {
      setAgeError("You must be 21 or older to enter.");
      return;
    }

    setAgeError("");
    setStep("auth");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoginMode) {
      const response = await login(formData.email, formData.password);
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
        marketingConsent: formData.marketingConsent,
        smsConsent: formData.smsConsent,
      });
      if (response.success) {
        setShowPopup(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl max-w-lg w-full relative max-h-[95vh] overflow-y-auto">

          {step === "age-verification" ? (
            // AGE VERIFICATION STEP
            <div className="text-center">
              <h2 className="md:text-2xl text-xl font-bold text-primary mb-4">Age Verification</h2>
              <p className="text-sm text-neutral mb-6">
                Please confirm your date of birth to continue. You must be 21 or older.
              </p>

              <form onSubmit={handleAgeSubmit} className="flex flex-col gap-4">
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="input input-bordered w-full text-neutral focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all py-2 px-4 rounded-xl shadow-md"
                />

                {ageError && <p className="text-red-600 text-sm font-semibold">{ageError}</p>}

                <button
                  type="submit"
                  className="btn btn-primary w-full rounded-xl font-semibold hover:bg-primary-focus transition-all active:scale-95 mt-2"
                >
                  Enter Site
                </button>
              </form>
            </div>
          ) : (
            // AUTH STEP (Login/Signup)
            <>
              <h2 className="text-center md:text-2xl text-xl font-bold text-primary mb-2">
                {isLoginMode ? "Login to Your Account" : "Join Napa Valley Wineries"}
              </h2>
              <p className="text-center text-sm text-neutral mb-4">
                {isLoginMode
                  ? "Enter your credentials to login"
                  : "Sign up to explore Napa Valley’s finest wineries or continue as a guest."}
              </p>

              <div className="flex gap-4 justify-center md:mb-6 mb-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline flex items-center gap-3 px-4 py-2 rounded-xl border-2 border-[#E4405F] text-[#E4405F] hover:border-[#E4405F] hover:bg-[#E4405F] hover:text-white transition-all transform active:scale-95"
                >
                  <FaInstagram size={24} />
                </a>

                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline flex items-center gap-3 px-4 py-2 rounded-xl border-2 border-[#000000] text-[#000000] hover:border-[#000000] hover:bg-[#000000] hover:text-white transition-all transform active:scale-95"
                >
                  <FaTiktok size={24} />
                </a>
              </div>

              {error && (!isLoginMode || (!error.toLowerCase().includes("firstname") && !error.toLowerCase().includes("lastname"))) && (
                <p className="text-red-600 text-sm text-center mb-2">{error}</p>
              )}

              <form className="flex flex-col space-y-3" onSubmit={handleSubmit}>
                {!isLoginMode && (
                  <>
                    <input
                      type="text"
                      placeholder="First Name"
                      name="firstName"
                      value={formData.firstName}
                      className="input input-bordered w-full text-neutral focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all py-2 px-3 rounded-xl shadow-md"
                      required
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      className="input input-bordered w-full text-neutral focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all py-2 px-3 rounded-xl shadow-md"
                      required
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                    <input
                      type="date"
                      placeholder="Date of Birth (MM/DD/YYYY)"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      className="input input-bordered w-full text-neutral focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all py-2 px-3 rounded-xl shadow-md"
                      required
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </>
                )}
                <input
                  type="email"
                  placeholder="Email Address"
                  className="input input-bordered w-full text-neutral focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all py-2 px-3 rounded-xl shadow-md"
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
                    className="input input-bordered w-full text-neutral focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all py-2 px-3 rounded-xl shadow-md"
                    required
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                )}
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    name="password"
                    className="input input-bordered w-full text-neutral focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all py-2 px-3 rounded-xl shadow-md"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <span
                    className="absolute right-4 top-2.5 cursor-pointer text-neutral"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </span>
                </div>

                {!isLoginMode && (
                  <div className="flex flex-col gap-2 mt-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.marketingConsent}
                        onChange={(e) => setFormData({ ...formData, marketingConsent: e.target.checked })}
                        className="checkbox checkbox-primary checkbox-sm rounded-md"
                      />
                      <span className="text-xs text-neutral group-hover:text-primary transition-colors">
                        I agree to receive email notifications and promotional offers.
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.smsConsent}
                        onChange={(e) => setFormData({ ...formData, smsConsent: e.target.checked })}
                        className="checkbox checkbox-primary checkbox-sm rounded-md"
                      />
                      <span className="text-xs text-neutral group-hover:text-primary transition-colors">
                        I agree to receive SMS/text alerts about my bookings.
                        <br /><span className="text-[10px] opacity-70">Reply STOP to unsubscribe at any time. Msg & data rates may apply.</span>
                      </span>
                    </label>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleGuestMode}
                    className="btn btn-outline w-full sm:w-auto rounded-xl font-semibold hover:bg-base-400 transition-all active:scale-95 py-2 min-h-0 h-auto text-sm"
                  >
                    Continue as Guest
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary w-full sm:w-auto rounded-xl font-semibold hover:bg-primary-focus transition-all active:scale-95 flex items-center justify-center gap-2 py-2 min-h-0 h-auto text-sm"
                  >
                    {isSubmitting && <span className="loading loading-spinner loading-xs"></span>}
                    {isLoginMode ? "Login" : "Create Account"}
                  </button>
                </div>
              </form>

              <p className="text-center mt-4 text-sm">
                {isLoginMode ? "Don't have an account?" : "Already have an account?"}
                <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-primary ml-2 font-semibold">
                  {isLoginMode ? "Sign Up" : "Login"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
