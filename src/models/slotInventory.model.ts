import mongoose, { Schema, model, models } from "mongoose";

export interface ISlotInventory {
  wineryId: mongoose.Types.ObjectId;
  date: Date;
  timeSlot: string;
  totalCapacity: number;
  bookedCapacity: number;
  availableCapacity: number;
  status: "available" | "limited" | "full" | "blocked";
  bookings: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const SlotInventorySchema = new Schema<ISlotInventory>(
  {
    wineryId: { 
      type: Schema.Types.ObjectId, 
      ref: "Winery", 
      required: true,
      index: true 
    },
    date: { 
      type: Date, 
      required: true,
      index: true 
    },
    timeSlot: { 
      type: String, 
      required: true 
    },
    totalCapacity: { 
      type: Number, 
      required: true, 
      min: 1 
    },
    bookedCapacity: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    availableCapacity: { 
      type: Number, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ["available", "limited", "full", "blocked"],
      default: "available"
    },
    bookings: [{ 
      type: Schema.Types.ObjectId, 
      ref: "Booking" 
    }],
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    updatedAt: { 
      type: Date, 
      default: Date.now 
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
SlotInventorySchema.index({ wineryId: 1, date: 1, timeSlot: 1 }, { unique: true });

// Pre-save middleware to calculate available capacity and status
SlotInventorySchema.pre("save", function (next) {
  this.availableCapacity = this.totalCapacity - this.bookedCapacity;
  
  if (this.status !== "blocked") {
    if (this.availableCapacity === 0) {
      this.status = "full";
    } else if (this.availableCapacity <= this.totalCapacity * 0.3) {
      this.status = "limited";
    } else {
      this.status = "available";
    }
  }
  
  next();
});

// Static method to check availability
SlotInventorySchema.statics.checkAvailability = async function(
  wineryId: mongoose.Types.ObjectId,
  date: Date,
  timeSlot: string,
  requiredCapacity: number = 1
) {
  const slot = await this.findOne({ wineryId, date, timeSlot });
  
  if (!slot) {
    return { available: false, reason: "Slot not found" };
  }
  
  if (slot.status === "blocked") {
    return { available: false, reason: "Slot is blocked" };
  }
  
  if (slot.availableCapacity < requiredCapacity) {
    return { 
      available: false, 
      reason: `Only ${slot.availableCapacity} spots available, ${requiredCapacity} required` 
    };
  }
  
  return { available: true, slot };
};

// Static method to reserve capacity
SlotInventorySchema.statics.reserveCapacity = async function(
  wineryId: mongoose.Types.ObjectId,
  date: Date,
  timeSlot: string,
  capacity: number,
  bookingId: mongoose.Types.ObjectId
) {
  const slot = await this.findOne({ wineryId, date, timeSlot });
  
  if (!slot) {
    throw new Error("Slot not found");
  }
  
  if (slot.availableCapacity < capacity) {
    throw new Error("Insufficient capacity");
  }
  
  slot.bookedCapacity += capacity;
  slot.bookings.push(bookingId);
  await slot.save();
  
  return slot;
};

// Static method to release capacity (for cancellations)
SlotInventorySchema.statics.releaseCapacity = async function(
  wineryId: mongoose.Types.ObjectId,
  date: Date,
  timeSlot: string,
  capacity: number,
  bookingId: mongoose.Types.ObjectId
) {
  const slot = await this.findOne({ wineryId, date, timeSlot });
  
  if (!slot) {
    throw new Error("Slot not found");
  }
  
  slot.bookedCapacity = Math.max(0, slot.bookedCapacity - capacity);
  slot.bookings = slot.bookings.filter(id => !id.equals(bookingId));
  await slot.save();
  
  return slot;
};

const SlotInventory = models.SlotInventory || model<ISlotInventory>("SlotInventory", SlotInventorySchema);

export default SlotInventory;
