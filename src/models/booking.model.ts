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
  tours: any[]; // Support detailed tour info
  foodPairings: FoodPairing[];
  otherFeatures: any[]; // Support detailed feature info
  numberOfGuests: number;
}

const wineryBookingSchema = new Schema<WineryBooking>(
  {
    wineryId: { type: Schema.Types.ObjectId, required: true, ref: "Winery" },
    datetime: { type: Date, required: true },
    tasting: { type: Number, default: null },
    tours: { type: [Object], default: [] },
    foodPairings: { type: [foodPairingSchema], default: [] },
    otherFeatures: { type: [Object], default: [] },
    numberOfGuests: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

interface Booking {
  userId: mongoose.Types.ObjectId;
  wineries: WineryBooking[];
  specialRequests?: string;
  status?: "pending" | "confirmed" | "cancelled";
  payment_method: string;
  totalPrice?: number;
}

const bookingSchema = new Schema<Booking>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    wineries: { type: [wineryBookingSchema], required: true },
    specialRequests: { type: String },
    status: { type: String, default: "pending", enum: ["pending", "confirmed", "cancelled"] },
    payment_method: { type: String, default: "pay_winery" },
    totalPrice: { type: Number, default: 0 }

  },
  { timestamps: true }
);

const BookingModel = models.Booking || model<Booking>("Booking", bookingSchema);

export default BookingModel;