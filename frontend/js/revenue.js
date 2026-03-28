const API = "/api"

const r = v => "R " + Number(v||0).toLocaleString("en-ZA")
const STAGES = ["prospect","demo","proposal","closed"]

let refreshTimer = null

/* =========================
   🔐 AUTH HEADER (GLOBAL)
========================= */
function authHeaders(extra = {}) {
  return {
    ...extra,
    Authorization: "Bearer " + localStorage.getItem("token")
  }
}

document.addEventListener("DOMContentLoaded", init)

/* =========================
   INIT
========================= */
async function init(){

  if(refreshTimer) clearTimeout(refreshTimer)

  const clients = await loadClients()

  // 🔥 SYNC DEALS FROM DASHBOARD
  for(const c of clients){

    const dashboard = await loadDashboard(c.id)

    try{
      await fetch(API + "/deals/sync", {
        method:"POST",
        headers: authHeaders({
          "Content-Type":"application/json"
        }),
        body: JSON.stringify({
          client_id: c.id,
          name: c.name,
          value: dashboard.potentialSavings || 0
        })
      })
    }catch(e){
      console.warn("⚠️ Sync failed:", e)
    }
  }

  let deals = await loadDeals()

  console.log("🔥 DEALS FROM API:", deals)

  // 🔥 DEMO FALLBACK (GUARANTEED UI DATA)
  if(!deals || deals.length === 0){
    console.warn("⚠️ No deals → injecting demo data")

    deals = [
      { id:"1", name:"Standard Bank", value:120000, stage:"prospect" },
      { id:"2", name:"MTN", value:90000, stage:"prospect" },
      { id:"3", name:"Discovery", value:150000, stage:"demo" },
      { id:"4", name:"Nedbank", value:300000, stage:"proposal" },
      { id:"5", name:"Sekela Xabiso", value:500000, stage:"closed" }
    ]
  }

  renderPipeline(deals)
  renderKPIs(deals)

  refreshTimer = setTimeout(init, 15000)
}

/* =========================
   LOAD CLIENTS
========================= */
async function loadClients(){
  try{
    const res = await fetch(API + "/clients", {
      headers: authHeaders()
    })

    const data = await res.json()
    console.log("👥 CLIENTS:", data)

    return data

  }catch(e){
    console.warn("⚠️ Failed to load clients", e)
    return []
  }
}

/* =========================
   LOAD DASHBOARD
========================= */
async function loadDashboard(id){
  try{
    const res = await fetch(`${API}/dashboard-data?client=${id}`, {
      headers: authHeaders()
    })

    const data = await res.json()
    return data

  }catch(e){
    console.warn("⚠️ Dashboard load failed:", e)
    return { potentialSavings: 0 }
  }
}

/* =========================
   LOAD DEALS (DEBUG ENABLED)
========================= */
async function loadDeals(){
  try{
    const res = await fetch(API + "/deals", {
      headers: authHeaders()
    })

    if(!res.ok){
      console.warn("⚠️ API ERROR:", res.status)
      return []
    }

    const data = await res.json()

    console.log("📦 RAW DEAL RESPONSE:", data)

    return data

  }catch(e){
    console.warn("⚠️ Failed to load deals", e)
    return []
  }
}

/* =========================
   PIPELINE
========================= */
function renderPipeline(deals){

  STAGES.forEach(s=>{
    const el = document.getElementById(s)
    if(!el) return

    el.innerHTML = `
      <h3>${s.toUpperCase()}</h3>
      <div id="value-${s}" class="stage-value"></div>
    `
  })

  const totals = {prospect:0,demo:0,proposal:0,closed:0}

  deals.forEach(d=>{

    if(!totals.hasOwnProperty(d.stage)) return

    totals[d.stage] += Number(d.value || 0)

    const div = document.createElement("div")
    div.className = "deal"
    div.draggable = true
    div.id = d.id

    if(d.value > 150000){
      div.classList.add("hot")
    }

    div.ondragstart = e => {
      e.dataTransfer.setData("id", d.id)
    }

    div.innerHTML = `
      <strong>${d.name}</strong><br>
      ${r(d.value)}

      <input value="${d.value || ''}"
        onchange="updateDeal('${d.id}', { value: this.value })" />

      <input placeholder="Notes"
        onchange="updateDeal('${d.id}', { notes: this.value })" />
    `

    const stageEl = document.getElementById(d.stage)
    if(stageEl) stageEl.appendChild(div)
  })

  STAGES.forEach(s=>{
    const valEl = document.getElementById("value-"+s)
    if(valEl) valEl.innerText = r(totals[s])
  })
}

/* =========================
   DRAG DROP
========================= */
function allowDrop(ev){ ev.preventDefault() }

function drop(ev){
  ev.preventDefault()

  const id = ev.dataTransfer.getData("id")
  const stage = ev.currentTarget.id

  updateDeal(id, { stage })
}

/* =========================
   UPDATE DEAL
========================= */
async function updateDeal(id, updates){

  try{
    await fetch(API + "/deals/" + id, {
      method:"PUT",
      headers: authHeaders({
        "Content-Type":"application/json"
      }),
      body: JSON.stringify(updates)
    })
  }catch(e){
    console.warn("⚠️ Update failed:", e)
  }

  init()
}

/* =========================
   KPIs
========================= */
function renderKPIs(deals){

  const total = deals.reduce((a,b)=>a + Number(b.value||0),0)
  const count = deals.length || 1

  document.getElementById("totalRevenue").innerText = r(total)
  document.getElementById("monthlyProjection").innerText = r(total/12)
  document.getElementById("dealCount").innerText = deals.length
  document.getElementById("avgDeal").innerText = r(total/count)
}