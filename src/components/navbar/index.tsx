"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FaUserAlt, FaSignOutAlt, FaHome, FaMapMarkerAlt, FaWineGlassAlt, FaMicrophone, FaHistory } from "react-icons/fa";
import { useItinerary } from "@/store/itinerary";
import Image from "next/image";
import AuthModal from "../modal/AuthModal";
import { MdExplore, MdOutlineSupportAgent, MdSupport } from "react-icons/md";
import { VoiceFilter } from "../filter-bar/voice-filter";
import { useAuthStore } from "@/store/authStore";
import { IUser } from "@/models/user.model";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { itinerary } = useItinerary();
  const { isAuthenticated, loading: isUserFetching, user, fetchUser, login, logout, register } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const { t, language, toggleLanguage } = useLanguage();

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      setIsProfileMenuOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const closeProfileMenu = () => {
    setIsProfileMenuOpen(false);
  };

  return (
    <header className="fixed w-full z-50 bg-transparent">
      <div className=" items-center bg-white bg-opacity-40 backdrop-blur-md rounded-b-xl shadow-md">
        <div className="md:hidden relative flex items-center justify-center">
          <Link href="/" className=" flex items-center py-1">
            <Image src="/logo.png" alt="Logo" width={18} height={10} />
            <div className="flex flex-col">
              <span className="text-2xl text-primary font-serif font-black leading-tight">NVW</span>
              <small className="font-serif text-secondary text-xs text-gray-500 leading-tight">Napa Valley Wineries</small>
            </div>
          </Link>

          <Link href="/support" className="absolute right-4 p-0 flex flex-col items-center">
            <MdOutlineSupportAgent className="text-primary hover:text-primary-focus transition-all" size={30} />
            <span className="text-xs font-semibold text-gray-800">{t('nav_support')}</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center ml-auto mr-auto w-full max-w-screen-xl justify-center px-6 py-1">
          <div className="flex items-center w-full justify-between max-w-screen-xl">
            <Link href="/" className="flex items-center space-x-3">
              <Image src="/logo.png" alt="Logo" width={25} height={25} />
              <div className="flex flex-col">
                <span className="text-4xl text-primary font-serif font-extrabold leading-tight">NVW</span>
                <small className="font-serif text-secondary text-sm text-gray-500 leading-tight">Napa Valley Winery</small>
              </div>
            </Link>

            <nav className="flex space-x-6">
              <NavbarLink href="/bookings" text={t('nav_bookings')} />
              <NavbarLink href="/support" text={t('nav_support')} />
              <NavbarLink href="#contact" text={t('nav_contact')} />
              {user?.role === "admin" && <NavbarLink href="/admin/dashboard" text={t('nav_admin')} />}
              {user?.role === "winery" && <NavbarLink href="/winery-dashboard" text="Winery Dashboard" />}
            </nav>

            <div className="flex items-center space-x-6">
              <button
                onClick={toggleLanguage}
                className="text-xs font-bold text-gray-600 hover:text-primary border border-gray-300 rounded px-2 py-1 transition-all"
              >
                {language === 'en' ? 'ES' : 'EN'}
              </button>

              <VoiceFilter />
              <ItineraryButton itineraryCount={itinerary.length} label={t('nav_itinerary')} />
              {user ? (
                <UserProfile user={user} handleLogout={handleLogout} loading={loading} t={t} />
              ) : (
                <button onClick={() => setShowModal(true)} className="text-gray-800 hover:text-primary text-sm font-semibold">
                  {t('sign_in')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav
        setShowModal={setShowModal}
        loading={loading}
        user={user}
        handleLogout={handleLogout}
        itineraryCount={itinerary.length}
        isProfileMenuOpen={isProfileMenuOpen}
        toggleProfileMenu={toggleProfileMenu}
        closeProfileMenu={closeProfileMenu}
        t={t}
      />

      {showModal && <AuthModal setShowPopup={setShowModal} />}
    </header>
  );
}

const NavbarLink = ({ href, text }: { href: string; text: string }) => (
  <Link href={href} className="text-gray-800 text-sm font-semibold hover:text-primary transition-all neumorphism-link">
    {text}
  </Link>
);

const ItineraryButton = ({ itineraryCount, label }: { itineraryCount: number; label?: string }) => (
  <div className="relative neumorphism-card p-2">
    <Link
      href="/itinerary"
      className="bg-primary text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-primary-focus transition-all duration-300"
    >
      <FaWineGlassAlt size={16} />
      <span className="text-sm">{label || "Itinerary"}</span>
      {itineraryCount > 0 && (
        <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
          {itineraryCount}
        </span>
      )}
    </Link>
  </div>
);

const UserProfile = ({ user, handleLogout, loading, t }: { user: IUser; handleLogout: () => void; loading: boolean; t: any }) => (
  <div className="relative flex items-center space-x-2 neumorphism-card p-3">
    <FaUserAlt size={28} className="text-gray-800 rounded-full" />
    <div className="flex flex-col">
      <span className="font-semibold text-sm text-gray-800">{`${user.firstName} ${user.lastName}`}</span>
      <button
        onClick={handleLogout}
        className="text-gray-600 hover:text-red-600 flex items-center space-x-1 text-xs"
        disabled={loading}
      >
        <FaSignOutAlt size={14} />
        <span>{loading ? "..." : t('sign_out')}</span>
      </button>
    </div>
  </div>
);

const MobileBottomNav = ({
  user,
  handleLogout,
  itineraryCount,
  isProfileMenuOpen,
  toggleProfileMenu,
  closeProfileMenu,
  loading = false,
  setShowModal,
  t
}: {
  user: any;
  handleLogout: () => void;
  itineraryCount: number;
  isProfileMenuOpen: boolean;
  toggleProfileMenu: () => void;
  closeProfileMenu: () => void;
  loading: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  t: any;
}) => (
  <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white to-gray-100 shadow-lg flex justify-center py-1 rounded-t-xl neumorphism-card z-18 border-t-2 border-basic">
    <div className="flex justify-between w-full items-center px-4">
      <NavLink icon={<FaHome size={20} />} href="/" label="Home" />
      <NavLink icon={<FaHistory size={20} />} href="/bookings" label="Bookings" />

      <VoiceFilter />

      <NavLink icon={<FaMapMarkerAlt size={20} />} href="/itinerary" label="Itinerary" badge={itineraryCount} />

      <div className="relative">
        <NavLink
          icon={<FaUserAlt size={20} />}
          href="#"
          label={user ? `${user.firstName} ${user.lastName}` : "Sign In"}
          onClick={() => {
            if (user) {
              toggleProfileMenu();
            } else {
              setShowModal(true);
            }
          }}
        />
      </div>
    </div>

    {isProfileMenuOpen && user && (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-40 z-30" onClick={closeProfileMenu}></div>

        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-6 rounded-t-xl transform transition-all duration-300 z-30 neumorphism-card">
          <div className="flex flex-col items-center space-y-4">
            <FaUserAlt size={50} className="text-gray-800 rounded-full" />
            <span className="font-semibold text-lg text-gray-800">{`${user.firstName} ${user.lastName}`}</span>
            {user.role === "admin" && (
              <Link href={"/admin/dashboard"} className="text-gray-600 text-sm font-semibold w-full text-center py-2">
                Admin Dashboard
              </Link>
            )}
            {user.role === "winery" && (
              <Link href={"/winery-dashboard"} className="text-gray-600 text-sm font-semibold w-full text-center py-2">
                Winery Dashboard
              </Link>
            )}
            <button onClick={handleLogout} className="text-red-600 text-sm font-semibold w-full text-center py-2">
              {loading ? "..." : t('sign_out')}
            </button>
          </div>
        </div>
      </>
    )}
  </div>
);

const NavLink = ({
  icon,
  href,
  label,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  href: string;
  label: string;
  badge?: number;
  onClick?: () => void;
}) => (
  <Link
    href={href}
    className="relative flex flex-col items-center text-gray-600 hover:text-gray-900 neumorphism-link p-1 transition-all"
    onClick={onClick}
  >
    {icon}
    <span className="text-xs font-semibold ">{label}</span>
    {badge
      ? badge > 0 && (
        <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-bounce">
          {badge}
        </span>
      )
      : ""}
  </Link>
);
