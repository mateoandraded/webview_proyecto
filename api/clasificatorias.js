import { getRequestUrl } from '../lib/requestUrl.js';

export const config = {
  runtime: 'edge',
};

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;

const FLAGS_MAP = {
  "MEXICO": "\uD83C\uDDF2\uD83C\uDDFD", "ESTADOS UNIDOS": "\uD83C\uDDFA\uD83C\uDDF8", "CANADA": "\uD83C\uDDE8\uD83C\uDDE6", "BRASIL": "\uD83C\uDDE7\uD83C\uDDF7",
  "ARGENTINA": "\uD83C\uDDE6\uD83C\uDDF7", "ECUADOR": "\uD83C\uDDEA\uD83C\uDDE8", "COLOMBIA": "\uD83C\uDDE8\uD83C\uDDF4", "URUGUAY": "\uD83C\uDDFA\uD83C\uDDFE",
  "PARAGUAY": "\uD83C\uDDF5\uD83C\uDDFE", "CHILE": "\uD83C\uDDE8\uD83C\uDDF1", "PERU": "\uD83C\uDDF5\uD83C\uDDEA", "VENEZUELA": "\uD83C\uDDFB\uD83C\uDDEA",
  "ALEMANIA": "\uD83C\uDDE9\uD83C\uDDEA", "ESPANA": "\uD83C\uDDEA\uD83C\uDDF8", "ESPA\u00D1A": "\uD83C\uDDEA\uD83C\uDDF8", "FRANCIA": "\uD83C\uDDEB\uD83C\uDDF7", "PORTUGAL": "\uD83C\uDDF5\uD83C\uDDF9",
  "BELGICA": "\uD83C\uDDE7\uD83C\uDDEA", "PAISES BAJOS": "\uD83C\uDDF3\uD83C\uDDF1", "CROACIA": "\uD83C\uDDED\uD83C\uDDF7", "SERBIA": "\uD83C\uDDF7\uD83C\uDDF8",
  "SUIZA": "\uD83C\uDDE8\uD83C\uDDED", "TURQUIA": "\uD83C\uDDF9\uD83C\uDDF7", "DINAMARCA": "\uD83C\uDDE9\uD83C\uDDF0", "AUSTRIA": "\uD83C\uDDE6\uD83C\uDDF9",
  "POLONIA": "\uD83C\uDDF5\uD83C\uDDF1", "RUMANIA": "\uD83C\uDDF7\uD83C\uDDF4", "ESLOVENIA": "\uD83C\uDDF8\uD83C\uDDEE", "ESLOVAQUIA": "\uD83C\uDDF8\uD83C\uDDF0",
  "ALBANIA": "\uD83C\uDDE6\uD83C\uDDF1", "UCRANIA": "\uD83C\uDDFA\uD83C\uDDE6", "GRECIA": "\uD83C\uDDEC\uD83C\uDDF7", "MARRUECOS": "\uD83C\uDDF2\uD83C\uDDE6",
  "SENEGAL": "\uD83C\uDDF8\uD83C\uDDF3", "NIGERIA": "\uD83C\uDDF3\uD83C\uDDEC", "CAMERUN": "\uD83C\uDDE8\uD83C\uDDF2", "COSTA DE MARFIL": "\uD83C\uDDE8\uD83C\uDDEE",
  "EGIPTO": "\uD83C\uDDEA\uD83C\uDDEC", "GHANA": "\uD83C\uDDEC\uD83C\uDDED", "TUNEZ": "\uD83C\uDDF9\uD83C\uDDF3", "JAPON": "\uD83C\uDDEF\uD83C\uDDF5",
  "COREA DEL SUR": "\uD83C\uDDF0\uD83C\uDDF7", "AUSTRALIA": "\uD83C\uDDE6\uD83C\uDDFA", "IRAN": "\uD83C\uDDEE\uD83C\uDDF7", "ARABIA SAUDITA": "\uD83C\uDDF8\uD83C\uDDE6",
  "INDONESIA": "\uD83C\uDDEE\uD83C\uDDE9", "COSTA RICA": "\uD83C\uDDE8\uD83C\uDDF7", "PANAMA": "\uD83C\uDDF5\uD83C\uDDE6", "JAMAICA": "\uD83C\uDDEF\uD83C\uDDF2",
  "SUDAFRICA": "\uD83C\uDDFF\uD83C\uDDE6", "REPUBLICA CHECA": "\uD83C\uDDE8\uD83C\uDDFF", "BOSNIA": "\uD83C\uDDE7\uD83C\uDDE6", "QATAR": "\uD83C\uDDF6\uD83C\uDDE6",
  "HAITI": "\uD83C\uDDED\uD83C\uDDF9", "ESCOCIA": "\uD83C\uDDEC\uD83C\uDDE7", "CURAZAO": "\uD83C\uDDE8\uD83C\uDDFC", "SUECIA": "\uD83C\uDDF8\uD83C\uDDEA",
  "NUEVA ZELANDA": "\uD83C\uDDF3\uD83C\uDDFF", "CABO VERDE": "\uD83C\uDDE8\uD83C\uDDFB", "IRAK": "\uD83C\uDDEE\uD83C\uDDF6", "NORUEGA": "\uD83C\uDDF3\uD83C\uDDF4",
  "ARGELIA": "\uD83C\uDDE9\uD83C\uDDFF", "JORDANIA": "\uD83C\uDDEF\uD83C\uDDF4", "RD CONGO": "\uD83C\uDDE8\uD83C\uDDE9", "UZBEKISTAN": "\uD83C\uDDFA\uD83C\uDDFF",
  "INGLATERRA": "\uD83C\uDDEC\uD83C\uDDE7"
};

