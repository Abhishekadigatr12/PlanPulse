import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true, trim: true },
    password: { type: String, required: true },
    lastActiveDate: { type: String, default: null },
    streak: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
