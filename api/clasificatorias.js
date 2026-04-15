export const config = {
  runtime: 'edge',
};

const API_KEY = "db_HQIwDXV9xkJTEU5F3wwYAGhHAGInsItCu79g5FSz6e3106ee";
const BASE_URL = "https://mateoacademy-9djnmu.jelou.cloud/api/collections";

const FLAGS = {"MEXICO":"🇲🇽","ESTADOS UNIDOS":"🇺🇸","CANADA":"🇨🇦","BRASIL":"🇧🇷","ARGENTINA":"🇦🇷","ECUADOR":"🇪🇨","COLOMBIA":"🇨🇴","PERU":"🇵🇪","CHILE":"🇨🇱","URUGUAY":"🇺🇾","PARAGUAY":"🇵🇾","BOLIVIA":"🇧🇴","VENEZUELA":"🇻🇪","ALEMANIA":"🇩🇪","ESPANA":"🇪🇸","ESPAÑA":"🇪🇸","FRANCIA":"🇫🇷","ITALIA":"🇮🇹","PORTUGAL":"🇵🇹","PAISES BAJOS":"🇳🇱","BELGICA":"🇧🇪","CROACIA":"🇭🇷","SERBIA":"🇷🇸","SUIZA":"🇨🇭","DINAMARCA":"🇩🇰","AUSTRIA":"🇦🇹","UCRANIA":"🇺🇦","TURQUIA":"🇹🇷","HUNGRIA":"🇭🇺","REPUBLICA CHECA":"🇨🇿","GRECIA":"🇬🇷","JAPON":"🇯🇵","REPUBLICA DE COREA":"🇰🇷","COREA DEL SUR":"🇰🇷","AUSTRALIA":"🇦🇺","IRAN":"🇮🇷","ARABIA SAUDITA":"🇸🇦","QATAR":"🇶🇦","MARRUECOS":"🇲🇦","SENEGAL":"🇸🇳","GHANA":"🇬🇭","CAMERUN":"🇨🇲","NIGERIA":"🇳🇬","TUNEZ":"🇹🇳","SUDAFRICA":"🇿🇦","EGIPTO":"🇪🇬","COSTA RICA":"🇨🇷","PANAMA":"🇵🇦","HONDURAS":"🇭🇳","JAMAICA":"🇯🇲","INDONESIA":"🇮🇩","NUEVA ZELANDA":"🇳🇿","GALES":"🏴󠁧󠁢󠁷󠁬󠁳󠁿","ESCOCIA":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","INGLATERRA":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","POLONIA":"🇵🇱","RUMANIA":"🇷🇴","ESLOVENIA":"🇸🇮","ESLOVAQUIA":"🇸🇰","ALBANIA":"🇦🇱","ARGELIA":"🇩🇿","COSTA DE MARFIL":"🇨🇮","NORUEGA":"🇳🇴","SUECIA":"🇸🇪","IRLANDA":"🇮🇪","TRINIDAD Y TOBAGO":"🇹🇹","EL SALVADOR":"🇸🇻","GUATEMALA":"🇬🇹"};

