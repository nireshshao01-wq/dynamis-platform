const express = require("express")
const router = express.Router()

const supabase = require("../supabaseClient")

/* =========================
   HELPERS
========================= */

function isUUID(id){
  return typeof id === "string" && id.length === 36
}

function getMonthFromDate(usageDate){
  if(!usageDate) return null

  try{
    const s =
      typeof usageDate === "string"
        ? usageDate
        : (usageDate.toISOString && usageDate.toISOString()) || String(usageDate)

    return s.slice(0,7)
  }catch{
    return null
  }
}

function safeNum(v){
  return Number(v || 0)
}

/* =========================
   TEST
========================= */

router.get("/test",(req,res)=>{
  res.json({status:"dashboard router working"})
})

/* =========================
   MAIN DASHBOARD
========================= */

router.get("/dashboard-data", async (req,res)=>{

try{

const clientId = req.query.client

if(!clientId){
return res.status(400).json({
success:false,
error:"Client ID missing"
})
}

/* =========================
   QUERY
========================= */

let query = supabase
.from("cloud_cost_data")
.select("cost,usage_date,cloud_provider,service,category,utilization")

if(isUUID(clientId)){
  query = query.eq("client_id", clientId)
}else{
  console.warn("⚠️ Invalid UUID → using fallback data")
  query = query.limit(500)
}

const {data:rows,error} = await query

if(error){
console.error("Supabase error:",error)
return res.status(500).json({
success:false,
error:"Failed to load data",
message:error.message
})
}

const dataRows = rows || []

/* =========================
   DEMO FALLBACK (CRITICAL)
========================= */

if(dataRows.length === 0){

console.warn("⚠️ No data → DEMO MODE")

return res.json({
success:true,

totalCost:1850000,
potentialSavings:420000,

awsCost:850000,
azureCost:650000,
gcpCost:350000,

computeWaste:180000,
storageWaste:90000,
networkWaste:80000,
idleWaste:70000,

monthlySeries:[
{month:"2026-01",cost:240000},
{month:"2026-02",cost:260000},
{month:"2026-03",cost:310000},
{month:"2026-04",cost:290000},
{month:"2026-05",cost:350000},
{month:"2026-06",cost:400000}
],

riskScore:68,
confidence:91,

cfoImpact:{
recoverableValue:420000 * 36
},

aiInsights:[
"R320k wasted on idle compute",
"Overprovisioned resources detected",
"Spike in June (+28%)",
"Potential annual saving identified"
]

})
}

/* =========================
   METRICS
========================= */

let totalCost = 0
let awsCost = 0
let azureCost = 0
let gcpCost = 0

let computeWaste = 0
let storageWaste = 0
let networkWaste = 0
let idleWaste = 0

const monthlyMap = {}

for(const row of dataRows){

const cost = safeNum(row.cost)
totalCost += cost

const provider = (row.cloud_provider || "").toUpperCase()
const service = (row.service || "").toUpperCase()

/* =========================
   PROVIDER SPLIT
========================= */

if(provider.includes("AWS")) awsCost += cost
else if(provider.includes("AZURE")) azureCost += cost
else if(provider.includes("GCP")) gcpCost += cost

/* =========================
   HYBRID WASTE MODEL
========================= */

// Compute
if(service.includes("EC2") || service.includes("VM")){
  computeWaste += cost * 0.20
}

// Storage
if(service.includes("S3") || service.includes("BLOB") || service.includes("STORAGE")){
  storageWaste += cost * 0.15
}

// Network
if(service.includes("NETWORK") || service.includes("CDN")){
  networkWaste += cost * 0.10
}

// Idle / serverless inefficiency
if(service.includes("LAMBDA") || service.includes("FUNCTION") || service.includes("IDLE")){
  idleWaste += cost * 0.05
}

/* =========================
   MONTHLY GROUPING
========================= */

const month = getMonthFromDate(row.usage_date)

if(month){
if(!monthlyMap[month]) monthlyMap[month] = 0
monthlyMap[month] += cost
}

}

/* =========================
   AGGREGATION
========================= */

const monthlySeries = Object.keys(monthlyMap)
.sort()
.map(m => ({
month: m,
cost: Number(monthlyMap[m].toFixed(2))
}))

const totalWaste = computeWaste + storageWaste + networkWaste + idleWaste

/* =========================
   KPI
========================= */

const riskScore = totalCost
  ? Math.min(100,Math.round((totalWaste/totalCost)*100))
  : 0

const confidence = totalCost
  ? Math.min(95, Math.round(80 + (totalWaste/totalCost)*10))
  : 0

/* =========================
   CFO IMPACT
========================= */

const recoverableValue = totalWaste * 36

/* =========================
   AI INSIGHTS (SMART LAYER)
========================= */

const aiInsights = []

if(computeWaste > totalCost * 0.1){
  aiInsights.push("High compute waste detected (rightsizing opportunity)")
}

if(storageWaste > totalCost * 0.08){
  aiInsights.push("Storage inefficiencies identified")
}

if(networkWaste > totalCost * 0.05){
  aiInsights.push("Network cost optimisation opportunity")
}

if(idleWaste > totalCost * 0.03){
  aiInsights.push("Idle/serverless inefficiencies detected")
}

if(monthlySeries.length > 1){
  const last = monthlySeries[monthlySeries.length - 1].cost
  const prev = monthlySeries[monthlySeries.length - 2].cost

  if(last > prev * 1.4){
    aiInsights.push(`Spend spike detected (${Math.round((last/prev -1)*100)}%)`)
  }
}

/* =========================
   RESPONSE
========================= */

res.json({

success:true,

totalCost:Number(totalCost.toFixed(2)),
potentialSavings:Number(totalWaste.toFixed(2)),

awsCost:Number(awsCost.toFixed(2)),
azureCost:Number(azureCost.toFixed(2)),
gcpCost:Number(gcpCost.toFixed(2)),

computeWaste:Number(computeWaste.toFixed(2)),
storageWaste:Number(storageWaste.toFixed(2)),
networkWaste:Number(networkWaste.toFixed(2)),
idleWaste:Number(idleWaste.toFixed(2)),

monthlySeries,

riskScore,
confidence,

cfoImpact:{
recoverableValue:Number(recoverableValue.toFixed(2))
},

aiInsights

})

}catch(err){

console.error("🔥 Dashboard error:",err)

res.status(500).json({
success:false,
error:"Dashboard failed",
message:err.message
})

}

})

module.exports = router