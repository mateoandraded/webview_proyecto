export const config = {
  runtime: 'edge',
};

const API_KEY = "db_HQIwDXV9xkJTEU5F3wwYAGhHAGInsItCu79g5FSz6e3106ee";
const BASE_URL = "https://mateoacademy-9djnmu.jelou.cloud/api/collections";

const FLAGS_MAP = {"MEXICO":"\uD83C\uDDF2\uD83C\uDDFD","ESTADOS UNIDOS":"\uD83C\uDDFA\uD83C\uDDF8","CANADA":"\uD83C\uDDE8\uD83C\uDDE6","BRASIL":"\uD83C\uDDE7\uD83C\uDDF7","ARGENTINA":"\uD83C\uDDE6\uD83C\uDDF7","ECUADOR":"\uD83C\uDDEA\uD83C\uDDE8","COLOMBIA":"\uD83C\uDDE8\uD83C\uDDF4","PERU":"\uD83C\uDDF5\uD83C\uDDEA","CHILE":"\uD83C\uDDE8\uD83C\uDDF1","URUGUAY":"\uD83C\uDDFA\uD83C\uDDFE","PARAGUAY":"\uD83C\uDDF5\uD83C\uDDFE","BOLIVIA":"\uD83C\uDDE7\uD83C\uDDF4","VENEZUELA":"\uD83C\uDDFB\uD83C\uDDEA","ALEMANIA":"\uD83C\uDDE9\uD83C\uDDEA","ESPANA":"\uD83C\uDDEA\uD83C\uDDF8","ESPAÑA":"\uD83C\uDDEA\uD83C\uDDF8","FRANCIA":"\uD83C\uDDEB\uD83C\uDDF7","ITALIA":"\uD83C\uDDEE\uD83C\uDDF9","PORTUGAL":"\uD83C\uDDF5\uD83C\uDDF9","PAISES BAJOS":"\uD83C\uDDF3\uD83C\uDDF1","BELGICA":"\uD83C\uDDE7\uD83C\uDDEA","CROACIA":"\uD83C\uDDED\uD83C\uDDF7","SERBIA":"\uD83C\uDDF7\uD83C\uDDF8","SUIZA":"\uD83C\uDDE8\uD83C\uDDED","DINAMARCA":"\uD83C\uDDE9\uD83C\uDDF0","AUSTRIA":"\uD83C\uDDE6\uD83C\uDDF9","UCRANIA":"\uD83C\uDDFA\uD83C\uDDE6","TURQUIA":"\uD83C\uDDF9\uD83C\uDDF7","HUNGRIA":"\uD83C\uDDED\uD83C\uDDFA","REPUBLICA CHECA":"\uD83C\uDDE8\uD83C\uDDFF","GRECIA":"\uD83C\uDDEC\uD83C\uDDF7","JAPON":"\uD83C\uDDEF\uD83C\uDDF5","REPUBLICA DE COREA":"\uD83C\uDDF0\uD83C\uDDF7","COREA DEL SUR":"\uD83C\uDDF0\uD83C\uDDF7","AUSTRALIA":"\uD83C\uDDE6\uD83C\uDDFA","IRAN":"\uD83C\uDDEE\uD83C\uDDF7","ARABIA SAUDITA":"\uD83C\uDDF8\uD83C\uDDE6","QATAR":"\uD83C\uDDF6\uD83C\uDDE6","MARRUECOS":"\uD83C\uDDF2\uD83C\uDDE6","SENEGAL":"\uD83C\uDDF8\uD83C\uDDF3","GHANA":"\uD83C\uDDEC\uD83C\uDDED","CAMERUN":"\uD83C\uDDE8\uD83C\uDDF2","NIGERIA":"\uD83C\uDDF3\uD83C\uDDEC","TUNEZ":"\uD83C\uDDF9\uD83C\uDDF3","SUDAFRICA":"\uD83C\uDDFF\uD83C\uDDE6","EGIPTO":"\uD83C\uDDEA\uD83C\uDDEC","COSTA RICA":"\uD83C\uDDE8\uD83C\uDDF7","PANAMA":"\uD83C\uDDF5\uD83C\uDDE6","HONDURAS":"\uD83C\uDDED\uD83C\uDDF3","JAMAICA":"\uD83C\uDDEF\uD83C\uDDF2","INDONESIA":"\uD83C\uDDEE\uD83C\uDDE9","NUEVA ZELANDA":"\uD83C\uDDF3\uD83C\uDDFF","GALES":"\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73\uDB40\uDC7F","ESCOCIA":"\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74\uDB40\uDC7F","INGLATERRA":"\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67\uDB40\uDC7F","POLONIA":"\uD83C\uDDF5\uD83C\uDDF1","RUMANIA":"\uD83C\uDDF7\uD83C\uDDF4","ESLOVENIA":"\uD83C\uDDF8\uD83C\uDDEE","ESLOVAQUIA":"\uD83C\uDDF8\uD83C\uDDF0","ALBANIA":"\uD83C\uDDE6\uD83C\uDDF1","ARGELIA":"\uD83C\uDDE9\uD83C\uDDFF","COSTA DE MARFIL":"\uD83C\uDDE8\uD83C\uDDEE","NORUEGA":"\uD83C\uDDF3\uD83C\uDDF4","SUECIA":"\uD83C\uDDF8\uD83C\uDDEA","IRLANDA":"\uD83C\uDDEE\uD83C\uDDEA","TRINIDAD Y TOBAGO":"\uD83C\uDDF9\uD83C\uDDF9","EL SALVADOR":"\uD83C\uDDF8\uD83C\uDDFB","GUATEMALA":"\uD83C\uDDEC\uD83C\uDDF9"};

