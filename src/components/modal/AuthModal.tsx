"use client";
import { useState } from "react";
import { FaInstagram, FaEye, FaEyeSlash, FaWineBottle, FaFacebook } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { SessionStorageService } from "@/lib/localstorage.config";
import { toast } from "react-toastify";
import { useLanguage } from "@/context/LanguageContext";

interface ModalProps {
  setShowPopup: React.Dispatch<React.SetStateAction<boolean>>;
  showLoginForm?: boolean;
}

const AuthModal = ({ setShowPopup, showLoginForm = false }: ModalProps) => {
  const { t } = useLanguage();
  const router = useRouter();
  const [isLoginMode, setIsLoginMode] = useState(showLoginForm);
  const [isWineryRegistration, setIsWineryRegistration] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    dateOfBirth: "",
    marketingConsent: false,
    smsConsent: false,
    isWineryOwner: false, // hidden flag or just assume user signup
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, error, loading: isSubmitting } = useAuthStore();

  const handleGuestMode = () => {
    SessionStorageService.setConfig({ isGuest: true });
    setShowPopup(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isWineryRegistration) {
      const response = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'winery',
        marketingConsent: formData.marketingConsent,
        smsConsent: formData.smsConsent,
      });
      if (response.success) {
        toast.success("Welcome aboard! Your winery account has been created.");
        setShowPopup(false);
        router.push("/winery-dashboard");
      }
      return;
    }

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
        role: 'customer',
        marketingConsent: formData.marketingConsent,
        smsConsent: formData.smsConsent,
      });
      if (response.success) {
        setShowPopup(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] overflow-y-auto flex items-center justify-center p-2 sm:p-4">
      <div className="min-h-full sm:min-h-0 w-full flex items-center justify-center">
        <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full relative sm:max-h-[90vh] overflow-y-auto border border-gray-100">

          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <FaWineBottle className="text-primary text-2xl" />
            </div>
          </div>

          <h2 className="text-center md:text-3xl text-2xl font-black text-gray-900 mb-2 tracking-tight">
            {isWineryRegistration ? t("auth_partner_portal") : (isLoginMode ? t("auth_unlock_cellar") : t("auth_join_club"))}
          </h2>
          <p className="text-center text-sm text-gray-500 mb-6 font-medium">
            {isWineryRegistration
              ? t("auth_register_vineyard")
              : (isLoginMode
                ? t("auth_welcome_back")
                : t("auth_create_profile"))}
          </p>

          <div className="flex gap-4 justify-center mb-6">
            <a
              href="https://www.instagram.com/winesnvw/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline border-gray-200 bg-gradient-to-br from-purple-600 to-pink-500 text-white border-transparent hover:scale-105 transition-all"
            >
              <FaInstagram size={20} />
            </a>


          </div>

          {error && (!isLoginMode || (!error.toLowerCase().includes("firstname") && !error.toLowerCase().includes("lastname"))) && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center mb-4 font-semibold border border-red-100">
              {error}
            </div>
          )}

          <form className="flex flex-col space-y-3" onSubmit={handleSubmit}>
            {!isLoginMode && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder={isWineryRegistration ? t("auth_is_winery_owner") : t("auth_first_name")}
                    name="firstName"
                    value={formData.firstName}
                    className="input input-bordered w-full bg-gray-50 focus:bg-white transition-all rounded-xl"
                    required
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder={isWineryRegistration ? t("auth_last_name") : t("auth_last_name")}
                    name="lastName"
                    value={formData.lastName}
                    className="input input-bordered w-full bg-gray-50 focus:bg-white transition-all rounded-xl"
                    required
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
                {!isWineryRegistration && (
                  <input
                    type="date"
                    placeholder="Date of Birth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    className="input input-bordered w-full bg-gray-50 focus:bg-white transition-all rounded-xl"
                    required
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                )}
              </>
            )}
            <input
              type="email"
              placeholder={t("auth_email")}
              className="input input-bordered w-full bg-gray-50 focus:bg-white transition-all rounded-xl"
              required
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {(!isLoginMode || isWineryRegistration) && (
              <input
                type="tel"
                placeholder={isWineryRegistration ? t("auth_phone") : t("auth_phone")}
                name="phone"
                value={formData.phone}
                className="input input-bordered w-full bg-gray-50 focus:bg-white transition-all rounded-xl"
                required
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            )}
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t("auth_password")}
                name="password"
                className="input input-bordered w-full bg-gray-50 focus:bg-white transition-all rounded-xl"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <span
                className="absolute right-4 top-3.5 cursor-pointer text-gray-400 hover:text-primary transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </span>
            </div>
            {isLoginMode && (
              <div className="text-right">
                <a href="/forgot-password" className="text-xs text-gray-500 hover:text-[#6B1E23] transition-colors">
                  {t("auth_forgot_password")}
                </a>
              </div>
            )}

            {!isLoginMode && (
              <div className="flex flex-col gap-3 mt-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.marketingConsent}
                    onChange={(e) => setFormData({ ...formData, marketingConsent: e.target.checked })}
                    className="checkbox checkbox-primary checkbox-sm rounded-md mt-0.5"
                  />
                  <span className="text-xs text-gray-600 group-hover:text-primary transition-colors">
                    {t("auth_marketing_consent")}
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.smsConsent}
                    onChange={(e) => setFormData({ ...formData, smsConsent: e.target.checked })}
                    className="checkbox checkbox-primary checkbox-sm rounded-md mt-0.5"
                  />
                  <span className="text-xs text-gray-600 group-hover:text-primary transition-colors">
                    {t("auth_sms_consent")}
                    <br /><span className="text-[10px] opacity-70">{t("auth_sms_disclaimer")}</span>
                  </span>
                </label>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
              {!isWineryRegistration && (
                <button
                  type="button"
                  onClick={handleGuestMode}
                  className="btn btn-ghost w-full sm:w-auto rounded-xl font-bold text-gray-500 hover:bg-gray-100"
                >
                  {t("auth_just_browsing")}
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full sm:w-auto rounded-xl font-bold shadow-lg shadow-primary/30 flex-1"
              >
                {isSubmitting && <span className="loading loading-spinner loading-xs"></span>}
                {isWineryRegistration ? t("auth_request_access") : (isLoginMode ? t("auth_open_cellar") : t("auth_mint_membership"))}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {isLoginMode ? t("auth_new_to_valley") : t("auth_have_pass")}
              <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-primary ml-2 font-bold hover:underline">
                {isLoginMode ? t("auth_get_on_list") : t("auth_login_here")}
              </button>
            </p>

            {!isLoginMode && !isWineryRegistration && (
              <p className="mt-4 text-xs text-gray-400">
                {t("auth_is_winery_owner")} <a href="#" onClick={(e) => { e.preventDefault(); setIsWineryRegistration(true); setIsLoginMode(false); }} className="text-gray-600 underline">{t("auth_register_winery")}</a>
              </p>
            )}

            {isWineryRegistration && (
              <p className="mt-4 text-xs text-gray-400">
                {t("auth_not_winery")} <a href="#" onClick={(e) => { e.preventDefault(); setIsWineryRegistration(false); setIsLoginMode(true); }} className="text-gray-600 underline">{t("auth_back_to_login")}</a>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthModal;
