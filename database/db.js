const mongoose = require("mongoose");

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDb connected successfully");
  } catch (e) {
    console.log("MongoDB Connection Failed");
    process.exit(1);
  }
};
module.exports = connectToDB;
