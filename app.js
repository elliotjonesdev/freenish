let selectedCategory="All";
const state={style:"All",material:"All",distance:5};

const feed=document.querySelector("#feed");
const empty=document.querySelector("#empty");
const searchInput=document.querySelector("#searchInput");
const sortSelect=document.querySelector("#sortSelect");

function render(){
  const q=searchInput.value.trim().toLowerCase();
  let data=listings.filter(x =>
    (selectedCategory==="All"||x.category===selectedCategory) &&
    (state.style==="All"||x.style===state.style) &&
    (state.material==="All"||x.material===state.material) &&
    x.distance<=Number(state.distance) &&
    (!q || `${x.title} ${x.category} ${x.style} ${x.material}`.toLowerCase().includes(q))
  );
  if(sortSelect.value==="distance") data.sort((a,b)=>a.distance-b.distance);
  else data.sort((a,b)=>a.mins-b.mins);
  feed.innerHTML=data.map(card).join("");
  empty.hidden=data.length!==0;
}
function card(x){
  return `<article class="card">
    <div class="card-top">
      ${x.pick?'<span class="badge">★ FREENISH PICK</span>':'<span></span>'}
      <span class="added">Added ${x.added}</span>
    </div>
    <h2 class="title">${x.title}</h2>
    <div class="meta"><strong>${x.material}</strong> &nbsp;•&nbsp; ${x.style}</div>
    <div class="meta">⌖ ${x.category} &nbsp;•&nbsp; Newport · ${x.distance} miles</div>
    <div class="free-row">
      <span class="free">FREE</span>
      <a class="original" href="${x.url}" target="_blank" rel="noopener">View original →</a>
    </div>
  </article>`;
}
document.querySelectorAll(".category").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".category").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  selectedCategory=btn.dataset.category;
  render();
}));
searchInput.addEventListener("input",render);
sortSelect.addEventListener("change",render);

const dialog=document.querySelector("#filterDialog");
document.querySelector("#filterBtn").addEventListener("click",()=>dialog.showModal());
document.querySelector("#closeDialog").addEventListener("click",()=>dialog.close());
document.querySelector("#applyFilters").addEventListener("click",()=>{
  state.style=document.querySelector("#styleFilter").value;
  state.material=document.querySelector("#materialFilter").value;
  state.distance=document.querySelector("#distanceFilter").value;
  dialog.close(); render();
});
document.querySelector("#locationBtn").addEventListener("click",()=>alert("V1 location is Newport. Location/radius can be connected to postcode or GPS later."));
render();
