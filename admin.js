const cfg = window.FREENISH_CONFIG,
    db = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_PUBLISHABLE_KEY),
    $ = id => document.getElementById(id);

function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    } [c]))
}

function show(s) {
    $("loginPanel").hidden = !!s;
    $("adminPanel").hidden = !s;
    $("logout").hidden = !s;
    if (s) load()
}
async function init() {
    show((await db.auth.getSession()).data.session)
}
db.auth.onAuthStateChange((e, s) => show(s));
$("loginForm").onsubmit = async e => {
    e.preventDefault();
    $("loginMsg").textContent = "Logging in…";
    let r = await db.auth.signInWithPassword({
        email: $("email").value,
        password: $("password").value
    });
    $("loginMsg").textContent = r.error ? r.error.message : ""
};
$("logout").onclick = () => db.auth.signOut();
$("listingForm").onsubmit = async e => {
    e.preventDefault();
    $("formMsg").textContent = "Saving…";
    let row = {
        title: $("title").value.trim(),
        category: $("category").value,
        style: $("style").value,
        material: $("material").value,
        color: $("color").value,
        location: $("location").value,
        distance: Number($("distance").value || 0),
        source: $("source").value,
        original_url: $("url").value.trim(),
        freenish_pick: $("pick").checked,
        active: true,
        expires_at: new Date(Date.now() + Number($("duration").value) * 86400000).toISOString()
    };
    let id = $("editingId").value,
        r = id ? await db.from("listings").update(row).eq("id", id) : await db.from("listings").insert(row);
    if (r.error) {
        $("formMsg").textContent = r.error.message;
        return
    }
    $("formMsg").textContent = "Saved.";
    reset();
    load()
};
$("cancelEdit").onclick = reset;
async function load() {
    let r = await db.from("listings").select("*").eq("active", true).order("added_at", {
        ascending: false
    });
    if (r.error) {
        $("listings").textContent = r.error.message;
        return
    }
    $("listings").innerHTML = (r.data || []).map(x => `<article class="item"><div><strong>${esc(x.title)}</strong><div class="small">${esc(x.category)} · ${esc(x.style||"")} · ${esc(x.material||"")} · ${esc(x.color||"")}</div><div class="small">${esc(x.location||"")} · ${esc(x.source||"")} · expires ${x.expires_at?new Date(x.expires_at).toLocaleDateString():"—"}</div></div><div class="item-actions"><button onclick="editFind('${x.id}')">Edit</button><button onclick="removeFind('${x.id}')">Remove</button></div></article>`).join("") || "<p>No active finds yet."
}
window.editFind = async id => {
    let r = await db.from("listings").select("*").eq("id", id).single();
    if (r.error) return alert(r.error.message);
    let x = r.data;
    $("editingId").value = x.id;
    $("title").value = x.title || "";
    $("category").value = x.category || "Other";
    $("style").value = x.style || "Other";
    $("material").value = x.material || "Other";
    $("color").value = x.color || "Other";
    $("location").value = x.location || "Other";
    $("distance").value = x.distance || 0;
    $("source").value = x.source || "Other";
    $("url").value = x.original_url || "";
    $("pick").checked = !!x.freenish_pick;
    $("formTitle").textContent = "Edit find";
    $("cancelEdit").hidden = false;
    scrollTo({
        top: 0,
        behavior: "smooth"
    })
};
window.removeFind = async id => {
    if (!confirm("Remove this find from the public feed?")) return;
    let r = await db.from("listings").update({
        active: false
    }).eq("id", id);
    if (r.error) alert(r.error.message);
    else load()
};

function reset() {
    $("listingForm").reset();
    $("editingId").value = "";
    $("duration").value = "14";
    $("formTitle").textContent = "Add a find";
    $("cancelEdit").hidden = true
}
init();
