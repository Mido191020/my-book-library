const express = require('express');
const app = express();
const port = 3000;

// Middleware
app.use(express.json()); // For parsing application/json

// Example route
app.get('/', (req, res) => {
  res.send('Welcome to My Book Library!');
});

// Add routes
const bookRoutes = require('./routes/bookRoutes');
app.use('/api/books', bookRoutes);

// Start server
app.listen(port, () => {  
  console.log("Server is running ")
});
