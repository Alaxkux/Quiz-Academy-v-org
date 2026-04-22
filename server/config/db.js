/* ================================================================
   QUIZ ACADEMY — DATABASE CONNECTION
   Connects to MongoDB Atlas using Mongoose.
   Call connectDB() once at server startup.
   ================================================================ */

const mongoose = require('mongoose');

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('   Check your MONGODB_URI in .env');
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

module.exports = connectDB;
