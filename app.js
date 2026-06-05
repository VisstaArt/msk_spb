var catColor={must:"#e23a3a",park:"#3fae6a",museum:"#b15de0",shop:"#f5b942",modern:"#3a6ee2",food:"#e07a3f"};
var lang="tr",city="moscow",map=null,markers=[],useLeaflet=false;

function allPlaces(){return (DATA[city].places||[]).concat(DATA[city].food||[]);}
function gmapsUrl(p){return "https://yandex.ru/maps/?pt="+p.lng+","+p.lat+"&z=16&l=map";}

// Map
function initMap(){
  try{
    if(typeof L==="undefined")throw new Error("no leaflet");
    map=L.map("map",{zoomControl:true}).setView(DATA[city].center,DATA[city].zoom);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap, © CARTO",maxZoom:19}).addTo(map);
    useLeaflet=true;
    document.getElementById("schema").style.display="none";
    document.getElementById("map").style.display="block";
  }catch(e){
    useLeaflet=false;
    document.getElementById("map").style.display="none";
    document.getElementById("schema").style.display="block";
  }
}

function drawMarkers(){
  if(useLeaflet&&map){
    markers.forEach(function(m){map.removeLayer(m);}); markers=[];
    allPlaces().forEach(function(p,i){
      var lbl=(p.cat==="food")?"🍽":(i+1);
      var icon=L.divIcon({className:"",html:"<div style=\"background:"+catColor[p.cat]+";width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;\"><span style=\"transform:rotate(45deg);color:"+(p.cat==="shop"?"#1a1d28":"#fff")+";font-weight:700;font-size:12px;font-family:Unbounded,sans-serif;\">"+lbl+"</span></div>",iconSize:[28,28],iconAnchor:[14,28],popupAnchor:[0,-26]});
      var m=L.marker([p.lat,p.lng],{icon:icon}).addTo(map);
      var imgHtml=p.imgs&&p.imgs.length?"<img src=\""+p.imgs[0]+"\" style=\"width:100%;height:95px;object-fit:cover;border-radius:11px 11px 0 0;display:block\">":"";
      m.bindPopup("<div class=\"pop\">"+imgHtml+"<div class=\"pin-in\"><div class=\"pt\">"+p.name[lang]+"</div><div class=\"ps\">Ⓜ "+p.metro[lang]+"</div><a href=\""+gmapsUrl(p)+"\" target=\"_blank\">"+T[lang].btnMap+"</a></div></div>");
      m.on("click",(function(idx){return function(){openCard(idx);};})(i));
      markers.push(m);
    });
  } else {
    drawSchema();
  }
}

function drawSchema(){
  var s=document.getElementById("schema");
  document.getElementById("schNote").textContent=T[lang].schNote;
  var old=s.querySelector("svg"); if(old)old.remove();
  var ns="http://www.w3.org/2000/svg";
  var svg=document.createElementNS(ns,"svg"); svg.setAttribute("viewBox","0 0 800 520"); svg.setAttribute("preserveAspectRatio","xMidYMid slice");
  var bg=document.createElementNS(ns,"rect"); bg.setAttribute("width","800");bg.setAttribute("height","520");bg.setAttribute("fill","#11151f"); svg.appendChild(bg);
  var river=document.createElementNS(ns,"path"); river.setAttribute("d",DATA[city].svgRiver); river.setAttribute("stroke","#2b4a7a"); river.setAttribute("stroke-width","26"); river.setAttribute("fill","none"); river.setAttribute("stroke-linecap","round"); svg.appendChild(river);
  allPlaces().forEach(function(p,i){
    var g=document.createElementNS(ns,"g"); g.setAttribute("class","sch-pin"); g.setAttribute("transform","translate("+p.x+","+p.y+")");
    var c=document.createElementNS(ns,"circle"); c.setAttribute("r","15"); c.setAttribute("fill",catColor[p.cat]); c.setAttribute("stroke","#fff"); c.setAttribute("stroke-width","1.5"); g.appendChild(c);
    var t=document.createElementNS(ns,"text"); t.setAttribute("text-anchor","middle"); t.setAttribute("dy","5"); t.setAttribute("fill",p.cat==="shop"?"#1a1d28":"#fff"); t.setAttribute("font-size","13"); t.setAttribute("font-weight","700"); t.setAttribute("font-family","Unbounded,sans-serif"); t.textContent=(p.cat==="food"?"🍽":(i+1)); g.appendChild(t);
    g.addEventListener("click",(function(idx){return function(){openCard(idx);};})(i));
    g.addEventListener("mousemove",(function(pp){return function(ev){showLabel(pp.name[lang],ev);};})(p));
    g.addEventListener("mouseleave",function(){document.getElementById("schLabel").style.display="none";});
    svg.appendChild(g);
  });
  s.insertBefore(svg,s.firstChild.nextSibling);
}

