/* -----------------------------
LOAD ENVIRONMENT VARIABLES
----------------------------- */
require("dotenv").config({ path: __dirname + "/.env" })

/* -----------------------------
IMPORTS
----------------------------- */
const express = require("express")
const cors = require("cors")
const path = require("path")

const app = express()

/* -----------------------------
MIDDLEWARE
----------------------------- */
app.use(cors())
app.use(express.json())

/* -----------------------------
FRONTEND STATIC FILES
----------------------------- */
const frontendPath = path.join(__dirname, "..", "frontend")

app.use(express.static(frontendPath))

console.log("Frontend served from:", frontendPath)

/* -----------------------------
🔥 ROUTE FIXES (IMPORTANT)
----------------------------- */

// Default route → dashboard
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "dashboard.html"))
})

// Clean routes (NO .html needed)
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(frontendPath, "dashboard.html"))
})

app.get("/analytics", (req, res) => {
  res.sendFile(path.join(frontendPath, "analytics.html"))
})

app.get("/clients", (req, res) => {
  res.sendFile(path.join(frontendPath, "clients.html"))
})

app.get("/revenue", (req, res) => {
  res.sendFile(path.join(frontendPath, "revenue.html"))
})

/* -----------------------------
API HEALTH CHECK
----------------------------- */
app.get("/api/health", (req, res) => {
  res.json({
    status: "DYNAMIS API running",
    time: new Date()
  })
})

/* -----------------------------
ROUTES
----------------------------- */

// 🔥 AUTH (KEEP FIRST)
const authRoute = require("./routes/auth")

// CORE ROUTES
const uploadRoute = require("./routes/upload")
const clientsRoute = require("./routes/clients")
const dashboardRoute = require("./routes/dashboard")

// ANALYTICS / FINOPS
const opportunitiesRoute = require("./routes/opportunities")
const anomaliesRoute = require("./routes/anomalies")
const reportRoute = require("./routes/report")
const analyticsRoute = require("./routes/analytics")
const finopsScoreRoute = require("./routes/finopsScore")
const savingsRoute = require("./routes/savings")

// 🔥 NEW: DEALS PIPELINE ROUTE
const dealsRoute = require("./routes/deals")

/* -----------------------------
REGISTER ROUTES
----------------------------- */

// AUTH
app.use("/api/auth", authRoute)

// CORE
app.use("/api/upload", uploadRoute)
app.use("/api/clients", clientsRoute)

// Dashboard API
app.use("/api", dashboardRoute)

// PIPELINE
app.use("/api/deals", dealsRoute)

// ANALYTICS
app.use("/api/opportunities", opportunitiesRoute)
app.use("/api/anomalies", anomaliesRoute)
app.use("/api/report", reportRoute)

app.use("/api/analytics", analyticsRoute)
app.use("/api/finops-score", finopsScoreRoute)
app.use("/api/savings", savingsRoute)

/* -----------------------------
FINOPS AUTOMATION
----------------------------- */
try {
  const startFinopsScheduler = require("./scheduler/scanJob")
  startFinopsScheduler()
  console.log("DYNAMIS FinOps scheduler started")
} catch (err) {
  console.log("Scheduler not started:", err.message)
}

/* -----------------------------
START SERVER
----------------------------- */
const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log("===================================")
  console.log("DYNAMIS backend running on port", PORT)
  console.log("===================================")
})
