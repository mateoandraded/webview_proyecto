export const config = {
  runtime: 'edge',
};

const API_KEY = "db_HQIwDXV9xkJTEU5F3wwYAGhHAGInsItCu79g5FSz6e3106ee";
const BASE_URL = "https://mateoacademy-9djnmu.jelou.cloud/api/collections";

const FLAGS = {"MEXICO":"\uD83C\uDDF2\uD83C\uDDFD","ESTADOS UNIDOS":"\uD83C\uDDFA\uD83C\uDDF8","CANADA":"\uD83C\uDDE8\uD83C\uDDE6","BRASIL":"\uD83C\uDDE7\uD83C\uDDF7","ARGENTINA":"\uD83C\uDDE6\uD83C\uDDF7","ECUADOR":"\uD83C\uDDEA\uD83C\uDDE8","COLOMBIA":"\uD83C\uDDE8\uD83C\uDDF4","PERU":"\uD83C\uDDF5\uD83C\uDDEA","CHILE":"\uD83C\uDDE8\uD83C\uDDF1","URUGUAY":"\uD83C\uDDFA\uD83C\uDDFE","PARAGUAY":"\uD83C\uDDF5\uD83C\uDDFE","BOLIVIA":"\uD83C\uDDE7\uD83C\uDDF4","VENEZUELA":"\uD83C\uDDFB\uD83C\uDDEA","ALEMANIA":"\uD83C\uDDE9\uD83C\uDDEA","ESPANA":"\uD83C\uDDEA\uD83C\uDDF8","ESPAÑA":"\uD83C\uDDEA\uD83C\uDDF8","FRANCIA":"\uD83C\uDDEB\uD83C\uDDF7","ITALIA":"\uD83C\uDDEE\uD83C\uDDF9","PORTUGAL":"\uD83C\uDDF5\uD83C\uDDF9","PAISES BAJOS":"\uD83C\uDDF3\uD83C\uDDF1","BELGICA":"\uD83C\uDDE7\uD83C\uDDEA","CROACIA":"\uD83C\uDDED\uD83C\uDDF7","SERBIA":"\uD83C\uDDF7\uD83C\uDDF8","SUIZA":"\uD83C\uDDE8\uD83C\uDDED","DINAMARCA":"\uD83C\uDDE9\uD83C\uDDF0","AUSTRIA":"\uD83C\uDDE6\uD83C\uDDF9","UCRANIA":"\uD83C\uDDFA\uD83C\uDDE6","TURQUIA":"\uD83C\uDDF9\uD83C\uDDF7","HUNGRIA":"\uD83C\uDDED\uD83C\uDDFA","REPUBLICA CHECA":"\uD83C\uDDE8\uD83C\uDDFF","GRECIA":"\uD83C\uDDEC\uD83C\uDDF7","JAPON":"\uD83C\uDDEF\uD83C\uDDF5","REPUBLICA DE COREA":"\uD83C\uDDF0\uD83C\uDDF7","COREA DEL SUR":"\uD83C\uDDF0\uD83C\uDDF7","AUSTRALIA":"\uD83C\uDDE6\uD83C\uDDFA","IRAN":"\uD83C\uDDEE\uD83C\uDDF7","ARABIA SAUDITA":"\uD83C\uDDF8\uD83C\uDDE6","QATAR":"\uD83C\uDDF6\uD83C\uDDE6","MARRUECOS":"\uD83C\uDDF2\uD83C\uDDE6","SENEGAL":"\uD83C\uDDF8\uD83C\uDDF3","GHANA":"\uD83C\uDDEC\uD83C\uDDED","CAMERUN":"\uD83C\uDDE8\uD83C\uDDF2","NIGERIA":"\uD83C\uDDF3\uD83C\uDDEC","TUNEZ":"\uD83C\uDDF9\uD83C\uDDF3","SUDAFRICA":"\uD83C\uDDFF\uD83C\uDDE6","EGIPTO":"\uD83C\uDDEA\uD83C\uDDEC","COSTA RICA":"\uD83C\uDDE8\uD83C\uDDF7","PANAMA":"\uD83C\uDDF5\uD83C\uDDE6","HONDURAS":"\uD83C\uDDED\uD83C\uDDF3","JAMAICA":"\uD83C\uDDEF\uD83C\uDDF2","INDONESIA":"\uD83C\uDDEE\uD83C\uDDE9","NUEVA ZELANDA":"\uD83C\uDDF3\uD83C\uDDFF","GALES":"\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73\uDB40\uDC7F","ESCOCIA":"\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74\uDB40\uDC7F","INGLATERRA":"\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67\uDB40\uDC7F","POLONIA":"\uD83C\uDDF5\uD83C\uDDF1","RUMANIA":"\uD83C\uDDF7\uD83C\uDDF4","ESLOVENIA":"\uD83C\uDDF8\uD83C\uDDEE","ESLOVAQUIA":"\uD83C\uDDF8\uD83C\uDDF0","ALBANIA":"\uD83C\uDDE6\uD83C\uDDF1","ARGELIA":"\uD83C\uDDE9\uD83C\uDDFF","COSTA DE MARFIL":"\uD83C\uDDE8\uD83C\uDDEE","NORUEGA":"\uD83C\uDDF3\uD83C\uDDF4","SUECIA":"\uD83C\uDDF8\uD83C\uDDEA","IRLANDA":"\uD83C\uDDEE\uD83C\uDDEA","TRINIDAD Y TOBAGO":"\uD83C\uDDF9\uD83C\uDDF9","EL SALVADOR":"\uD83C\uDDF8\uD83C\uDDFB","GUATEMALA":"\uD83C\uDDEC\uD83C\uDDF9"};
function flag(n) { return FLAGS[(n||'').toUpperCase()] || '\uD83C\uDFF3\uFE0F'; }