function showLabel(txt,ev){
  var l=document.getElementById("schLabel"),w=document.getElementById("schema").getBoundingClientRect();
  l.textContent=txt;l.style.left=(ev.clientX-w.left)+"px";l.style.top=(ev.clientY-w.top)+"px";l.style.display="block";
}

// Cards
function cardHTML(p,gi,numLabel){
  var alt=(lang==="tr")?"ru":"tr";
  var imgs=p.imgs||[];
  var firstSrc=imgs.length>0?imgs[0]:"";
  var metaLine=(p.cat==="food")?("Ⓜ "+p.metro[lang]+"  ·  💰 "+p.price[lang]):("Ⓜ "+p.metro[lang]+"  ·  ⏱ "+p.time);
  var tagsExtra=(p.cat==="food")?"<span class=\"tag price\">💰 "+T[lang].price+": "+p.price[lang]+"</span>":"<span class=\"tag time\">⏱ "+T[lang].time+": "+p.time+"</span>";
  var gridHTML="";
  for(var pi=1;pi<imgs.length;pi++){
    gridHTML+="<img src=\""+imgs[pi]+"\" onclick=\"event.stopPropagation();lbOpen("+gi+","+pi+")\">";
  }
  var viewBtn="<div style=\"padding:0 14px 8px\"><button onclick=\"event.stopPropagation();lbOpen("+gi+",0)\" style=\"background:var(--panel);border:1px solid var(--line);color:var(--muted);font-family:inherit;font-size:12px;padding:6px 14px;border-radius:8px;cursor:pointer;width:100%\">🖼 "+T[lang].btnPhoto+"</button></div>";
  var photoSection=imgs.length>1?"<div class=\"photo-grid\">"+gridHTML+"</div>":viewBtn;
  var galHTML="<div class=\"gal\" onclick=\"toggleCard("+gi+")\"><div class=\"track\">"+(firstSrc?"<img src=\""+firstSrc+"\">":"")+"</div><div class=\"ov\"></div><div class=\"tnum\">"+numLabel+"</div><div class=\"ttl\"><div class=\"t\">"+p.name[lang]+"</div><div class=\"sub\">"+p.name[alt]+"</div></div></div>";
  var topHTML="<div class=\"card-top\" onclick=\"toggleCard("+gi+")\"><div class=\"meta\">"+metaLine+"</div><div class=\"chev\">▼</div></div>";
  var bodyHTML="<div class=\"card-body\"><div class=\"card-inner\">"+photoSection+"<div class=\"tags\"><span class=\"tag\">"+T[lang].cat[p.cat]+"</span><span class=\"tag metro\">Ⓜ "+p.metro[lang]+"</span>"+tagsExtra+"</div><div class=\"desc\">"+p.desc[lang]+"</div><div class=\"why\"><div class=\"wt\">"+T[lang].why+"</div><ul>"+p.why[lang].map(function(w){return"<li>"+w+"</li>";}).join("")+"</ul></div><div class=\"btns\"><a class=\"btn-map\" href=\""+gmapsUrl(p)+"\" target=\"_blank\">📍 "+T[lang].btnMap+"</a></div></div></div>";
  return galHTML+topHTML+bodyHTML;
}

function renderList(){
  var sg=DATA[city].places||[], fd=DATA[city].food||[];
  var hs=document.getElementById("listSights"); hs.className="list"; hs.innerHTML="";
  sg.forEach(function(p,i){var gi=i;var el=document.createElement("div");el.className="card cat-"+p.cat;el.id="card"+gi;el.innerHTML=cardHTML(p,gi,i+1);hs.appendChild(el);});
  document.getElementById("foodTitle").textContent="🍽  "+T[lang].food;
  var hf=document.getElementById("listFood"); hf.className="list"; hf.innerHTML="";
  fd.forEach(function(p,j){var gi=sg.length+j;var el=document.createElement("div");el.className="card food cat-food";el.id="card"+gi;el.innerHTML=cardHTML(p,gi,"🍽");hf.appendChild(el);});
}

