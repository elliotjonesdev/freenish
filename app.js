const cfg=window.FREENISH_CONFIG;
const client=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_PUBLISHABLE_KEY);
let selectedCategory="All", listings=[];
const state={style:"All",material:"All",distance:5};
const feed=document.querySelector("#feed"),empty=document.querySelector("#empty"),loading=document.querySelector("#loading");
const searchInput=document.querySelector("#searchInput"),sortSelect=document.querySelector("#sortSelect");
async function loadListings(){
  try{
    const {data,error}=await client.from("listings").select("*").eq("active",true).order("added_at",{ascending:false});
    if(error)throw error;
    const now=Date.now();
    listings=(data||[]).filter(x=>!x.expires_at||new Date(x.expires_at).getTime()>now);
    loading.hidden=true;render();
  }catch(e){console.error(e);loading.textContent="Couldn't load today's finds. Check the Supabase key and RLS policy.";}
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function ago(v){const m=Math.max(0,Math.round((Date.now()-new Date(v).getTime())/60000));return m<1?"just now":m<60?`${m} min ago`:m<1440?`${Math.round(m/60)} hr ago`:`${Math.round(m/1440)} day ago`;}
function render(){
 let d=listings.filter(x=>(selectedCategory==="All"||x.category===selectedCategory)&&(state.style==="All"||x.style===state.style)&&(state.material==="All"||x.material===state.material)&&Number(x.distance||0)<=state.distance&&(!searchInput.value||(`${x.title} ${x.category} ${x.style} ${x.material} ${x.colour}`).toLowerCase().includes(searchInput.value.toLowerCase())));
 if(sortSelect.value==="distance")d.sort((a,b)=>Number(a.distance)-Number(b.distance));
 else d.sort((a,b)=>new Date(b.added_at)-new Date(a.added_at));
 feed.innerHTML=d.map(x=>`<article class="card"><div class="card-top">${x.freenish_pick?'<span class="badge">★ FREENISH PICK</span>':'<span></span>'}<span class="added">Added ${ago(x.added_at)}</span></div><h2 class="title">${esc(x.title)}</h2><div class="meta">${esc([x.material,x.style,x.colour].filter(Boolean).join(" · "))}</div><div class="meta">⌖ ${esc(x.category)} · ${esc(x.location||"Newport")} · ${Number(x.distance||0)} miles</div><div class="free-row"><span class="free">FREE</span><a class="original" href="${esc(x.original_url||"#")}" target="_blank" rel="noopener">View original →</a></div></article>`).join("");
 empty.hidden=d.length>0;
}
document.querySelectorAll(".category").forEach(b=>b.onclick=()=>{document.querySelectorAll(".category").forEach(x=>x.classList.remove("active"));b.classList.add("active");selectedCategory=b.dataset.category;render();});
searchInput.oninput=render;sortSelect.onchange=render;
const dialog=document.querySelector("#filterDialog");
document.querySelector("#filterBtn").onclick=()=>dialog.showModal();
document.querySelector("#closeDialog").onclick=()=>dialog.close();
document.querySelector("#applyFilters").onclick=()=>{state.style=document.querySelector("#styleFilter").value;state.material=document.querySelector("#materialFilter").value;state.distance=Number(document.querySelector("#distanceFilter").value);dialog.close();render();};
loadListings();
