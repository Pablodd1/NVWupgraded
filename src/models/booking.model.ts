import mongoose, { Schema, model, models } from "mongoose";

interface FoodPairing {
  name: string;
  price: number;
}

interface WineryBooking {
  wineryId: mongoose.Types.ObjectId;
  datetime: Date;
  tasting: number | null;
  tour: number | null;
  foodPairings: FoodPairing[];
}
const foodPairingSchema = new Schema<FoodPairing>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const wineryBookingSchema = new Schema<WineryBooking>(
  {
    wineryId: { type: Schema.Types.ObjectId, required: true, ref: "Winery" },
    datetime: { type: Date, required: true },
    tasting: { type: Number, default: null },
    tour: { type: Number, default: null },
    foodPairings: { type: [foodPairingSchema], default: [] },
  },
  { _id: false }
);

interface Booking {
  userId: mongoose.Types.ObjectId;
  wineries: WineryBooking[];
  specialRequests?: string;
  status?: "pending" | "confirmed" | "cancelled";
  payment_method: string;

}

const bookingSchema = new Schema<Booking>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    wineries: { type: [wineryBookingSchema], required: true },
    specialRequests: { type: String },
    status: { type: String, default: "pending", enum: ["pending", "confirmed", "cancelled"] },
    payment_method: { type: String, default: "pay_winery" }

  },
  { timestamps: true }
);

const BookingModel = models.Booking || model<Booking>("Booking", bookingSchema);

export default BookingModel;