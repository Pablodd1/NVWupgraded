import mongoose, { Schema, model, models } from "mongoose";

interface FoodPairing {
  name: string;
  price: number;
}

const foodPairingSchema = new Schema<FoodPairing>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

interface WineryBooking {
  wineryId: mongoose.Types.ObjectId;
  datetime: Date;
  tasting: number | null;
  baseBookingFee?: number; // Base fee for first person
  additionalGuestFee?: number; // Fee per additional guest
  freeGuestsIncluded?: number; // Number of guests included in base fee
  childPrice?: number;
  nonDrinkerPrice?: number;
  tours: any[]; // Support detailed tour info
  foodPairings: FoodPairing[];
  foodPairingQty?: number;
  otherFeatures: any[]; // Support detailed feature info
  numberOfGuests: number;
  numberOfChildren?: number;
  numberOfNonDrinkers?: number;
  status: "pending" | "confirmed" | "declined" | "completed";
}

const wineryBookingSchema = new Schema<WineryBooking>(
  {
    wineryId: { type: Schema.Types.ObjectId, required: true, ref: "Winery" },
    datetime: { type: Date, required: true },
    tasting: { type: Number, default: null },
    baseBookingFee: { type: Number, default: 0 },
    additionalGuestFee: { type: Number, default: 0 },
    freeGuestsIncluded: { type: Number, default: 0 },
    childPrice: { type: Number, default: 0 },
    nonDrinkerPrice: { type: Number, default: 0 },
    tours: { type: [Object], default: [] },
    foodPairings: { type: [foodPairingSchema], default: [] },
    foodPairingQty: { type: Number, default: 1 },
    otherFeatures: { type: [Object], default: [] },
    numberOfGuests: { type: Number, default: 1, min: 1 },
    numberOfChildren: { type: Number, default: 0 },
    numberOfNonDrinkers: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "declined", "completed"],
      default: "pending"
    }
  },
  { _id: false }
);

interface Booking {
  userId?: mongoose.Types.ObjectId; // Optional for external bookings
  wineries: WineryBooking[];
  specialRequests?: string;
  status?: "pending" | "confirmed" | "cancelled" | "partial" | "completed";
  payment_method: string;
  totalPrice?: number;

  // External booking fields
  wineryId?: mongoose.Types.ObjectId;
  tastingTitle?: string;
  bookingDate?: Date;
  numberOfGuests?: number;
  customerFirstName?: string;
  customerLastName?: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentStatus?: "pending" | "paid" | "external" | "failed";
  paymentMethod?: "stripe" | "pay_winery" | "external_booking";
  totalAmount?: number;
  externalBookingReference?: string;
}

const bookingSchema = new Schema<Booking>(
  {
    userId: { type: Schema.Types.ObjectId, required: false, ref: "User" }, // Optional for external bookings
    wineries: { type: [wineryBookingSchema], required: true },
    specialRequests: { type: String },
    status: { type: String, default: "pending", enum: ["pending", "confirmed", "cancelled", "partial", "completed"] },
    payment_method: { type: String, default: "pay_winery" },
    totalPrice: { type: Number, default: 0 },

    // External booking fields
    wineryId: { type: Schema.Types.ObjectId, ref: "Winery" },
    tastingTitle: { type: String },
    bookingDate: { type: Date },
    numberOfGuests: { type: Number },
    customerFirstName: { type: String },
    customerLastName: { type: String },
    customerEmail: { type: String },
    customerPhone: { type: String },
    paymentStatus: { type: String, enum: ["pending", "paid", "external", "failed"], default: "pending" },
    paymentMethod: { type: String, enum: ["stripe", "pay_winery", "external_booking"], default: "pay_winery" },
    totalAmount: { type: Number, default: 0 },
    externalBookingReference: { type: String }, // Reference from external booking system
  },
  { timestamps: true }
);
// Performance Indexes
bookingSchema.index({ userId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'wineries.wineryId': 1 });
bookingSchema.index({ createdAt: -1 });

const BookingModel = models.Booking || model<Booking>("Booking", bookingSchema);

export default BookingModel;