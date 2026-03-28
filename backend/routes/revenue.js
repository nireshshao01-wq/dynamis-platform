const express = require("express")
const router = express.Router()

/* =========================
   DEMO DATA GENERATOR
========================= */

function getDemoRevenue() {

  return {
    totalRevenue: 2450000,
    monthlyProjection: 380000,
    activeDeals: 12,
    avgDeal: 85000,

    pipeline: {
      prospect: [
        { name: "Standard Bank", value: 120000 },
        { name: "MTN", value: 90000 }
      ],
      demo: [
        { name: "Discovery", value: 150000 }
      ],
      proposal: [
        { name: "Nedbank", value: 300000 }
      ],
      closed: [
        { name: "Sekela Xabiso", value: 500000 }
      ]
    }
  }
}

/* =========================
   GET REVENUE DASHBOARD
========================= */

router.get("/", async (req, res) => {

  try {

    // 🔥 TEMP: Always return demo data if no DB yet
    const data = getDemoRevenue()

    res.json(data)

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to load revenue" })
  }

})

module.exports = router