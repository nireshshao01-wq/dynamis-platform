const supabase = window.supabase.createClient(
  "https://YOUR_PROJECT.supabase.co",
  "YOUR_PUBLIC_ANON_KEY"
)

async function login(email,password){

  const { data, error } = await supabase.auth.signInWithPassword({
    email, password
  })

  if(error){
    alert(error.message)
    return
  }

  localStorage.setItem("token", data.session.access_token)

  window.location = "/dashboard.html"
}

function getToken(){
  return localStorage.getItem("token")
}