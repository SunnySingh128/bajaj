const express = require('express');
const cors = require('cors');
const bfhlRouter = require('./routes/bfhl');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all requests to support frontend integration
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve API routes
app.use('/bfhl', bfhlRouter);

// Root route check
app.get('/', (req, res) => {
  res.status(200).json({
    message: "Welcome to the Chitkara Full Stack Engineering Challenge Backend API",
    endpoints: {
      post_bfhl: "POST /bfhl - Submit edges data to parse and build trees",
      get_bfhl: "GET /bfhl - Get operation details"
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running in production mode on port ${PORT}`);
});
