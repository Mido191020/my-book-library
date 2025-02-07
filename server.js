const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const bookRouter = require('./routes/bookRoutes');

// Get port from env file, fallback to 3000 if not set
const port = process.env.PORT || 3000;

// Updated MongoDB connection string format
const DB = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vpyvgv7.mongodb.net/bookSchelf?retryWrites=true&w=majority`;

// Simplified mongoose connection
mongoose
  .connect(DB)
  .then(() => {
    console.log('MongoDB connection successful!');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    // Fallback to local database if main connection fails
    mongoose.connect(process.env.DATABASE_LOCAL)
      .then(() => console.log('Connected to local database'))
      .catch((err) => console.error('Local database connection failed:', err));
  });

app.use(express.json());
app.use('/', bookRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
