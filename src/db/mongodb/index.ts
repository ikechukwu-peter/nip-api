import { mainLogger } from "../../logger";
import mongoose, { connect } from "mongoose";

//start DB
mongoose.set("strictQuery", true);
export const startMongoDB = async () => {
  connect(process.env.MONGODB_URI as string)
    .then(() => mainLogger.info("DB connected successfully"))
    .catch(() => mainLogger.error("DB not connected"));
};
