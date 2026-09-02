/* Compatible runtime blocks preserved from user-owned CocBasePro theme. */

/* ORIGINAL SCRIPT BLOCK 36 */


(function(){
  function eventPopup(){
    return document.getElementById("event-popup");
  }

  function setEventPopupOpen(open){
    var popup = eventPopup();
    if(!popup) return;
    var isOpen = !!open;
    popup.classList.toggle("show", isOpen);
    popup.setAttribute("aria-hidden", isOpen ? "false" : "true");
    document.documentElement.classList.toggle("event-popup-open", isOpen);
  }

  function toLocalEventTime(y,m,d,h,min){
    h = h || 0;
    min = min || 0;
    return new Date(Date.UTC(y,m,d,h-2,min));
  }

  function getEvents(){
    var now = new Date();
    var year = now.getUTCFullYear();
    var month = now.getUTCMonth();

    var goldStart = toLocalEventTime(year,month,1,0,0);
    var goldEnd = toLocalEventTime(year,month+1,0,23,59);

    var dow = now.getUTCDay();
    var raidStart = new Date(now);
    raidStart.setUTCHours(6,0,0,0);
    raidStart.setUTCDate(raidStart.getUTCDate() - ((dow + 7 - 5) % 7));

    var raidEnd = new Date(raidStart);
    raidEnd.setUTCDate(raidStart.getUTCDate() + 2);
    raidEnd.setUTCHours(23,59,59,999);

    return [
      {name:"🎫 Gold Pass Season", start:goldStart, end:goldEnd},
      {name:"⚔️ Raid Weekend", start:raidStart, end:raidEnd},
      {name:"🎯 Clan Games", start:toLocalEventTime(year,month,22,8,0), end:toLocalEventTime(year,month,28,8,0)},
      {name:"🛡️ Clan War League", start:toLocalEventTime(year,month,1,0,0), end:toLocalEventTime(year,month,8,0,0)}
    ];
  }

  function countdown(ms){
    ms = Math.max(0, ms);
    var d = Math.floor(ms / 86400000);
    var h = Math.floor(ms / 3600000 % 24);
    var m = Math.floor(ms / 60000 % 60);
    return d + " days " + h + " hours " + m + " minutes";
  }

  function eventStatus(ev,now){
    if(now < ev.start) return "⏳ Starts in " + countdown(ev.start-now);
    if(now > ev.end) return "✅ Ended";
    return "🔥 Live - ends in " + countdown(ev.end-now);
  }

  window.updateEvents = function(){
    var list = document.getElementById("event-list");
    var next = document.getElementById("next-event");
    if(!list || !next) return;

    var now = new Date();
    var events = getEvents();
    var upcoming = null;
    list.innerHTML = "";

    events.forEach(function(ev){
      var row = document.createElement("div");
      row.className = "event-row";

      var title = document.createElement("b");
      title.textContent = ev.name;

      var detail = document.createElement("small");
      detail.textContent = eventStatus(ev,now);

      row.appendChild(title);
      row.appendChild(document.createElement("br"));
      row.appendChild(detail);
      list.appendChild(row);

      if(!upcoming && now < ev.start) upcoming = ev;
    });

    if(upcoming){
      next.textContent = "👉 Next event: " + upcoming.name + " (" + countdown(upcoming.start-now) + ")";
    }else{
      next.textContent = "🔥 An event is currently live!";
    }
  };

  window.openEventPopup = function(){
    if(typeof window.closeMobileMore === "function") window.closeMobileMore();
    window.updateEvents();
    setEventPopupOpen(true);
  };

  window.closeEventPopup = function(){
    setEventPopupOpen(false);
  };

  document.addEventListener("click",function(e){
    if(e.target.closest("[data-close-event='1']")){
      e.preventDefault();
      window.closeEventPopup();
    }
  });

  document.addEventListener("keydown",function(e){
    if(e.key === "Escape") window.closeEventPopup();
  });

  setEventPopupOpen(false);
  window.addEventListener("pageshow",function(){ setEventPopupOpen(false); });
})();


/* ORIGINAL SCRIPT BLOCK 37 */


(function(){
  window.CBP_ACTIVE_POPUP = null;

  window.closeAllCbpPopups = function(except){
    var keep = except || "";

    var imageViewer = document.getElementById("ai-image-viewer-root");
    if(imageViewer){
      imageViewer.remove();
      return;
    }

    var demoRoot = document.getElementById("ai-demo-modal-root");
    if(demoRoot && demoRoot.children.length){
      if(typeof closeAIDownloadGate === "function"){
        closeAIDownloadGate();
      }else{
        demoRoot.innerHTML = "";
      }
      return;
    }

    var ai = document.getElementById("ai-finder-popup");
    if(keep !== "ai" && ai && ai.classList.contains("show")){
      if(typeof ai._setAIFinderOpen === "function"){
        ai._setAIFinderOpen(false);
      }else{
        ai.classList.remove("show");
        ai.setAttribute("aria-hidden","true");
      }
    }

    var simple = document.getElementById("simple-popup");
    if(keep !== "simple" && simple && simple.classList.contains("show")){
      simple.classList.remove("show");
      simple.classList.remove("hero-skins-fullscreen");
    }

    var eventPopup = document.getElementById("event-popup");
    if(keep !== "event" && eventPopup){
      eventPopup.classList.remove("show");
      eventPopup.setAttribute("aria-hidden","true");
    }

    var more = document.getElementById("mobile-more-sheet");
    if(keep !== "more" && more){
      more.classList.remove("show");
      more.setAttribute("aria-hidden","true");
    }

    var cocMore = document.getElementById("coc-more-sheet");
    if(keep !== "more" && cocMore){
      cocMore.classList.remove("show");
    }

    if(!keep){
      document.documentElement.classList.remove("cbp-tool-fullscreen-open");
      document.documentElement.classList.remove("mobile-menu-open");
      window.CBP_ACTIVE_POPUP = null;
    }
  };
})();


/* ORIGINAL SCRIPT BLOCK 39 */


(function(){
  const ua = navigator.userAgent || "";
  const isApp = ua.includes("CocBaseProApp-iOS") || ua.includes("CocBaseProApp-Android");
  if(isApp) document.body.classList.add("app-webview");

  const moreBtn = document.getElementById("nav-more-btn");
  const sheet = document.getElementById("mobile-more-sheet");
  const mainNav = document.getElementById("mobile-nav");

  function setMoreOpen(open){
    if(!sheet) return;
    const isOpen = !!open;
    sheet.classList.toggle("show", isOpen);
    sheet.setAttribute("aria-hidden", isOpen ? "false" : "true");
    document.documentElement.classList.toggle("mobile-menu-open", isOpen);

    if(mainNav){
      mainNav.setAttribute("aria-hidden", isOpen ? "true" : "false");
      mainNav.style.pointerEvents = isOpen ? "none" : "";
    }

    if(moreBtn){
      moreBtn.classList.toggle("is-active", isOpen);
      moreBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }
  }

  function closeThen(callback){
    setMoreOpen(false);
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        if(typeof callback === "function") callback();
      });
    });
  }

  window.openMobileMore = function(){ setMoreOpen(true); };
  window.closeMobileMore = function(){ setMoreOpen(false); };

  if(moreBtn){
    moreBtn.setAttribute("aria-controls","mobile-more-sheet");
    moreBtn.setAttribute("aria-expanded","false");
    moreBtn.addEventListener("click",function(e){
      e.preventDefault();
      setMoreOpen(!sheet.classList.contains("show"));
    });
  }

  document.addEventListener("click",function(e){
    if(e.target.closest("[data-close-more='1']")){
      setMoreOpen(false);
      return;
    }

    const popupItem = e.target.closest("[data-popup]");
    if(popupItem && popupItem.closest("#mobile-more-sheet")){
      e.preventDefault();
      e.stopImmediatePropagation();
      const type = popupItem.getAttribute("data-popup");
      closeThen(function(){
        if(typeof window.openSimple === "function") window.openSimple(type);
      });
      return;
    }

    const item = e.target.closest("[data-more-action]");
    if(!item) return;

    e.preventDefault();
    e.stopImmediatePropagation();
    const action = item.getAttribute("data-more-action");

    closeThen(function(){
      if(action === "event"){
        if(typeof window.openEventPopup === "function") window.openEventPopup();
        return;
      }

      if(action === "saved" && typeof window.openSimple === "function"){
        window.openSimple("saved");
        return;
      }

      if(action === "topclans" && typeof window.openSimple === "function"){
        window.openSimple("topclans");
        return;
      }

      if(action === "premium-app"){
        if(window.Android && typeof Android.openPremium === "function"){
          Android.openPremium();
          return;
        }
        if(window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.openPremium){
          window.webkit.messageHandlers.openPremium.postMessage("");
        }
      }
    });
  }, true);

  document.addEventListener("keydown",function(e){
    if(e.key === "Escape") setMoreOpen(false);
  });

  window.addEventListener("pageshow",function(){ setMoreOpen(false); });
})();


