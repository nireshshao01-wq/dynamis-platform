function getTopWaste(data) {

  return data
    .filter(d => d.behaviour === "Waste")
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5)
}