const GROUP_TEAMS = {
  A: ["MEXICO", "SUDAFRICA", "COREA DEL SUR", "REPUBLICA CHECA"],
  B: ["CANADA", "BOSNIA", "QATAR", "SUIZA"],
  C: ["BRASIL", "MARRUECOS", "HAITI", "ESCOCIA"],
  D: ["ESTADOS UNIDOS", "PARAGUAY", "AUSTRALIA", "TURQUIA"],
  E: ["ALEMANIA", "CURAZAO", "COSTA DE MARFIL", "ECUADOR"],
  F: ["PAISES BAJOS", "JAPON", "SUECIA", "TUNEZ"],
  G: ["BELGICA", "EGIPTO", "IRAN", "NUEVA ZELANDA"],
  H: ["ESPA\u00D1A", "CABO VERDE", "ARABIA SAUDITA", "URUGUAY"],
  I: ["FRANCIA", "SENEGAL", "IRAK", "NORUEGA"],
  J: ["ARGENTINA", "ARGELIA", "AUSTRIA", "JORDANIA"],
  K: ["PORTUGAL", "RD CONGO", "UZBEKISTAN", "COLOMBIA"],
  L: ["INGLATERRA", "CROACIA", "GHANA", "PANAMA"]
};

async function fetchDatum(collection, method, body, id, query) {
  method = method || 'GET';
  id = id || '';
  query = query || '';
  const url = BASE_URL + '/' + collection + '/records' + (id ? '/' + id : '') + '?perPage=500' + query;
  const options = { method: method, headers: { 'X-Api-Key': API_KEY, 'Content-Type': 'application/json' } };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  if (!res.ok) throw new Error('HTTP Error ' + res.status);
  if (method === 'DELETE' || res.status === 204) return true;
  return await res.json();
}