/* ORIGINAL SCRIPT BLOCK 40 */

  
(function(){

function ready(fn){
  if(document.readyState!="loading") fn();
  else document.addEventListener("DOMContentLoaded",fn);
}

ready(function(){

/* ===== FIX OLD WEBVIEW CACHE ===== */
const APP_CACHE_VERSION = "cache_fix_20260613_v2";

(function clearOldBrokenCache(){

  const key = "APP_CACHE_VERSION";
  const old = localStorage.getItem(key);

  if(old !== APP_CACHE_VERSION){

    Object.keys(localStorage).forEach(function(k){

      const x = k.toLowerCase();

      if(
        x.includes("cache") ||
        x.includes("posts") ||
        x.includes("bases") ||
        x.includes("stats") ||
        x.includes("free") ||
        x.includes("premium")
      ){
        localStorage.removeItem(k);
      }

    });

    sessionStorage.clear();

    localStorage.setItem(key, APP_CACHE_VERSION);

    console.warn("OLD WEBVIEW CACHE CLEARED:", APP_CACHE_VERSION);
  }

})();

/* ⭐ DÁN NGAY Ở ĐÂY ⭐ */
  window.NEWS_STATE = {
    data: [],
    seen: JSON.parse(localStorage.getItem("seen_news") || "{}")
  };

function syncUnreadToFlutter(count){
  window.unread = count;

  // gửi sang Flutter
  if (window.Flutter) {
    Flutter.postMessage(String(count));
  }
}

var userId = localStorage.getItem("user_id");
if(!userId){
  userId="u_"+Math.random().toString(36).substr(2,9);
  localStorage.setItem("user_id",userId);
}

/* ===== HIDE NAV ON HOMEPAGE ===== */
var nav = document.getElementById("mobile-nav");

var isHome =
  location.pathname === "/" ||
  location.pathname === "/index.html" ||
  location.pathname === "";

if(nav && isHome){
  nav.style.display = "none";
}

/* ===== POPUP ===== */
let currentPopup=null;

/* ===== COC RANKINGS GLOBAL ===== */

async function safeFetch(url) {
  const res = await fetch(url + "?v=" + Date.now(), {
    cache: "no-store"
  });

  if (!res.ok) throw new Error("Network error");

  return await res.json();
}
var ALL_RANKINGS = [];

var RANKING_FILES = {
  global_clans:
    "https://hoangquocvuong.github.io/coc-top-clans/top_clans.json",

  global_players:
    "https://hoangquocvuong.github.io/coc-top-clans/top_players.json",

  capital_clans:
    "https://hoangquocvuong.github.io/coc-top-clans/top_capital_clans.json",

  builder_players:
    "https://hoangquocvuong.github.io/coc-top-clans/top_builder_players.json",

  builder_clans:
    "https://hoangquocvuong.github.io/coc-top-clans/top_builder_clans.json"
};
var HERO_SKINS_BASE =
  "https://hoangquocvuong.github.io/coc-hero-skins/";

var HERO_SKINS_INDEX =
  HERO_SKINS_BASE + "hero-skins.json";



window.openSimple=function(type){

  if(typeof window.closeAllCbpPopups === "function"){
    window.closeAllCbpPopups("simple");
  }
  window.CBP_ACTIVE_POPUP = "simple";

  const box=document.getElementById("simple-popup");
  const title=document.getElementById("sp-title");
  const text=document.getElementById("sp-text");

  if(!box) return;

  const id=Date.now();
  currentPopup=id;

  box.classList.remove("show");
  box.classList.toggle("hero-skins-fullscreen", type === "heroskins");
  document.documentElement.classList.toggle(
    "cbp-tool-fullscreen-open",
    type === "heroskins"
  );
  title.innerText="";
  text.innerHTML="";

  function show(){
    if(currentPopup!==id) return;
    box.classList.add("show");
  }



const SAVED_CACHE_KEY = "SAVED_BASES_CACHE_" + userId;
const SAVED_CACHE_TIME = 24 * 60 * 60 * 1000;

function saveSavedCache(data){
  try{
    localStorage.setItem(
      SAVED_CACHE_KEY,
      JSON.stringify({
        time: Date.now(),
        data: data || []
      })
    );
  }catch(e){
    console.warn("Saved cache failed", e);
  }
}

function loadSavedCache(){
  try{
    let raw = localStorage.getItem(SAVED_CACHE_KEY);
    if(!raw) return null;

    let parsed = JSON.parse(raw);
    if(!parsed.data) return null;

    if(Date.now() - parsed.time > SAVED_CACHE_TIME){
      localStorage.removeItem(SAVED_CACHE_KEY);
      return null;
    }

    return parsed.data;
  }catch(e){
    return null;
  }
}

function renderSavedList(items){
  if(!items || !items.length){
    text.innerHTML = `
      <div class="saved-empty">
        <h3>No saved bases yet 😢</h3>
        <p>Tap the bookmark icon
          <span class="inline-bookmark">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2H18V22L12 18L6 22V2Z"/>
            </svg>
          </span>
          below your favorite bases to save them here.
        </p>
      </div>
    `;
    return;
  }

  let html = `<button id="saved-reset">🗑 Reset All</button><div id="saved-list">`;

  items.forEach(i=>{
    html += `
      <div class="saved-card" data-slug="${i.slug}">
        <div class="saved-remove">✕</div>
        <a href="${i.url}">
          <img src="${i.image}">
        </a>
      </div>`;
  });

  html += `</div>`;
  text.innerHTML = html;

  document.getElementById("saved-list").onclick = function(e){
    let btn = e.target.closest(".saved-remove");
    if(!btn) return;

    e.stopPropagation();

    let card = btn.closest(".saved-card");
    let slug = card.dataset.slug;

    db.ref("bookmarks/"+userId+"/"+slug).remove()
      .then(function(){
        // Firebase live listener sẽ tự đổi icon bookmark vàng -> xám.
        card.remove();

        let newItems = items.filter(x => x.slug !== slug);
        saveSavedCache(newItems);

        if(!newItems.length){
          renderSavedList([]);
        }
      })
      .catch(function(error){
        console.log("SAVED REMOVE ERROR:", error);
      });
  };

  document.getElementById("saved-reset").onclick = function(){
    db.ref("bookmarks/"+userId).remove().then(()=>{
      // Các bookmarkStateRef.on("value") đang mở sẽ tự chuyển toàn bộ icon về xám.
      localStorage.removeItem(SAVED_CACHE_KEY);
      openSimple("saved");
    });
  };
}

  /* ===== SAVED ===== */
if(type === "saved"){

  title.innerText = "Saved Bases";

  const SAVED_CACHE_TIME = 24 * 60 * 60 * 1000;

  function getSavedCacheKey(){
    return "SAVED_BASES_CACHE_" + userId;
  }

  function saveSavedCache(data){
    try{
      localStorage.setItem(
        getSavedCacheKey(),
        JSON.stringify({
          time: Date.now(),
          data: data || []
        })
      );
    }catch(e){
      console.warn("Saved cache failed", e);
    }
  }

  function loadSavedCache(){
    try{
      let raw = localStorage.getItem(getSavedCacheKey());
      if(!raw) return null;

      let parsed = JSON.parse(raw);
      if(!parsed.data) return null;

      if(Date.now() - parsed.time > SAVED_CACHE_TIME){
        localStorage.removeItem(getSavedCacheKey());
        return null;
      }

      return parsed.data;
    }catch(e){
      return null;
    }
  }

  function renderSavedList(items){

    if(!items || !items.length){
      text.innerHTML = `
        <div class="saved-empty">
          <h3>No saved bases yet 😢</h3>
          <p>
            Tap the bookmark icon
            <span class="inline-bookmark">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2H18V22L12 18L6 22V2Z"/>
              </svg>
            </span>
            below your favorite bases to save them here.
          </p>
        </div>
      `;
      return;
    }

    let html = `
      <button id="saved-reset">🗑 Reset All</button>
      <div id="saved-list">
    `;

    items.forEach(i=>{
      html += `
        <div class="saved-card" data-slug="${i.slug}">
          <div class="saved-remove">✕</div>
          <a href="${i.url || "#"}">
            <img src="${i.image || i.img || "/images/default.jpg"}">
          </a>
        </div>
      `;
    });

    html += `</div>`;
    text.innerHTML = html;

    let listEl = document.getElementById("saved-list");
    if(listEl){
      listEl.onclick = function(e){
        let btn = e.target.closest(".saved-remove");
        if(!btn) return;

        e.stopPropagation();

        let card = btn.closest(".saved-card");
        let slug = card.dataset.slug;

        let newItems = items.filter(x => x.slug !== slug);

        if(typeof db !== "undefined"){
          db.ref("bookmarks/" + userId + "/" + slug).remove()
            .then(function(){
              // Firebase live listener sẽ tự đổi icon bookmark vàng -> xám.
              card.remove();
              saveSavedCache(newItems);

              if(!newItems.length){
                renderSavedList([]);
              }
            })
            .catch(function(error){
              console.log("SAVED REMOVE ERROR:", error);
            });
        }else{
          card.remove();
          saveSavedCache(newItems);

          if(!newItems.length){
            renderSavedList([]);
          }
        }
      };
    }

    let resetBtn = document.getElementById("saved-reset");
    if(resetBtn){
      resetBtn.onclick = function(){

        localStorage.removeItem(getSavedCacheKey());

        if(typeof db !== "undefined"){
          db.ref("bookmarks/" + userId).remove().then(()=>{
            // Live bookmark listeners tự đồng bộ toàn bộ icon về trạng thái chưa lưu.
            openSimple("saved");
          });
        }else{
          renderSavedList([]);
        }
      };
    }
  }

  // 🔥 1. render cache trước
  let cachedSaved = loadSavedCache();

  if(cachedSaved){
    renderSavedList(cachedSaved);
    show();
  }

  // 🔥 2. nếu firebase chưa ready thì dùng cache
  if(typeof db === "undefined"){

    if(cachedSaved){
      console.log("Saved Firebase not ready, using cache");
      return;
    }

    text.innerHTML = "DB not ready";
    show();
    return;
  }

  // 🔥 3. firebase refresh nền
  db.ref("bookmarks/" + userId).once("value")
    .then(snap=>{

      let items = [];

      if(snap.exists()){
        snap.forEach(c=>{
          let v = c.val();
          if(v) items.push(v);
        });
      }

      saveSavedCache(items);
      renderSavedList(items);
      show();

    })
    .catch(err=>{

      console.warn("Saved load failed", err);

      if(cachedSaved){
        renderSavedList(cachedSaved);
        show();
        return;
      }

      text.innerHTML = "Saved bases failed to load";
      show();
    });

  return;
}



/* ===== COC RANKINGS ===== */
if(type === "topclans"){


  text.innerHTML = `
    <div style="
      display:flex;
      flex-direction:column;
      gap:12px;
      min-height:0;
      height:100%;
    ">

      <h3 style="
        margin:0;
        text-align:center;
        font-size:18px;
        font-weight:800;
      ">
        🏆 Clash of Clans Rankings
      </h3>

  <div class="ranking-tabs">
  <button class="ranking-tab active" data-rank="player_lookup">Player Lookup</button>
  <button class="ranking-tab" data-rank="global_clans">Global Clans</button>
  <button class="ranking-tab" data-rank="global_players">Global Players</button>
  <button class="ranking-tab" data-rank="capital_clans">Capital Clans</button>
  <button class="ranking-tab" data-rank="builder_players">Builder Players</button>
  <button class="ranking-tab" data-rank="builder_clans">Builder Clans</button>
  </div>

      <input
        id="ranking-search"
        placeholder="Search..."
        style="
          padding:12px 14px;
          border:none;
          border-radius:12px;
          font-size:16px;
          width:100%;
          box-sizing:border-box;
        "
      >

      <div id="ranking-list"
        style="
          overflow:auto;
          display:flex;
          flex-direction:column;
          gap:8px;
          max-height:58vh;
        ">
        Loading...
      </div>

    </div>
  `;

  show();

  

  setTimeout(function(){

  document.querySelectorAll(".ranking-tab").forEach(function(btn){

    btn.onclick = function(){

      document.querySelectorAll(".ranking-tab").forEach(function(b){
        b.classList.remove("active");
      });

      this.classList.add("active");

      loadRanking(this.dataset.rank);
    };

  });

  loadRanking("player_lookup");

},50);

return;
}


/* ===== HERO SKINS ===== */
if(type === "heroskins"){

  title.innerText = "";

  text.innerHTML = `
    <div style="
      display:flex;
      flex-direction:column;
      gap:12px;
      max-height:75vh;
    ">

      <h3 style="
        margin:0;
        text-align:center;
        font-size:18px;
        font-weight:800;
      ">
        🎨 Hero Skins
      </h3>
	  <div id="hero-skin-stats" style="
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:8px;
">
  <div class="skin-stat-box">Loading...</div>
</div>

<input
  id="hero-skin-search"
  placeholder="Search skin..."
  style="
    padding:12px 14px;
    border:none;
    border-radius:12px;
    font-size:15px;
    background:#111;
    color:#fff;
    width:100%;
    box-sizing:border-box;
  "
>
      <div id="hero-skin-tabs"
  style="
    display:flex;
    gap:8px;
    overflow-x:auto;
    padding:4px 0 10px;
    min-height:44px;
    flex-shrink:0;
  ">
        Loading...
      </div>

      <div id="hero-skin-list"
        style="
          overflow:auto;
          display:flex;
          flex-direction:column;
          gap:10px;
          min-height:0;
          max-height:none;
        ">
        Loading skins...
      </div>

    </div>
  `;

  show();

  setTimeout(loadHeroSkinsHome, 50);

  return;
}


document.addEventListener("click", function(e){

  const btn = e.target.closest(".ranking-tab");
  if(!btn) return;

  document.querySelectorAll(".ranking-tab").forEach(b=>{
    b.classList.remove("active");
  });

  btn.classList.add("active");

  loadRanking(btn.dataset.rank);

});

async function loadRanking(type){

  const box = document.getElementById("ranking-list");
  const search = document.getElementById("ranking-search");

  if(!box) return;

  if(type === "player_lookup"){
    renderPlayerLookup();
    return;
  }

  if(search){
    search.style.display = "block";
  }

  box.innerHTML = "Loading...";

  try{

    if(!RANKING_FILES || !RANKING_FILES[type]){
      box.innerHTML = "❌ Ranking file config missing";
      return;
    }

    const url = RANKING_FILES[type] + "?v=" + Date.now();

    const res = await fetch(url,{ cache:"no-store" });

    const data = await res.json();

    ALL_RANKINGS =
      data.clans ||
      data.players ||
      data.items ||
      [];

    renderRanking(ALL_RANKINGS,type);

    if(search){

      search.value = "";

      search.oninput = function(){

        const q = this.value.toLowerCase();

        renderRanking(
          ALL_RANKINGS.filter(item =>
            (item.name || "").toLowerCase().includes(q) ||
            (item.tag || "").toLowerCase().includes(q)
          ),
          type
        );

      };

    }

  }catch(err){

    console.error(err);
    box.innerHTML = "❌ Failed to load rankings";

  }

}

function renderPlayerLookup(){

  const box = document.getElementById("ranking-list");
  const search = document.getElementById("ranking-search");

  if(search){
    search.style.display = "none";
  }

  if(!box) return;

  box.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px;">

      <input
        id="playerTagInput"
        placeholder="Enter player tag, example #LY2C9LJY"
        style="
          padding:12px 14px;
          border:none;
          border-radius:12px;
          font-size:15px;
          background:#111;
          color:#fff;
        "
      >

      <button
        id="lookupPlayerBtn"
        style="
          padding:12px;
          border:none;
          border-radius:12px;
          font-weight:900;
          background:#f5b301;
          color:#111;
          cursor:pointer;
        "
      >
        🔍 Search Player
      </button>

      <div id="playerLookupResult"></div>

    </div>
  `;

  document.getElementById("lookupPlayerBtn").onclick = searchPlayer;
}

function cleanPlayerTag(tag){
  tag = (tag || "").trim().toUpperCase();
  if(!tag) return "";
  if(!tag.startsWith("#")) tag = "#" + tag;
  return tag;
}

async function searchPlayer(){

  const input = document.getElementById("playerTagInput");
  const result = document.getElementById("playerLookupResult");

  const tag = cleanPlayerTag(input.value);

  if(!tag){
    result.innerHTML = "❌ Please enter player tag";
    return;
  }

  result.innerHTML = "Loading player...";

  try{

   const apiUrl =
  "https://api.cocbasepro.com/player?tag=" +
  encodeURIComponent(tag);

    const res = await fetch(apiUrl);
    const p = await res.json();

    if(!res.ok || p.reason){
      result.innerHTML = "❌ Player not found";
      return;
    }

    result.innerHTML = `
      <div class="top-clan-card" style="align-items:flex-start;">

        <img
          class="top-clan-badge"
          src="${p.league?.iconUrls?.medium || ""}"
          loading="lazy"
        >

        <div class="top-clan-info">

          <div class="top-clan-name">
            ${p.name || "Unknown Player"}
          </div>

          <div class="top-clan-tag">
            ${p.tag || ""}
          </div>

          <div class="top-clan-tag">
            TH ${p.townHallLevel || "-"} • XP ${p.expLevel || 0}
          </div>

          <div class="top-clan-tag">
            🏆 ${Number(p.trophies || 0).toLocaleString()}
            • Best ${Number(p.bestTrophies || 0).toLocaleString()}
          </div>

          <div class="top-clan-tag">
            ⭐ War Stars: ${Number(p.warStars || 0).toLocaleString()}
          </div>

          <div class="top-clan-tag">
            🛠 BH ${p.builderHallLevel || "-"}
            • ${Number(p.builderBaseTrophies || 0).toLocaleString()} BB trophies
          </div>

          <div class="top-clan-tag">
            Clan: ${p.clan?.name || "No Clan"}
          </div>

          <div class="top-clan-tag">
            League: ${p.league?.name || "-"}
          </div>

        </div>

      </div>
    `;

  }catch(err){

    console.error(err);
    result.innerHTML = "❌ Failed to lookup player";

  }
}

function renderRanking(items,type){

  const box = document.getElementById("ranking-list");
  if(!box) return;

  if(!items || !items.length){
    box.innerHTML = `
      <div class="top-clans-empty">
        No results found
      </div>
    `;
    return;
  }

  box.innerHTML = items.map(item=>{

    const isPlayer =
  type === "global_players" ||
  type === "builder_players";

    const badge =
      item.badgeUrls?.medium ||
      item.clan?.badgeUrls?.medium ||
      item.league?.iconUrls?.medium ||
      "";

  const points =
  item.clanPoints ||
  item.clanBuilderBasePoints ||
  item.clanVersusPoints ||
  item.clanCapitalPoints ||
  item.capitalPoints ||
  item.builderBaseTrophies ||
  item.versusTrophies ||
  item.trophies ||
  0;

    const isAnyPlayer =
  type === "global_players" ||
  type === "builder_players";

const sub =
  isAnyPlayer
    ? `${item.tag || ""} • Player Lv.${item.expLevel || 0}`
    : `${item.tag || ""} • Clan Lv.${item.clanLevel || 0}`;

    return `

      <div class="top-clan-card">

        <div class="top-clan-rank">
          #${item.rank || "-"}
        </div>

        <img
          class="top-clan-badge"
          src="${badge}"
          loading="lazy"
        >

        <div class="top-clan-info">

          <div class="top-clan-name">
            ${item.name || "Unknown"}
          </div>

          <div class="top-clan-tag">
            ${sub}
          </div>

        </div>

        <div class="top-clan-points">
          🏆 ${Number(points).toLocaleString()}
        </div>

      </div>

    `;

  }).join("");

}
}

var HERO_SKIN_HEROES = [];
var CURRENT_HERO_NAME = "";
var CURRENT_SKIN_INDEX = 0;
var HERO_SKINS_CACHE_KEY = "HERO_SKINS_CACHE_V1";
var HERO_SKINS_CACHE_TTL = 24 * 60 * 60 * 1000;
var HERO_PRELOADED_IMAGES = {};
const CacheSystem = {
  memory: new Map(),

  get(key) {
    if (this.memory.has(key)) return this.memory.get(key);

    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const parsed = JSON.parse(raw);

      if (Date.now() - parsed.time > 10 * 60 * 1000) {
        localStorage.removeItem(key);
        return null;
      }

      this.memory.set(key, parsed.data);
      return parsed.data;

    } catch {
      return null;
    }
  },

  set(key, data) {
    this.memory.set(key, data);

    try {
      localStorage.setItem(key, JSON.stringify({
        time: Date.now(),
        data
      }));
    } catch {}
  },

  clearAll() {
    this.memory.clear();
    localStorage.clear();
  }
};

function getHeroSkinCache(key){
  try{
    const raw = localStorage.getItem(key);
    if(!raw) return null;

    const obj = JSON.parse(raw);

    if(!obj.time || !obj.data) return null;

    if(Date.now() - obj.time > HERO_SKINS_CACHE_TTL){
      localStorage.removeItem(key);
      return null;
    }

    return obj.data;
  }catch(e){
    return null;
  }
}

function setHeroSkinCache(key, data){
  try{
    localStorage.setItem(
      key,
      JSON.stringify({
        time: Date.now(),
        data: data
      })
    );
  }catch(e){}
}

async function loadHeroSkinsHome(){

  const tabs = document.getElementById("hero-skin-tabs");
  const list = document.getElementById("hero-skin-list");

  if(!tabs || !list) return;

  tabs.innerHTML = "Loading...";
  list.innerHTML = "Loading skins...";

  try{

    let data = getHeroSkinCache(HERO_SKINS_CACHE_KEY + "_index");

if(!data){
  data = await safeFetch(HERO_SKINS_INDEX);
}

  setHeroSkinCache(HERO_SKINS_CACHE_KEY + "_index", data);


    HERO_SKIN_HEROES = data.heroes || [];
	const stats = document.getElementById("hero-skin-stats");

if(stats){
  stats.innerHTML = `
    <div class="skin-stat-box">
      <b>${data.total || 0}</b>
      <span>Total Skins</span>
    </div>
    <div class="skin-stat-box">
      <b>${HERO_SKIN_HEROES.length}</b>
      <span>Heroes</span>
    </div>
    <div class="skin-stat-box">
      <b>${data.updated || "-"}</b>
      <span>Updated</span>
    </div>
  `;
}

    if(!HERO_SKIN_HEROES.length){
      tabs.innerHTML = "";
      list.innerHTML = "No hero skins found";
      return;
    }

   tabs.innerHTML = HERO_SKIN_HEROES.map((h, index)=>`
  <button
    class="hero-skin-tab ${index === 0 ? "active" : ""}"
    data-file="${h.file}"
    data-name="${h.name}"
    style="
      flex:0 0 auto;
      border:none;
      border-radius:999px;
      padding:9px 12px;
      font-weight:800;
      background:${index === 0 ? "#f5b301" : "#222"};
      color:${index === 0 ? "#111" : "#fff"};
      cursor:pointer;
      white-space:nowrap;
    "
  >
    ${h.name} (${h.count || 0})
  </button>
`).join("");

    document.querySelectorAll(".hero-skin-tab").forEach(btn=>{
      btn.onclick = function(){

        document.querySelectorAll(".hero-skin-tab").forEach(b=>{
          b.classList.remove("active");
          b.style.background = "#222";
          b.style.color = "#fff";
        });

        this.classList.add("active");
        this.style.background = "#f5b301";
        this.style.color = "#111";

        loadHeroSkinFile(this.dataset.file, this.dataset.name);
      };
    });

    loadHeroSkinFile(
      HERO_SKIN_HEROES[0].file,
      HERO_SKIN_HEROES[0].name
    );

  }catch(err){

    console.error(err);

    tabs.innerHTML = "";
    list.innerHTML = "❌ Failed to load hero skins";

  }
}

async function loadHeroSkinFile(file, heroName){

  const list = document.getElementById("hero-skin-list");
  if(!list) return;

  list.innerHTML = "Loading " + heroName + " skins...";

  try {

    const cacheKey = "skin_" + file;

    let data = CacheSystem.get(cacheKey);

    if(!data){
      data = await safeFetch(HERO_SKINS_BASE + file);
      CacheSystem.set(cacheKey, data);
    }

    CURRENT_HERO_SKINS = data.skins || [];
    CURRENT_HERO_NAME = data.hero || heroName;

    renderHeroSkins(CURRENT_HERO_SKINS, CURRENT_HERO_NAME);

    setTimeout(() => {
      preloadHeroSkinImages(CURRENT_HERO_SKINS, 8);
    }, 300);

  } catch(err){
    console.error(err);
    list.innerHTML = "❌ Failed to load skins";
  }
}


function renderHeroSkins(skins, heroName){

  const list = document.getElementById("hero-skin-list");
  if(!list) return;

  if(!skins || !skins.length){
    list.innerHTML =
      '<div class="com-empty">No skins found for ' +
      heroName +
      '</div>';
    return;
  }

  list.innerHTML =
  '<div style="font-weight:900;margin:4px 0 8px;">' +
  heroName + ' • ' + skins.length + ' skins' +
  '</div>';
  list.innerHTML += skins.map(function(s){

  const img = s.image
  ? '<img class="hero-skin-img" src="' + s.image + '" loading="lazy" decoding="async" onerror="this.outerHTML=\'<div class="hero-skin-placeholder" style="display:flex;align-items:center;justify-content:center;color:#f5b301;font-size:24px;">🎨</div>\'">'
  : '<div class="hero-skin-placeholder" style="display:flex;align-items:center;justify-content:center;color:#f5b301;font-size:24px;">🎨</div>';

    const setHtml = s.set
      ? '<div class="top-clan-tag">Set: ' + s.set + '</div>'
      : '';

    return (
  '<div class="top-clan-card" style="align-items:flex-start;cursor:pointer;" onclick="openHeroSkinDetailByName(\'' + (s.name || "").replace(/'/g,"") + '\')">' +
        img +
        '<div class="top-clan-info">' +
          '<div class="top-clan-name">' + (s.name || "Unknown Skin") + '</div>' +
          '<div class="top-clan-tag">Hero: ' + heroName + '</div>' +
          '<div class="top-clan-tag">Year: ' + (s.year || "-") + ' • ' + (s.rarity || "Unknown") + '</div>' +
          '<div class="top-clan-tag">Source: ' + (s.source || "-") + '</div>' +
          setHtml +
        '</div>' +
      '</div>'
    );

  }).join("");
}

window.openHeroSkinDetailByName = function(name){

  try{

    // iOS Flutter
    if(window.HeroSkinAd && HeroSkinAd.postMessage){
      HeroSkinAd.postMessage("skin_detail_click");
    }

    // Android WebView
    else if(
      window.Android &&
      Android.skinDetailClick
    ){
      Android.skinDetailClick();
    }

  }catch(e){
    console.warn(e);
  }

  

  const index = CURRENT_HERO_SKINS.findIndex(function(s){
    return (s.name || "") === name;
  });

  if(index < 0) return;

  CURRENT_SKIN_INDEX = index;
  window.openHeroSkinDetail(CURRENT_HERO_SKINS[index]);
};

function notifyHeroSkinView(){

  // Android

  if(
    window.Android &&
    typeof Android.skinDetailClick === "function"
  ){

    Android.skinDetailClick();

  }

  // iOS

  if(window.HeroSkinAd){

    HeroSkinAd.postMessage(
      "skin_detail_click"
    );

  }

}

window.openHeroSkinDetail = function(skin){

  if(!skin) return;

  if(typeof window.closeSimple === "function"){
    window.closeSimple();
  }

  const existingPreview = document.getElementById("hero-skin-preview");
  if(existingPreview) existingPreview.remove();

  const old = document.getElementById("hero-skin-detail");
  if(old) old.remove();

  const img = skin.image || "";
  const title = skin.name || "Hero Skin";

  const overlay = document.createElement("div");
  overlay.id = "hero-skin-detail";
  overlay.className = "hero-skin-detail-overlay";

  overlay.innerHTML =
    '<div class="hero-skin-detail-box">' +
      '<button class="hero-skin-detail-close" aria-label="Close" onclick="document.getElementById(\'hero-skin-detail\').remove()"></button>' +
      '<h2>' + title + '</h2>' +
      (
        img
        ? '<img class="hero-skin-detail-img" src="' + img + '" onerror="this.outerHTML=\'<div class="hero-skin-detail-placeholder">🎨</div>\'">'
        : '<div class="hero-skin-detail-placeholder">🎨</div>'
      ) +
      '<div class="hero-skin-detail-info">' +
        '<div><b>Hero</b><span>' + (CURRENT_HERO_NAME || skin.hero || "-") + '</span></div>' +
        '<div><b>Year</b><span>' + (skin.year || "-") + '</span></div>' +
        '<div><b>Rarity</b><span>' + (skin.rarity || "-") + '</span></div>' +
        '<div><b>Source</b><span>' + (skin.source || "-") + '</span></div>' +
        '<div><b>Set</b><span>' + (skin.set || "-") + '</span></div>' +
      '</div>' +
      '<div class="hero-skin-detail-nav">' +
        '<button onclick="showPrevHeroSkin()">← Previous</button>' +
        '<button onclick="showNextHeroSkin()">Next →</button>' +
      '</div>' +
    '</div>';

  overlay.onclick = function(e){
    if(e.target === overlay){
      overlay.remove();
    }
  };

  document.body.appendChild(overlay);
};

window.showPrevHeroSkin = function(){

  if(!CURRENT_HERO_SKINS.length) return;

  CURRENT_SKIN_INDEX =
    (CURRENT_SKIN_INDEX - 1 + CURRENT_HERO_SKINS.length) %
    CURRENT_HERO_SKINS.length;

  window.openHeroSkinDetail(CURRENT_HERO_SKINS[CURRENT_SKIN_INDEX]);
};

window.showNextHeroSkin = function(){

  if(!CURRENT_HERO_SKINS.length) return;

  CURRENT_SKIN_INDEX =
    (CURRENT_SKIN_INDEX + 1) %
    CURRENT_HERO_SKINS.length;

  window.openHeroSkinDetail(
    CURRENT_HERO_SKINS[CURRENT_SKIN_INDEX]
  );

  notifyHeroSkinView();

};

function preloadHeroSkinImages(skins, limit){

  if(!skins || !skins.length) return;

  let count = 0;

  skins.forEach(function(s){

    if(!s.image) return;
    if(HERO_PRELOADED_IMAGES[s.image]) return;
    if(limit && count >= limit) return;

    const img = new Image();
    img.src = s.image;

    HERO_PRELOADED_IMAGES[s.image] = true;
    count++;
  });
}

function openHeroSkinPreview(imgUrl, title){

  const old = document.getElementById("hero-skin-preview");
  if(old) old.remove();

  const overlay = document.createElement("div");
  overlay.id = "hero-skin-preview";

  overlay.style.cssText =
    "position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;padding:20px;";

  overlay.innerHTML =
    '<div style="position:relative;background:#111;border-radius:18px;padding:18px;max-width:92vw;max-height:92vh;text-align:center;">' +
      '<button onclick="document.getElementById(\'hero-skin-preview\').remove()" style="position:absolute;right:10px;top:10px;border:none;border-radius:50%;width:34px;height:34px;font-weight:900;cursor:pointer;">×</button>' +
      '<img src="' + imgUrl + '" style="max-width:86vw;max-height:72vh;object-fit:contain;display:block;margin:auto;">' +
      '<div style="color:#fff;font-weight:900;margin-top:12px;font-size:18px;">' + title + '</div>' +
    '</div>';

  overlay.onclick = function(e){
    if(e.target === overlay){
      overlay.remove();
    }
  };

  document.body.appendChild(overlay);
}

function openHeroSkinDetailByName(name){

  const index = CURRENT_HERO_SKINS.findIndex(function(s){
    return (s.name || "") === name;
  });

  if(index < 0) return;

  CURRENT_SKIN_INDEX = index;
  openHeroSkinDetail(CURRENT_HERO_SKINS[index]);
}

function openHeroSkinDetail(skin){

  if(!skin) return;

  if(typeof window.closeSimple === "function"){
    window.closeSimple();
  }

  const existingPreview = document.getElementById("hero-skin-preview");
  if(existingPreview) existingPreview.remove();

  const old = document.getElementById("hero-skin-detail");
  if(old) old.remove();

  const img = skin.image || "";
  const title = skin.name || "Hero Skin";

  const overlay = document.createElement("div");
  overlay.id = "hero-skin-detail";
  overlay.className = "hero-skin-detail-overlay";

  overlay.innerHTML =
    '<div class="hero-skin-detail-box">' +

      '<button class="hero-skin-detail-close" aria-label="Close" onclick="document.getElementById(\'hero-skin-detail\').remove()"></button>' +

      '<h2>' + title + '</h2>' +

      (
        img
        ? '<img class="hero-skin-detail-img" src="' + img + '" onerror="this.outerHTML=\'<div class="hero-skin-detail-placeholder">🎨</div>\'">'
        : '<div class="hero-skin-detail-placeholder">🎨</div>'
      ) +

      '<div class="hero-skin-detail-info">' +
        '<div><b>Hero</b><span>' + (CURRENT_HERO_NAME || skin.hero || "-") + '</span></div>' +
        '<div><b>Year</b><span>' + (skin.year || "-") + '</span></div>' +
        '<div><b>Rarity</b><span>' + (skin.rarity || "-") + '</span></div>' +
        '<div><b>Source</b><span>' + (skin.source || "-") + '</span></div>' +
        '<div><b>Set</b><span>' + (skin.set || "-") + '</span></div>' +
      '</div>' +

      '<div class="hero-skin-detail-nav">' +
        '<button onclick="showPrevHeroSkin()">← Previous</button>' +
        '<button onclick="showNextHeroSkin()">Next →</button>' +
      '</div>' +

    '</div>';

  overlay.onclick = function(e){
    if(e.target === overlay){
      overlay.remove();
    }
  };

  document.body.appendChild(overlay);
}

function showPrevHeroSkin(){

  if(!CURRENT_HERO_SKINS.length) return;

  CURRENT_SKIN_INDEX =
    (CURRENT_SKIN_INDEX - 1 + CURRENT_HERO_SKINS.length) %
    CURRENT_HERO_SKINS.length;

  openHeroSkinDetail(CURRENT_HERO_SKINS[CURRENT_SKIN_INDEX]);
}

function showNextHeroSkin(){

  if(!CURRENT_HERO_SKINS.length) return;

  CURRENT_SKIN_INDEX =
    (CURRENT_SKIN_INDEX + 1) %
    CURRENT_HERO_SKINS.length;

  openHeroSkinDetail(CURRENT_HERO_SKINS[CURRENT_SKIN_INDEX]);
}

/* ===== CLOSE POPUP ===== */
window.closeSimple = function(){

  const el = document.getElementById("simple-popup");

  if(!el) return;

  el.classList.remove("show");
  el.classList.remove("hero-skins-fullscreen");
  document.documentElement.classList.remove("cbp-tool-fullscreen-open");

  if(window.CBP_ACTIVE_POPUP === "simple"){
    window.CBP_ACTIVE_POPUP = null;
  }

};

/* ===== CLICK BTN ===== */
document.querySelectorAll("[data-popup]").forEach(btn=>{
  btn.onclick=function(e){
    e.preventDefault();
    e.stopPropagation();
    if(typeof window.closeMobileMore === "function") window.closeMobileMore();
    openSimple(this.dataset.popup);
  };
});

/* ===== CLICK OUTSIDE ===== */
document.getElementById("simple-popup").onclick=function(e){
  if(e.target.classList.contains("overlay")){
    closeSimple();
  }
};



/* ===== POPUP ===== */
window.openSimpleCustom = function(titleText, htmlText){
  if(typeof window.closeAllCbpPopups === "function"){
    window.closeAllCbpPopups("simple");
  }
  window.CBP_ACTIVE_POPUP = "simple";

  const box = document.getElementById("simple-popup");
  const title = document.getElementById("sp-title");
  const text = document.getElementById("sp-text");

  if(!box) return;

  box.classList.remove("hero-skins-fullscreen");
  document.documentElement.classList.remove("cbp-tool-fullscreen-open");
  title.innerText = titleText;
  text.innerHTML = htmlText;

  box.classList.add("show");
};

var newsBtn = document.getElementById("nav-news-btn");
  var badge = document.getElementById("news-badge");

 

 

  /* ===== TIME ===== */
  function timeAgo(t){
    let d = Date.now() - t;
    let s = Math.floor(d/1000);
    let m = Math.floor(s/60);
    let h = Math.floor(m/60);
    let day = Math.floor(h/24);

    if(s < 60) return "just now";
    if(m < 60) return m + " min ago";
    if(h < 24) return h + " h ago";
    return day + " day ago";
  }



  /* ===== POPUP ===== */
  function openPopup(){

  let state = window.NEWS_STATE;

  let unread = state.data.filter(n =>

  n.pin || !state.seen[n.id]

);

  let html = "<div>";

  if(unread.length === 0){
    html += "<p style='text-align:center'>No news</p>";
  } else {

    unread.forEach(n => {
      html += `
        <a href="${n.url}"
           onclick="markAsRead('${n.id}')"
           style="display:block;padding:10px;margin:10px 0;background:#eee;border-radius:8px">

          📰 ${n.title}

          <div style="font-size:11px;color:#888">
  ${timeAgo(n.time)}
</div>

        </a>
      `;
    });
  }

  html += "</div>";

  openSimpleCustom("News", html);
}



  /* ===== CLICK BUTTON ===== */
  if(newsBtn){
    newsBtn.addEventListener("click", function(e){
      e.stopPropagation();
      openPopup();
    });
  }

 /* ===== COMMUNITY UNREAD WATCHER ===== */
  setTimeout(function(){
    startCommunityUnreadWatcher();
  }, 1500);


/* ===== APP RESUME RECOVERY GLOBAL ===== */

let APP_RESUME_LOCK = false;

function appResumeRecovery(){

  if(APP_RESUME_LOCK) return;

  APP_RESUME_LOCK = true;

  setTimeout(function(){
    APP_RESUME_LOCK = false;
  }, 5000);

  const didReconnect = forceFirebaseReconnect();

if(!didReconnect){
  return;
}

  setTimeout(function(){

    if(typeof reloadCurrentPage === "function"){
      reloadCurrentPage();
    }

    const popup = document.getElementById("simple-popup");
    const communityBox = document.getElementById("communityBox");

    if(
      popup &&
      popup.classList.contains("show") &&
      communityBox &&
      typeof reloadCommunityCurrentView === "function"
    ){
      reloadCommunityCurrentView();
    }

  }, 1200);
}

document.addEventListener("visibilitychange", function(){

  if(document.visibilityState === "visible"){
    appResumeRecovery();
  }

});

window.addEventListener("pageshow", function(){
  appResumeRecovery();
});

window.addEventListener("focus", function(){
  appResumeRecovery();
});
});



document.addEventListener("DOMContentLoaded", () => {

  let cached = loadCache();

if(cached && cached.length){

  DATA = cached;
  window.DATA = DATA;

  buildTabs();
  buildLevels();
  renderAll();

  console.log("🔥 INSTANT CACHE RENDER");

  console.log("🔥 CACHE RENDERED - REFRESH FIREBASE BACKGROUND");

  setTimeout(function(){

  if(navigator.onLine){
    loadData();
  }

}, 1000);

  return;
}

loadData();
});
})();



  

 
/* ORIGINAL SCRIPT BLOCK 41 */

  
(function(){

document.addEventListener("DOMContentLoaded", function(){
const adminList = document.getElementById("admin-list");

/* =========================
   LOAD ADMIN LIST
========================= */
function loadAdminList(){

  if(!isAdmin()) return;

  newsRef
    .orderByChild("time")
    .limitToLast(50)
    .on("value", snap => {

      let arr = [];

      snap.forEach(c=>{
        let n = c.val() || {};
        n.id = c.key;
        n.pin = n.pin === true;
        arr.push(n);
      });

      arr = getSortedNews(arr);

      let html = "";

      arr.forEach(n=>{

        html += `
<div class="admin-item ${n.pin ? "pinned" : ""}">

            <div class="admin-title">
              ${n.title || ""}
              ${n.pin ? `<span class="pin-badge">PIN</span>` : ``}
            </div>

            <div class="admin-time">
              ${new Date(n.time || Date.now()).toLocaleString()}
            </div>

            <div class="admin-actions">
              <button class="btn-del" data-id="${n.id}">Xoá</button>
              <button class="btn-pin" data-id="${n.id}">
                ${n.pin ? "Bỏ ghim" : "Ghim"}
              </button>
            </div>

          </div>
        `;
      });

      adminList.innerHTML = html;

      bindAdminActions();
    });
}

function rebuildNewsCache(){

  return newsRef.once("value").then(snap => {

    let items = [];

    snap.forEach(c=>{
      let n = c.val() || {};

      items.push({
        id: c.key,
        title: n.title || "",
        url: n.url || "#",
        time: Number(n.time || 0),
        pin: n.pin === true
      });
    });

    items = getSortedNews(items).slice(0,30);

    return db.ref("news_cache").set({
      updated: Date.now(),
      total: items.length,
      items: items
    }).then(()=>{

      // 🔥 cập nhật ngay cho người đang mở trang
      window.NEWS_STATE.data = items;

      renderNews(items);
      updateBadge();

      console.log("✅ NEWS CACHE AUTO UPDATED:", items.length);

    });

  });
}
/* =========================
   ACTIONS
========================= */
function bindAdminActions(){

  // ❌ DELETE
  document.querySelectorAll(".btn-del").forEach(btn=>{
    btn.onclick = function(){

      let id = this.dataset.id;

      if(confirm("Xoá tin này?")){

        newsRef.child(id)
          .remove()
          .then(()=>{

            rebuildNewsCache();

            console.log(
              "🗑 NEWS DELETED:",
              id
            );

          });

      }

    };
  });

  // 📌 PIN
  document.querySelectorAll(".btn-pin").forEach(btn=>{

    btn.onclick = function(){

      let id = this.dataset.id;

      newsRef.child(id)
        .once("value")
        .then(snap=>{

          let val =
            snap.val() || {};

          newsRef.child(id)
            .update({
              pin: !val.pin
            })
            .then(()=>{

              rebuildNewsCache();

              console.log(
                "📌 PIN UPDATED:",
                id,
                !val.pin
              );

            });

        });

    };

  });

}
/* =========================
   USER ID (SYNC ĐA THIẾT BỊ)
========================= */
var userId = localStorage.getItem("user_id");
if(!userId){
  userId = "u_" + Math.random().toString(36).substr(2,9);
  localStorage.setItem("user_id", userId);
}

/* =========================
   STATE
========================= */
window.NEWS_STATE = {
  data: [],
  seen: {},
  loaded: false
};


/* =========================
   ELEMENTS
========================= */
const newsBtn = document.getElementById("nav-news-btn");
const badge = document.getElementById("news-badge");
const panel = document.getElementById("adminPanel");
const postBtn = document.getElementById("postBtn");

/* =========================
   WAIT FIREBASE
========================= */
function waitFirebase(cb){
  if(typeof window.newsRef === "undefined"){
    return setTimeout(()=>waitFirebase(cb), 200);
  }
  cb();
}

/* =========================
   LOAD SEEN FROM FIREBASE
========================= */
function loadSeen(){

  if(!window.db) return; // 🔥 tránh crash

  window.db.ref("news_seen/" + userId).once("value").then(snap => {
    if(snap.exists()){
      window.NEWS_STATE.seen = snap.val();
    }
    updateBadge();
  });

}
/* =========================
   BADGE
========================= */
function updateBadge(){

  let state = window.NEWS_STATE;

  // Chưa load xong thì không hiện badge
  if(!state.loaded){

    badge.style.display = "none";

    return;

  }

  let unread = state.data.filter(
    n => !state.seen[n.id]
  );

  let count = unread.length;

  // Keep CSS/helpers synchronized with the real Firebase unread count.
  badge.setAttribute("data-count", String(count));

  // ===== WEB BADGE =====
  if(count <= 0){

    badge.innerText = "";
    badge.classList.add("is-empty");
    badge.style.display = "none";

  }else{

    badge.classList.remove("is-empty");
    badge.innerText =
      count > 9
      ? "9+"
      : String(count);

    badge.style.display = "inline-flex";

  }

  // ===== SEND TO FLUTTER =====
  try{

    if(
      window.Flutter &&
      Flutter.postMessage
    ){

      Flutter.postMessage(
        count.toString()
      );

      console.log(
        "Send badge:",
        count
      );

    }

  }catch(e){
    console.log(e);
  }

}


window.markAsRead = function(id){

  let state = window.NEWS_STATE;

  state.seen[id] = true;

  // 🔥 tránh crash
  if(window.db){
    window.db.ref("news_seen/" + userId + "/" + id).set(true);
  }

  updateBadge();
  openPopup();
};
/* =========================
   POPUP
========================= */
function openPopup(){

  let state = window.NEWS_STATE;
  let unread = state.data.filter(n =>

  n.pin || !state.seen[n.id]

);

let html = `
  <div style="padding:10px">

    <!-- 🔥 BUTTON -->
    <div style="display:flex;justify-content:flex-end;margin-bottom:10px">
      <button id="mark-all-read" style="
        background:#ff3b30;
        color:#fff;
        border:none;
        padding:5px 10px;
        border-radius:6px;
        font-size:12px;
        cursor:pointer;
      ">
        Mark all as read
      </button>
    </div>
`;

if(unread.length === 0){
  html += "<p style='text-align:center;color:#888'>No news</p>";
}else{

  getSortedNews(unread)
  .forEach(n=>{

   html += `
<a href="${n.url || '#'}"
   data-id="${n.id}"
   data-url="${n.url || "#"}"
   data-pin="${n.pin ? 1 : 0}"
   class="news-item ${n.pin ? "news-pinned" : ""}">

  

 <div class="news-top">

 <div class="news-title">

  ${
    n.pin
      ? `
      <span class="news-donation-icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21s-6.716-4.35-9.192-8.04C.88 10.12 2.12 6.5 5.5 6.5c2.04 0 3.25 1.16 4.01 2.34C10.27 7.66 11.48 6.5 13.5 6.5c3.38 0 4.62 3.62 2.69 6.46C18.72 16.65 12 21 12 21z"/>
          <circle cx="18" cy="18" r="4"/>
        </svg>
      </span>
      `
      : `
      <span class="news-normal-icon">📰</span>
      `
  }

  <span>${n.title}</span>

</div>

  ${
    n.pin
      ? `
      <img
        src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh6mrxbCwScvKWM7g858N-s4seAsnZpo9DZKuxuP3HYjRR7tI0C_PN-HkuBOGItn5967la1VKRVhr5qMozyt0f2gT7HDh7H0zH_2vENm57HKiDnpIKMAA4FWYo909l8AdKL96yzX9lI-QVENRGQpkxuFc9Zgx6HivAM3QDNFogJTEkrR2TW2OJmbT-xiSNs/s400/2899445-removebg-preview.png"
        class="official-icon"
        loading="lazy"
        alt="Official">
      `
      : (!state.seen[n.id]
          ? "<span class='news-new'>NEW</span>"
          : "")
  }

</div>

  <div class="news-time">
    ${new Date(n.time).toLocaleString()}
  </div>

</a>
`;
  });
}

html += "</div>";

openSimpleCustom("News", html);

  // 🔥 BIND CLICK NGAY SAU KHI RENDER
  document.querySelectorAll(".news-item").forEach(el=>{

    el.onclick = function(e){

      e.preventDefault();

      let id = this.dataset.id;
      let url = this.dataset.url;
	  let isPin = this.dataset.pin === "1";

      let state = window.NEWS_STATE;
      state.seen[id] = true;

     db.ref("news_seen/" + userId + "/" + id).set(true);

     updateBadge();

     if(isPin){

  // refresh popup để bỏ NEW nhưng vẫn giữ bài ghim
  openPopup();

}

setTimeout(()=>{
  window.location.href = url;
},100);
    };
// 🔥 MARK ALL
const btnAll = document.getElementById("mark-all-read");

if(btnAll){
  btnAll.onclick = function(){

    let state = window.NEWS_STATE;

    let updates = {};

state.data.forEach(n=>{

  state.seen[n.id] = true;

  updates[n.id] = true;

});

updateBadge();

openPopup();

db.ref("news_seen/" + userId).update(updates);

    updateBadge();
    openPopup(); // reload lại popup
  };
}

  });

}


/* =========================
   CLICK BTN
========================= */
if(newsBtn){
  newsBtn.onclick = function(e){
    e.stopPropagation();
    openPopup();
  };
}

function renderNews(data) {

  const container = document.getElementById("news-list");
  if (!container) return;

  container.innerHTML = "";

  data.forEach(n => {

    const div = document.createElement("div");

    div.className = "news-item" + (n.pin ? " pin" : "");

    div.innerHTML = `
  <div>
    📰 ${n.title}
    ${n.pin ? "<span style='background:red;color:#fff;padding:2px 6px;border-radius:4px;font-size:11px'>📌 PIN</span>" : ""}
  </div>
  <div>${new Date(n.time).toLocaleString()}</div>
`;

    container.appendChild(div);
  });
}


function getSortedNews(arr){
  return [...arr].sort((a, b) => {

    const aPin = !!a.pin;
    const bPin = !!b.pin;

    if (aPin !== bPin) return aPin ? -1 : 1;

    return (b.time || 0) - (a.time || 0);
  });
}

/* =========================
   LOAD NEWS
========================= */
function loadNews(){

  db.ref("news_cache").once("value").then(snap => {

    let cache = snap.val() || {};
    let arr = cache.items || [];

    window.NEWS_STATE.data = getSortedNews(arr);
	window.NEWS_STATE.loaded = true;

    renderNews(window.NEWS_STATE.data);
    updateBadge();

    console.log("🔥 NEWS CACHE LOADED:", arr.length);

  }).catch(err => {

    console.warn("News cache failed, fallback news node", err);

    newsRef.limitToLast(20).once("value").then(snap => {

      let arr = [];

      snap.forEach(c => {
        let v = c.val();
        v.id = c.key;
        v.pin = v.pin === true || v.pin === "true" || v.pin === 1 || v.pin === "1";
        arr.push(v);
      });

      window.NEWS_STATE.data = getSortedNews(arr);
	  window.NEWS_STATE.loaded = true;
      renderNews(window.NEWS_STATE.data);
      updateBadge();
    });

  });
}

/* =========================
   ADMIN
========================= */
function isAdmin(){
  return localStorage.getItem("dev_admin") === "1";
}

document.addEventListener("keydown", function(e){
  if(e.ctrlKey && e.shiftKey && e.key.toLowerCase()==="a"){
    if(isAdmin()){
      localStorage.removeItem("dev_admin");
      panel.style.display="none";
      alert("Admin OFF");
    }else{
      localStorage.setItem("dev_admin","1");
      panel.style.display="block";
      alert("Admin ON");
    }
  }
});

if(postBtn){
  postBtn.onclick = function(){

    let title = document.getElementById("admin-title").value.trim();
    let url = document.getElementById("admin-url").value.trim() || "#";

    if(!title) return;

    newsRef.push({
  title,
  url,
  time: Date.now(),
  pin: false
}).then(()=>{

  rebuildNewsCache();

  console.log(
    "📰 NEWS POSTED:",
    title
  );

});

    document.getElementById("admin-title").value="";
    document.getElementById("admin-url").value="";
  };
}

/* =========================
   INIT
========================= */
waitFirebase(()=>{
  loadNews();
  loadSeen();

  // Chỉ admin mới load admin list
  if(isAdmin()){
    loadAdminList();
  }
});

/* =========================
   REALTIME SYNC SEEN
========================= */
function waitDB(callback){
  if(window.db){
    callback();
  } else {
    setTimeout(() => waitDB(callback), 200);
  }
}

waitDB(function(){

  window.db.ref("news_seen/" + userId).once("value").then(snap=>{
    if(snap.exists()){
      window.NEWS_STATE.seen = snap.val();
      updateBadge();
    }
  });

});

/* =========================
🔥 WEBVIEW RESUME FIX
========================= */

window.refreshNewsBadge = function(){

  console.log("🔥 REFRESH NEWS BADGE");

  db.ref("news_cache").once("value").then(snap => {

    let cache = snap.val() || {};
    let arr = cache.items || [];

    window.NEWS_STATE.data = getSortedNews(arr);
	window.NEWS_STATE.loaded = true;
    renderNews(window.NEWS_STATE.data);
    updateBadge();

    console.log("🔥 NEWS BADGE UPDATED FROM CACHE");

  }).catch(err => {
    console.warn("Refresh news cache failed", err);
  });

};

/* =========================
🔥 RESUME LOCK - HARD LIMIT
========================= */

let __lastNewsResume = Number(
  sessionStorage.getItem("__lastNewsResume") || 0
);

function safeRefreshNewsBadge(){

  let now = Date.now();

  // 🔥 trong 60 giây chỉ cho chạy 1 lần
  if(now - __lastNewsResume < 5 * 60 * 1000){
    return;
  }

  __lastNewsResume = now;

  sessionStorage.setItem(
    "__lastNewsResume",
    String(now)
  );

  if(typeof refreshNewsBadge === "function"){
    refreshNewsBadge();
  }
}


/* =========================
🔥 APP RESUME - ONE BIND ONLY
========================= */

if(!window.__newsResumeBound){

  window.__newsResumeBound = true;

  document.addEventListener("visibilitychange", function(){

    if(document.hidden) return;

    setTimeout(function(){
      safeRefreshNewsBadge();
    }, 1200);

  });

}
}); // ✅ đóng DOMContentLoaded
})();


/* ORIGINAL SCRIPT BLOCK 42 */


(function(){

  function mountFixedMobileNav(){
    var isIOSApp =
      document.documentElement.classList.contains("ios-app-mode") ||
      document.documentElement.classList.contains("cocbase-native-ios") ||
      (navigator.userAgent || "").indexOf("CocBaseProApp-iOS") !== -1;

    if(isIOSApp){
      var iosNav = document.getElementById("mobile-nav");
      if(iosNav){
        iosNav.style.setProperty("display", "none", "important");
      }
      return;
    }

    var nav = document.getElementById("mobile-nav");
    if(!nav) return;

    /* Đưa menu ra thẳng body để position:fixed luôn bám viewport,
       không bị lệch bởi wrapper/transform của template Blogger. */
    if(nav.parentNode !== document.body){
      document.body.appendChild(nav);
    }

    nav.classList.remove("hide", "is-hidden");
    nav.style.removeProperty("transform");
    nav.style.removeProperty("left");
    nav.style.removeProperty("right");
    nav.style.removeProperty("bottom");
    nav.style.removeProperty("width");
    nav.style.removeProperty("opacity");
    nav.style.removeProperty("visibility");
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", mountFixedMobileNav, {once:true});
  }else{
    mountFixedMobileNav();
  }

  window.addEventListener("pageshow", mountFixedMobileNav);
  window.addEventListener("resize", mountFixedMobileNav, {passive:true});

  /* Mobile only: cuộn xuống ẩn menu, cuộn lên hiện lại.
     Desktop >= 901px luôn cố định, không tự ẩn. */
  var lastScrollY = Math.max(0, window.pageYOffset || document.documentElement.scrollTop || 0);
  var ticking = false;
  var minDelta = 8;
  var topReveal = 80;

  function updateMobileNavOnScroll(){
    ticking = false;

    var nav = document.getElementById("mobile-nav");
    if(!nav) return;

    /* PC: luôn hiện */
    if(window.matchMedia("(min-width: 901px)").matches){
      nav.classList.remove("hide", "is-hidden");
      lastScrollY = Math.max(0, window.pageYOffset || document.documentElement.scrollTop || 0);
      return;
    }

    /* Khi More đang mở, menu chính do More quản lý */
    if(document.documentElement.classList.contains("mobile-menu-open")){
      lastScrollY = Math.max(0, window.pageYOffset || document.documentElement.scrollTop || 0);
      return;
    }

    var currentY = Math.max(0, window.pageYOffset || document.documentElement.scrollTop || 0);
    var delta = currentY - lastScrollY;

    if(currentY <= topReveal){
      nav.classList.remove("hide", "is-hidden");
    }else if(delta > minDelta){
      nav.classList.add("is-hidden");
    }else if(delta < -minDelta){
      nav.classList.remove("hide", "is-hidden");
    }

    lastScrollY = currentY;
  }

  window.addEventListener("scroll", function(){
    if(ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateMobileNavOnScroll);
  }, {passive:true});

  window.addEventListener("orientationchange", function(){
    setTimeout(function(){
      var nav = document.getElementById("mobile-nav");
      if(nav) nav.classList.remove("hide", "is-hidden");
      lastScrollY = Math.max(0, window.pageYOffset || document.documentElement.scrollTop || 0);
    }, 150);
  });

})();


/* ORIGINAL SCRIPT BLOCK 43 */

(function(){

  // =============================
  // PURPOSE MAP
  // =============================
  const FIX_MAP = {
    "WAR": "War",
    "TROPHY": "Trophy",
    "FARMING": "Farming",
    "HYBRID": "Hybrid",
    "TROLL": "Troll",
    "CWL": "CWL",
    "LEGEND": "Legend"
  };

  function cap(word){
    word = word.toUpperCase();
    return FIX_MAP[word] || (word.charAt(0) + word.slice(1).toLowerCase());
  }

  // =============================
  // CHỈ FIX TH LEVEL
  // TH18-FARMING => TH18-Farming
  // TH20-WAR => TH20-War
  // =============================
  function normalizeLabel(label){

    return label.replace(/\bTH(\d+)-([A-Z\-]+)/gi, function(match, level, purpose){

      let parts = purpose.split("-").map(cap);

      return "TH" + level + "-" + parts.join("-");
    });

  }

  // =============================
  // FIX LINKS
  // =============================
  function fixAllLinks(){

    document.querySelectorAll("a[href*='/search/label/']").forEach(a => {

      let oldHref = a.getAttribute("href");
      let newHref = normalizeLabel(oldHref);

      if(oldHref !== newHref){
        a.setAttribute("href", newHref);
      }

      if(a.textContent){
        a.textContent = normalizeLabel(a.textContent);
      }

    });

  }

  // =============================
  // REDIRECT LABEL URL SAI
  // =============================
  function handleRedirect(){

    let path = location.pathname;

    if(!path.includes("/search/label/")) return;

    let label = decodeURIComponent(
      path.split("/search/label/")[1] || ""
    );

    let fixed = normalizeLabel(label);

    if(label !== fixed){
      location.replace("/search/label/" + fixed);
    }

  }

  // =============================
  // CANONICAL
  // =============================
  function addCanonical(){

    let path = location.pathname;

    if(!path.includes("/search/label/")) return;

    let label = decodeURIComponent(
      path.split("/search/label/")[1] || ""
    );

    let fixed = normalizeLabel(label);

    let url = location.origin + "/search/label/" + fixed;

    let link = document.querySelector("link[rel='canonical']");

    if(!link){
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }

    link.href = url;

  }

  // RUN
  handleRedirect();
  fixAllLinks();
  addCanonical();

})();

/* ORIGINAL SCRIPT BLOCK 44 */


(function () {
  "use strict";
  if (window.__COCBASE_VPS_IMAGE_V112__) return;
  window.__COCBASE_VPS_IMAGE_V112__ = true;

  var API_ROOT = "https://api.cocbasepro.com/base-index-test/";
  var POST_MAP_URL = API_ROOT + "post-image-map.json";
  var RELATED_MAP_URL = API_ROOT + "related-image-map.json";

  function absUrl(v) {
    if (!v) return "";
    try { return new URL(String(v).replace(/&/g, "&"), location.href).href; }
    catch (e) { return ""; }
  }

  function canonicalPostUrl(v) {
    try {
      var u = new URL(v || location.href, location.href);
      return (u.origin + u.pathname).replace(/\/$/, "");
    } catch (e) { return ""; }
  }

  function normalizeImageKey(v) {
    var src = absUrl(v);
    if (!src) return "";
    try {
      var u = new URL(src);
      u.pathname = u.pathname
        .replace(/\/s\d+(?:-[^\/]*)?\//i, "/SIZE/")
        .replace(/\/w\d+-h\d+(?:-[^\/]*)?\//i, "/SIZE/")
        .replace(/=s\d+(?:-[^\/?#]*)?$/i, "=SIZE")
        .replace(/=w\d+(?:-h\d+)?(?:-[^\/?#]*)?$/i, "=SIZE");
      u.searchParams.delete("w");
      u.searchParams.delete("h");
      return u.href;
    } catch (e) { return src; }
  }

  function currentImageSrc(img) {
    return absUrl(
      img.getAttribute("data-src") ||
      img.getAttribute("data-original") ||
      img.getAttribute("data-lazy-src") ||
      img.currentSrc ||
      img.getAttribute("src") ||
      ""
    );
  }

  var postMapPromise;
  function loadPostMap() {
    if (postMapPromise) return postMapPromise;
    postMapPromise = fetch(POST_MAP_URL, {mode:"cors",cache:"force-cache",credentials:"omit"})
      .then(function(r){ if(!r.ok) throw new Error("post map"); return r.json(); })
      .catch(function(){ return {byImage:{},byPost:{}}; });
    return postMapPromise;
  }

  var relatedMapPromise;
  function loadRelatedMap() {
    if (relatedMapPromise) return relatedMapPromise;
    relatedMapPromise = fetch(RELATED_MAP_URL, {mode:"cors",cache:"force-cache",credentials:"omit"})
      .then(function(r){ if(!r.ok) throw new Error("related map"); return r.json(); })
      .then(function(d){ return d && d.items ? d.items : (d || {}); })
      .catch(function(){ return {}; });
    return relatedMapPromise;
  }

  function applyPostVariant(img, variant) {
    if (!variant || !variant.w768) return;
    var old = currentImageSrc(img);
    if (old) img.dataset.cocOriginalSrc = old;

    img.setAttribute("src", variant.w768);
    if (variant.w1200) {
      img.setAttribute("srcset", variant.w768 + " 768w, " + variant.w1200 + " 1200w");
      img.setAttribute("sizes", "(max-width: 768px) 100vw, 1200px");
    } else {
      img.removeAttribute("srcset");
    }
    img.setAttribute("decoding","async");
    if (!img.hasAttribute("loading")) img.setAttribute("loading","lazy");
    img.dataset.cocVpsImageDone = "1";
  }

  function optimizePostBody() {
    var post = document.querySelector(".post-body-inner");
    if (!post) return;
    var imgs = Array.prototype.slice.call(post.querySelectorAll("img"));
    if (!imgs.length) return;

    loadPostMap().then(function(map){
      var byImage = (map && map.byImage) || {};
      var byPost = (map && map.byPost) || {};
      var postKey = canonicalPostUrl(location.href);
      var postVariants = byPost[postKey] || [];

      imgs.forEach(function(img,index){
        if (img.dataset.cocVpsImageDone === "1") return;
        var src = currentImageSrc(img);
        var normalized = normalizeImageKey(src);
        var variant = byImage[src] || byImage[normalized] || postVariants[index] || null;
        if (variant) applyPostVariant(img, variant);
      });
    });
  }

  function optimizeRelatedPosts() {
    var items = document.querySelectorAll(".post-related-item");
    if (!items.length) return;

    loadRelatedMap().then(function(map){
      Array.prototype.forEach.call(items,function(item){
        var link = item.querySelector("a[href*='.html']");
        var img = item.querySelector(".item-thumbnail img, img");
        if (!link || !img || img.dataset.cocRelatedVps === "1") return;

        var key = canonicalPostUrl(link.href);
        var thumb = map[key] || map[link.href] || "";
        if (!thumb) return;

        var old = currentImageSrc(img);
        if (old) img.dataset.cocOriginalSrc = old;
        img.setAttribute("src", thumb);
        img.removeAttribute("srcset");
        img.setAttribute("loading","lazy");
        img.setAttribute("decoding","async");
        img.dataset.cocRelatedVps = "1";
      });
    });
  }

  function run(){
    optimizePostBody();
    optimizeRelatedPosts();
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",run,{once:true});
  } else run();

  window.addEventListener("load",run);
  window.addEventListener("pageshow",run);

  if(document.documentElement && !window.__COCBASE_VPS_IMAGE_OBSERVER_V112__){
    window.__COCBASE_VPS_IMAGE_OBSERVER_V112__ = new MutationObserver(function(){
      clearTimeout(window.__COCBASE_VPS_IMAGE_TIMER_V112__);
      window.__COCBASE_VPS_IMAGE_TIMER_V112__ = setTimeout(run,80);
    });
    window.__COCBASE_VPS_IMAGE_OBSERVER_V112__.observe(document.documentElement,{
      childList:true,subtree:true
    });
  }
})();


/* ORIGINAL SCRIPT BLOCK 45 */

(function () {
  var ua = navigator.userAgent || "";
  var isIOSApp = ua.indexOf("CocBaseProApp-iOS") !== -1;

  if (!isIOSApp) return;

  function applyIOSAppMode() {
    document.documentElement.classList.add(
      "ios-app-mode",
      "cocbase-native-ios"
    );

    if (document.body) {
      document.body.classList.add(
        "ios-app-mode",
        "cocbase-native-ios"
      );
    }
  }

  applyIOSAppMode();

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      applyIOSAppMode,
      { once: true }
    );
  }

  window.addEventListener("pageshow", applyIOSAppMode);
})();

/* ORIGINAL SCRIPT BLOCK 46 */

(function(){
  function removeCookieBanner(){
    document.querySelectorAll(
      '#cookieChoiceInfo,.cookieChoicesInfo,.cookie-choices-info,div[id*="cookieChoice"],div[class*="cookieChoice"]'
    ).forEach(function(el){
      el.remove();
    });
  }

  removeCookieBanner();
  setTimeout(removeCookieBanner, 500);
  setTimeout(removeCookieBanner, 1500);
})();

/* ORIGINAL SCRIPT BLOCK 47 */

setInterval(function(){

  var header = document.querySelector('.post-related-header');

  if(header && !header.querySelector('.app-store-row')){

    var randomBtn = header.querySelector('.post-related-random-button');

    var storeHtml = `
      <div class='app-store-row'>
        <a href='https://play.google.com/store/apps/details?id=com.cocbase.appbase' rel='noopener' target='_blank'>
          <img alt='Google Play' src='https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgGnjbdjf7rL57w60Dicwl_UjE0RdhORdYvNbSE65mY_jRLczTfy01ckVP68ehDKzEPcOkusQGkahRloewVh9qLzh2ohEyIFyrmvsK4UaCE6k7f-1Wwb90_wvVfwtcwqtx9rw9vp02921esDIDRtzN1opEr2nMeM4WslkRHyD7rC-tPAO7djwYOyfl130go/s600/pngegg_cropped.png'/>
        </a>

        <a href='https://apps.apple.com/app/ai-find-base/id6782599725' rel='noopener' target='_blank'>
          <img alt='App Store' src='https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiz-hlYLLIxeud4RIUzK6EdE-KfXo7LraNKsCfuh94XuvqM_t77GbY1rAbGAcgkyg6tiXhQrnQ0PO1FgIvSDpAwrM9uaoi1QHuEq7212j7HKYzj8_rz6pEv5shQO8uPhrFJnQczv9-omgM1TPyCyRiOMSFffHyvdC8QPA2hUgo2ueRkIP1jut0ZDZXGRahL/s600/pngegg_cropped_cropped.png'/>
        </a>
      </div>
    `;

    if(randomBtn){
      randomBtn.insertAdjacentHTML('beforebegin', storeHtml);
    }else{
      header.insertAdjacentHTML('beforeend', storeHtml);
    }
  }

},1000);
  
/* ORIGINAL SCRIPT BLOCK 48 */


document.addEventListener('DOMContentLoaded',function(){
  var imgs=document.querySelectorAll('img');
  for(var i=0;i<imgs.length;i++){
    var img=imgs[i];
    if(i<2){
      if(!img.getAttribute('fetchpriority')) img.setAttribute('fetchpriority','high');
      if(!img.getAttribute('decoding')) img.setAttribute('decoding','async');
    }else{
      if(!img.getAttribute('loading')) img.setAttribute('loading','lazy');
      if(!img.getAttribute('decoding')) img.setAttribute('decoding','async');
    }
  }
},{once:true});


/* ORIGINAL SCRIPT BLOCK 49 */


(function(){
  document.addEventListener("keydown",function(e){
    if(e.key !== "Escape") return;

    var ai = document.getElementById("ai-finder-popup");
    if(ai && ai.classList.contains("show")){
      if(typeof ai._setAIFinderOpen === "function"){
        ai._setAIFinderOpen(false);
      }else{
        ai.classList.remove("show");
        document.documentElement.classList.remove("cbp-tool-fullscreen-open");
      }
      return;
    }

    var simple = document.getElementById("simple-popup");
    if(simple && simple.classList.contains("hero-skins-fullscreen")){
      if(typeof window.closeSimple === "function"){
        window.closeSimple();
      }
    }
  });
})();


/* ORIGINAL SCRIPT BLOCK 50 */


(function(){
  function openAICompat(){
    if(typeof window.openAIFinder === "function"){
      window.openAIFinder();
      return true;
    }

    var button = document.getElementById("nav-ai-btn");
    if(button){
      button.click();
      return true;
    }

    return false;
  }

  /* Compatibility names for existing app builds */
  window.openAIFinderPopup = openAICompat;
  window.openAIFinderFromApp = openAICompat;
  window.openAIBaseFinder = openAICompat;
  window.openAI = openAICompat;

  /* Old app builds may dispatch a custom event instead of clicking the button */
  window.addEventListener("open-ai-finder", openAICompat);
  document.addEventListener("open-ai-finder", openAICompat);

  /* URL fallback used by some WebView builds */
  function openFromQuery(){
    try{
      var params = new URLSearchParams(location.search);
      if(
        params.get("open_ai") === "1" ||
        params.get("openAI") === "1" ||
        params.get("ai") === "1"
      ){
        setTimeout(openAICompat, 350);
      }
    }catch(e){}
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", openFromQuery, {once:true});
  }else{
    openFromQuery();
  }
})();


/* ORIGINAL SCRIPT BLOCK 51 */


(function(){
  'use strict';

  /* =========================================================
     PREMIUM LINK MAPPER V11.7
     BuyMeACoffee /e/{id} -> direct Clash of Clans copy link.
     Fixes:
       - loads cached map immediately
       - fetches fresh GitHub map
       - rewrites href in DOM after map is ready
       - capture-phase click fallback
       - preserves real donation links without /e/{id}
  ========================================================= */
  var MAP_URL='https://raw.githubusercontent.com/hoangquocvuong/premium-map.json/main/premium-map.json';
  var CACHE_KEY='cbp_premium_map_web_v2';
  var baseMap={};
  var mapReady=null;

  function normalizeMap(data){
    var out={};
    if(!data || typeof data!=='object') return out;

    Object.keys(data).forEach(function(key){
      var value=data[key];

      if(typeof value==='string'){
        value=value.trim();

        if(/^https:\/\/link\.clashofclans\.com\//i.test(value)){
          out[String(key).trim()]=value;
        }
      }
    });

    return out;
  }

  function loadCachedMap(){
    try{
      var raw=localStorage.getItem(CACHE_KEY);
      if(raw){
        var parsed=normalizeMap(JSON.parse(raw));
        if(Object.keys(parsed).length){
          baseMap=parsed;
        }
      }
    }catch(e){}
  }

  function getProductId(url){
    try{
      var u=new URL(url,location.href);
      var host=(u.hostname||'').toLowerCase();

      if(
        host!=='buymeacoffee.com' &&
        !host.endsWith('.buymeacoffee.com') &&
        host!=='bmc.link' &&
        !host.endsWith('.bmc.link')
      ){
        return '';
      }

      var m=u.pathname.match(/\/e\/([^/?#]+)/i);
      return m&&m[1] ? decodeURIComponent(m[1]).trim() : '';
    }catch(e){
      return '';
    }
  }

  function isClashLink(url){
    return /^https:\/\/link\.clashofclans\.com\//i.test(String(url||''));
  }

  function rewritePremiumLinks(root){
    var scope=root && root.querySelectorAll ? root : document;
    var links=[];

    try{
      links=scope.querySelectorAll(
        'a[href*="buymeacoffee.com/"][href*="/e/"],a[href*="bmc.link/"][href*="/e/"]'
      );
    }catch(e){
      return 0;
    }

    var changed=0;

    Array.prototype.forEach.call(links,function(a){
      var original=a.getAttribute('data-cbp-premium-original') || a.href || a.getAttribute('href') || '';
      var id=getProductId(original);
      if(!id) return;

      var direct=baseMap[id];
      if(!isClashLink(direct)) return;

      if(!a.getAttribute('data-cbp-premium-original')){
        a.setAttribute('data-cbp-premium-original',original);
      }

      a.setAttribute('href',direct);
      a.setAttribute('data-cbp-premium-id',id);
      a.setAttribute('data-cbp-premium-mapped','1');

      /* Direct copy link should not open a BMC tab. */
      a.removeAttribute('target');

      changed++;
    });

    return changed;
  }

  function loadBaseMap(force){
    if(mapReady && !force) return mapReady;

    loadCachedMap();

    /* Cached map can already make existing links work instantly. */
    rewritePremiumLinks(document);

    mapReady=fetch(
      MAP_URL+'?v='+Date.now(),
      {
        cache:'no-store',
        credentials:'omit'
      }
    )
      .then(function(r){
        if(!r.ok) throw new Error('Map HTTP '+r.status);
        return r.json();
      })
      .then(function(data){
        var parsed=normalizeMap(data);

        if(Object.keys(parsed).length){
          baseMap=parsed;

          try{
            localStorage.setItem(CACHE_KEY,JSON.stringify(parsed));
          }catch(e){}

          rewritePremiumLinks(document);
        }

        return baseMap;
      })
      .catch(function(err){
        console.log('PREMIUM MAP LOAD ERROR:',err);
        return baseMap;
      });

    return mapReady;
  }

  function openCopyLink(url){
    if(!isClashLink(url)) return false;

    window.location.assign(url);
    return true;
  }

  /* Load cache synchronously before first user click. */
  loadCachedMap();

  /* Capture-phase fallback: works even before DOM rewrite completes. */
  document.addEventListener('click',function(ev){
    var a=ev.target&&ev.target.closest ? ev.target.closest('a[href]') : null;
    if(!a) return;

    var currentHref=a.href || a.getAttribute('href') || '';

    /* Already rewritten to Clash link -> normal browser navigation. */
    if(isClashLink(currentHref)) return;

    var original=
      a.getAttribute('data-cbp-premium-original') ||
      currentHref;

    var id=getProductId(original);
    if(!id) return; /* Real donation links continue normally. */

    ev.preventDefault();
    ev.stopPropagation();

    if(typeof ev.stopImmediatePropagation==='function'){
      ev.stopImmediatePropagation();
    }

    var direct=baseMap[id];

    if(isClashLink(direct)){
      openCopyLink(direct);
      return;
    }

    loadBaseMap(true).then(function(map){
      var finalUrl=map[id];

      if(isClashLink(finalUrl)){
        openCopyLink(finalUrl);
        return;
      }

      /* Only if the event ID genuinely is not mapped. */
      window.location.assign(original);
    });
  },true);

  /* Dynamic Blogger/MagOne content: rewrite new premium anchors too. */
  if(document.documentElement){
    new MutationObserver(function(mutations){
      var needRewrite=false;

      mutations.forEach(function(m){
        if(m.addedNodes && m.addedNodes.length){
          needRewrite=true;
        }
      });

      if(needRewrite){
        rewritePremiumLinks(document);
      }
    }).observe(document.documentElement,{
      childList:true,
      subtree:true
    });
  }

  /* Fetch fresh map early, not only at idle. */
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){
      loadBaseMap(false);
    },{once:true});
  }else{
    loadBaseMap(false);
  }

  /* Keep More focused on navigation. Donate now has one unified main-menu popup. */
  function enhanceMenu(){
    var grid=document.querySelector('.more-sheet-grid');
    if(!grid) return false;

    var premiumLink=grid.querySelector('a[href*="premium-coc-bases"]');
    if(premiumLink){
      premiumLink.setAttribute('href','/p/coc-bases.html');
      var label=premiumLink.querySelector('span');
      if(label && label.textContent!=='All Bases') label.textContent='All Bases';
    }

    var upgrade=grid.querySelector('[data-more-action="premium-app"]');
    if(upgrade) upgrade.style.display='none';

    var stale=grid.querySelector('.cbp-support-progress');
    if(stale) stale.remove();
    return true;
  }

  function polishAI(){
    var popup=document.getElementById('ai-finder-popup');
    if(!popup) return;
    var title=popup.querySelector('h2');
    var desc=popup.querySelector('.ai-desc');
    var hint=popup.querySelector('.ai-level-hint');
    var reset=popup.querySelector('#ai-reset-btn');
    var search=popup.querySelector('#ai-search-btn');
    if(title && title.textContent!=='Find Base Source') title.textContent='Find Base Source';
    if(desc && desc.textContent!=='Upload a base screenshot to find its original or closest public source.') desc.textContent='Upload a base screenshot to find its original or closest public source.';
    if(hint) hint.style.display='none';
    if(reset && reset.textContent!=='Reset') reset.textContent='Reset';
    if(search && search.textContent!=='Find Base Source') search.textContent='Find Base Source';
    var demo=popup.querySelector('#ai-demo-remaining');
    if(demo && demo.style.display!=='none') demo.style.display='none';
    return true;
  }

  function initSupportPopup(){
    var popup=document.getElementById('cbp-support-popup');
    var button=document.getElementById('nav-donate-btn');
    if(!popup || !button || popup.dataset.bound==='1') return false;
    popup.dataset.bound='1';

    /* Connect this to your VPS endpoint after enabling the Buy Me a Coffee webhook.
       Supported response:
       {
         "current":42,"goal":100,"currency":"USD","supporterCount":8,
         "monthLabel":"July 2026","daysLeft":5,
         "topSupporters":[{"name":"Player One","amount":15,"avatar":"","message":"Keep going!"}],
         "recentSupporters":[{"name":"Player Two","amount":5,"createdAt":"2026-07-27T08:00:00Z"}]
       }
    */
    var DONATE_STATUS_URL='https://seo.cocbaseai.com/api/donate-status';
    var state={current:0,goal:100,currency:'USD',supporterCount:0,monthLabel:'Monthly server goal',daysLeft:null,lifetimeTotal:0,topSupporters:[],recentSupporters:[]};

    var currentEl=document.getElementById('cbp-support-current');
    var goalEl=document.getElementById('cbp-support-goal');
    var percentEl=document.getElementById('cbp-support-percent');
    var fill=document.getElementById('cbp-support-meter-fill');
    var meter=document.getElementById('cbp-support-meter');
    var countEl=document.getElementById('cbp-support-count');
    var daysEl=document.getElementById('cbp-support-days');
    var averageEl=document.getElementById('cbp-support-average');
    var lifetimeEl=document.getElementById('cbp-support-lifetime');
    var monthEl=document.getElementById('cbp-support-month');
    var topList=document.getElementById('cbp-support-top-list');
    var recentList=document.getElementById('cbp-support-recent-list');

    function safeText(value,fallback){
      var text=String(value==null?'':value).trim();
      return text || fallback || '';
    }
    function money(value,currency){
      var number=Math.max(0,Number(value)||0);
      try{return new Intl.NumberFormat('en-US',{style:'currency',currency:currency||'USD',maximumFractionDigits:2}).format(number);}
      catch(e){return '$'+number.toLocaleString('en-US',{maximumFractionDigits:2});}
    }
    function initials(name){
      var parts=safeText(name,'Anonymous').split(/\s+/).filter(Boolean).slice(0,2);
      return parts.map(function(p){return p.charAt(0).toUpperCase();}).join('') || 'A';
    }
    function avatarNode(item){
      var avatar=document.createElement('span');
      avatar.className='cbp-support-avatar';
      if(item && item.avatar){
        var img=document.createElement('img');
        img.alt='';img.loading='lazy';img.referrerPolicy='no-referrer';img.src=item.avatar;
        img.onerror=function(){avatar.textContent=initials(item.name);img.remove();};
        avatar.appendChild(img);
      }else avatar.textContent=initials(item && item.name);
      return avatar;
    }
    function relativeDate(value){
      if(!value) return 'Recently';
      var d=new Date(value);if(isNaN(d.getTime())) return safeText(value,'Recently');
      var diff=Math.max(0,Date.now()-d.getTime());
      var mins=Math.floor(diff/60000);if(mins<1) return 'Just now';if(mins<60) return mins+'m ago';
      var hrs=Math.floor(mins/60);if(hrs<24) return hrs+'h ago';
      var days=Math.floor(hrs/24);return days+'d ago';
    }
    function renderTop(items,currency){
      if(!topList) return;
      topList.textContent='';
      var list=Array.isArray(items)?items.slice(0,10):[];
      if(!list.length){var empty=document.createElement('li');empty.className='cbp-support-empty';empty.textContent='No public supporters yet this month. Be the first!';topList.appendChild(empty);return;}
      list.forEach(function(item,index){
        var li=document.createElement('li');li.className='cbp-support-top-item';
        var rank=document.createElement('span');rank.className='cbp-support-rank';rank.textContent='#'+(index+1);
        var person=document.createElement('span');person.className='cbp-support-person';
        var name=document.createElement('b');name.textContent=safeText(item.name,'Anonymous supporter');
        var note=document.createElement('span');note.textContent=safeText(item.message,item.count&&Number(item.count)>1?Number(item.count)+' donations':'Community supporter');
        person.appendChild(name);person.appendChild(note);
        var amount=document.createElement('strong');amount.className='cbp-support-value';amount.textContent=money(item.amount,currency);
        li.appendChild(rank);li.appendChild(avatarNode(item));li.appendChild(person);li.appendChild(amount);topList.appendChild(li);
      });
    }
    function renderRecent(items,currency){
      if(!recentList) return;
      recentList.textContent='';
      var list=Array.isArray(items)?items.slice(0,6):[];
      if(!list.length){var empty=document.createElement('div');empty.className='cbp-support-empty';empty.textContent='Recent donations will appear here.';recentList.appendChild(empty);return;}
      list.forEach(function(item){
        var row=document.createElement('div');row.className='cbp-support-recent-item';
        var person=document.createElement('span');
        var name=document.createElement('b');name.textContent=safeText(item.name,'Anonymous supporter');
        var when=document.createElement('small');when.textContent=relativeDate(item.createdAt||item.date);
        person.appendChild(name);person.appendChild(when);
        var amount=document.createElement('strong');amount.textContent=money(item.amount,currency);
        row.appendChild(avatarNode(item));row.appendChild(person);row.appendChild(amount);recentList.appendChild(row);
      });
    }
    function render(data){
      data=data||{};
      state.current=Math.max(0,Number(data.current!=null?data.current:state.current)||0);
      state.goal=Math.max(1,Number(data.goal!=null?data.goal:state.goal)||100);
      state.currency=safeText(data.currency,state.currency).toUpperCase();
      state.supporterCount=Math.max(0,Number(data.supporterCount!=null?data.supporterCount:(data.totalSupporters!=null?data.totalSupporters:state.supporterCount))||0);
      state.monthLabel=safeText(data.monthLabel,state.monthLabel);
      state.daysLeft=data.daysLeft!=null?Math.max(0,Number(data.daysLeft)||0):state.daysLeft;
      state.lifetimeTotal=Math.max(0,Number(data.lifetimeTotal!=null?data.lifetimeTotal:state.lifetimeTotal)||0);
      state.topSupporters=Array.isArray(data.topSupporters)?data.topSupporters:state.topSupporters;
      state.recentSupporters=Array.isArray(data.recentSupporters)?data.recentSupporters:state.recentSupporters;
      var pct=Math.max(0,Math.min(100,Math.round((state.current/state.goal)*100)));
      if(currentEl) currentEl.textContent=money(state.current,state.currency);
      if(goalEl) goalEl.textContent=money(state.goal,state.currency);
      if(percentEl) percentEl.textContent=pct+'%';
      if(fill) fill.style.width=pct+'%';
      if(meter){meter.setAttribute('aria-valuenow',String(pct));meter.setAttribute('aria-valuetext',pct+'% funded');}
      if(countEl) countEl.textContent=state.supporterCount.toLocaleString('en-US');
      if(daysEl) daysEl.textContent=state.daysLeft==null?'—':String(state.daysLeft);
      if(averageEl) averageEl.textContent=money(data.averageDonation!=null?data.averageDonation:(state.supporterCount?state.current/state.supporterCount:0),state.currency);
      if(lifetimeEl) lifetimeEl.textContent=money(state.lifetimeTotal,state.currency);
      if(monthEl) monthEl.textContent=state.monthLabel;
      renderTop(state.topSupporters,state.currency);
      renderRecent(state.recentSupporters,state.currency);
    }

    var lastDonateLoad=0;
    function loadDonateStatus(force){
      if(!DONATE_STATUS_URL) return;
      if(!force && Date.now()-lastDonateLoad<60000) return;
      lastDonateLoad=Date.now();
      fetch(DONATE_STATUS_URL,{cache:'no-store',mode:'cors',headers:{'Accept':'application/json'}})
        .then(function(r){if(!r.ok) throw new Error('Donate status HTTP '+r.status);return r.json();})
        .then(function(data){
          if(!data || data.ok===false) throw new Error('Invalid donate response');
          popup.classList.remove('cbp-support-offline');
          popup.classList.add('cbp-support-live-data');
          render(data);
        })
        .catch(function(){popup.classList.add('cbp-support-offline');});
    }

    render(state);
    loadDonateStatus(true);

    function setOpen(open){
      popup.classList.toggle('show',!!open);
      popup.setAttribute('aria-hidden',open?'false':'true');
      document.documentElement.classList.toggle('cbp-support-open',!!open);
      if(open){loadDonateStatus(false);var close=popup.querySelector('.cbp-support-close');if(close) setTimeout(function(){close.focus();},30);}
    }
    button.addEventListener('click',function(e){e.preventDefault();setOpen(true);});
    popup.addEventListener('click',function(e){if(e.target.closest('[data-close-support="1"]')) setOpen(false);});
    document.addEventListener('keydown',function(e){if(e.key==='Escape' && popup.classList.contains('show')) setOpen(false);});
    return true;
  }

  function initializeCommunityUI(){
    enhanceMenu();
    polishAI();
    initSupportPopup();
  }

  /* Debounced observer: only reacts to newly inserted UI and never rewrites unchanged text. */
  var uiTimer=0;
  var observer=new MutationObserver(function(){
    clearTimeout(uiTimer);
    uiTimer=setTimeout(initializeCommunityUI,40);
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initializeCommunityUI,{once:true});
  else initializeCommunityUI();
})();


/* ORIGINAL SCRIPT BLOCK 52 */


(function(){
  'use strict';
  function applyV114(){
    var grid=document.querySelector('#mobile-more-sheet .more-sheet-grid');
    if(!grid) return;
    /* Keep exactly nine compact menu cells. Privacy remains available in the site footer. */
    var privacy=grid.querySelector('a[href*="privacy-policy"]');
    if(privacy) privacy.remove();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',applyV114,{once:true});
  else applyV114();
})();


/* ORIGINAL SCRIPT BLOCK 53 */


(function(){
  'use strict';
  function syncThemeNow(){
    var body=document.body;
    if(!body) return;
    var mode=body.getAttribute('data-mode')==='dark'?'dark':'light';
    document.documentElement.setAttribute('data-cbp-mode',mode);
  }
  function cleanupNews(){
    var old=document.getElementById('nav-news-btn');
    if(old) old.remove();
    var badge=document.getElementById('news-badge');
    if(badge) badge.remove();
  }
  function init(){
    syncThemeNow();
    if(document.body){
      new MutationObserver(syncThemeNow).observe(document.body,{attributes:true,attributeFilter:['data-mode']});
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();


/* ORIGINAL SCRIPT BLOCK 55 */


(function(){
  'use strict';

  function setImp(el, prop, value){
    if(el) el.style.setProperty(prop,value,'important');
  }

  function each(selector, fn){
    document.querySelectorAll(selector).forEach(fn);
  }

  function applyRuntimeTheme(){
    var body=document.body;
    if(!body) return;
    var dark=body.getAttribute('data-mode')==='dark';
    var surface=dark?'#15171c':'#ffffff';
    var card=dark?'#1d2129':'#ffffff';
    var card2=dark?'#20232a':'#f5f7fa';
    var text=dark?'#f4f7fb':'#172033';
    var muted=dark?'#aab2c0':'#667085';
    var border=dark?'rgba(255,255,255,.14)':'rgba(15,23,42,.15)';

    var nav=document.getElementById('mobile-nav');
    if(nav){
      setImp(nav,'background',surface);
      setImp(nav,'background-color',surface);
      setImp(nav,'background-image','none');
      setImp(nav,'color',text);
      setImp(nav,'border-color',border);
      setImp(nav,'opacity','1');
      setImp(nav,'backdrop-filter','none');
      setImp(nav,'-webkit-backdrop-filter','none');
    }
    each('#mobile-nav .nav-item,#mobile-nav .nav-btn',function(el){
      setImp(el,'color',text);
    });

    var panel=document.querySelector('#cbp-support-popup .cbp-support-panel');
    if(panel){
      setImp(panel,'background',surface);
      setImp(panel,'background-color',surface);
      setImp(panel,'color',text);
      setImp(panel,'border-color',border);
    }

    each('#cbp-support-popup .cbp-support-goal-card,#cbp-support-popup .cbp-support-leaderboard,#cbp-support-popup .cbp-support-recent,#cbp-support-popup .cbp-support-message',function(el){
      setImp(el,'background',card2);
      setImp(el,'background-color',card2);
      setImp(el,'color',text);
      setImp(el,'border-color',border);
    });

    each('#cbp-support-popup .cbp-support-stats > div,#cbp-support-popup .cbp-support-top-item,#cbp-support-popup .cbp-support-recent-item,#cbp-support-popup .cbp-support-empty',function(el){
      setImp(el,'background',card);
      setImp(el,'background-color',card);
      setImp(el,'color',text);
      setImp(el,'border-color',border);
    });

    each('#cbp-support-popup h1,#cbp-support-popup h2,#cbp-support-popup h3,#cbp-support-popup h4,#cbp-support-popup strong,#cbp-support-popup b,#cbp-support-popup .cbp-support-name,#cbp-support-popup .cbp-support-amount',function(el){
      setImp(el,'color',text);
    });

    each('#cbp-support-popup p,#cbp-support-popup small,#cbp-support-popup .cbp-support-meta,#cbp-support-popup .cbp-support-privacy,#cbp-support-popup .cbp-support-stats span,#cbp-support-popup .cbp-support-amounts',function(el){
      setImp(el,'color',muted);
    });

    var close=document.querySelector('#cbp-support-popup .cbp-support-close');
    if(close){
      setImp(close,'background',card2);
      setImp(close,'color',text);
      setImp(close,'border-color',border);
    }
  }

  var raf=0;
  function scheduleApply(){
    if(raf) return;
    raf=requestAnimationFrame(function(){
      raf=0;
      applyRuntimeTheme();
    });
  }

  function init(){
    applyRuntimeTheme();
    if(document.body){
      new MutationObserver(scheduleApply).observe(document.body,{attributes:true,attributeFilter:['data-mode']});
    }
    var popup=document.getElementById('cbp-support-popup');
    if(popup){
      new MutationObserver(scheduleApply).observe(popup,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
    }
    window.addEventListener('scroll',scheduleApply,{passive:true});
    window.addEventListener('resize',scheduleApply,{passive:true});
    document.addEventListener('click',function(e){
      if(e.target.closest('#nav-donate-btn,#cbp-support-popup,.header-mode-toggle,#header-mode-toggle-checkbox')){
        setTimeout(applyRuntimeTheme,0);
        setTimeout(applyRuntimeTheme,80);
      }
    },true);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();


/* ORIGINAL SCRIPT BLOCK 56 */


(function(){
  'use strict';
  function syncMainNavWithMore(){
    var nav=document.getElementById('mobile-nav');
    var sheet=document.getElementById('mobile-more-sheet');
    if(!nav) return;
    var open=document.documentElement.classList.contains('mobile-menu-open') ||
             document.body.classList.contains('mobile-menu-open') ||
             (sheet && sheet.classList.contains('show'));
    if(open){
      nav.style.setProperty('display','none','important');
      nav.style.setProperty('opacity','0','important');
      nav.style.setProperty('visibility','hidden','important');
      nav.style.setProperty('pointer-events','none','important');
      nav.setAttribute('aria-hidden','true');
    }else{
      nav.style.removeProperty('display');
      nav.style.removeProperty('visibility');
      nav.style.removeProperty('pointer-events');
      nav.style.removeProperty('opacity');
      nav.setAttribute('aria-hidden','false');
      if(typeof window.requestAnimationFrame==='function'){
        requestAnimationFrame(function(){
          if(typeof window.dispatchEvent==='function') window.dispatchEvent(new Event('resize'));
        });
      }
    }
  }
  function init(){
    syncMainNavWithMore();
    var sheet=document.getElementById('mobile-more-sheet');
    new MutationObserver(syncMainNavWithMore).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
    if(document.body) new MutationObserver(syncMainNavWithMore).observe(document.body,{attributes:true,attributeFilter:['class']});
    if(sheet) new MutationObserver(syncMainNavWithMore).observe(sheet,{attributes:true,attributeFilter:['class','aria-hidden']});
    document.addEventListener('click',function(e){
      if(e.target.closest('#nav-more-btn,[data-close-more="1"],#mobile-more-sheet .more-sheet-item,#mobile-more-sheet .more-sheet-close')){
        setTimeout(syncMainNavWithMore,0);
        setTimeout(syncMainNavWithMore,80);
      }
    },true);
    window.addEventListener('pageshow',syncMainNavWithMore);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();


/* ORIGINAL SCRIPT BLOCK 57 */


(function(){
  'use strict';

  function closeMoreMenu(){
    var sheet=document.getElementById('mobile-more-sheet');
    if(sheet){
      sheet.classList.remove('show','open','is-open');
      sheet.setAttribute('aria-hidden','true');
    }
    document.documentElement.classList.remove('mobile-menu-open');
    if(document.body) document.body.classList.remove('mobile-menu-open');
  }

  function openDonateCenter(){
    var popup=document.getElementById('cbp-support-popup');
    if(!popup) return false;

    closeMoreMenu();
    popup.classList.add('show');
    popup.setAttribute('aria-hidden','false');
    document.documentElement.classList.add('cbp-support-open');

    try{
      if(location.hash!=='#donate-center'){
        history.replaceState(null,'',location.pathname+location.search+'#donate-center');
      }
    }catch(e){}

    var close=popup.querySelector('.cbp-support-close');
    if(close) setTimeout(function(){try{close.focus();}catch(e){}},50);
    return true;
  }

  function closeDonateCenter(){
    var popup=document.getElementById('cbp-support-popup');
    if(!popup) return false;
    popup.classList.remove('show');
    popup.setAttribute('aria-hidden','true');
    document.documentElement.classList.remove('cbp-support-open');
    try{
      if(location.hash==='#donate-center'){
        history.replaceState(null,'',location.pathname+location.search);
      }
    }catch(e){}
    return true;
  }

  window.openDonateCenter=openDonateCenter;
  window.openSupportCenter=openDonateCenter;
  window.closeDonateCenter=closeDonateCenter;

  /* Capture phase prevents old template/app handlers from swallowing the tap. */
  document.addEventListener('click',function(e){
    var donate=e.target && e.target.closest ? e.target.closest('#nav-donate-btn,[data-open-donate="1"]') : null;
    if(donate){
      e.preventDefault();
      e.stopPropagation();
      if(e.stopImmediatePropagation) e.stopImmediatePropagation();
      openDonateCenter();
      return;
    }

    var close=e.target && e.target.closest ? e.target.closest('#cbp-support-popup [data-close-support="1"]') : null;
    if(close){
      e.preventDefault();
      closeDonateCenter();
    }
  },true);

  document.addEventListener('touchend',function(e){
    var donate=e.target && e.target.closest ? e.target.closest('#nav-donate-btn') : null;
    if(donate){
      e.preventDefault();
      openDonateCenter();
    }
  },{capture:true,passive:false});

  function openFromLocation(){
    var shouldOpen=location.hash==='#donate-center';
    try{
      var params=new URLSearchParams(location.search);
      shouldOpen=shouldOpen || params.get('open_donate')==='1' || params.get('donate')==='1';
    }catch(e){}
    if(shouldOpen) setTimeout(openDonateCenter,180);
  }

  window.addEventListener('hashchange',openFromLocation);
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',openFromLocation,{once:true});
  }else{
    openFromLocation();
  }
})();


/* ORIGINAL SCRIPT BLOCK 58 */


(function(){
  'use strict';

  function renderBadge(){
    var badge=document.getElementById('news-badge');
    if(!badge) return;

    var text=(badge.textContent || '').trim();
    var count=parseInt(text.replace(/[^\d]/g,''),10);

    if(!isFinite(count) || count<=0){
      badge.classList.add('is-empty');
      badge.style.display='none';
      return;
    }

    badge.classList.remove('is-empty');
    badge.style.display='inline-flex';

    if(count>9 || text.indexOf('+')!==-1){
      badge.textContent='9+';
    }
  }

  function init(){
    renderBadge();
    setInterval(renderBadge,1200);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init,{once:true});
  }else{
    init();
  }
})();


/* ORIGINAL SCRIPT BLOCK 59 */


(function(){
  'use strict';
  document.addEventListener('click',function(e){
    var btn=e.target && e.target.closest ? e.target.closest('#ai-finder-popup .ai-pro-donate-btn') : null;
    if(!btn)return;
    e.preventDefault();
    var popup=document.getElementById('ai-finder-popup');
    if(popup){popup.classList.remove('show');popup.setAttribute('aria-hidden','true');}
    document.documentElement.classList.remove('cbp-tool-fullscreen-open');
    if(typeof window.openDonateCenter==='function'){
      setTimeout(window.openDonateCenter,80);
    }else{
      location.hash='donate-center';
      var support=document.getElementById('cbp-support-popup');
      if(support){support.classList.add('show','is-open','open');support.setAttribute('aria-hidden','false');}
    }
  },true);
})();


/* ORIGINAL SCRIPT BLOCK 60 */


(function(){
  'use strict';
  function bind(){
    var popup=document.getElementById('ai-finder-popup');
    if(!popup || popup.dataset.cbpAiV1122==='1')return;
    popup.dataset.cbpAiV1122='1';
    var input=popup.querySelector('#ai-image-input');
    var choose=popup.querySelector('#ai-choose-btn');
    var box=popup.querySelector('#ai-upload-box');
    if(choose && input){choose.addEventListener('click',function(){input.click();});}
    if(box && input){
      ['dragenter','dragover'].forEach(function(type){box.addEventListener(type,function(e){e.preventDefault();box.classList.add('dragover');});});
      ['dragleave','drop'].forEach(function(type){box.addEventListener(type,function(e){e.preventDefault();box.classList.remove('dragover');});});
      box.addEventListener('drop',function(e){
        if(!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length)return;
        try{
          var dt=new DataTransfer();
          dt.items.add(e.dataTransfer.files[0]);
          input.files=dt.files;
          input.dispatchEvent(new Event('change',{bubbles:true}));
        }catch(err){}
      });
    }
  }
  document.addEventListener('click',function(e){
    if(e.target && e.target.closest && e.target.closest('#nav-ai-btn'))setTimeout(bind,0);
  },true);
  new MutationObserver(bind).observe(document.documentElement,{childList:true,subtree:true});
  bind();
})();

