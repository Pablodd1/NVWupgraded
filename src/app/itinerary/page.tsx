"use client";
import { useEffect, useState } from "react";
import ItinerarySummary from "@/components/Itinerary-summary";
import { useItinerary, BookingData, ItineraryWinery } from "@/store/itinerary";
import AuthModal from "@/components/modal/AuthModal";
import { Car, Loader2, Wine } from "lucide-react";
import { Button } from "@/components/buttons/button";
import Modal from "@/components/modal";
import { useRouter, useSearchParams } from "next/navigation";
import WineryBookingCard from "@/components/cards/winery";
import axios from "axios";
import { isUser21OrOlder } from "@/lib/ageVerification";
import { useAuthStore } from "@/store/authStore";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";
import DateOfBirthModal from "@/components/modal/DateOfBirthModal";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export default function ItineraryPage() {
  const [isLottieLoaded, setIsLottieLoaded] = useState(false);
  const { itinerary, setItinerary } = useItinerary();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRideModal, setShowRideModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [showDateOfBirthModal, setShowDateOfBirthModal] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Listen for Stripe success or cancel
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      setShowRideModal(true);
      toast.success("Payment successful! Your itinerary is confirmed.");
      // The session creator already saved the booking to the DB
      // We just need to clear the local itinerary
      // We'll let the RideModal close handler do it, or do it here
    }

    const cancel = searchParams.get("cancel");
    if (cancel === "true") {
      toast.error("Payment cancelled. You can try booking again.");
    }
  }, [searchParams]);

  const handleUpdate = (id: string, data: BookingData) => {
    const updatedItinerary = itinerary.map((winery) => {
      if ((winery._id || winery.name) === id) {
        // Only update if bookingDetails has changed
        if (JSON.stringify(winery.bookingDetails) !== JSON.stringify(data)) {
          return { ...winery, bookingDetails: data };
        }
      }
      return winery;
    });

    // Only call setItinerary if there are actual changes
    if (JSON.stringify(updatedItinerary) !== JSON.stringify(itinerary)) {
      setItinerary(updatedItinerary);
    }
  };

  const handleRemove = (id: string) => setItinerary(itinerary.filter((winery) => winery._id !== id));

  const handleClearAll = () => {
    setShowRideModal(false);
    setItinerary([]);
  };

  const getUserLocation = async () => {
    setLoadingLocation(true);
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCurrentLocation(location);
          setLoadingLocation(false);
          resolve(location);
        },
        (error) => {
          setLoadingLocation(false);
          reject(error);
        }
      );
    });
  };
  const handleConfirmBooking = async () => {
    // Get latest user from store to avoid stale closure issues during retries
    const latestUser = useAuthStore.getState().user;

    if (!latestUser) {
      toast.info("Please sign in to confirm your itinerary");
      return setShowAuthModal(true);
    }

    // Check age verification for alcohol-related bookings
    const dob = latestUser.dateOfBirth;

    if (dob && !isUser21OrOlder(new Date(dob))) {
      // HANDLE DEMO MODE: If user ID starts with "demo_", skip API and update local store only
      const uid = (latestUser as any)?._id?.toString() || "";
      if (uid.startsWith("demo_")) {
        console.log("Demo Mode detected: Allowing demo user bypass for age check");
      } else {
        toast.error("You must be 21 or older to book wine tastings.");
        return;
      }
    } else if (!dob) {
      console.log("Date of Birth missing for user, showing verification modal");
      setShowDateOfBirthModal(true);
      return;
    }

    // Validate that all wineries have required booking details
    const missingDetails = itinerary.filter(w => !w.bookingDetails?.selectedTime || !w.bookingDetails?.selectedDate);
    if (missingDetails.length > 0) {
      toast.error(`Please select date and time for: ${missingDetails.map(w => w.name).join(', ')}`);
      return;
    }

    const data = itinerary.map((winery) => {
      const selectedTastingIndex = winery.bookingDetails?.selectedTastingIndex || 0;
      const currentTastingInfo = winery.tasting_info?.[selectedTastingIndex];

      return {
        wineryId: winery._id,
        dateTime: winery.bookingDetails?.selectedTime,
        numberOfGuests: winery.bookingDetails?.numberOfGuests || 1,
        tastingIndex: selectedTastingIndex,
        tasting: winery.bookingDetails?.tasting ? (currentTastingInfo?.tasting_price ?? 0) : null,
        foodPairings: winery.bookingDetails?.foodPairings || [],
        tours: winery.bookingDetails?.tours || [],
        otherFeatures: winery.bookingDetails?.otherFeature || [],
        payment_method: winery.payment_method,
      };
    });

    try {
      const stripeWineries = itinerary.filter((winery) => winery?.payment_method?.type === "pay_stripe");
      const requiresStripe = stripeWineries.length > 0;

      if (requiresStripe) {
        setLoadingPayment(true);
        const lineItems: any[] = [];

        stripeWineries.forEach((winery) => {
          let wineryTotal = 0;
          const selectedTastingIndex = winery.bookingDetails?.selectedTastingIndex || 0;
          const currentTastingInfo = winery.tasting_info?.[selectedTastingIndex];

          if (currentTastingInfo?.tasting_price) wineryTotal += currentTastingInfo.tasting_price;

          winery.bookingDetails?.foodPairings?.forEach(p => wineryTotal += (p.price || 0));
          winery.bookingDetails?.tours?.forEach(t => wineryTotal += (t.price || 0));
          winery.bookingDetails?.otherFeature?.forEach(f => wineryTotal += (Number(f.price) || 0));

          if (wineryTotal > 0) {
            lineItems.push({
              price_data: {
                currency: "usd",
                product_data: {
                  name: `${winery.name} - ${currentTastingInfo?.tasting_title || 'Tasting Package'}`,
                },
                unit_amount: Math.round(wineryTotal * 100),
              },
              quantity: 1,
            });
          }
        });

        // If total Stripe cost is $0, skip Stripe and treat as regular booking
        if (lineItems.length === 0) {
          const response = await axios.post("/api/itinerary/book", { data });
          if (response.status === 201) {
            setShowRideModal(true);
          }
          return;
        }

        const response = await axios.post("/api/stripe/create-checkout-session", {
          line_items: lineItems,
          success_url: `${window.location.origin}/itinerary?success=true`,
          cancel_url: `${window.location.origin}/itinerary?cancel=true`,
          metadata: { itinerary: JSON.stringify(data) },
          bookData: data,
        });

        const { sessionId } = response.data;
        const stripe = await stripePromise;
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId });
        } else {
          throw new Error("Stripe failed to initialize");
        }
      } else {
        // Check if any wineries use external booking links
        const hasExternalBooking = itinerary.some((winery) => winery?.payment_method?.type === "external_booking");

        if (hasExternalBooking) {
          // Handle external booking links
          const externalBookings = itinerary.filter((winery) => winery?.payment_method?.type === "external_booking");

          if (externalBookings.length > 0) {
            // For external bookings, redirect to the winery's booking link
            const firstExternalBooking = externalBookings[0];
            if (firstExternalBooking.payment_method?.external_booking_link) {
              // Still send confirmation to our system (no payment processing)
              await axios.post("/api/itinerary/book", { data });
              toast.success("Booking confirmed! Redirecting to winery booking page...");
              window.open(firstExternalBooking.payment_method.external_booking_link, '_blank');
              return;
            }
          }
        }

        // Pay at winery - no payment processing needed
        const response = await axios.post("/api/itinerary/book", { data });
        if (response.status === 201) {
          setShowRideModal(true);
        }
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      // Show specific error from API if available
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors?.length > 0) {
        toast.error(error.response.data.errors.join(', '));
      } else if (error.response?.status === 400) {
        toast.error("Booking failed: Selected time slot may not be available. Please try a different time.");
      } else if (error.response?.status === 404) {
        toast.error("Payment processing is currently unavailable. Please try again later.");
      } else if (error.message?.includes("Stripe")) {
        toast.error("Failed to initialize payment. Please check your connection and try again.");
      } else if (error.message?.includes("No items selected")) {
        toast.error(error.message);
      } else {
        toast.error("Failed to process booking. Please try again later.");
      }
    } finally {
      setLoadingPayment(false);
    }
  };


  const handleDateOfBirthSuccess = () => {
    // Retry the booking process after date of birth is updated
    handleConfirmBooking();
  };

  const handleRideClick = async (service: "uber" | "lyft") => {
    if (!currentLocation) {
      try {
        const location: any = await getUserLocation();
        openRideLink(service, location);
      } catch {
        alert("Location access denied. Unable to book ride.");
      }
    } else {
      openRideLink(service, currentLocation);
    }
  };

  const openRideLink = (service: "uber" | "lyft", location: { latitude: number; longitude: number }) => {
    const earliestWinery = itinerary[0];
    if (!earliestWinery) return;

    const pickupTime = Math.floor(Date.now() / 1000) + 30 * 60;
    let rideURL = "";
    if (service === "uber") {
      rideURL = `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${location.latitude}&pickup[longitude]=${location.longitude}&dropoff[latitude]=${earliestWinery.location.latitude}&dropoff[longitude]=${earliestWinery.location.longitude}&pickup_time=${pickupTime}&intent=ride`;
    } else if (service === "lyft") {
      rideURL = `https://ride.lyft.com/?id=lyft&pickup[latitude]=${location.latitude}&pickup[longitude]=${location.longitude
        }&destination=${encodeURIComponent(earliestWinery.location.address)}`;
    }
    window.open(rideURL, "_blank");
  };

  // Sort itinerary without causing infinite loop
  useEffect(() => {
    const sortedItinerary = [...itinerary].sort((a, b) => {
      const timeA = a.bookingDetails?.selectedTime ? new Date(a.bookingDetails.selectedTime).getTime() : Infinity;
      const timeB = b.bookingDetails?.selectedTime ? new Date(b.bookingDetails.selectedTime).getTime() : Infinity;
      return timeA - timeB;
    });
    // Only update if the order has changed to prevent infinite loop
    if (JSON.stringify(sortedItinerary) !== JSON.stringify(itinerary)) {
      setItinerary(sortedItinerary);
    }
  }, [itinerary, setItinerary]);

  return (
    <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative md:top-10 top-5">
      <div className="max-w-7xl mx-auto">
        <h1 className="md:text-2xl font-bold text-gray-900">Your Itinerary</h1>
        <p className="text-gray-600 mb-4 md:text-md text-sm">Plan your perfect wine-tasting experience.</p>

        {itinerary.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 text-center text-gray-500">
            <Wine size={50} className="text-gray-400 mb-4" />
            <p className="text-lg font-semibold">Your itinerary is empty</p>
            <p className="text-sm text-gray-600">Start adding wineries to create your perfect wine tour!</p>
            <Button variant="secondary" className="mt-4" onClick={() => router.push("/")}>
              Browse Wineries
            </Button>
          </div>
        ) : (
          <div className="flex gap-10 flex-wrap lg:flex-nowrap mb-10">
            <div className="lg:w-4/5 w-full">
              {itinerary.map((winery) => (
                <div key={winery._id || winery.name} className="mb-4 w-full">
                  <WineryBookingCard winery={winery} onUpdate={handleUpdate} onRemove={handleRemove} />
                </div>
              ))}
            </div>

            <div className="lg:w-2/5 w-full">
              <ItinerarySummary wineries={itinerary} onConfirm={handleConfirmBooking} />

              <div className="flex gap-4 mt-6">
                <Button variant="destructive" onClick={handleClearAll}>
                  Clear All
                </Button>
                <Button onClick={() => router.push("/")} variant="outline">
                  Back to Wineries
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showRideModal}
        onClose={() => {
          setShowRideModal(false);
          handleClearAll();
        }}
      >
        <div className="flex flex-col items-center p-0">
          {!isLottieLoaded && <Loader2 className="w-8 h-8 text-gray-500 animate-spin mb-4" />}
          <iframe
            src="https://lottie.host/embed/303f3d0b-e50a-4592-894a-474164e44c5d/f4rpyUChZF.lottie"
            className={`transition-opacity duration-300 ${isLottieLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setIsLottieLoaded(true)}
          ></iframe>

          {isLottieLoaded && (
            <>
              <h2 className="lg:text-2xl text-xl font-bold text-gray-900 mt-4 text-center">Your Wine Tour is Confirmed! 🍷</h2>
              <p className="text-gray-600 mt-2 text-center">
                You’ve successfully planned your winery itinerary. Get ready to explore amazing wineries and enjoy premium
                tastings!
              </p>

              <p className="text-gray-500 text-sm mt-4 text-center">
                A confirmation email has been sent to <strong>{user?.email || "your email"}</strong> with all your booking
                details. Be sure to check your schedule and arrive on time for your reservations.
              </p>

              <div className="border-t w-full my-4"></div>

              <h3 className="text-lg font-semibold text-gray-900 text-left w-full">What’s Next?</h3>
              <ul className="text-gray-600 text-sm mt-2 space-y-2 text-left w-full">
                <li>📍 Review your itinerary details in your email.</li>
                <li>🍷 Make sure to bring your ID if required by the wineries.</li>
                <li>🚗 Need a ride? Book an Uber or Lyft below.</li>
                <li>📸 Don’t forget to take pictures and share your experience!</li>
              </ul>

              <div className="flex gap-4 mt-6">
                <Button onClick={() => handleRideClick("uber")} className="bg-black text-white">
                  🚗 Book an Uber
                </Button>
                <Button onClick={() => handleRideClick("lyft")} className="bg-[#FF00BF] text-white">
                  🚖 Book a Lyft
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {showAuthModal && <AuthModal setShowPopup={setShowAuthModal} showLoginForm={true} />}
      <DateOfBirthModal
        isOpen={showDateOfBirthModal}
        onClose={() => setShowDateOfBirthModal(false)}
        onSuccess={handleDateOfBirthSuccess}
      />
    </div>
  );
}
