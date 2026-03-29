// File: backend/routes/clients.js
const express = require("express");
const router = express.Router();

// Mock clients data
const mockClients = [
  { id: 1, name: "Client A", cloud: "AWS", industry: "Tech" },
  { id: 2, name: "Client B", cloud: "Azure", industry: "Finance" },
  { id: 3, name: "Client C", cloud: "GCS", industry: "Healthcare" }
];

// GET ALL CLIENTS
router.get("/", async (req, res) => {
  try {
    // Return mock clients immediately (no database needed)
    res.json(mockClients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// CREATE NEW CLIENT
router.post("/", async (req, res) => {
  try {
    const { name, cloud, industry } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: "Client name required" });
    }
    
    const newClient = {
      id: mockClients.length + 1,
      name,
      cloud,
      industry,
      created_at: new Date()
    };
    
    mockClients.push(newClient);
    res.json(newClient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
