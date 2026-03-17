"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  FaMapMarkerAlt,
  FaArrowLeft,
  FaArrowRight,
  FaStar,
  FaPhoneAlt,
  FaEnvelope,
  FaWineGlass,
  FaDollarSign,
  FaClock,
  FaGlassCheers,
  FaUsers,
  FaCar,
} from "react-icons/fa";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/buttons/button";
import { Card } from "@/components/cards/card";
import BookingCalendar from "@/components/booking-calendar";
import { Winery } from "@/app/interfaces";
import Map from "@/components/map";
import { useItinerary } from "@/store/itinerary";
import { toast } from "react-toastify";
import axios from "axios";
import AvailableSlotsWidget from "@/components/winery/AvailableSlotsWidget";
import Image from "next/image";

import { useAuthStore } from "@/store/authStore";

const WineryDetail = () => {
  const { user } = useAuthStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const [selectedTastingIndex, setSelectedTastingIndex] = useState<number>(0);
  const [selectedFoodPairingOption, setSelectedFoodPairingOption] = useState<string | null>(null);
  const [selectedNumberOfPeople, setSelectedNumberOfPeople] = useState<number | string>(1);
  const [selectedChildren, setSelectedChildren] = useState<number>(0);
  const [selectedNonDrinkers, setSelectedNonDrinkers] = useState<number>(0);
  const [selectedFoodQty, setSelectedFoodQty] = useState<number>(1);
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { itinerary, setItinerary } = useItinerary();
  const [winery, setWinery] = useState<Winery>(undefined as any);
  const hasFetchedWinery = useRef(false);

  // Auth Overlay
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-wine-primary/10 rounded-full flex items-center justify-center mx-auto">
            <FaWineGlass className="text-3xl text-wine-primary" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900">Unlock Exclusive Access</h2>
          <p className="text-gray-600">
            Sign up or log in to view exclusive winery details, book tastings, and create your personalized itinerary.
          </p>
          <div className="space-y-3">
            {/* The AuthModal is usually triggered by the Navbar state or we can redirect to login */}
            <Button
              className="w-full bg-wine-primary hover:bg-wine-primary/90 text-white py-3 rounded-lg font-bold"
              onClick={() => {
                // Trigger global auth modal via event or direct state if possible, or redirect
                // For now, let's assume we can push to a login route or trigger the modal
                // Since AuthModal is in Layout/Navbar, we might need a way to open it.
                // A simple redirect to home with a query param might work if the home page opens the modal.
                // Or we can just redirect to home
                router.push('/?login=true');
              }}
            >
              Sign In / Sign Up
            </Button>
            <Button
              variant="ghost"
              className="w-full text-gray-500 hover:text-gray-700"
              onClick={() => router.push('/')}
            >
              Back to Search
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Booking State
  const [selectedFoodPairings, setSelectedFoodPairings] = useState<{ name: string; price: number }[]>([]);
  const [selectedTours, setSelectedTours] = useState<{ description: string; price: number }[]>([]);

  // Get current tasting info based on selection
  const currentTastingInfo = winery?.tasting_info?.[selectedTastingIndex];

  // Get images from the main winery profile or fallback to current tasting/first tasting
  const currentImages = (winery?.images && winery.images.length > 0)
    ? winery.images
    : (currentTastingInfo?.images || winery?.tasting_info?.[0]?.images || []);

  // Check if this winery uses external booking
  const hasExternalBooking = currentTastingInfo?.booking_info?.external_booking_link;

  // Handler for external booking
  const handleExternalBooking = () => {
    if (hasExternalBooking) {
      window.open(currentTastingInfo.booking_info.external_booking_link, "_blank");
      toast.info(`Redirecting to ${winery.name}'s booking system...`);
    }
  };

  const addToItinerary = () => {
    const wineryWithBookingDetails = {
      ...winery,
      bookingDetails: {
        selectedTastingIndex,
        numberOfGuests: Number(selectedNumberOfPeople),
        numberOfChildren: selectedChildren,
        numberOfNonDrinkers: selectedNonDrinkers,
        foodPairings: selectedFoodPairings,
        foodPairingQty: selectedFoodQty,
        tours: selectedTours,
        otherFeature: [],
        selectedDate: "",
        selectedTime: "",
        tasting: true
      }
    };

    setItinerary(prev => {
      const isAlreadyAdded = prev.some(item => (item._id || item.name) === (winery._id || winery.name));
      if (!isAlreadyAdded) {
        return [...prev, wineryWithBookingDetails];
      }
      return prev;
    });

    toast.success(`${winery?.name} added to your itinerary!`);
    router.push("/itinerary");
  };

  const handleFoodPairingChange = (pairing: any, qty: number) => {
    setSelectedFoodPairingOption(pairing.id);
    setSelectedFoodQty(qty);

    // Update selectedFoodPairings for itinerary
    const otherPairings = selectedFoodPairings.filter(p => p.name !== pairing.name);
    const newEntries = qty > 0 ? [{ name: pairing.name, price: pairing.price }] : [];
    setSelectedFoodPairings([...otherPairings, ...newEntries]);

    toast.success(qty === 0 ? `${pairing.name} removed` : `${qty}x ${pairing.name} selected`);
  };

  const handleTourToggle = (tour: any) => {
    // Check if tour is already selected (check if any entry matches description)
    const isSelected = selectedTours.some(t => t.description === tour.description);

    if (isSelected) {
      // Remove
      setSelectedTours(prev => prev.filter(t => t.description !== tour.description));
      toast.info("Tour removed");
    } else {
      // Add for all guests (Per Guest policy)
      const guestCount = Number(selectedNumberOfPeople) || 1;
      const newEntries = Array(guestCount).fill({
        description: tour.description,
        price: tour.cost // Use 'cost' from tour object, map to 'price' 
      });
      setSelectedTours(prev => [...prev, ...newEntries]);
      toast.success("Tour added for all guests");
    }
  };

  const handleLocationPermission = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation(position.coords);
          toast.success("We can now show you directions to the winery.");
        },
        (error) => {
          toast.error("Location error");
        }
      );
    }
  }, []);

  const changeImage = (direction: "next" | "prev") => {
    setCurrentImageIndex((prevIndex) => {
      if (direction === "next") {
        return (prevIndex + 1) % currentImages.length;
      }
      return (prevIndex - 1 + currentImages.length) % currentImages.length;
    });
  };

  useEffect(() => {
    if (!hasFetchedWinery.current) {
      const fetchWinery = async () => {
        try {
          const response = await axios.get(`/api/winery/${id}`);


          const wineryData = response.data.winery;

          setWinery(wineryData);
          hasFetchedWinery.current = true;
        } catch (error) {
          // Silent error for production
        }
      };

      fetchWinery();
    }

    return () => {
      hasFetchedWinery.current = false;
    };
  }, [id]);

  if (!winery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-gray-600 font-medium">Loading winery details...</p>
        </div>
      </div>
    );
  }

  // Calculate Total Price
  const totalSummary = (() => {
    const adults = Number(selectedNumberOfPeople) || 0;
    const tastingPrice = (currentTastingInfo?.tasting_price || 0) * adults;

    const childrenFee = (currentTastingInfo?.child_price || 0) * selectedChildren;
    const nonDrinkerFee = (currentTastingInfo?.non_drinker_price || 0) * selectedNonDrinkers;

    const foodFee = selectedFoodPairings.reduce((sum, p) => sum + (p.price * selectedFoodQty), 0);
    const tourFee = selectedTours.reduce((sum, t) => sum + t.price, 0);

    const total = tastingPrice + childrenFee + nonDrinkerFee + foodFee + tourFee;

    return { tastingPrice, childrenFee, nonDrinkerFee, foodFee, tourFee, total };
  })();

  return (
    <div className="min-h-screen bg-wine-background md:top-20 top-16 relative">
      {/* Hero Section */}
      <div className="relative h-[60vh] sm:h-[80vh] overflow-hidden">
        {currentImages.length > 0 ? (
          <Image
            src={currentImages[currentImageIndex]}
            alt={winery.name}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-500">No images available</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl px-4">
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6 leading-tight">{winery.name}</h1>
            <p className="text-sm sm:text-xl max-w-2xl mx-auto font-light leading-relaxed">{winery.description}</p>
            <div className="mt-8">
              {/* Show direct booking button if external booking is configured */}
              {hasExternalBooking ? (
                <Button
                  className="bg-wine-primary hover:bg-wine-primary/90 text-white px-8 py-6 text-lg"
                  onClick={handleExternalBooking}
                >
                  Book Now →
                </Button>
              ) : (
                <Button className="bg-wine-primary hover:bg-wine-primary/90 text-white px-8 py-6 text-lg" onClick={addToItinerary}>
                  Add to Itinerary
                </Button>
              )}
            </div>
          </div>
        </div>
        {currentImages.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => changeImage("prev")}
              className="bg-white/80 hover:bg-white backdrop-blur-sm"
            >
              <FaArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => changeImage("next")}
              className="bg-white/80 hover:bg-white backdrop-blur-sm"
            >
              <FaArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-16 space-y-8 sm:space-y-16">
        {/* Multiple Tasting Selection */}
        {winery.tasting_info && winery.tasting_info.length > 1 && (
          <div className="bg-white rounded-xl p-4 sm:p-8 shadow-lg">
            <h2 className="font-serif text-2xl sm:text-3xl mb-4 sm:mb-6 text-wine-primary">Choose Your Tasting Experience</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {winery.tasting_info.map((tasting, index) => (
                <Card
                  key={index}
                  className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${selectedTastingIndex === index ? 'ring-2 ring-wine-primary bg-wine-primary/5' : ''
                    }`}
                  onClick={() => setSelectedTastingIndex(index)}
                >
                  <h3 className="font-serif text-xl mb-3 text-wine-primary">{tasting.tasting_title}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{tasting.tasting_description}</p>
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-lg">${tasting.tasting_price.toFixed(2)}</p>
                    <p className="text-gray-500">{tasting.number_of_wines_per_tasting} wines included</p>
                    <p className="text-gray-500 font-medium">Per Person</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Slots Widget */}
        <AvailableSlotsWidget wineryId={id} />

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-wine-primary/10 rounded-full">
                <FaWineGlass className="h-6 w-6 text-wine-primary" />
              </div>
              <div>
                <h3 className="font-serif text-lg mb-1">Wine Types</h3>
                <p className="text-gray-600 text-sm capitalize">{currentTastingInfo?.wine_types?.join(", ") || "N/A"}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-wine-primary/10 rounded-full">
                <FaClock className="h-6 w-6 text-wine-primary" />
              </div>
              <div>
                <h3 className="font-serif text-lg mb-1">Tasting Duration</h3>
                <p className="text-gray-600 text-sm">60-90 minutes</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-wine-primary/10 rounded-full">
                <FaDollarSign className="h-6 w-6 text-wine-primary" />
              </div>
              <div>
                <h3 className="font-serif text-lg mb-1">Price</h3>
                <p className="text-gray-600 text-sm">
                  {`$${currentTastingInfo?.tasting_price?.toFixed(2) ?? "N/A"} per person`}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-wine-primary/10 rounded-full">
                <FaMapMarkerAlt className="h-6 w-6 text-wine-primary" />
              </div>
              <div>
                <h3 className="font-serif text-lg mb-1">Location</h3>
                <p className="text-gray-600 text-sm">{currentTastingInfo?.ava}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Details Section - Only show if there's content */}
        {(currentTastingInfo?.wine_details?.length > 0 ||
          currentTastingInfo?.tours?.tour_options?.length > 0 ||
          currentTastingInfo?.other_features?.length > 0 ||
          currentTastingInfo?.food_pairing_options?.length > 0) && (
            <div className="bg-white rounded-lg p-4 sm:p-8 shadow-lg">
              <h2 className="font-serif text-2xl sm:text-3xl mb-4 sm:mb-6 text-wine-primary">Tasting Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                {/* Wine Section - Only show if wine details exist */}
                {currentTastingInfo?.wine_details && currentTastingInfo.wine_details.length > 0 && (
                  <div>
                    <h3 className="font-serif text-xl mb-4">Featured Wines</h3>
                    {currentTastingInfo.wine_details.map((wine, index) => (
                      <div key={wine.id} className="mb-4">
                        {wine.photo && (
                          <div className="mb-4 relative h-48 w-full">
                            <Image
                              src={wine.photo}
                              alt={wine.name}
                              fill
                              className="object-cover rounded-lg shadow-md"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          </div>
                        )}
                        <p>
                          <strong>Wine Name:</strong> {wine.name}
                        </p>
                        <p>
                          <strong>Description:</strong> {wine.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tour Options Section - Only show if tours exist */}
                {currentTastingInfo?.tours?.tour_options && currentTastingInfo.tours.tour_options.length > 0 && (
                  <div>
                    <h3 className="font-serif text-xl mb-4">Tour Options</h3>
                    {currentTastingInfo.tours.tour_options.map((tour, index) => (
                      <div key={index + 1} className="mb-4 p-4 border border-gray-200 rounded-lg">
                        <p className="mb-2">
                          <strong>Tour:</strong> {tour.description}
                        </p>
                        <p className="text-lg font-semibold text-wine-primary">
                          {tour.cost === 0 ? 'Free' : `$${tour.cost.toFixed(2)}`}
                        </p>
                        <Button
                          onClick={() => handleTourToggle(tour)}
                          className={`mt-2 w-full ${selectedTours.some(t => t.description === tour.description) ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-wine-primary text-white hover:bg-wine-primary/90'}`}
                        >
                          {selectedTours.some(t => t.description === tour.description) ? 'Remove' : 'Add to Booking'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Other Features Section - Only show if features exist */}
                {currentTastingInfo?.other_features && currentTastingInfo.other_features.length > 0 && (
                  <div>
                    <h3 className="font-serif text-xl mb-4">Other Features</h3>
                    {currentTastingInfo.other_features.map((feature, index) => (
                      <div key={index + 1} className="mb-4 p-4 border border-gray-200 rounded-lg">
                        <p className="mb-2">
                          <strong>Feature:</strong> {feature.description}
                        </p>
                        <p className="text-lg font-semibold text-wine-primary">
                          {feature.cost === 0 ? 'Free' : `$${feature.cost.toFixed(2)}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}


              </div>
            </div>
          )}

        {/* Tasting Experience Section */}
        <div className="bg-white rounded-xl p-4 sm:p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-4 sm:mb-8">
            <FaGlassCheers className="h-6 w-6 sm:h-8 sm:w-8 text-wine-primary" />
            <h2 className="font-serif text-2xl sm:text-3xl text-wine-primary">Tasting Experience</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            <Card className="p-6">
              <h3 className="font-serif text-xl mb-4">What to Expect</h3>
              <div className="space-y-4">
                <p className="flex items-center gap-2">
                  <FaWineGlass className="text-wine-primary" />
                  <span>{currentTastingInfo?.number_of_wines_per_tasting} wines per tasting</span>
                </p>
                <p className="flex items-center gap-2">
                  <FaUsers className="text-wine-primary" />
                  <span>Size: {currentTastingInfo?.booking_info?.max_guests_per_slot || "Waitlist"} people per slot</span>
                </p>
                <div>
                  <h4 className="font-medium mb-3">Special Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {/* Combine winery-level handicap access with tasting-level features */}
                    {winery.amenities.handicap_accessible && (
                      <span className="bg-blue-50 text-blue-700 border border-blue-100 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1">
                        ♿ Handicap Accessible
                      </span>
                    )}
                    {currentTastingInfo?.special_features?.map((feature, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-800 border border-gray-200 px-4 py-2 rounded-full text-sm font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                    {!winery.amenities.handicap_accessible && (!currentTastingInfo?.special_features || currentTastingInfo.special_features.length === 0) && (
                      <span className="text-gray-500">No special features listed</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Book a Tasting Section */}
        <div className="bg-white rounded-lg p-4 sm:p-8 shadow-lg">
          <h2 className="font-serif text-2xl sm:text-3xl mb-4 sm:mb-6 text-wine-primary">Book a Tasting</h2>

          {/* External Booking - Direct Flow */}
          {hasExternalBooking ? (
            <div className="space-y-6">
              {/* Information Note */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      External Booking System
                    </h3>
                    <p className="text-blue-800 mb-3">
                      This winery uses their own booking system. When you click the button below, you'll be redirected to <strong>{winery.name}</strong> official booking platform to complete your reservation.
                    </p>
                    <p className="text-sm text-blue-700">
                      ✓ Secure booking process<br />
                      ✓ Direct confirmation from the winery<br />
                      ✓ Managed by {winery.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct External Booking Button */}
              <Button
                className="bg-wine-primary hover:bg-wine-primary/90 text-white w-full py-8 text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handleExternalBooking}
              >
                <span className="flex items-center justify-center gap-3">
                  <span>Book Your Tasting Now</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </span>
              </Button>

              {/* Additional Info */}
              <p className="text-center text-gray-500 text-sm">
                You will be redirected to {winery.name}'s booking system in a new window
              </p>
            </div>
          ) : (
            /* Built-in Booking Flow */
            <div className="space-y-6">
              {/* Number of People Selection */}
              <div>
                <label htmlFor="num-people" className="text-sm text-gray-900 font-extrabold">Number of People</label>
                <input
                  id="num-people"
                  type="number"
                  min={1}
                  max={currentTastingInfo?.booking_info?.max_guests_per_slot || 20}
                  value={selectedNumberOfPeople}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setSelectedNumberOfPeople('');
                    } else {
                      const numValue = parseInt(value);
                      if (!isNaN(numValue) && numValue >= 1) {
                        setSelectedNumberOfPeople(numValue);
                      }
                    }
                  }}
                  className="input input-bordered w-full mt-2 text-sm"
                  placeholder="1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Children Selection */}
                {winery.amenities?.allows_children && (
                  <div>
                    <label htmlFor="num-children" className="text-sm text-gray-900 font-extrabold flex justify-between">
                      <span>Number of Children</span>
                      <span className="text-primary">${currentTastingInfo?.child_price || 0} ea</span>
                    </label>
                    <input
                      id="num-children"
                      type="number"
                      min={0}
                      value={selectedChildren}
                      onChange={(e) => setSelectedChildren(Math.max(0, parseInt(e.target.value) || 0))}
                      className="input input-bordered w-full mt-2 text-sm"
                      placeholder="0"
                    />
                  </div>
                )}

                {/* Non-Drinkers Selection */}
                {winery.amenities?.allows_non_drinkers && (
                  <div>
                    <label htmlFor="num-non-drinkers" className="text-sm text-gray-900 font-extrabold flex justify-between">
                      <span>Non-Drinkers</span>
                      <span className="text-primary">${currentTastingInfo?.non_drinker_price || 0} ea</span>
                    </label>
                    <input
                      id="num-non-drinkers"
                      type="number"
                      min={0}
                      value={selectedNonDrinkers}
                      onChange={(e) => setSelectedNonDrinkers(Math.max(0, parseInt(e.target.value) || 0))}
                      className="input input-bordered w-full mt-2 text-sm"
                      placeholder="0"
                    />
                  </div>
                )}
              </div>

              {/* Price Summary Breakdown */}
              <div className="mt-8 border-t border-gray-100 pt-6">
                <h3 className="font-serif text-xl mb-4 text-wine-primary">Price Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tasting ({selectedNumberOfPeople} Guests)</span>
                    <span className="font-bold">${totalSummary.tastingPrice.toFixed(2)}</span>
                  </div>
                  {totalSummary.childrenFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Children ({selectedChildren})</span>
                      <span className="font-bold">+${totalSummary.childrenFee.toFixed(2)}</span>
                    </div>
                  )}
                  {totalSummary.nonDrinkerFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Non-Drinkers ({selectedNonDrinkers})</span>
                      <span className="font-bold">+${totalSummary.nonDrinkerFee.toFixed(2)}</span>
                    </div>
                  )}
                  {totalSummary.foodFee > 0 && (
                    <div className="flex justify-between text-indigo-600 font-medium">
                      <span>Food Pairings ({selectedFoodQty}x)</span>
                      <span>+${totalSummary.foodFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-black border-t-2 border-primary/10 pt-4 mt-2">
                    <span>Estimated Total</span>
                    <span className="text-primary underline decoration-berry-500 underline-offset-4">${totalSummary.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <Button
                  className="flex-1 bg-wine-primary hover:bg-wine-primary/90 text-white font-black py-6 rounded-2xl shadow-xl shadow-wine-primary/20 transition-all hover:scale-[1.02]"
                  onClick={addToItinerary}
                >
                  Confirm & Add to Itinerary
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Reviews Section - Only show if reviews exist */}
        {winery?.user_reviews && winery.user_reviews.length > 0 && (
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h2 className="font-serif text-3xl mb-8 text-wine-primary flex items-center gap-3">
              <FaStar className="h-7 w-7" />
              Guest Reviews
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {winery.user_reviews.map((review) => (
                <Card key={review.review_id} className="p-6 hover:shadow-lg transition-all">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`h-5 w-5 ${i < Math.floor(review.rating) ? "text-wine-secondary" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="font-medium ml-2">{review.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-gray-600 italic">{review.comment}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Contact & Directions Section */}
        <div className="bg-white rounded-xl p-4 sm:p-8 shadow-lg">
          <h2 className="font-serif text-2xl sm:text-3xl mb-4 sm:mb-8 text-wine-primary">Contact & Directions</h2>

          {/* Hours of Operation */}
          <div className="mb-8">
            <h3 className="font-serif text-2xl mb-4 text-wine-primary">Hours of Operation</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6 ">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-wine-primary/10 rounded-full">
                  <FaPhoneAlt className="h-5 w-5 text-wine-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-xl mb-1">Phone</h3>
                  <p className="text-gray-600">{winery?.contact_info.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-wine-primary/10 rounded-full">
                  <FaEnvelope className="h-5 w-5 text-wine-primary" />
                </div>
                <div className="break-all">
                  <h3 className="font-serif text-xl mb-1">Email</h3>
                  <p className="text-gray-600">{winery?.contact_info.email}</p>
                </div>
              </div>

            </div>
            <div className="flex flex-col justify-center gap-4">
              <Button
                onClick={() => {
                  if (!userLocation) {
                    handleLocationPermission();
                    // We can't open immediately after asking permission due to browser security/async, 
                    // but we can prompt them to click again or use a useEffect to trigger it.
                    // For now, simpler is better: ask for location, then they click again.
                    return;
                  }
                  const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${winery.location.latitude},${winery.location.longitude}`;
                  window.open(url, '_blank');
                }}
                className="bg-wine-primary hover:bg-wine-primary/90 text-white w-full py-4 text-lg flex items-center justify-center gap-2"
              >
                <FaMapMarkerAlt /> Get Directions
              </Button>

              {winery.transportation.uber_availability && (
                <Button
                  onClick={() => {
                    if (!userLocation) {
                      handleLocationPermission();
                      return;
                    }
                    // Uber Universal Link
                    const url = `https://m.uber.com/ul/?client_id=YOUR_UBER_CLIENT_ID&action=setPickup&pickup[latitude]=${userLocation.latitude}&pickup[longitude]=${userLocation.longitude}&dropoff[latitude]=${winery.location.latitude}&dropoff[longitude]=${winery.location.longitude}&dropoff[nickname]=${encodeURIComponent(winery.name)}`;
                    window.open(url, '_blank');
                  }}
                  className="bg-black hover:bg-gray-800 text-white w-full py-4 text-lg flex items-center justify-center gap-2"
                >
                  <FaCar /> Ride with Uber
                </Button>
              )}

              {winery.transportation.lyft_availability && (
                <Button
                  onClick={() => {
                    if (!userLocation) {
                      handleLocationPermission();
                      return;
                    }
                    // Lyft Universal Link
                    const url = `https://lyft.com/ride?id=lyft&pickup[latitude]=${userLocation.latitude}&pickup[longitude]=${userLocation.longitude}&destination[latitude]=${winery.location.latitude}&destination[longitude]=${winery.location.longitude}`;
                    window.open(url, '_blank');
                  }}
                  className="bg-[#FF00BF] hover:bg-[#D400A0] text-white w-full py-4 text-lg flex items-center justify-center gap-2"
                >
                  <FaCar /> Ride with Lyft
                </Button>
              )}

              {userLocation && (
                <p className="text-center mt-2 text-gray-600 text-sm">
                  Distance: {winery?.transportation.distance_from_user?.toFixed(1) || 'Calculating...'} miles
                </p>
              )}
            </div>
          </div>
          {userLocation && <Map userLocation={userLocation} wineryLocation={winery?.location} />}
        </div>

        {/* Food Pairings Section - Bottom of Page */}
        {currentTastingInfo?.food_pairing_options && currentTastingInfo.food_pairing_options.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 py-8 sm:py-16">
            <div className="bg-white rounded-xl p-4 sm:p-8 shadow-lg">
              <h2 className="font-serif text-2xl sm:text-3xl mb-2 text-wine-primary">Food Pairings</h2>
              <p className="text-gray-600 mb-6">Enhance your tasting experience with artisanal pairings. Select quantity per party.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentTastingInfo.food_pairing_options.map((pairing, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-xl p-6 hover:border-wine-primary transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{pairing.name}</h3>
                        <p className="text-wine-primary font-semibold text-xl mt-1">
                          {pairing.price === 0 ? 'Complimentary' : `$${pairing.price.toFixed(2)}`}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Selector - Click to Select */}
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">Quantity for party:</p>
                      <div className="flex flex-wrap gap-2">
                        {[0, 1, 2, 3, 4, 5, 6].map((qty) => (
                          <button
                            key={qty}
                            onClick={() => handleFoodPairingChange(pairing, qty)}
                            className={`
                              w-10 h-10 rounded-full border-2 font-bold transition-all
                              ${
                              // Check if this quantity is currently selected
                              selectedFoodPairings.filter(p => p.name === pairing.name).length === qty
                                ? 'bg-wine-primary text-white border-wine-primary'
                                : qty === 0
                                  ? 'border-gray-300 text-gray-400 hover:border-red-400 hover:text-red-500'
                                  : 'border-wine-primary/30 text-wine-primary hover:bg-wine-primary hover:text-white'
                              }
                            `}
                          >
                            {qty === 0 ? '✕' : qty}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-center text-gray-500 text-sm mt-6">
                Food pairings are per person. Click a number to select quantity for your party.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WineryDetail;
