const express = require('express')
const router = express.Router()

const supabase = require('../supabaseClient')
const generateReport = require('../services/reportGenerator')

router.get("/", async (req,res)=>{

try{

const clientId = req.query.client_id

if(!clientId){
  return res.status(400).json({ error: "client_id required" })
}

await generateReport(clientId, res)
  }

await generateReport(clientId,res)

}catch(err){

console.error(err)
res.status(500).json(err)

}

})

module.exports = router