const WC_TEAMS = ["MEXICO","ESTADOS UNIDOS","CANADA","BRASIL","ARGENTINA","ECUADOR","COLOMBIA","URUGUAY","PARAGUAY","CHILE","PERU","VENEZUELA","ALEMANIA","ESPAÑA","FRANCIA","PORTUGAL","BELGICA","PAISES BAJOS","CROACIA","SERBIA","SUIZA","TURQUIA","DINAMARCA","AUSTRIA","POLONIA","RUMANIA","ESLOVENIA","ESLOVAQUIA","ALBANIA","UCRANIA","GRECIA","MARRUECOS","SENEGAL","NIGERIA","CAMERUN","COSTA DE MARFIL","EGIPTO","GHANA","TUNEZ","JAPON","COREA DEL SUR","AUSTRALIA","IRAN","ARABIA SAUDITA","INDONESIA","COSTA RICA","PANAMA","JAMAICA"];

async function fetchDatum(collection, method, body, id, query) {
  method = method || 'GET'; id = id || ''; query = query || '';
  const url = BASE_URL + '/' + collection + '/records' + (id ? '/' + id : '') + '?perPage=500' + query;
  const options = { method: method, headers: { 'X-Api-Key': API_KEY, 'Content-Type': 'application/json' } };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  if (!res.ok) throw new Error('HTTP Error ' + res.status);
  if (method === 'DELETE' || res.status === 204) return true;
  return await res.json();
}

