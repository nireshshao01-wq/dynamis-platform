async function loadCategoryBreakdown(clientId) {

  const res = await fetch(`/api/costs/breakdown/${clientId}`)
  const data = await res.json()

  const container = document.getElementById("categoryBreakdown")

  container.innerHTML = Object.entries(data).map(([cat, subs]) => `

    <div class="cat-block">
      <h3>${cat}</h3>

      ${Object.entries(subs).map(([sub, val]) => `
        <div class="row">
          <span>${sub}</span>
          <span>R ${val.toLocaleString()}</span>
        </div>
      `).join("")}

    </div>

  `).join("")
}