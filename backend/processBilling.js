const { mapService } = require("./mappingEngine")

function enrichBillingData(rows) {

  return rows.map(r => {

    const service =
      r.service ||
      r.meterCategory ||
      r["service.description"] ||
      ""

    const mapped = mapService(service)

    return {
      ...r,
      category: mapped.category,
      subcategory: mapped.subcategory,
      behaviour: mapped.behaviour
    }

  })
}

module.exports = { enrichBillingData }