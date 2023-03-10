import { Schema, model, models, Model } from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface IUser extends Document {
  _id?: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 3. Create a Model.
export const UserModel =
  (models.User as Model<IUser>) || model<IUser>("User", userSchema);