// 48 WC2026 teams — pool for 16vos
const WC_TEAMS = ["MEXICO","ESTADOS UNIDOS","CANADA","BRASIL","ARGENTINA","ECUADOR","COLOMBIA","URUGUAY","PARAGUAY","CHILE","PERU","BOLIVIA","VENEZUELA","ALEMANIA","ESPAÑA","FRANCIA","PORTUGAL","BELGICA","PAISES BAJOS","CROACIA","SERBIA","SUIZA","TURQUIA","DINAMARCA","AUSTRIA","POLONIA","RUMANIA","ESLOVENIA","ESLOVAQUIA","ALBANIA","UCRANIA","GRECIA","MARRUECOS","SENEGAL","NIGERIA","CAMERUN","COSTA DE MARFIL","EGIPTO","GHANA","TUNEZ","JAPON","COREA DEL SUR","AUSTRALIA","IRAN","ARABIA SAUDITA","INDONESIA","COSTA RICA","PANAMA"];

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

  const bracketJson = JSON.stringify(uBracket);
  const teamsJson = JSON.stringify(WC_TEAMS);
  const flagsJson = JSON.stringify(FLAGS);

  const css = `
    :root{--black:#000;--white:#fff;--lime:#C9FF24;--magenta:#FF0055;--teal:#00FFCC;--purple:#6200EA;--dim:#141414;--dim2:#222;--border:rgba(255,255,255,.12)}
    *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
    body{background:var(--black);color:var(--white);font-family:'Inter',sans-serif;padding-bottom:100px}
    .app-container{max-width:450px;margin:auto;padding:0 16px}
    .header-box{margin:40px 0 20px;border-bottom:4px solid var(--white);padding-bottom:10px}
    .badge-26{display:inline-block;background:var(--purple);color:var(--white);font-weight:900;font-size:14px;padding:4px 10px;margin-bottom:12px;letter-spacing:.5px}
    h1{font-family:'Archivo Black',sans-serif;font-size:38px;line-height:.9;letter-spacing:-2px}

    /* PHASE TABS */
    .phase-nav{display:flex;overflow-x:auto;gap:8px;margin-bottom:20px;padding-bottom:12px;border-bottom:2px solid var(--dim);scrollbar-width:none}
    .phase-nav::-webkit-scrollbar{display:none}
    .phase-tab{background:var(--dim);color:rgba(255,255,255,.5);border:1px solid var(--border);padding:8px 14px;font-family:'Archivo Black';font-size:13px;white-space:nowrap;cursor:pointer;flex-shrink:0;transition:.15s}
    .phase-tab.active{background:var(--white);color:var(--black);border-color:var(--white)}
    .phase-container{display:none}
    .phase-container.active{display:block}

    /* PHASE INSTRUCTIONS */
    .phase-instr{font-size:11px;font-weight:800;letter-spacing:1px;color:rgba(255,255,255,.4);text-transform:uppercase;margin-bottom:14px;padding:8px;background:var(--dim);border-left:3px solid var(--lime)}

    /* COUNTRY CHIP GRID */
    .chip-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px}
    .country-chip{
      display:flex;align-items:center;gap:8px;
      background:var(--dim2);border:2px solid var(--border);
      padding:10px 12px;cursor:pointer;
      transition:.12s;position:relative;
      min-height:56px;
    }
    .country-chip:active{transform:scale(.97)}
    .country-chip.selected{
      background:var(--teal);border-color:var(--teal);color:var(--black);
    }
    .country-chip.selected .chip-name{color:var(--black);font-weight:900}
    .country-chip.disabled{opacity:.3;pointer-events:none}
    .chip-flag{font-size:24px;flex-shrink:0;line-height:1}
    .chip-name{font-weight:800;font-size:11px;text-transform:uppercase;line-height:1.2;flex:1}
    .chip-check{
      position:absolute;top:4px;right:6px;
      font-size:12px;opacity:0;transition:.12s;
    }
    .country-chip.selected .chip-check{opacity:1}

    /* SELECTED COUNTER */
    .sel-counter{font-size:11px;font-weight:900;letter-spacing:1px;color:var(--lime);margin-bottom:10px;text-align:right}
    .sel-counter span{color:rgba(255,255,255,.4)}

    /* PODIO PHASE */
    .podio-wrap{display:flex;flex-direction:column;gap:12px}
    .podio-item{background:var(--dim2);border:2px solid var(--border);padding:14px}
    .podio-label{font-size:10px;font-weight:900;letter-spacing:2px;color:rgba(255,255,255,.5);margin-bottom:10px;text-transform:uppercase}
    .podio-chips{display:flex;flex-wrap:wrap;gap:8px}

    /* SAVE BAR */
    .bottom-bar{position:fixed;bottom:0;left:0;width:100%;background:var(--black);padding:16px;border-top:4px solid var(--purple);z-index:50}
    .btn-save{width:100%;max-width:450px;margin:0 auto;display:block;background:var(--lime);color:var(--black);border:none;padding:16px;font-family:'Archivo Black';font-size:18px;cursor:pointer;letter-spacing:1px}
    .btn-save:active{background:var(--white)}
    .toast{position:fixed;top:16px;left:50%;transform:translateX(-50%) translateY(-100px);background:var(--white);color:var(--black);padding:12px 24px;font-family:'Archivo Black';font-size:14px;z-index:100;transition:.3s;border:4px solid var(--black)}
    .toast.show{transform:translateX(-50%) translateY(0)}
  `;

  // Phase config: label, max picks, source phase key
  const phases = [
    { id: 'dieciseisavos', label: '16VOS', max: 32, instLabel: 'Elige los 32 clasificados a 16avos', src: null },
    { id: 'octavos',       label: '8VOS',  max: 16, instLabel: 'De los 32, elige los 16 clasificados a 8vos', src: 'dieciseisavos' },
    { id: 'cuartos',       label: '4TOS',  max: 8,  instLabel: 'De los 16, elige los 8 clasificados a cuartos', src: 'octavos' },
    { id: 'semis',         label: 'SEMIS', max: 4,  instLabel: 'De los 8, elige los 4 semifinalistas', src: 'cuartos' },
    { id: 'finales',       label: 'FINALES', max: null, instLabel: 'Elige al campe\u00F3n y 3er puesto', src: 'semis' }
  ];
  const phasesJson = JSON.stringify(phases);

  const jsCode = [
    'var FLAGS=' + flagsJson + ';',
    'function getFlag(n){return FLAGS[(n||"").toUpperCase()]||"\uD83C\uDFF3\uFE0F";}',
    'var ALL_TEAMS=' + teamsJson + ';',
    'var PHASES=' + phasesJson + ';',
    'var state={dieciseisavos:[],octavos:[],cuartos:[],semis:[],campeon:"",subcampeon:"",tercer_lugar:""};',
    'var saved=' + bracketJson + ';',
    'if(saved&&saved.dieciseisavos){state.dieciseisavos=saved.dieciseisavos||[];state.octavos=saved.octavos||[];state.cuartos=saved.cuartos||[];state.semis=saved.semis||[];state.campeon=saved.campeon||"";state.subcampeon=saved.subcampeon||"";state.tercer_lugar=saved.tercer_lugar||"";}',

    // Build chip grid for a phase
    'function buildChipGrid(phaseId, teams, max){',
    '  var sel=state[phaseId]||[];',
    '  var html="<div class=\\"sel-counter\\">"+sel.length+" <span>/ "+max+" seleccionados</span></div>";',
    '  html+="<div class=\\"chip-grid\\">";',
    '  teams.forEach(function(t){',
    '    var isSel=sel.indexOf(t)>=0;',
    '    var isDisabled=!isSel&&sel.length>=max;',
    '    html+="<div class=\\"country-chip"+(isSel?" selected":"")+(isDisabled?" disabled":"")+"\\" onclick=\\"toggleChip(\'"+phaseId+"\',\'"+t+"\',"+max+")\\" data-team=\\""+t+"\\">"+',
    '      "<div class=\\"chip-flag\\">"+getFlag(t)+"</div>"+',
    '      "<div class=\\"chip-name\\">"+t+"</div>"+',
    '      "<div class=\\"chip-check\\">\u2713</div>"+',
    '    "</div>";',
    '  });',
    '  html+="</div>";',
    '  return html;',
    '}',

    // Build the finales podio picker
    'function buildFinales(){',
    '  var semisTeams=state.semis||[];',
    '  function chipRow(key,label,exclude){',
    '    var sel=state[key]||"";',
    '    var html="<div class=\\"podio-item\\"><div class=\\"podio-label\\">"+label+"</div><div class=\\"podio-chips\\">";',
    '    semisTeams.forEach(function(t){',
    '      if(exclude&&exclude.indexOf(t)>=0&&t!==sel)return;',
    '      var isSel=(sel===t);',
    '      html+="<div class=\\"country-chip"+(isSel?" selected":"\"")+" onclick=\\"pickFinal(\'"+key+"\',\'"+t+"\')\\" style=\\"min-width:120px;\\">"+',
    '        "<div class=\\"chip-flag\\">"+getFlag(t)+"</div>"+',
    '        "<div class=\\"chip-name\\">"+t+"</div>"+',
    '        "<div class=\\"chip-check\\">\u2713</div>"+',
    '      "</div>";',
    '    });',
    '    html+="</div></div>";',
    '    return html;',
    '  }',
    '  var html="<div class=\\"podio-wrap\\">";',
    '  html+=chipRow("campeon","\uD83C\uDFC6 CAMPE\u00D3N MUNDIAL",null);',
    '  html+=chipRow("subcampeon","SUBCAMPE\u00D3N (2do puesto)",null);',
    '  html+=chipRow("tercer_lugar","TERCER LUGAR (3er puesto)",null);',
    '  html+="</div>";',
    '  return html;',
    '}',

    // Toggle chip selection
    'window.toggleChip=function(phaseId,team,max){',
    '  var arr=state[phaseId]||[];',
    '  var idx=arr.indexOf(team);',
    '  if(idx>=0){arr.splice(idx,1);}',
    '  else if(arr.length<max){arr.push(team);}',
    '  state[phaseId]=arr;',
    '  // Clear downstream phases if they contain teams not in current selection',
    '  var phaseOrder=["dieciseisavos","octavos","cuartos","semis"];',
    '  var phIdx=phaseOrder.indexOf(phaseId);',
    '  for(var i=phIdx+1;i<phaseOrder.length;i++){',
    '    var nextKey=phaseOrder[i];',
    '    var prevKey=phaseOrder[i-1];',
    '    var prevSel=state[prevKey]||[];',
    '    state[nextKey]=(state[nextKey]||[]).filter(function(t){return prevSel.indexOf(t)>=0;});',
    '  }',
    '  state.campeon=""; state.subcampeon=""; state.tercer_lugar="";',
    '  rerender();',
    '};',

    'window.pickFinal=function(key,team){',
    '  state[key]=team;',
    '  document.getElementById("cont_finales").innerHTML=buildFinales();',
    '};',

    // Render current active phase
    'function rerender(){',
    '  PHASES.forEach(function(ph){',
    '    var cont=document.getElementById("cont_"+ph.id);',
    '    if(!cont)return;',
    '    if(ph.id==="finales"){cont.innerHTML=buildFinales();return;}',
    '    var teams=ph.src?state[ph.src]||[]:ALL_TEAMS;',
    '    cont.innerHTML=buildChipGrid(ph.id,teams,ph.max);',
    '  });',
    '}',

    // Tab switching
    'function showPhase(idx){',
    '  document.querySelectorAll(".phase-tab").forEach(function(el,i){el.classList.toggle("active",i===idx);});',
    '  document.querySelectorAll(".phase-container").forEach(function(el,i){el.classList.toggle("active",i===idx);});',
    '}',

    // Save
    'window.guardarTodo=function(){',
    '  var btn=document.getElementById("btnSave");',
    '  btn.innerText="GUARDANDO...";',
    '  var payload={dieciseisavos:state.dieciseisavos,octavos:state.octavos,cuartos:state.cuartos,semis:state.semis,campeon:state.campeon,subcampeon:state.subcampeon,tercer_lugar:state.tercer_lugar,cuarto_lugar:"" };',
    '  var userId=new URLSearchParams(window.location.search).get("user_id")||"GUEST";',
    '  fetch("/api/clasificatorias?user_id="+userId,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)})',
    '    .then(function(res){',
    '      if(res.ok){var t=document.getElementById("toast");t.classList.add("show");setTimeout(function(){t.classList.remove("show");},2500);}',
    '      else{alert("Error al guardar");}',
    '    }).catch(function(){alert("Error de red");}).finally(function(){btn.innerText="GUARDAR CLASIFICADOS";});',
    '};',

    // Init
    'rerender();',
    // Wire tabs
    'document.querySelectorAll(".phase-tab").forEach(function(btn,i){btn.onclick=function(){showPhase(i);};});'
  ].join('\n');

  // Build static HTML scaffold — tabs + empty containers (JS fills them)
  let navHtml = '';
  let containersHtml = '';
  phases.forEach(function(ph, idx) {
    navHtml += '<div class="phase-tab' + (idx === 0 ? ' active' : '') + '">' + ph.label + '</div>';
    containersHtml +=
      '<div class="phase-container' + (idx === 0 ? ' active' : '') + '">' +
        '<div class="phase-instr">' + ph.instLabel + '</div>' +
        '<div id="cont_' + ph.id + '"></div>' +
      '</div>';
  });

  const html = '<!DOCTYPE html><html lang="es"><head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">' +
    '<title>Mis Clasificados \u00B7 Jelou Mundial 2026</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">' +
    '<style>' + css + '</style>' +
    '</head><body>' +
    '<div class="toast" id="toast">\u00A1CLASIFICADOS GUARDADOS!</div>' +
    '<div class="app-container">' +
      '<div class="header-box">' +
        '<div class="badge-26">JELOU MUNDIAL 2026</div>' +
        '<h1>MIS<br>CLASIFICADOS</h1>' +
      '</div>' +
      '<div class="phase-nav" id="tabsNav">' + navHtml + '</div>' +
      '<div id="phasesWrapper">' + containersHtml + '</div>' +
    '</div>' +
    '<div class="bottom-bar"><button class="btn-save" id="btnSave" onclick="guardarTodo()">GUARDAR CLASIFICADOS</button></div>' +
    '<script>' + jsCode + '<\/script>' +
    '</body></html>';

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
