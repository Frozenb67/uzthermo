const mongoose = require('mongoose');

async function connectDB() {
  try {
    const conn = await mongoose.connect("mongodb+srv://user:user123@cluster0.njzp0pk.mongodb.net/?appName=Cluster0");
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
