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
  FaCheckCircle,
} from "react-icons/fa";
import { CheckCircle2 } from "lucide-react";
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
import { useLanguage } from "@/context/LanguageContext";

import { useAuthStore } from "@/store/authStore";

const WineryDetail = () => {
  const { user } = useAuthStore();
  const { t } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const [selectedTastingIndex, setSelectedTastingIndex] = useState<number>(0);
  const [selectedFoodPairingOption, setSelectedFoodPairingOption] = useState<string | null>(null);
  const [selectedNumberOfPeople, setSelectedNumberOfPeople] = useState<number | string>(1);
  const [selectedChildren, setSelectedChildren] = useState<number>(0);
  const [selectedNonDrinkers, setSelectedNonDrinkers] = useState<number>(0);
  const [selectedFoodQty, setSelectedFoodQty] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
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
          <h2 className="text-2xl font-serif font-bold text-gray-900">{t("auth_overlay_title")}</h2>
          <p className="text-gray-600">
            {t("auth_overlay_desc")}
          </p>
          <div className="space-y-3">
            {/* The AuthModal is usually triggered by the Navbar state or we can redirect to login */}
            <Button
              className="w-full bg-wine-primary hover:bg-wine-primary/90 text-white py-3 rounded-lg font-bold"
              onClick={() => {
                router.push('/?login=true');
              }}
            >
              {t("sign_in")}
            </Button>
            <Button
              variant="ghost"
              className="w-full text-gray-500 hover:text-gray-700"
              onClick={() => router.push('/')}
            >
              {t("auth_back_to_search")}
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
        selectedDate,
        selectedTime,
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

  // Calculate Total Price (DEPRECATED for detail page, kept for reference if needed elsewhere)
  const totalSummary = (() => {
    return { 
      tastingPrice: currentTastingInfo?.tasting_price || 0, 
      childrenFee: 0, 
      nonDrinkerFee: 0, 
      foodFee: 0, 
      tourFee: 0, 
      total: currentTastingInfo?.tasting_price || 0, 
      totalFoodItems: 0, 
      totalTourItems: 0 
    };
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

        {/* Available Slots Widget */}
        <div className="mb-10">
          {winery._id && <AvailableSlotsWidget wineryId={winery._id} />}
        </div>

        {/* Add to Itinerary - Cleaned Up */}
        <div className="bg-white rounded-lg p-6 sm:p-10 shadow-lg border border-primary/10 flex flex-col items-center text-center">
          <h2 className="font-serif text-3xl mb-4 text-wine-primary">Plan Your Visit</h2>
          
          <div className="w-full max-w-2xl text-left mb-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control w-full">
                <label className="label"><span className="label-text font-bold">Select Date</span></label>
                <input 
                  type="date" 
                  className="input input-bordered w-full" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="form-control w-full">
                <label className="label"><span className="label-text font-bold">Select Time</span></label>
                <select 
                  className="select select-bordered w-full" 
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                >
                  <option value="" disabled>Pick a time</option>
                  {currentTastingInfo?.available_times?.map((time: string) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="form-control w-full">
                <label className="label"><span className="label-text font-bold">Number of Guests</span></label>
                <input 
                  type="number" 
                  min="1"
                  max={currentTastingInfo?.booking_info?.max_guests_per_slot || 20}
                  className="input input-bordered w-full" 
                  value={selectedNumberOfPeople}
                  onChange={(e) => setSelectedNumberOfPeople(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <Button 
            className="bg-wine-primary hover:bg-wine-primary/95 text-white px-12 py-8 text-xl font-bold rounded-2xl shadow-xl shadow-wine-primary/20 transition-all hover:scale-[1.02] w-full sm:w-auto"
            onClick={() => {
              if (!selectedDate || !selectedTime) {
                toast.error("Please select a date and time for your visit.");
                return;
              }
              addToItinerary();
            }}
          >
            Add to Itinerary
          </Button>
          
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Flexible Scheduling
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Customize Tours
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              No Payment Needed Yet
            </span>
          </div>
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
          <div className="mb-12">
            <h3 className="font-serif text-2xl mb-6 text-wine-primary flex items-center gap-2">
              <FaClock className="text-wine-secondary" />
              Hours of Operation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                const hours = winery.operating_hours?.[day as keyof typeof winery.operating_hours];
                const isClosed = !hours || hours.closed;
                
                return (
                  <div key={day} className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold uppercase text-gray-500 mb-1">{day}</span>
                    {isClosed ? (
                      <span className="text-sm font-medium text-red-500">Closed</span>
                    ) : (
                      <span className="text-sm font-medium text-gray-900">
                        {hours.open} - {hours.close}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
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



              {userLocation && (
                <p className="text-center mt-2 text-gray-600 text-sm">
                  Distance: {winery?.transportation.distance_from_user?.toFixed(1) || 'Calculating...'} miles
                </p>
              )}
            </div>
          </div>
          {userLocation && <Map userLocation={userLocation} wineryLocation={winery?.location} />}
        </div>


      </div>
    </div>
  );
};

export default WineryDetail;
