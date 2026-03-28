// 🧠 AI INSIGHTS PANEL

function renderAIInsights(data){

  const box = document.getElementById("aiInsights")

  if(!box) return

  const items = [
    `💰 R${Number(data.savingsOpportunity).toLocaleString()} recoverable`,
    ...data.recommendations,
    ...data.anomalies
  ]

  box.innerHTML = ""

  let i = 0

  function typeLine(){
    if(i >= items.length) return

    const p = document.createElement("p")
    p.style.opacity = 0
    p.textContent = items[i]

    box.appendChild(p)

    setTimeout(()=>{
      p.style.transition = "0.5s"
      p.style.opacity = 1
    },100)

    i++
    setTimeout(typeLine, 600)
  }

  typeLine()

  document.getElementById("aiConfidence").innerText = data.confidence + "%"
}