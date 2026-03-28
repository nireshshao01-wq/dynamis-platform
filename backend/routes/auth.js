console.log("🔥 AUTH ROUTE LOADED")

const express = require("express")
const router = express.Router()

const supabase = require("../supabaseClient")

/* =========================
   LOGIN
========================= */

router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" })
    }

    // 🔥 DEMO USERS (replace later with real auth)
    const demoUsers = [
      {
        email: "admin@dynamis.com",
        password: "1234",
        name: "Admin User"
      }
    ]

    const user = demoUsers.find(u =>
      u.email === email && u.password === password
    )

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // 🔥 GET FIRST CLIENT (for now)
    const { data: clients, error } = await supabase
      .from("clients")
      .select("*")
      .limit(1)

    if (error || !clients || clients.length === 0) {
      return res.status(500).json({ error: "No clients found" })
    }

    const client = clients[0]

    return res.json({
      token: "demo-token",
      user: {
        name: user.name,
        email: user.email
      },
      clientId: client.id
    })

  } catch (err) {

    console.error("Login error:", err)

    res.status(500).json({
      error: "Login failed",
      message: err.message
    })
  }

})

module.exports = router