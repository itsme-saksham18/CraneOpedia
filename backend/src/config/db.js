const mongoose = require(mongoose);
const connectDB = async () => {


    try {
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/CraneOpedia');
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  };

connectDB();