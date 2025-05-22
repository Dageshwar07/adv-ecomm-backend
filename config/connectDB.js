// config/connectDB.js
import mongoose from 'mongoose';
import dotenvFlow from 'dotenv-flow';

// Load .env files based on NODE_ENV (development/production)
dotenvFlow.config();

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME || 'ecomm';

  if (!mongoURI) {
    console.error('❌ MONGO_URI is missing in your environment variables');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      dbName,
  
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} [${dbName}]`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1); // Exit process if DB connection fails
  }
};

export default connectDB;
