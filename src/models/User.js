import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    fullname: { type: String, required: true },
    profilePicture: { type: String },
    oauthProviders: [
      {
        provider: { type: String },
        providerId: { type: String },
        connectedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
