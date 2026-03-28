router.get("/breakdown/:clientId", async (req, res) => {

  const data = await getClientCosts(req.params.clientId)

  const grouped = {}

  data.forEach(item => {

    if (!grouped[item.category]) {
      grouped[item.category] = {}
    }

    if (!grouped[item.category][item.subcategory]) {
      grouped[item.category][item.subcategory] = 0
    }

    grouped[item.category][item.subcategory] += Number(item.cost || 0)

  })

  res.json(grouped)
})