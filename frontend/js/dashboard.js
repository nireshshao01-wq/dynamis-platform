console.log("🔥 DYNAMIS v2.0 Dashboard Loaded")

let lastData = null
let cfoMode = false

/* =========================
   FORMATTERS
========================= */
function r(v){
  return "R " + Number(v || 0).toLocaleString("en-ZA")
}

/* =========================
   ANIMATE COUNTER
========================= */
function animateCounter(id, value){

  const el = document.getElementById(id)
  if(!el) return

  el.classList.remove("skeleton")

  let start = 0
  const duration = 1200
  const stepTime = 16
  const steps = duration / stepTime
  const increment = value / steps

  let current = 0

  const interval = setInterval(()=>{
    current += increment

    if(current >= value){
      current = value
      clearInterval(interval)
    }

    el.innerText = r(Math.floor(current))
  }, stepTime)
}

/* =========================
   CFO MODE
========================= */
function toggleCFOMode(){

  cfoMode = !cfoMode

  document.body.classList.toggle("cfo-mode")

  const label = document.getElementById("modeLabel")
  if(label){
    label.innerText = cfoMode ? "CFO MODE" : "ENGINEER MODE"
  }

  if(lastData){
    render(lastData)
  }
}

/* =========================
   RENDER
========================= */
function render(d){

  console.log("📊 DASHBOARD INPUT:", d)

  /* FALLBACK */
  if(!d || Object.keys(d).length === 0){
    console.warn("⚠️ Using DEMO dashboard data")

    d = {
      totalCost: 1200000,
      potentialSavings: 250000,
      riskScore: 32,
      confidence: 87,
      cfoImpact: { recoverableValue: 900000 },
      trend: [80000, 90000, 110000, 70000],
      vendors: { AWS: 60, Azure: 25, GCP: 15 },
      categoryBreakdown: {},
      resources: []
    }
  }

  lastData = d

  /* KPI */
  animateCounter("valueTotal", d.totalCost || 0)
  animateCounter("valueSavings", d.potentialSavings || 0)

  const riskEl = document.getElementById("valueRisk")
  if(riskEl){
    riskEl.classList.remove("skeleton")
    riskEl.innerText = (d.riskScore ?? 0) + "%"
  }

  const confEl = document.getElementById("valueConfidence")
  if(confEl){
    confEl.classList.remove("skeleton")
    confEl.innerText = (d.confidence ?? 0) + "%"
  }

  const cfoVal =
    d.cfoImpact?.recoverableValue ||
    (d.potentialSavings ? d.potentialSavings * 36 : 0)

  animateCounter("cfoValue", cfoVal)

  renderCharts(d)
  renderAI(d)

  /* 🔥 NEW v2.0 */
  renderCategoryBreakdown(d)
  renderBehaviourInsights(d)
  renderTopWaste(d)
}

/* =========================
   CATEGORY BREAKDOWN (NEW)
========================= */
function renderCategoryBreakdown(d){

  const container = document.getElementById("categoryBreakdown")
  if(!container) return

  const data = d.categoryBreakdown || {}

  if(Object.keys(data).length === 0){
    container.innerHTML = `<div class="empty">No category data</div>`
    return
  }

  container.innerHTML = Object.entries(data).map(([cat, subs]) => `

    <div class="cat-block">
      <h3>${cat}</h3>

      ${Object.entries(subs).map(([sub, val]) => `
        <div class="row">
          <span>${sub}</span>
          <span>${r(val)}</span>
        </div>
      `).join("")}

    </div>

  `).join("")
}

/* =========================
   BEHAVIOUR INSIGHTS (NEW)
========================= */
function renderBehaviourInsights(d){

  const el = document.getElementById("behaviourInsights")
  if(!el) return

  const data = d.resources || []

  const result = {
    Waste: 0,
    Optimisable: 0,
    Elastic: 0,
    "Risk Spend": 0
  }

  data.forEach(item => {
    if(result[item.behaviour] !== undefined){
      result[item.behaviour] += Number(item.cost || 0)
    }
  })

  el.innerHTML = Object.entries(result).map(([k,v]) => `
    <div class="row">
      <span>${k}</span>
      <span>${r(v)}</span>
    </div>
  `).join("")
}

