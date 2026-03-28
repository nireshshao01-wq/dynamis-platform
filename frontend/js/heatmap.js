function generateHeatmap(data) {

  return data.map(d => ({
    x: d.category,
    y: d.subcategory,
    value: d.cost
  }))
}