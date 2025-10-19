const mongoose = require("mongoose");

let isConnected = false; // Track connection status

const connectDB = async () => {
  if (isConnected) {
    console.log("✅ MongoDB: Reusing existing connection");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }); 

    isConnected = conn.connections[0].readyState === 1;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = {
    connectDB
};
