const API = "/api"

document.addEventListener("DOMContentLoaded", load)

async function load(){

  const res = await fetch(API + "/dashboard-data?client=demo")
  const d = await res.json()

  new Chart(document.getElementById("vendorChart"),{
    type:"doughnut",
    data:{
      labels:["AWS","Azure","GCP"],
      datasets:[{
        data:[d.awsCost,d.azureCost,d.gcpCost]
      }]
    }
  })

  new Chart(document.getElementById("trendChart"),{
    type:"line",
    data:{
      labels:d.monthlySeries.map(x=>x.month),
      datasets:[{
        data:d.monthlySeries.map(x=>x.cost)
      }]
    }
  })
}