/* =========================
   TOP WASTE DRIVERS (NEW)
========================= */
function renderTopWaste(d){

  const el = document.getElementById("topWaste")
  if(!el) return

  const data = (d.resources || [])
    .filter(r => r.behaviour === "Waste")
    .sort((a,b) => b.cost - a.cost)
    .slice(0,5)

  if(data.length === 0){
    el.innerHTML = `<div class="empty">No waste detected</div>`
    return
  }

  el.innerHTML = data.map(i => `
    <div class="row">
      <span>${i.service || "Unknown"}</span>
      <span>${r(i.cost)}</span>
    </div>
  `).join("")
}

/* =========================
   CHARTS
========================= */
function renderCharts(d){

  console.log("📊 Rendering charts...")

  const trend = d.trend || [80000, 90000, 110000, 70000]

  const vendors = d.vendors || {
    AWS: 60,
    Azure: 25,
    GCP: 15
  }

  if(window.spendChart) window.spendChart.destroy()
  if(window.vendorChart) window.vendorChart.destroy()
  if(window.savingsChart) window.savingsChart.destroy()

  /* SPEND TREND */
  const spendCanvas = document.getElementById("spendChart")
  if(spendCanvas){
    window.spendChart = new Chart(spendCanvas, {
      type: "line",
      data: {
        labels: ["Jan","Feb","Mar","Apr"],
        datasets: [{
          data: trend,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59,130,246,0.2)",
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        plugins: { legend: { display:false } },
        responsive:true,
        maintainAspectRatio:false
      }
    })
  }

  /* VENDOR */
  const vendorCanvas = document.getElementById("vendorChart")
  if(vendorCanvas){
    window.vendorChart = new Chart(vendorCanvas, {
      type: "doughnut",
      data: {
        labels: Object.keys(vendors),
        datasets: [{
          data: Object.values(vendors),
          backgroundColor: ["#3b82f6","#ec4899","#f59e0b"]
        }]
      },
      options: {
        plugins: { legend: { position:"bottom" } },
        responsive:true
      }
    })
  }

  /* SAVINGS */
  const savingsCanvas = document.getElementById("savingsTrend")
  if(savingsCanvas){
    window.savingsChart = new Chart(savingsCanvas, {
      type: "bar",
      data: {
        labels: ["Jan","Feb","Mar","Apr"],
        datasets: [{
          data: trend.map(v => v * 0.2),
          backgroundColor: "#10b981"
        }]
      },
      options: {
        plugins: { legend: { display:false } },
        responsive:true
      }
    })
  }
}

/* =========================
   AI PANEL
========================= */
function renderAI(d){

  const el = document.getElementById("aiInsights")
  if(!el) return

  el.innerHTML = `
    <div style="font-size:14px">
      💡 Potential savings of <b>${r(d.potentialSavings)}</b><br><br>
      ⚠️ Risk score at <b>${d.riskScore}%</b><br><br>
      📈 Confidence level <b>${d.confidence}%</b>
    </div>
  `
}

/* =========================
   INIT
========================= */
async function initDashboard(){

  console.log("🚀 Initialising dashboard...")

  let data = {}

  try{
    const res = await fetch("/api/dashboard-data?client=1")

    if(!res.ok) throw new Error("API failed")

    data = await res.json()

    console.log("📊 API DATA:", data)

  }catch(e){
    console.warn("⚠️ Using DEMO DATA")

    data = {
      totalCost: 1200000,
      potentialSavings: 250000,
      riskScore: 32,
      confidence: 87,
      cfoImpact: { recoverableValue: 900000 },
      trend: [80000, 90000, 110000, 70000],
      vendors: { AWS: 60, Azure: 25, GCP: 15 },
      categoryBreakdown: {},
      resources: []
    }
  }

  render(data)
}

/* RUN */
initDashboard()