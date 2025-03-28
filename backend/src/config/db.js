const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://sakshammaheshwari18:Saksham@cluster0.eqwnrtf.mongodb.net/CraneOpedia?retryWrites=true&w=majority&appName=Cluster0');
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(` Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
