import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  mobile: string;
  name: string;
  password: string;
  token?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      trim: true,
      match: [/^\d{10}$/, 'Mobile number must be 10 digits'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Don't return password by default
    },
    token: {
      type: String,
      select: false, // Don't return token by default
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model re-compilation
let User: mongoose.Model<IUser>;

try {
  User = mongoose.model<IUser>('User');
} catch (error) {
  User = mongoose.model<IUser>('User', UserSchema);
}

export default User;
