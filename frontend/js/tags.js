router.get("/by-tag/:clientId", async (req, res) => {

  const data = await getClientCosts(req.params.clientId)

  const grouped = {}

  data.forEach(d => {

    const tag = d.tags?.Application || "Unassigned"

    if (!grouped[tag]) grouped[tag] = 0

    grouped[tag] += Number(d.cost || 0)

  })

  res.json(grouped)
})