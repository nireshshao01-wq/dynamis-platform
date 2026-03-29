const express = require("express");
const router = express.Router();

// Mock clients data for demo
const mockClients = [
  { id: 1, name: "TechCorp - AWS", cloud: "AWS", industry: "Technology" },
  { id: 2, name: "FinanceInc - Azure", cloud: "Azure", industry: "Finance" },
  { id: 3, name: "HealthPlus - GCS", cloud: "GCS", industry: "Healthcare" }
];

// GET ALL CLIENTS
router.get("/", (req, res) => {
  console.log("[CLIENTS] Returning mock clients");
  res.json(mockClients);
});

// CREATE NEW CLIENT
router.post("/", (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
