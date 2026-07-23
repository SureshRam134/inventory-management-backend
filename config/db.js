import mongoose from "mongoose";

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB);
        console.log(" MongoDB Connected");
    } catch (error) {
        console.log(" MongoDB Connection Error");
        console.log(error);
        process.exit(1);
    }
};

export default connectDb;