const express = require('express');
const router = express.Router();
const { processEdges } = require('../utils/treeBuilder');

// POST /bfhl - Process hierarchy data
router.post('/', (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        is_success: false,
        error: "Missing 'data' field in request body."
      });
    }

    if (!Array.isArray(data)) {
      return res.status(400).json({
        is_success: false,
        error: "'data' field must be an array of strings."
      });
    }

    const result = processEdges(data);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in POST /bfhl:", error);
    return res.status(500).json({
      is_success: false,
      error: "Internal Server Error"
    });
  }
});

// GET /bfhl - Simple status check
router.get('/', (req, res) => {
  return res.status(200).json({
    operation_code: 1,
    status: "active",
    message: "Chitkara Full Stack Challenge API is running."
  });
});

module.exports = router;