function toggleCard(gi){
  var c=document.getElementById("card"+gi),wasOpen=c.classList.contains("open");
  document.querySelectorAll(".card").forEach(function(x){x.classList.remove("open");});
  if(!wasOpen){c.classList.add("open");var p=allPlaces()[gi];if(useLeaflet&&map){map.setView([p.lat,p.lng],14,{animate:true});if(markers[gi])markers[gi].openPopup();}}
}
function openCard(gi){
  document.querySelectorAll(".card").forEach(function(x){x.classList.remove("open");});
  var c=document.getElementById("card"+gi);if(c){c.classList.add("open");c.scrollIntoView({behavior:"smooth",block:"center"});}
}
function showOnMap(gi){
  var mw=document.getElementById("mapwrap");
  mw.classList.add("map-open");
  var p=allPlaces()[gi];
  setTimeout(function(){
    if(useLeaflet&&map){map.invalidateSize();map.setView([p.lat,p.lng],14,{animate:true});if(markers[gi])markers[gi].openPopup();}
  },350);
  mw.scrollIntoView({behavior:"smooth"});
}

function renderLegend(){
  var lg=document.getElementById("legend");
  lg.innerHTML=["must","park","museum","shop","modern","food"].map(function(k){return"<span><i style=\"background:"+catColor[k]+"\"></i>"+T[lang].cat[k]+"</span>";}).join("");
}

function setCity(c){
  city=c;
  document.getElementById("cMoscow").classList.toggle("active",c==="moscow");
  document.getElementById("cSpb").classList.toggle("active",c==="spb");
  if(useLeaflet&&map)map.setView(DATA[city].center,DATA[city].zoom,{animate:true});
  drawMarkers(); renderList(); updateTexts();
}
function setLang(l){
  lang=l;
  document.getElementById("lTr").classList.toggle("active",l==="tr");
  document.getElementById("lRu").classList.toggle("active",l==="ru");
  drawMarkers(); renderList(); renderLegend(); updateTexts();
}
function updateTexts(){
  document.getElementById("brandText").textContent=T[lang].brand;
  document.getElementById("cityName").textContent=DATA[city].name[lang];
  document.getElementById("cityDesc").textContent=T[lang].cityDesc[city];
}

// Lightbox
var _lb={gi:0,idx:0};
function lbOpen(gi,idx){
  var imgs=(allPlaces()[gi].imgs)||[];if(!imgs.length)return;
  _lb={gi:gi,idx:idx};
  document.getElementById("lbImg").src=imgs[idx];
  document.getElementById("lbCount").textContent=(idx+1)+" / "+imgs.length;
  document.getElementById("lb").classList.add("on");
  document.body.style.overflow="hidden";
}
function lbMove(d){
  var imgs=(allPlaces()[_lb.gi].imgs)||[];
  _lb.idx=(_lb.idx+d+imgs.length)%imgs.length;
  document.getElementById("lbImg").src=imgs[_lb.idx];
  document.getElementById("lbCount").textContent=(_lb.idx+1)+" / "+imgs.length;
}
function lbClose(){document.getElementById("lb").classList.remove("on");document.body.style.overflow="";}
document.addEventListener("keydown",function(e){
  if(!document.getElementById("lb").classList.contains("on"))return;
  if(e.key==="ArrowRight")lbMove(1);else if(e.key==="ArrowLeft")lbMove(-1);else if(e.key==="Escape")lbClose();
});

// Boot
function boot(){
  initMap(); drawMarkers(); renderList(); renderLegend(); updateTexts();
  if(useLeaflet&&map)setTimeout(function(){map.invalidateSize();},200);
  var lbEl=document.getElementById("lb");
  if(lbEl)lbEl.addEventListener("click",function(e){if(e.target===this)lbClose();});
}
function loadLeaflet(cb){
  var s=document.createElement("script");s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";s.onload=cb;s.onerror=cb;document.head.appendChild(s);
}
window.addEventListener("load",function(){loadLeaflet(boot);});