export default async function handler(req) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('user_id') || 'GUEST';
  const executionId = url.searchParams.get('executionId') || '';

  if (req.method === 'POST') {
    try {
      const data = await req.json();
      let existingItems = [];
      try {
        const existReq = await fetchDatum('pronosticos_brackets', 'GET', null, '', "&filter=(user_id='" + userId + "')");
        existingItems = existReq.items || existReq;
      } catch(e) { existingItems = []; }
      const payload = {
        user_id: userId,
        dieciseisavos: data.dieciseisavos || [],
        octavos: data.octavos || [],
        cuartos: data.cuartos || [],
        semis: data.semis || [],
        campeon: data.campeon || "",
        subcampeon: data.subcampeon || "",
        tercer_lugar: data.tercer_lugar || "",
        cuarto_lugar: data.cuarto_lugar || ""
      };
      if (existingItems.length > 0) {
        await fetchDatum('pronosticos_brackets', 'PATCH', payload, existingItems[0].id, '');
      } else {
        await fetchDatum('pronosticos_brackets', 'POST', payload, '', '');
      }
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  let uBracket = {};
  if (userId !== 'GUEST') {
    try {
      const dbb = await fetchDatum('pronosticos_brackets', 'GET', null, '', "&filter=(user_id='" + userId + "')");
      if (dbb.items && dbb.items.length > 0) uBracket = dbb.items[0];
    } catch(e) {}
  }

  const savedJson = JSON.stringify(uBracket);
  const teamsJson = JSON.stringify(WC_TEAMS);
  const flagsJson = JSON.stringify(FLAGS_MAP);

  const html = '<!DOCTYPE html>' +
'<html lang="es"><head>' +
'<meta charset="UTF-8">' +
'<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">' +
'<title>Mis Clasificados \u00B7 Jelou Mundial 2026</title>' +
'<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">' +
'<style>' +
':root{--black:#000;--white:#fff;--lime:#C9FF24;--mag:#FF0055;--teal:#00FFCC;--purple:#6200EA;--dim:#181818;--dim2:#222;--bd:rgba(255,255,255,.12)}' +
'*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}' +
'body{background:var(--black);color:var(--white);font-family:Inter,sans-serif;padding-bottom:140px}' +
'.app{max-width:450px;margin:auto;padding:0 16px}' +
'.header-box{margin:40px 0 20px;border-bottom:4px solid var(--white);padding-bottom:10px}' +
'.badge-26{display:inline-block;background:var(--purple);color:var(--white);font-weight:900;font-size:14px;padding:4px 10px;margin-bottom:12px}' +
'h1{font-family:"Archivo Black",sans-serif;font-size:38px;line-height:.9;letter-spacing:-2px}' +
'.phase-nav{display:flex;overflow-x:auto;gap:8px;margin-bottom:20px;padding-bottom:12px;border-bottom:2px solid var(--dim);scrollbar-width:none}' +
'.phase-nav::-webkit-scrollbar{display:none}' +
'.phase-tab{background:var(--dim);color:rgba(255,255,255,.5);border:2px solid var(--bd);padding:8px 14px;font-family:"Archivo Black",sans-serif;font-size:13px;white-space:nowrap;cursor:pointer;flex-shrink:0;transition:.15s}' +
'.phase-tab.active{background:var(--white);color:var(--black);border-color:var(--white)}' +
'.phase-panel{display:none}.phase-panel.active{display:block}' +
'.instr{font-size:11px;font-weight:800;letter-spacing:1px;color:rgba(255,255,255,.4);text-transform:uppercase;margin-bottom:14px;padding:8px 10px;background:var(--dim);border-left:3px solid var(--lime)}' +
'.counter{font-size:11px;font-weight:900;letter-spacing:1px;color:var(--lime);margin-bottom:10px;text-align:right}' +
'.counter em{color:rgba(255,255,255,.35);font-style:normal}' +
'.chip-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}' +
'.chip{display:flex;align-items:center;gap:8px;background:var(--dim2);border:2px solid var(--bd);padding:10px 10px;cursor:pointer;transition:.12s;min-height:54px;position:relative;user-select:none}' +
'.chip:active{transform:scale(.96)}' +
'.chip.sel{background:var(--teal);border-color:var(--teal)}' +
'.chip.sel .cname{color:var(--black);font-weight:900}' +
'.chip.dim{opacity:.28;pointer-events:none}' +
'.cflag{font-size:22px;flex-shrink:0;line-height:1}' +
'.cname{font-weight:800;font-size:11px;text-transform:uppercase;line-height:1.2;flex:1;color:var(--white)}' +
'.tick{position:absolute;top:3px;right:5px;font-size:11px;color:var(--black);opacity:0;transition:.12s}' +
'.chip.sel .tick{opacity:1}' +
'.podio-section{margin-bottom:20px}' +
'.podio-label{font-size:10px;font-weight:900;letter-spacing:2px;color:rgba(255,255,255,.45);margin-bottom:10px;text-transform:uppercase;padding:6px 0;border-bottom:1px solid var(--bd)}' +
'.podio-chips{display:flex;flex-wrap:wrap;gap:8px}' +
'.podio-chips .chip{min-width:130px}' +
'.bottom-bar{position:fixed;bottom:0;left:0;width:100%;background:var(--black);padding:16px;border-top:4px solid var(--purple);z-index:50;display:flex;flex-direction:column;gap:10px}' +
'.btn-save{width:100%;max-width:450px;margin:0 auto;display:block;background:var(--lime);color:var(--black);border:none;padding:16px;font-family:"Archivo Black",sans-serif;font-size:18px;cursor:pointer;letter-spacing:1px}' +
'.btn-save:active{background:var(--white)}' +
'.btn-volver{width:100%;max-width:450px;margin:0 auto;display:block;background:var(--white);color:var(--black);border:none;padding:12px;font-family:"Archivo Black",sans-serif;font-size:14px;cursor:pointer;text-align:center;letter-spacing:1px}' +
'.btn-volver:active{background:var(--teal)}' +
'.toast{position:fixed;top:16px;left:50%;transform:translateX(-50%) translateY(-120px);background:var(--white);color:var(--black);padding:12px 24px;font-family:"Archivo Black",sans-serif;font-size:14px;z-index:100;transition:.3s;border:4px solid var(--black)}' +
'.toast.show{transform:translateX(-50%) translateY(0)}' +
'</style></head><body>' +
'<div class="toast" id="toast">\u00A1CLASIFICADOS GUARDADOS!</div>' +
'<div class="app">' +
  '<div class="header-box">' +
    '<div class="badge-26">JELOU MUNDIAL 2026</div>' +
    '<h1>MIS<br>CLASIFICADOS</h1>' +
  '</div>' +
  '<div class="phase-nav" id="nav">' +
    '<div class="phase-tab active" onclick="showPhase(0)">16VOS</div>' +
    '<div class="phase-tab" onclick="showPhase(1)">8VOS</div>' +
    '<div class="phase-tab" onclick="showPhase(2)">4TOS</div>' +
    '<div class="phase-tab" onclick="showPhase(3)">SEMIS</div>' +
    '<div class="phase-tab" onclick="showPhase(4)">FINALES</div>' +
  '</div>' +
  '<div id="panel0" class="phase-panel active"></div>' +
  '<div id="panel1" class="phase-panel"></div>' +
  '<div id="panel2" class="phase-panel"></div>' +
  '<div id="panel3" class="phase-panel"></div>' +
  '<div id="panel4" class="phase-panel"></div>' +
'</div>' +
'<div class="bottom-bar">' +
  '<button class="btn-save" id="btnSave" onclick="guardar()">GUARDAR CLASIFICADOS</button>' +
  '<button class="btn-volver" onclick="volver()">VOLVER</button>' +
'</div>' +
'<script>var ALL_TEAMS=' + teamsJson + ';var FLAGS=' + flagsJson + ';var SAVED=' + savedJson + ';</script>' +
'<script>' +
'var state={d16:[],d8:[],d4:[],semis:[],campeon:"",sub:"",tercero:"",cuarto:""};' +
'(function initState(){' +
'  if(!SAVED||!SAVED.dieciseisavos)return;' +
'  state.d16=SAVED.dieciseisavos||[];' +
'  state.d8=SAVED.octavos||[];' +
'  state.d4=SAVED.cuartos||[];' +
'  state.semis=SAVED.semis||[];' +
'  state.campeon=SAVED.campeon||"";' +
'  state.sub=SAVED.subcampeon||"";' +
'  state.tercero=SAVED.tercer_lugar||"";' +
'  state.cuarto=SAVED.cuarto_lugar||"";' +
'})();' +
'function gf(n){return FLAGS[(n||"").toUpperCase()]||"\\uD83C\\uDFF3\\uFE0F";}' +
'function chip(team,sel,dimmed,onclick){' +
'  var c="chip"+(sel?" sel":"")+(dimmed?" dim":"");' +
'  return "<div class=\\""+c+"\\" onclick=\\""+onclick+"\\"><div class=\\"cflag\\">"+gf(team)+"</div><div class=\\"cname\\">"+team+"</div><div class=\\"tick\\">\u2713</div></div>";' +
'}' +
'function buildPhase(idx){' +
'  var p=document.getElementById("panel"+idx);if(!p)return;' +
'  var h="";' +
'  if(idx===0){' +
'    var max=32,sel=state.d16;' +
'    h+="<div class=\\"instr\\">Elige los 32 que clasifican a 16avos</div>";' +
'    h+="<div class=\\"counter\\">"+sel.length+" <em>/ "+max+"</em></div>";' +
'    h+="<div class=\\"chip-grid\\">";' +
'    ALL_TEAMS.forEach(function(t){var isSel=sel.indexOf(t)>=0;var isDim=!isSel&&sel.length>=max;h+=chip(t,isSel,isDim,"toggle16(\'"+t+"\')");});' +
'    h+="</div>";' +
'  }else if(idx===1){' +
'    var max=16,src=state.d16,sel=state.d8;' +
'    h+="<div class=\\"instr\\">De los 32, elige 16 para 8vos</div>";' +
'    if(src.length===0){h+="<div class=\\"instr\\" style=\\"border-color:var(--mag)\\">Primero elige en 16VOS</div>";}' +
'    else{h+="<div class=\\"counter\\">"+sel.length+" <em>/ "+max+"</em></div><div class=\\"chip-grid\\">";src.forEach(function(t){var isSel=sel.indexOf(t)>=0;var isDim=!isSel&&sel.length>=max;h+=chip(t,isSel,isDim,"toggle8(\'"+t+"\')");});h+="</div>";}' +
'  }else if(idx===2){' +
'    var max=8,src=state.d8,sel=state.d4;' +
'    h+="<div class=\\"instr\\">De los 16, elige 8 para cuartos</div>";' +
'    if(src.length===0){h+="<div class=\\"instr\\" style=\\"border-color:var(--mag)\\">Primero elige en 8VOS</div>";}' +
'    else{h+="<div class=\\"counter\\">"+sel.length+" <em>/ "+max+"</em></div><div class=\\"chip-grid\\">";src.forEach(function(t){var isSel=sel.indexOf(t)>=0;var isDim=!isSel&&sel.length>=max;h+=chip(t,isSel,isDim,"toggle4(\'"+t+"\')");});h+="</div>";}' +
'  }else if(idx===3){' +
'    var max=4,src=state.d4,sel=state.semis;' +
'    h+="<div class=\\"instr\\">De los 8, elige los 4 semifinalistas</div>";' +
'    if(src.length===0){h+="<div class=\\"instr\\" style=\\"border-color:var(--mag)\\">Primero elige en 4VOS</div>";}' +
'    else{h+="<div class=\\"counter\\">"+sel.length+" <em>/ "+max+"</em></div><div class=\\"chip-grid\\">";src.forEach(function(t){var isSel=sel.indexOf(t)>=0;var isDim=!isSel&&sel.length>=max;h+=chip(t,isSel,isDim,"toggleSemi(\'"+t+"\')");});h+="</div>";}' +
'  }else if(idx===4){' +
'    var src=state.semis;' +
'    h+="<div class=\\"instr\\">Selecciona los ganadores finales</div>";' +
'    if(src.length===0){h+="<div class=\\"instr\\" style=\\"border-color:var(--mag)\\">Primero elige en SEMIS</div>";}' +
'    else{' +
'      function podio(label,sk,excl){' +
'        var sel=state[sk];' +
'        var html="<div class=\\"podio-section\\"><div class=\\"podio-label\\">"+label+"</div><div class=\\"podio-chips\\">";' +
'        src.forEach(function(t){' +
'          if(excl.indexOf(t)>=0&&t!==sel)return;' +
'          html+=chip(t,t===sel,false,"pickFinal(\'"+sk+"\',\'"+t+"\')");' +
'        });' +
'        html+="</div></div>";return html;' +
'      }' +
'      h+=podio("\uD83C\uDFC6 CAMPE\u00D3N MUNDIAL","campeon",[]);' +
'      h+=podio("SUBCAMPE\u00D3N (2\u00B0 PUESTO)","sub",[state.campeon]);' +
'      h+=podio("TERCER LUGAR (3er PUESTO)","tercero",[state.campeon,state.sub]);' +
'      h+=podio("CUARTO LUGAR (4to PUESTO)","cuarto",[state.campeon,state.sub,state.tercero]);' +
'    }' +
'  }' +
'  p.innerHTML=h;' +
'}' +
'function rerender(){for(var i=0;i<5;i++)buildPhase(i);}' +
'function clearDown(k){' +
'  var o=["d16","d8","d4","semis"];var i=o.indexOf(k)+1;' +
'  for(;i<o.length;i++){state[o[i]]=state[o[i]].filter(function(t){return state[o[i-1]].indexOf(t)>=0;});}' +
'  state.campeon="";state.sub="";state.tercero="";state.cuarto="";' +
'}' +
'function toggleArr(a,t,m){var i=a.indexOf(t);i>=0?a.splice(i,1):(a.length<m&&a.push(t));}' +
'window.toggle16=function(t){toggleArr(state.d16,t,32);clearDown("d16");rerender();};' +
'window.toggle8=function(t){toggleArr(state.d8,t,16);clearDown("d8");rerender();};' +
'window.toggle4=function(t){toggleArr(state.d4,t,8);clearDown("d4");rerender();};' +
'window.toggleSemi=function(t){toggleArr(state.semis,t,4);clearDown("semis");rerender();};' +
'window.pickFinal=function(k,t){' +
'  if(state[k]===t)state[k]="";else state[k]=t;' +
'  if(k==="campeon"){if(state.sub===t)state.sub="";if(state.tercero===t)state.tercero="";if(state.cuarto===t)state.cuarto="";}' +
'  if(k==="sub"){if(state.campeon===t)state.campeon="";if(state.tercero===t)state.tercero="";if(state.cuarto===t)state.cuarto="";}' +
'  if(k==="tercero"){if(state.campeon===t)state.campeon="";if(state.sub===t)state.sub="";if(state.cuarto===t)state.cuarto="";}' +
'  if(k==="cuarto"){if(state.campeon===t)state.campeon="";if(state.sub===t)state.sub="";if(state.tercero===t)state.tercero="";}' +
'  buildPhase(4);' +
'};' +
'function showPhase(idx){' +
'  document.querySelectorAll(".phase-tab").forEach(function(el,i){el.classList.toggle("active",i===idx);});' +
'  document.querySelectorAll(".phase-panel").forEach(function(el,i){el.classList.toggle("active",i===idx);});' +
'}' +
'window.guardar=function(){' +
'  var btn=document.getElementById("btnSave");btn.innerText="GUARDANDO...";' +
'  var payload={dieciseisavos:state.d16,octavos:state.d8,cuartos:state.d4,semis:state.semis,campeon:state.campeon,subcampeon:state.sub,tercer_lugar:state.tercero,cuarto_lugar:state.cuarto};' +
'  var uid=new URLSearchParams(window.location.search).get("user_id")||"GUEST";' +
'  var exId=new URLSearchParams(window.location.search).get("executionId")||"";' +
'  fetch("/api/clasificatorias?user_id="+uid,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)})' +
'    .then(function(r){' +
'      if(r.ok){' +
'        var t=document.getElementById("toast");t.classList.add("show");' +
'        var cbBody={executionId:exId,success:true,data:{action:"save_clasificados",summary:payload}};' +
'        fetch("https://workflows.jelou.ai/v1/webview/callback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(cbBody)})' +
'        .finally(function(){ setTimeout(function(){window.location.href="https://wa.me/13239183195";},1500); });' +
'      }else{alert("Error al guardar");}' +
'    }).catch(function(){alert("Error de red");}).finally(function(){btn.innerText="GUARDAR CLASIFICADOS";});' +
'};' +
'window.volver=function(){' +
'  var exId=new URLSearchParams(window.location.search).get("executionId")||"";' +
'  var cbBody={executionId:exId,success:true,data:{action:"volver"}}; ' +
'  fetch("https://workflows.jelou.ai/v1/webview/callback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(cbBody)})' +
'    .finally(function(){ window.location.href="https://wa.me/13239183195"; });' +
'};' +
'rerender();' +
'<\/script>' +
'</body></html>';

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