const PHASES = [
  { id: 'dieciseisavos', label: '16VOS', matchesP: [
    {id:'m1', l:'A1', v:'B2'},{id:'m2', l:'C1', v:'D2'},{id:'m3', l:'E1', v:'F2'},{id:'m4', l:'G1', v:'H2'},
    {id:'m5', l:'I1', v:'J2'},{id:'m6', l:'K1', v:'L2'},{id:'m7', l:'B1', v:'A2'},{id:'m8', l:'D1', v:'C2'},
    {id:'m9', l:'F1', v:'E2'},{id:'m10',l:'H1', v:'G2'},{id:'m11',l:'J1', v:'I2'},{id:'m12',l:'L1', v:'K2'},
    {id:'m13',l:'A3', v:'B3'},{id:'m14',l:'C3', v:'D3'},{id:'m15',l:'E3', v:'F3'},{id:'m16',l:'G3', v:'H3'}
  ]},
  { id: 'octavos', label: '8VOS', matchesP: [
    {id:'o1', l:'Wm1', v:'Wm2'},{id:'o2', l:'Wm3', v:'Wm4'},{id:'o3', l:'Wm5', v:'Wm6'},{id:'o4', l:'Wm7', v:'Wm8'},
    {id:'o5', l:'Wm9', v:'Wm10'},{id:'o6', l:'Wm11', v:'Wm12'},{id:'o7', l:'Wm13', v:'Wm14'},{id:'o8', l:'Wm15', v:'Wm16'}
  ]},
  { id: 'cuartos', label: '4TOS', matchesP: [
    {id:'q1', l:'Wo1', v:'Wo2'},{id:'q2', l:'Wo3', v:'Wo4'},{id:'q3', l:'Wo5', v:'Wo6'},{id:'q4', l:'Wo7', v:'Wo8'}
  ]},
  { id: 'semis', label: 'SEMIS', matchesP: [
    {id:'s1', l:'Wq1', v:'Wq2'},{id:'s2', l:'Wq3', v:'Wq4'}
  ]},
  { id: 'finales', label: 'FINALES', matchesP: [
    {id:'f1', l:'Ls1', v:'Ls2', type:'3rd'},{id:'f2', l:'Ws1', v:'Ws2', type:'final'}
  ]}
];

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
      const existReq = await fetchDatum('pronosticos_brackets', 'GET', null, '', "&filter=(user_id='" + userId + "')");
      const existingItems = existReq.items || existReq;
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

  const teamsReq = await fetchDatum('pbc_1311026048', 'GET', null, '', '');
  let TEAMS = (teamsReq.items || teamsReq).map(function(t) { return t.equipo; }).sort();
  if (TEAMS.length === 0) TEAMS = Object.keys(FLAGS).sort();

  let uBracket = {};
  if (userId !== 'GUEST') {
    try {
      const dbb = await fetchDatum('pronosticos_brackets', 'GET', null, '', "&filter=(user_id='" + userId + "')");
      if (dbb.items && dbb.items.length > 0) uBracket = dbb.items[0];
    } catch(e) {}
  }

  const teamsJson = JSON.stringify(TEAMS);
  const bracketJson = JSON.stringify(uBracket);
  const phasesJson = JSON.stringify(PHASES);
  const flagsJson = JSON.stringify(FLAGS);

  const css = `
    :root{--black:#000;--white:#fff;--lime:#C9FF24;--magenta:#FF0055;--teal:#00FFCC;--purple:#6200EA;--dim:#111;--border:rgba(255,255,255,.2)}
    *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
    body{background:var(--black);color:var(--white);font-family:'Inter',sans-serif;padding-bottom:90px}
    .app-container{max-width:450px;margin:auto;padding:0 16px}
    .header-box{margin:40px 0 20px;border-bottom:4px solid var(--white);padding-bottom:10px}
    .badge-26{display:inline-block;background:var(--purple);color:var(--white);font-weight:900;font-size:14px;padding:4px 8px;margin-bottom:12px}
    h1{font-family:'Archivo Black',sans-serif;font-size:40px;line-height:.9;letter-spacing:-2px}
    .phase-nav{display:flex;overflow-x:auto;gap:8px;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid var(--dim)}
    .phase-tab{background:var(--dim);color:rgba(255,255,255,.6);border:1px solid var(--border);padding:8px 16px;font-family:'Archivo Black';font-size:14px;white-space:nowrap;cursor:pointer;flex-shrink:0}
    .phase-tab.active{background:var(--white);color:var(--black);border-color:var(--white)}
    .phase-container{display:none}
    .phase-container.active{display:block}
    .match-box{border:2px solid var(--border);background:var(--dim);margin-bottom:16px;position:relative}
    .match-num{position:absolute;top:0;left:0;background:var(--black);border-bottom:2px solid var(--border);border-right:2px solid var(--border);padding:2px 6px;font-weight:900;font-size:10px;color:var(--lime)}
    .team-slot{display:flex;align-items:stretch;border-bottom:1px dashed var(--border);cursor:pointer;transition:.2s}
    .team-slot:last-child{border-bottom:none}
    .team-slot.selected{background:var(--teal);color:var(--black)}
    .s-flag{padding:12px;font-size:24px;opacity:.7}
    .s-select{flex:1;background:transparent;border:none;color:inherit;font-weight:800;font-size:14px;text-transform:uppercase;padding:12px;outline:none;appearance:none;font-family:'Inter'}
    .team-slot.selected .s-select{color:var(--black);font-weight:900}
    .s-select option{background:var(--black);color:var(--white)}
    .podium-box{border:4px solid var(--lime);padding:16px;margin-top:16px;background:var(--black)}
    .podium-title{font-family:'Archivo Black';font-size:24px;color:var(--lime);margin-bottom:12px}
    .bottom-bar{position:fixed;bottom:0;left:0;width:100%;background:var(--black);padding:16px;border-top:4px solid var(--purple);z-index:50}
    .btn-save{width:100%;max-width:450px;margin:0 auto;display:block;background:var(--lime);color:var(--black);border:none;padding:16px;font-family:'Archivo Black';font-size:18px;cursor:pointer}
    .toast{position:fixed;top:16px;left:50%;transform:translateX(-50%) translateY(-100px);background:var(--white);color:var(--black);padding:12px 24px;font-family:'Archivo Black';font-size:14px;z-index:100;transition:.3s;border:4px solid var(--black)}
    .toast.show{transform:translateX(-50%) translateY(0)}
  `;

  const jsCode = [
    'var TEAMS=' + teamsJson + ';',
    'var uBracket=' + bracketJson + ';',
    'var FLAGS=' + flagsJson + ';',
    'function getFlag(n){return FLAGS[(n||"").toUpperCase()]||"🏳️";}',
    'var PHASES=' + phasesJson + ';',
    'var bracketState={dieciseisavos:[],octavos:[],cuartos:[],semis:[],campeon:"",subcampeon:"",tercer_lugar:"",cuarto_lugar:""};',
    'if(uBracket&&uBracket.dieciseisavos){bracketState={dieciseisavos:uBracket.dieciseisavos||[],octavos:uBracket.octavos||[],cuartos:uBracket.cuartos||[],semis:uBracket.semis||[],campeon:uBracket.campeon||"",subcampeon:uBracket.subcampeon||"",tercer_lugar:uBracket.tercer_lugar||"",cuarto_lugar:uBracket.cuarto_lugar||""};}',
    'function initUI(){',
    '  var nav=document.getElementById("tabsNav");',
    '  var wrap=document.getElementById("phasesWrapper");',
    '  PHASES.forEach(function(ph,idx){',
    '    var btn=document.createElement("div");',
    '    btn.className="phase-tab"+(idx===0?" active":"");',
    '    btn.innerText=ph.label;',
    '    btn.onclick=function(){showPhase(idx);};',
    '    nav.appendChild(btn);',
    '    var cont=document.createElement("div");',
    '    cont.className="phase-container"+(idx===0?" active":"");',
    '    var contentHtml="";',
    '    ph.matchesP.forEach(function(m){',
    '      contentHtml+="<div class=\\"match-box\\" data-match=\\""+m.id+"\\"><div class=\\"match-num\\">"+ph.label.substring(0,3)+" - "+m.id+"</div>"+',
    '        "<div class=\\"team-slot\\" data-slot=\\""+m.id+"_A\\" onclick=\\"selectWinner(\'"+m.id+"_A\',\'"+m.id+"\',\'"+ph.id+"\')\\" ><div class=\\"s-flag\\">🏳️</div><select class=\\"s-select\\" id=\\"sel_"+m.id+"_A\\" onchange=\\"updateFlag(this)\\"></select></div>"+',
    '        "<div class=\\"team-slot\\" data-slot=\\""+m.id+"_B\\" onclick=\\"selectWinner(\'"+m.id+"_B\',\'"+m.id+"\',\'"+ph.id+"\')\\" ><div class=\\"s-flag\\">🏳️</div><select class=\\"s-select\\" id=\\"sel_"+m.id+"_B\\" onchange=\\"updateFlag(this)\\"></select></div>"+',
    '        "</div>";',
    '    });',
    '    cont.innerHTML=contentHtml;',
    '    wrap.appendChild(cont);',
    '  });',
    '  document.querySelectorAll("select").forEach(function(sel){',
    '    var opts="<option value=\\"\\">SELECCIONA</option>";',
    '    TEAMS.forEach(function(t){opts+="<option value=\\""+t+"\\">"+t+"</option>";});',
    '    sel.innerHTML=opts;',
    '  });',
    '  restoreState();',
    '}',
    'function restoreState(){',
    '  if(bracketState.dieciseisavos.length===32){var i=0;PHASES[0].matchesP.forEach(function(m){setSel("sel_"+m.id+"_A",bracketState.dieciseisavos[i++]);setSel("sel_"+m.id+"_B",bracketState.dieciseisavos[i++]);});}',
    '  if(bracketState.octavos.length===16){var i=0;PHASES[1].matchesP.forEach(function(m){selectProg("sel_"+m.id+"_A",bracketState.octavos[i++]);selectProg("sel_"+m.id+"_B",bracketState.octavos[i++]);});}',
    '  if(bracketState.cuartos.length===8){var i=0;PHASES[2].matchesP.forEach(function(m){selectProg("sel_"+m.id+"_A",bracketState.cuartos[i++]);selectProg("sel_"+m.id+"_B",bracketState.cuartos[i++]);});}',
    '  if(bracketState.semis.length===4){var i=0;PHASES[3].matchesP.forEach(function(m){selectProg("sel_"+m.id+"_A",bracketState.semis[i++]);selectProg("sel_"+m.id+"_B",bracketState.semis[i++]);});}',
    '  if(bracketState.campeon){setSel("sel_campeon",bracketState.campeon);document.getElementById("podiumBox").style.display="block";}',
    '}',
    'function setSel(id,val){var el=document.getElementById(id);if(el){el.value=val;updateFlag(el);}}',
    'function updateFlag(sel){var fd=sel.parentElement.querySelector(".s-flag");if(fd)fd.innerHTML=getFlag(sel.value);}',
    'function selectProg(id,val){var el=document.getElementById(id);if(el){el.value=val;updateFlag(el);el.parentElement.classList.add("selected");}}',
    'window.selectWinner=function(slotId,matchId,phaseId){',
    '  var parent=document.getElementById("sel_"+slotId).parentElement.parentElement;',
    '  parent.querySelectorAll(".team-slot").forEach(function(s){s.classList.remove("selected");});',
    '  document.getElementById("sel_"+slotId).parentElement.classList.add("selected");',
    '  if(phaseId==="finales"){document.getElementById("podiumBox").style.display="block";}',
    '};',
    'function showPhase(idx){',
    '  document.querySelectorAll(".phase-tab").forEach(function(el,i){el.classList.toggle("active",i===idx);});',
    '  document.querySelectorAll(".phase-container").forEach(function(el,i){el.classList.toggle("active",i===idx);});',
    '  document.getElementById("podiumBox").style.display=(idx===PHASES.length-1)?"block":"none";',
    '}',
    'window.guardarTodo=function(){',
    '  var btn=document.getElementById("btnSave");',
    '  btn.innerText="GUARDANDO...";',
    '  var data={dieciseisavos:[],octavos:[],cuartos:[],semis:[],campeon:"",subcampeon:"",tercer_lugar:"",cuarto_lugar:""};',
    '  PHASES[0].matchesP.forEach(function(m){data.dieciseisavos.push(document.getElementById("sel_"+m.id+"_A").value||"");data.dieciseisavos.push(document.getElementById("sel_"+m.id+"_B").value||"");});',
    '  var selCamp=document.getElementById("sel_campeon");',
    '  data.campeon=selCamp?selCamp.value:"";',
    '  var userId=new URLSearchParams(window.location.search).get("user_id")||"GUEST";',
    '  fetch("/api/clasificatorias?user_id="+userId,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)})',
    '    .then(function(res){if(res.ok){var t=document.getElementById("toast");t.classList.add("show");setTimeout(function(){t.classList.remove("show");},2500);}else{alert("Error");}}).catch(function(){alert("Error de red");}).finally(function(){btn.innerText="GUARDAR BRACKET";});',
    '};',
    'initUI();'
  ].join('\n');

  const html = '<!DOCTYPE html><html lang="es"><head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">' +
    '<title>Brackets - World Cup 26</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">' +
    '<style>' + css + '</style>' +
    '</head><body>' +
    '<div class="toast" id="toast">¡GUARDADO!</div>' +
    '<div class="app-container">' +
      '<div class="header-box"><div class="badge-26">FASE ELIMINATORIA</div><h1>TU<br>BRACKET</h1></div>' +
      '<div class="phase-nav" id="tabsNav"></div>' +
      '<div id="phasesWrapper"></div>' +
      '<div class="podium-box" id="podiumBox" style="display:none">' +
        '<div class="podium-title">&#127942; CAMPEÓN MUNDIAL</div>' +
        '<div class="team-slot selected"><div class="s-flag" id="flag_campeon">&#127987;&#65039;</div><select class="s-select" id="sel_campeon"></select></div>' +
      '</div>' +
    '</div>' +
    '<div class="bottom-bar"><button class="btn-save" id="btnSave" onclick="guardarTodo()">GUARDAR BRACKET</button></div>' +
    '<script>' + jsCode + '<\/script>' +
    '</body></html>';

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
