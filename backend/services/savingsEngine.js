const supabase = require("../supabaseClient")

async function getSavingsOpportunities(clientId, options = {}) {

  const limit = options.limit || 10

  try {

    const { data, error } = await supabase
      .from("cloud_cost_data")
      .select("service,cost,utilization")
      .eq("client_id", clientId)

    if (error) throw error

    const rows = data || []

    let opportunities = []
    let totalPotentialSavings = 0

    for (const r of rows) {

      const cost = Number(r.cost || 0)
      const utilization = Number(r.utilization || 0)

      if (utilization < 40 && cost > 0) {

        const savings = cost * 0.30

        opportunities.push({
          service: r.service,
          potentialSavings: Number(savings.toFixed(2)),
          recommendation: "Rightsize or shut down under-utilised resources"
        })

        totalPotentialSavings += savings
      }
    }

    opportunities = opportunities
      .sort((a,b)=>b.potentialSavings-a.potentialSavings)
      .slice(0,limit)

    return {
      opportunities,
      totalPotentialSavings:Number(totalPotentialSavings.toFixed(2))
    }

  } catch (err) {

    console.error("Savings engine error:",err)

    return {
      opportunities:[],
      totalPotentialSavings:0
    }

  }

}

module.exports = {
  getSavingsOpportunities
}
