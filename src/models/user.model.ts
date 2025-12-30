import { Schema, model, models, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth?: Date;
  createdAt: Date;
  role: "customer" | "winery" | "admin";
  wineryId?: Schema.Types.ObjectId;
  isActive: boolean;
  marketingConsent: boolean;
  smsConsent: boolean;
  visitedWineries: string[]; // Digital Passport Stamps

  // Age Verification (Twilio Compliance)
  ageVerified?: boolean;
  ageVerificationDate?: Date;
  ageVerificationMethod?: 'dob' | 'id_verification' | 'third_party';

  // SMS Opt-In with Age Confirmation (Twilio Compliance)
  smsOptIn?: boolean;
  smsOptInDate?: Date;
  smsOptInAgeConfirmed?: boolean;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    dateOfBirth: { type: Date },
    role: {
      type: String,
      default: "customer",
      enum: ["customer", "winery", "admin"],
      required: true
    },
    wineryId: { type: Schema.Types.ObjectId, ref: "Winery" },
    isActive: { type: Boolean, default: true },
    marketingConsent: { type: Boolean, default: false },
    smsConsent: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },

    // Age Verification (Twilio Compliance)
    ageVerified: { type: Boolean, default: false },
    ageVerificationDate: { type: Date },
    ageVerificationMethod: {
      type: String,
      enum: ['dob', 'id_verification', 'third_party'],
      default: 'dob'
    },

    // SMS Opt-In with Age Confirmation (Twilio Compliance)
    smsOptIn: { type: Boolean, default: false },
    smsOptInDate: { type: Date },
    smsOptInAgeConfirmed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> = models.User || model<IUser>("User", UserSchema);

export default User;
