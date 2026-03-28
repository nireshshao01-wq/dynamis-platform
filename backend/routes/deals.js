const express = require("express")
const router = express.Router()

const supabase = require("../supabaseClient")
const auth = require("../middleware/auth")

/* =========================
   GET DEALS (SCOPED)
========================= */
router.get("/", auth, async (req,res)=>{

  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("tenant_id", req.tenant_id)

  if(error) return res.status(500).json({error:error.message})

  res.json(data)
})

/* =========================
   SYNC DEAL
========================= */
router.post("/sync", auth, async (req,res)=>{

  const { client_id, name, value } = req.body

  const { data:existing } = await supabase
    .from("deals")
    .select("*")
    .eq("client_id", client_id)
    .eq("tenant_id", req.tenant_id)
    .single()

  if(!existing){

    const { data, error } = await supabase
      .from("deals")
      .insert([{
        client_id,
        name,
        value,
        tenant_id: req.tenant_id,
        stage:"prospect"
      }])
      .select()

    if(error) return res.status(500).json({error:error.message})

    return res.json({created:true,data})
  }

  if(Number(existing.value) !== Number(value)){

    const { data, error } = await supabase
      .from("deals")
      .update({ value })
      .eq("id", existing.id)

    if(error) return res.status(500).json({error:error.message})

    return res.json({updated:true})
  }

  res.json({message:"no change"})
})

/* =========================
   UPDATE DEAL
========================= */
router.put("/:id", auth, async (req,res)=>{

  const { id } = req.params
  const { stage, value, notes } = req.body

  const { data, error } = await supabase
    .from("deals")
    .update({ stage, value, notes })
    .eq("id", id)
    .eq("tenant_id", req.tenant_id)

  if(error) return res.status(500).json({error:error.message})

  res.json(data)
})

module.exports = router