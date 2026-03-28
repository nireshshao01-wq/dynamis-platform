// THEME TOGGLE
function toggleTheme(){
  const current = document.body.classList.toggle("light")
  localStorage.setItem("theme", current ? "light" : "dark")
}

// LOAD THEME
(function(){
  const saved = localStorage.getItem("theme")
  if(saved === "light"){
    document.body.classList.add("light")
  }
})()