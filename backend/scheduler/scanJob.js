const cron = require("node-cron")

function startFinopsScheduler() {

  console.log("FinOps scheduler initialized")

  /* run every 10 minutes */

  cron.schedule("*/10 * * * *", () => {

    console.log("Running FinOps scan at:", new Date().toISOString())

    /* future automation logic goes here */

  })

}

module.exports = startFinopsScheduler