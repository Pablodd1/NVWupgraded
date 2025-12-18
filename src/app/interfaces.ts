// Location.ts
export interface Location {
  address: string;
  latitude: number;
  longitude: number;
  is_mountain_location: boolean;
}

// ContactInfo.ts
export interface ContactInfo {
  phone: string;
  email: string;
  website: string;
}

// FoodPairingOption.ts
export interface FoodPairingOption {
  id: string;
  name: string;
  price: number;
}

// Tours.ts
export interface Tours {
  available: boolean;
  tour_price: number;
  tour_options: { description: string; cost: number; tour_id?: string }[];
}

// WineDetail.ts
export interface WineDetail {
  id: string;
  name: string;
  description: string;
  year?: number;
  tasting_notes?: string;
  photo?: string;
}

// DynamicPricing.ts
export interface DynamicPricing {
  enabled: boolean;
  weekend_multiplier: number;
}

// BookingInfo.ts
export interface BookingInfo {
  booking_enabled: boolean;
  max_guests_per_slot: number;
  number_of_people: number[];
  dynamic_pricing: DynamicPricing;
  available_slots: string[];
  external_booking_link?: string;
}

// Amenities.ts
export interface Amenities {
  virtual_sommelier: boolean;
  augmented_reality_tours: boolean;
  handicap_accessible: boolean;
}

// UserReview.ts
export interface UserReview {
  review_id: string;
  user_id: string;
  rating: number;
  comment: string;
}

// Transportation.ts
export interface Transportation {
  uber_availability: boolean;
  lyft_availability: boolean;
  distance_from_user: number;
}

// TastingInfo.ts
export interface TastingInfo {
  tasting_title: string;
  tasting_description: string;
  ava: string;
  tasting_price: number;
  available_times: string[];
  wine_types: string[];
  number_of_wines_per_tasting: number;
  special_features: string[];
  images: string[];
  food_pairing_options: FoodPairingOption[];
  tours: Tours;
  wine_details: WineDetail[];
  booking_info: BookingInfo;
  other_features: { description: string; cost: number; feature_id?: string }[];
}

// PaymentMethod.ts
export interface PaymentMethod {
  type: 'pay_winery' | 'pay_stripe' | 'external_booking';
  external_booking_link?: string;
}

// Winery.ts
export interface Winery {
  _id?: string;
  name: string;
  location: Location;
  contact_info: ContactInfo;
  description: string;
  tasting_info: TastingInfo[];
  amenities: Amenities;
  user_reviews: UserReview[];
  transportation: Transportation;
  payment_method: PaymentMethod;
  food_pairing_options?: FoodPairingOption[];
  tours?: Tours;
  wine_details?: WineDetail[];
}