export default async function handler(req) {
  const url = getRequestUrl(req);
  const userId = url.searchParams.get('user_id') || 'GUEST';
  const executionId = url.searchParams.get('executionId') || '';

  if (req.method === 'POST') {
    try {
      const data = await req.json();
      let existingItems = [];
      try {
        const existReq = await fetchDatum('pronosticos_brackets', 'GET', null, '', "&filter=(user_id='" + userId + "')");
        existingItems = existReq.items || existReq;
      } catch (e) {
        existingItems = [];
      }
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
    } catch (e) {}
  }

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <title>Mis Clasificados · Jelou Mundial 2026</title>
  <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">
  <style>
    :root{--black:#000;--white:#fff;--lime:#C9FF24;--mag:#FF0055;--teal:#00FFCC;--purple:#6200EA;--dim:#181818;--dim2:#222;--bd:rgba(255,255,255,.12)}
    *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
    body{background:var(--black);color:var(--white);font-family:Inter,sans-serif;padding-bottom:140px}
    .app{max-width:450px;margin:auto;padding:0 16px}
    .header-box{margin:40px 0 20px;border-bottom:4px solid var(--white);padding-bottom:10px}
    .badge-26{display:inline-block;background:var(--purple);color:var(--white);font-weight:900;font-size:14px;padding:4px 10px;margin-bottom:12px}
    h1{font-family:"Archivo Black",sans-serif;font-size:38px;line-height:.9;letter-spacing:-2px}
    .phase-nav{display:flex;overflow-x:auto;gap:8px;margin-bottom:20px;padding-bottom:12px;border-bottom:2px solid var(--dim);scrollbar-width:none}
    .phase-nav::-webkit-scrollbar{display:none}
    .phase-tab{background:var(--dim);color:rgba(255,255,255,.5);border:2px solid var(--bd);padding:8px 14px;font-family:"Archivo Black",sans-serif;font-size:13px;white-space:nowrap;cursor:pointer;flex-shrink:0;transition:.15s}
    .phase-tab.active{background:var(--white);color:var(--black);border-color:var(--white)}
    .phase-panel{display:none}.phase-panel.active{display:block}
    .instr{font-size:11px;font-weight:800;letter-spacing:1px;color:rgba(255,255,255,.4);text-transform:uppercase;margin-bottom:14px;padding:8px 10px;background:var(--dim);border-left:3px solid var(--lime)}
    .counter{font-size:11px;font-weight:900;letter-spacing:1px;color:var(--lime);margin-bottom:10px;text-align:right}
    .counter em{color:rgba(255,255,255,.35);font-style:normal}
    .chip-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .chip{display:flex;align-items:center;gap:8px;background:var(--dim2);border:2px solid var(--bd);padding:10px 10px;cursor:pointer;transition:.12s;min-height:54px;position:relative;user-select:none}
    .chip:active{transform:scale(.96)}
    .chip.sel{background:var(--teal);border-color:var(--teal)}
    .chip.sel .cname{color:var(--black);font-weight:900}
    .chip.dim{opacity:.28;pointer-events:none}
    .cflag{font-size:22px;flex-shrink:0;line-height:1}
    .cname{font-weight:800;font-size:11px;text-transform:uppercase;line-height:1.2;flex:1;color:var(--white)}
    .tick{position:absolute;top:3px;right:5px;font-size:10px;color:var(--black);opacity:0;transition:.12s;font-weight:900}
    .chip.sel .tick{opacity:1}
    .group-wrap{display:flex;flex-direction:column;gap:14px}
    .group-card{border:2px solid var(--bd);padding:10px;background:var(--dim)}
    .group-title{font-family:"Archivo Black",sans-serif;font-size:18px;margin-bottom:8px;letter-spacing:-1px}
    .match-list{display:flex;flex-direction:column;gap:10px}
    .match-card{background:var(--dim);border:2px solid var(--bd);padding:8px}
    .match-head{font-size:10px;font-weight:900;letter-spacing:1px;color:rgba(255,255,255,.55);margin-bottom:8px;text-transform:uppercase}
    .match-pick{display:flex;flex-direction:column;gap:6px}
    .next-wrap{margin-top:12px;display:flex;justify-content:flex-end}
    .btn-next-phase{background:var(--dim2);color:var(--white);border:2px solid var(--bd);padding:8px 12px;font-family:"Archivo Black",sans-serif;font-size:11px;letter-spacing:.5px;cursor:pointer}
    .btn-next-phase:active{background:var(--teal);color:var(--black);border-color:var(--teal)}
    .podio-section{margin-bottom:20px}
    .podio-label{font-size:10px;font-weight:900;letter-spacing:2px;color:rgba(255,255,255,.45);margin-bottom:10px;text-transform:uppercase;padding:6px 0;border-bottom:1px solid var(--bd)}
    .podio-chips{display:flex;flex-wrap:wrap;gap:8px}
    .podio-chips .chip{min-width:130px}
    .bottom-bar{position:fixed;bottom:0;left:0;width:100%;background:var(--black);padding:16px;border-top:4px solid var(--purple);z-index:50;display:flex;flex-direction:column;gap:10px}
    .btn-save{width:100%;max-width:450px;margin:0 auto;display:block;background:var(--lime);color:var(--black);border:none;padding:16px;font-family:"Archivo Black",sans-serif;font-size:18px;cursor:pointer;letter-spacing:1px;display:none}
    .btn-save.visible{display:block}
    .btn-save:active{background:var(--white)}
    .btn-volver{width:100%;max-width:450px;margin:0 auto;display:block;background:var(--white);color:var(--black);border:none;padding:12px;font-family:"Archivo Black",sans-serif;font-size:14px;cursor:pointer;text-align:center;letter-spacing:1px}
    .btn-volver:active{background:var(--teal)}
    .toast{position:fixed;top:16px;left:50%;transform:translateX(-50%) translateY(-120px);background:var(--white);color:var(--black);padding:12px 24px;font-family:"Archivo Black",sans-serif;font-size:14px;z-index:100;transition:.3s;border:4px solid var(--black)}
    .toast.show{transform:translateX(-50%) translateY(0)}
  </style>
</head>
<body>
  <div class="toast" id="toast">¡CLASIFICADOS GUARDADOS!</div>
  <div class="app">
    <div class="header-box">
      <div class="badge-26">JELOU MUNDIAL 2026</div>
      <h1>MIS<br>CLASIFICADOS</h1>
    </div>
    <div class="phase-nav">
      <div class="phase-tab active" onclick="showPhase(0)">GRUPOS</div>
      <div class="phase-tab" onclick="showPhase(1)">16VOS</div>
      <div class="phase-tab" onclick="showPhase(2)">8VOS</div>
      <div class="phase-tab" onclick="showPhase(3)">4TOS</div>
      <div class="phase-tab" onclick="showPhase(4)">SEMIS</div>
      <div class="phase-tab" onclick="showPhase(5)">PODIO</div>
    </div>
    <div id="panel0" class="phase-panel active"></div>
    <div id="panel1" class="phase-panel"></div>
    <div id="panel2" class="phase-panel"></div>
    <div id="panel3" class="phase-panel"></div>
    <div id="panel4" class="phase-panel"></div>
    <div id="panel5" class="phase-panel"></div>
  </div>
  <div class="bottom-bar">
    <button class="btn-save" id="btnSave" onclick="guardar()">GUARDAR CLASIFICADOS</button>
    <button class="btn-volver" onclick="volver()">VOLVER</button>
  </div>
  <script>
    var GROUPS=${JSON.stringify(GROUP_TEAMS)};
    var FLAGS=${JSON.stringify(FLAGS_MAP)};
    var SAVED=${JSON.stringify(uBracket)};
    var SERVER_EXECUTION_ID=${JSON.stringify(executionId)};

    var GROUP_ORDER = Object.keys(GROUPS).sort();
    var THIRD_SLOTS = [
      { slot:74, options:["A","B","C","D","F"] },
      { slot:77, options:["C","D","F","G","H"] },
      { slot:79, options:["C","E","F","H","I"] },
      { slot:80, options:["E","H","I","J","K"] },
      { slot:81, options:["B","E","F","I","J"] },
      { slot:82, options:["A","E","H","I","J"] },
      { slot:85, options:["E","F","G","I","J"] },
      { slot:87, options:["D","E","I","J","L"] }
    ];

    var R32_DEF = [
      { id:73, home:{type:"second",group:"A"}, away:{type:"second",group:"B"} },
      { id:74, home:{type:"first",group:"E"}, away:{type:"third",slot:74} },
      { id:75, home:{type:"first",group:"F"}, away:{type:"second",group:"C"} },
      { id:76, home:{type:"first",group:"C"}, away:{type:"second",group:"F"} },
      { id:77, home:{type:"first",group:"I"}, away:{type:"third",slot:77} },
      { id:78, home:{type:"second",group:"E"}, away:{type:"second",group:"I"} },
      { id:79, home:{type:"first",group:"A"}, away:{type:"third",slot:79} },
      { id:80, home:{type:"first",group:"L"}, away:{type:"third",slot:80} },
      { id:81, home:{type:"first",group:"D"}, away:{type:"third",slot:81} },
      { id:82, home:{type:"first",group:"G"}, away:{type:"third",slot:82} },
      { id:83, home:{type:"second",group:"K"}, away:{type:"second",group:"L"} },
      { id:84, home:{type:"first",group:"H"}, away:{type:"second",group:"J"} },
      { id:85, home:{type:"first",group:"B"}, away:{type:"third",slot:85} },
      { id:86, home:{type:"first",group:"J"}, away:{type:"second",group:"H"} },
      { id:87, home:{type:"first",group:"K"}, away:{type:"third",slot:87} },
      { id:88, home:{type:"second",group:"D"}, away:{type:"second",group:"G"} }
    ];

    var R16_DEF = [
      { id:89, a:74, b:77 }, { id:90, a:73, b:75 }, { id:91, a:76, b:78 }, { id:92, a:79, b:80 },
      { id:93, a:83, b:84 }, { id:94, a:81, b:82 }, { id:95, a:86, b:88 }, { id:96, a:85, b:87 }
    ];
    var QF_DEF = [{ id:97, a:89, b:90 }, { id:98, a:93, b:94 }, { id:99, a:91, b:92 }, { id:100, a:95, b:96 }];
    var SF_DEF = [{ id:101, a:97, b:98 }, { id:102, a:99, b:100 }];

    var callbackSent = false;
    var state = {
      groups: (function(){ var g={}; GROUP_ORDER.forEach(function(k){ g[k]=[]; }); return g; })(),
      winners: { r32:{}, r16:{}, qf:{}, sf:{} },
      podium: { campeon:"", sub:"", tercero:"", cuarto:"" }
    };
    var derived = {};

    function gf(n){ return FLAGS[(n || "").toUpperCase()] || "🏳️"; }
    function comboKey(arr){ return arr.slice().sort().join(""); }
    function winnersCount(map){ return Object.keys(map).length; }

    function chip(team, sel, dimmed, onclick, badge){
      var cls = "chip" + (sel ? " sel":"") + (dimmed ? " dim":"");
      var mark = badge || (sel ? "✓":"");
      return "<div class=\\"" + cls + "\\" onclick=\\"" + onclick + "\\"><div class=\\"cflag\\">" + gf(team) + "</div><div class=\\"cname\\">" + team + "</div><div class=\\"tick\\">" + mark + "</div></div>";
    }

    function solveThirdAssignment(groups){
      var allowed = new Set(groups);
      var slots = THIRD_SLOTS.slice();
      var used = new Set();
      var out = {};
      function bt(i){
        if(i === slots.length) return true;
        var s = slots[i];
        var candidates = s.options.filter(function(g){ return allowed.has(g) && !used.has(g); }).sort();
        for(var j=0;j<candidates.length;j++){
          var g = candidates[j];
          used.add(g);
          out[s.slot] = g;
          if(bt(i + 1)) return true;
          used.delete(g);
          delete out[s.slot];
        }
        return false;
      }
      return bt(0) ? out : null;
    }

    function buildThirdTable(){
      var letters = GROUP_ORDER.slice();
      var combos = [];
      function rec(i, picked){
        if(picked.length === 8){ combos.push(picked.slice()); return; }
        if(i >= letters.length) return;
        picked.push(letters[i]); rec(i + 1, picked); picked.pop();
        rec(i + 1, picked);
      }
      rec(0, []);
      var table = {};
      combos.forEach(function(c){
        var solved = solveThirdAssignment(c);
        if(solved) table[comboKey(c)] = solved;
      });
      return table;
    }

    var THIRD_LOOKUP = buildThirdTable();

    function getPlacements(){
      var firstByGroup = {}, secondByGroup = {}, thirdByGroup = {};
      var firstList = [], secondList = [], thirdList = [];
      GROUP_ORDER.forEach(function(g){
        var picks = state.groups[g] || [];
        if(picks[0]){ firstByGroup[g] = picks[0]; firstList.push(picks[0]); }
        if(picks[1]){ secondByGroup[g] = picks[1]; secondList.push(picks[1]); }
        if(picks[2]){ thirdByGroup[g] = picks[2]; thirdList.push(picks[2]); }
      });
      var thirdGroups = Object.keys(thirdByGroup).sort();
      return {
        firstByGroup:firstByGroup,
        secondByGroup:secondByGroup,
        thirdByGroup:thirdByGroup,
        thirdAssign:THIRD_LOOKUP[comboKey(thirdGroups)] || null,
        groupsReady:firstList.length === 12 && secondList.length === 12 && thirdList.length === 8,
        legacyD16:firstList.concat(secondList,thirdList)
      };
    }

    function resolveEntry(entry, placements){
      if(entry.type === "first") return placements.firstByGroup[entry.group] || "";
      if(entry.type === "second") return placements.secondByGroup[entry.group] || "";
      if(entry.type === "third"){
        if(!placements.thirdAssign) return "";
        var g = placements.thirdAssign[entry.slot];
        return g ? (placements.thirdByGroup[g] || "") : "";
      }
      return "";
    }

    function buildR32(placements){
      return R32_DEF.map(function(def){
        return { id:def.id, home:resolveEntry(def.home, placements), away:resolveEntry(def.away, placements) };
      });
    }

    function buildKnockout(defs, sourceWinners){
      return defs.map(function(d){
        return { id:d.id, home:sourceWinners[d.a] || "", away:sourceWinners[d.b] || "" };
      });
    }

    function sanitizeWinnerMap(matches, map){
      Object.keys(map).forEach(function(mid){
        var m = matches.find(function(it){ return String(it.id) === String(mid); });
        if(!m || !map[mid] || (map[mid] !== m.home && map[mid] !== m.away)) delete map[mid];
      });
    }

    function sanitizePodium(sfMatches){
      var m101 = sfMatches.find(function(m){ return m.id === 101; });
      var m102 = sfMatches.find(function(m){ return m.id === 102; });
      var w101 = state.winners.sf["101"] || "";
      var w102 = state.winners.sf["102"] || "";
      var finalists = [w101,w102].filter(Boolean);
      var loser101 = (m101 && w101) ? (w101 === m101.home ? m101.away : m101.home) : "";
      var loser102 = (m102 && w102) ? (w102 === m102.home ? m102.away : m102.home) : "";
      var thirdFinal = [loser101,loser102].filter(Boolean);

      if(finalists.indexOf(state.podium.campeon) === -1) state.podium.campeon = "";
      if(finalists.indexOf(state.podium.sub) === -1) state.podium.sub = "";
      if(thirdFinal.indexOf(state.podium.tercero) === -1) state.podium.tercero = "";
      if(thirdFinal.indexOf(state.podium.cuarto) === -1) state.podium.cuarto = "";
    }

    function recompute(){
      derived.placements = getPlacements();
      derived.r32 = buildR32(derived.placements);
      sanitizeWinnerMap(derived.r32, state.winners.r32);

      derived.r16 = buildKnockout(R16_DEF, state.winners.r32);
      sanitizeWinnerMap(derived.r16, state.winners.r16);

      derived.qf = buildKnockout(QF_DEF, state.winners.r16);
      sanitizeWinnerMap(derived.qf, state.winners.qf);

      derived.sf = buildKnockout(SF_DEF, state.winners.qf);
      sanitizeWinnerMap(derived.sf, state.winners.sf);
      sanitizePodium(derived.sf);
    }

    function hydrateWinners(matches, outMap, teams){
      (teams || []).forEach(function(team){
        if(!team) return;
        var m = matches.find(function(it){
          return !outMap[it.id] && (it.home === team || it.away === team);
        });
        if(m) outMap[m.id] = team;
      });
    }

    function initFromSaved(){
      if(!SAVED) return;
      var oldD16 = Array.isArray(SAVED.dieciseisavos) ? SAVED.dieciseisavos : [];
      var setD16 = new Set(oldD16);
      GROUP_ORDER.forEach(function(g){
        var inGroup = GROUPS[g].filter(function(t){ return setD16.has(t); });
        inGroup.sort(function(a,b){ return oldD16.indexOf(a) - oldD16.indexOf(b); });
        state.groups[g] = inGroup.slice(0,3);
      });

      var thirds = GROUP_ORDER.filter(function(g){ return (state.groups[g] || []).length > 2; });
      if(thirds.length > 8){
        thirds.slice(8).forEach(function(g){ state.groups[g] = state.groups[g].slice(0,2); });
      }

      state.podium.campeon = SAVED.campeon || "";
      state.podium.sub = SAVED.subcampeon || "";
      state.podium.tercero = SAVED.tercer_lugar || "";
      state.podium.cuarto = SAVED.cuarto_lugar || "";

      recompute();
      hydrateWinners(derived.r32, state.winners.r32, SAVED.octavos || []);
      recompute();
      hydrateWinners(derived.r16, state.winners.r16, SAVED.cuartos || []);
      recompute();
      hydrateWinners(derived.qf, state.winners.qf, SAVED.semis || []);
      recompute();
    }

    function thirdCount(){
      var total = 0;
      GROUP_ORDER.forEach(function(g){ if((state.groups[g] || []).length > 2) total++; });
      return total;
    }

    function toggleGroupTeam(group, team){
      var picks = state.groups[group];
      var idx = picks.indexOf(team);
      if(idx >= 0){
        picks.splice(idx, 1);
      }else if(picks.length < 2){
        picks.push(team);
      }else if(picks.length === 2){
        if(thirdCount() >= 8) return;
        picks.push(team);
      }else{
        return;
      }
      state.winners.r32 = {};
      state.winners.r16 = {};
      state.winners.qf = {};
      state.winners.sf = {};
      state.podium = { campeon:"", sub:"", tercero:"", cuarto:"" };
      rerender();
    }

    function toggleWinner(stage, matchId, team){
      if(!team) return;
      var map = state.winners[stage];
      var key = String(matchId);
      if(map[key] === team) delete map[key];
      else map[key] = team;

      if(stage === "r32"){ state.winners.r16 = {}; state.winners.qf = {}; state.winners.sf = {}; state.podium = { campeon:"", sub:"", tercero:"", cuarto:"" }; }
      if(stage === "r16"){ state.winners.qf = {}; state.winners.sf = {}; state.podium = { campeon:"", sub:"", tercero:"", cuarto:"" }; }
      if(stage === "qf"){ state.winners.sf = {}; state.podium = { campeon:"", sub:"", tercero:"", cuarto:"" }; }
      if(stage === "sf"){ state.podium = { campeon:"", sub:"", tercero:"", cuarto:"" }; }
      rerender();
    }

    function pickPodio(k, t){
      if(state.podium[k] === t) state.podium[k] = "";
      else state.podium[k] = t;
      if(k === "campeon"){ if(state.podium.sub === t) state.podium.sub = ""; }
      if(k === "sub"){ if(state.podium.campeon === t) state.podium.campeon = ""; }
      if(k === "tercero"){ if(state.podium.cuarto === t) state.podium.cuarto = ""; }
      if(k === "cuarto"){ if(state.podium.tercero === t) state.podium.tercero = ""; }
      buildPanel(5);
      checkSaveButton();
    }

    function renderMatchList(matches, stage, title){
      var selected = winnersCount(state.winners[stage]);
      var h = "<div class=\\"instr\\">" + title + "</div>";
      h += "<div class=\\"counter\\">" + selected + " <em>/ " + matches.length + "</em></div>";
      h += "<div class=\\"match-list\\">";
      matches.forEach(function(m){
        var winner = state.winners[stage][m.id] || "";
        var ready = !!(m.home && m.away);
        h += "<div class=\\"match-card\\"><div class=\\"match-head\\">MATCH " + m.id + "</div><div class=\\"match-pick\\">";
        h += chip(m.home || "PENDIENTE", winner === m.home, !ready || !m.home, "toggleWinner(\\'" + stage + "\\'," + m.id + ",\\'" + (m.home || "") + "\\')", winner === m.home ? "GANADOR" : "");
        h += chip(m.away || "PENDIENTE", winner === m.away, !ready || !m.away, "toggleWinner(\\'" + stage + "\\'," + m.id + ",\\'" + (m.away || "") + "\\')", winner === m.away ? "GANADOR" : "");
        h += "</div></div>";
      });
      h += "</div>";
      return h;
    }

    function nextShortcut(targetIdx, label){
      return "<div class=\\"next-wrap\\"><button type=\\"button\\" class=\\"btn-next-phase\\" onclick=\\"showPhase(" + targetIdx + ")\\">" + label + "</button></div>";
    }

    function buildPanel(idx){
      var p = document.getElementById("panel" + idx);
      if(!p) return;
      var h = "";
      if(idx === 0){
        h += "<div class=\\"instr\\">Elige 1°, 2° y (opcional) 3° por grupo. Máximo 8 terceros.</div>";
        h += "<div class=\\"counter\\">Terceros: " + thirdCount() + " <em>/ 8</em></div>";
        h += "<div class=\\"group-wrap\\">";
        GROUP_ORDER.forEach(function(g){
          var picks = state.groups[g] || [];
          h += "<div class=\\"group-card\\"><div class=\\"group-title\\">GRUPO " + g + "</div><div class=\\"chip-grid\\">";
          GROUPS[g].forEach(function(team){
            var pi = picks.indexOf(team);
            var sel = pi >= 0;
            var badge = sel ? (pi === 0 ? "1°" : (pi === 1 ? "2°" : "3°")) : "";
            var block = !sel && (picks.length >= 3 || (picks.length === 2 && thirdCount() >= 8));
            h += chip(team, sel, block, "toggleGroupTeam(\\'" + g + "\\',\\'" + team + "\\')", badge);
          });
          h += "</div></div>";
        });
        h += "</div>";
        if(derived.placements.groupsReady){
          h += nextShortcut(1, "IR A 16VOS");
        }
      } else if(idx === 1){
        if(!derived.placements.groupsReady){
          h += "<div class=\\"instr\\" style=\\"border-color:var(--mag)\\">Completa GRUPOS para armar 16VOS</div>";
        } else {
          h += renderMatchList(derived.r32, "r32", "Selecciona el ganador de cada partido de 16VOS");
          if(winnersCount(state.winners.r32) === 16){
            h += nextShortcut(2, "IR A 8VOS");
          }
        }
      } else if(idx === 2){
        h += renderMatchList(derived.r16, "r16", "Selecciona el ganador de cada partido de 8VOS");
        if(winnersCount(state.winners.r16) === 8){
          h += nextShortcut(3, "IR A 4TOS");
        }
      } else if(idx === 3){
        h += renderMatchList(derived.qf, "qf", "Selecciona el ganador de cada partido de 4TOS");
        if(winnersCount(state.winners.qf) === 4){
          h += nextShortcut(4, "IR A SEMIS");
        }
      } else if(idx === 4){
        h += renderMatchList(derived.sf, "sf", "Selecciona el ganador de cada semifinal");
        if(winnersCount(state.winners.sf) === 2){
          h += nextShortcut(5, "IR A PODIO");
        }
      } else {
        var m101 = derived.sf.find(function(m){ return m.id === 101; });
        var m102 = derived.sf.find(function(m){ return m.id === 102; });
        var w101 = state.winners.sf["101"] || "";
        var w102 = state.winners.sf["102"] || "";
        var finalists = [w101,w102].filter(Boolean);
        var thirdFinal = [];
        if(m101 && w101) thirdFinal.push(w101 === m101.home ? m101.away : m101.home);
        if(m102 && w102) thirdFinal.push(w102 === m102.home ? m102.away : m102.home);

        h += "<div class=\\"instr\\">Selecciona podio final del torneo</div>";
        if(finalists.length < 2 || thirdFinal.length < 2){
          h += "<div class=\\"instr\\" style=\\"border-color:var(--mag)\\">Primero completa SEMIS</div>";
        } else {
          function podio(label,key,pool,excl){
            var html = "<div class=\\"podio-section\\"><div class=\\"podio-label\\">" + label + "</div><div class=\\"podio-chips\\">";
            var selected = state.podium[key];
            pool.forEach(function(t){
              if(excl.indexOf(t) >= 0 && t !== selected) return;
              html += chip(t, selected === t, false, "pickPodio(\\'" + key + "\\',\\'" + t + "\\')", selected === t ? "OK" : "");
            });
            html += "</div></div>";
            return html;
          }
          h += podio("🏆 CAMPEÓN MUNDIAL","campeon",finalists,[]);
          h += podio("SUBCAMPEÓN (2° PUESTO)","sub",finalists,[state.podium.campeon]);
          h += podio("TERCER LUGAR (3er PUESTO)","tercero",thirdFinal,[]);
          h += podio("CUARTO LUGAR (4to PUESTO)","cuarto",thirdFinal,[state.podium.tercero]);
        }
      }
      p.innerHTML = h;
    }

    function checkSaveButton(){
      var ok = derived.placements.groupsReady &&
        winnersCount(state.winners.r32) === 16 &&
        winnersCount(state.winners.r16) === 8 &&
        winnersCount(state.winners.qf) === 4 &&
        winnersCount(state.winners.sf) === 2 &&
        !!state.podium.campeon && !!state.podium.sub && !!state.podium.tercero && !!state.podium.cuarto;
      document.getElementById("btnSave").classList.toggle("visible", !!ok);
    }

    function rerender(){
      recompute();
      for(var i=0;i<6;i++) buildPanel(i);
      checkSaveButton();
    }

    function showPhase(idx){
      document.querySelectorAll(".phase-tab").forEach(function(el,i){ el.classList.toggle("active", i === idx); });
      document.querySelectorAll(".phase-panel").forEach(function(el,i){ el.classList.toggle("active", i === idx); });
    }

    function orderedWinners(ids, map){
      return ids.map(function(id){ return map[id] || map[String(id)] || ""; }).filter(Boolean);
    }

    /** Callback Brain: summary ≤ 1024 chars; quita desde el final arrays completos o entradas sueltas. */
    function bracketSummaryForCallback(p) {
      var MAX = 1024;
      var base = {
        campeon: p.campeon || "",
        subcampeon: p.subcampeon || "",
        tercer_lugar: p.tercer_lugar || "",
        cuarto_lugar: p.cuarto_lugar || "",
        dieciseisavos: [],
        octavos: [],
        cuartos: [],
        semis: []
      };
      var order = [
        ["dieciseisavos", p.dieciseisavos || []],
        ["octavos", p.octavos || []],
        ["cuartos", p.cuartos || []],
        ["semis", p.semis || []]
      ];
      var ki, j, key, arr, trial;
      for (ki = 0; ki < order.length; ki++) {
        key = order[ki][0];
        arr = order[ki][1];
        for (j = 0; j < arr.length; j++) {
          base[key].push(arr[j]);
          trial = JSON.stringify(base);
          if (trial.length > MAX) {
            base[key].pop();
            base.truncado = true;
            return base;
          }
        }
      }
      return base;
    }

    function guardar(){
      var btn = document.getElementById("btnSave");
      btn.innerText = "GUARDANDO...";
      var payload = {
        dieciseisavos: derived.placements.legacyD16,
        octavos: orderedWinners([73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88], state.winners.r32),
        cuartos: orderedWinners([89,90,91,92,93,94,95,96], state.winners.r16),
        semis: orderedWinners([97,98,99,100], state.winners.qf),
        campeon: state.podium.campeon,
        subcampeon: state.podium.sub,
        tercer_lugar: state.podium.tercero,
        cuarto_lugar: state.podium.cuarto
      };
      var uid = new URLSearchParams(window.location.search).get("user_id") || "GUEST";
      var exId = new URLSearchParams(window.location.search).get("executionId") || "";
      fetch("/api/clasificatorias?user_id=" + uid, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(payload)
      })
      .then(function(r){
        if(r.ok){
          document.getElementById("toast").classList.add("show");
          callbackSent = true;
          var cbBody = { executionId: exId, success: true, data: { action: "save_clasificados", summary: bracketSummaryForCallback(payload) } };
          fetch("https://workflows.jelou.ai/v1/webview/callback", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(cbBody)
          }).finally(function(){ setTimeout(function(){ window.location.href = "https://wa.me/13239183195"; }, 1500); });
        }else{
          alert("Error al guardar");
        }
      })
      .catch(function(){ alert("Error de red"); })
      .finally(function(){ btn.innerText = "GUARDAR CLASIFICADOS"; });
    }

    function volver(){
      if(callbackSent) return;
      callbackSent = true;
      var exId = new URLSearchParams(window.location.search).get("executionId") || SERVER_EXECUTION_ID || "";
      fetch("https://workflows.jelou.ai/v1/webview/callback", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ executionId: exId, success: true, data: { action: "volver" } })
      }).finally(function(){ window.location.href = "https://wa.me/13239183195"; });
    }

    document.addEventListener("visibilitychange", function(){
      if(document.visibilityState === "hidden" && !callbackSent){
        callbackSent = true;
        var exId = new URLSearchParams(window.location.search).get("executionId") || SERVER_EXECUTION_ID || "";
        fetch("https://workflows.jelou.ai/v1/webview/callback", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({ executionId: exId, success: true, data: { action: "volver" } }),
          keepalive:true
        });
      }
    });

    window.toggleGroupTeam = toggleGroupTeam;
    window.toggleWinner = toggleWinner;
    window.pickPodio = pickPodio;
    window.showPhase = showPhase;
    window.guardar = guardar;
    window.volver = volver;

    initFromSaved();
    rerender();
  </script>
</body>
</html>`;

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
