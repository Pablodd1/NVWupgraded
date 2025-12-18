import mongoose from "mongoose";

// FoodPairingOption Schema
const FoodPairingOptionSchema = new mongoose.Schema({
  id: { type: String, required: true, default: () => crypto.randomUUID() },
  name: { type: String, required: true },
  price: { type: Number, default: 0, min: 0 }, // Allow $0 (free) food pairings
});

// Tours Schema
const ToursSchema = new mongoose.Schema({
  available: { type: Boolean, default: false },
  tour_price: { type: Number, default: 0, min: 0 },
  tour_options: [
    {
      description: { type: String, required: true },
      cost: { type: Number, default: 0, min: 0 }, // Allow $0 (free) tours
      tour_id: { type: String }, // Optional
    },
  ],
});

// WineDetail Schema
const WineDetailSchema = new mongoose.Schema({
  id: { type: String, required: true, default: () => crypto.randomUUID() },
  name: { type: String, required: true },
  description: { type: String, required: true },
  year: { type: Number },
  tasting_notes: { type: String },
  photo: { type: String },
});

// BookingInfo Schema
const BookingInfoSchema = new mongoose.Schema({
  booking_enabled: { type: Boolean, default: false },
  max_guests_per_slot: { type: Number, min: 0 },
  number_of_people: [{ type: Number, min: 0 }],
  dynamic_pricing: {
    enabled: { type: Boolean, default: false },
    weekend_multiplier: { type: Number, min: 0 },
  },
  available_slots: [{ type: String }],
  external_booking_link: { type: String },
});

// OtherFeature Schema
const OtherFeatureSchema = new mongoose.Schema({
  description: { type: String, required: true },
  cost: { type: Number, default: 0, min: 0 }, // Allow $0 (free) features  
  feature_id: { type: String },
});

// TastingInfo Schema
const TastingInfoSchema = new mongoose.Schema({
  tasting_title: { type: String, required: true },
  tasting_description: { type: String, required: true },
  ava: { type: String },
  tasting_price: { type: Number, default: 0, min: 0 }, // Allow $0 (free) tastings
  available_times: [{ type: String }],
  wine_types: [{ type: String }],
  number_of_wines_per_tasting: { type: Number, min: 1, default: 1 },
  special_features: [{ type: String }],
  images: [{ type: String }],
  food_pairing_options: [FoodPairingOptionSchema],
  tours: ToursSchema,
  wine_details: [WineDetailSchema],
  booking_info: BookingInfoSchema,
  other_features: [OtherFeatureSchema],
});

// Winery Schema
const WinerySchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    address: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    is_mountain_location: { type: Boolean, required: true },
  },
  contact_info: {
    phone: { type: String },
    email: { type: String },
    website: { type: String },
  },
  description: { type: String },
  tasting_info: [TastingInfoSchema],
  amenities: {
    virtual_sommelier: { type: Boolean, default: false },
    augmented_reality_tours: { type: Boolean, default: false },
    handicap_accessible: { type: Boolean, default: false },
  },
  user_reviews: [
    {
      review_id: { type: String },
      user_id: { type: String },
      rating: { type: Number, min: 0, max: 5 },
      comment: { type: String },
    },
  ],
  transportation: {
    uber_availability: { type: Boolean, default: false },
    lyft_availability: { type: Boolean, default: false },
    distance_from_user: { type: Number, min: 0 },
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

// Check if the model is already defined
const Winery = mongoose.models.Winery || mongoose.model("Winery", WinerySchema);

export default Winery;