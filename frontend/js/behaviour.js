function calculateBehaviour(data) {

  const result = {
    Waste: 0,
    Optimisable: 0,
    Elastic: 0,
    Risk: 0
  }

  data.forEach(d => {
    if (result[d.behaviour] !== undefined) {
      result[d.behaviour] += Number(d.cost || 0)
    }
  })

  return result
}