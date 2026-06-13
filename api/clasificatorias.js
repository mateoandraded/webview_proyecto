import { getRequestUrl } from '../lib/requestUrl.js';
import { fetchFechaTorneoDesdeJelou } from '../lib/fechaTorneo.js';

export const config = {
  runtime: 'edge',
};

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;

const FECHA_LIMITE_PRONOSTICOS = '2026-06-14';

function bracketPayloadsEqual(p, existing) {
  var arrKeys = ['dieciseisavos', 'octavos', 'cuartos', 'semis'];
  var i, k;
  for (i = 0; i < arrKeys.length; i++) {
    k = arrKeys[i];
    if (JSON.stringify(p[k] || []) !== JSON.stringify(existing[k] || [])) return false;
  }
  var strKeys = ['campeon', 'subcampeon', 'tercer_lugar', 'cuarto_lugar'];
  for (i = 0; i < strKeys.length; i++) {
    k = strKeys[i];
    if (String(p[k] || '') !== String(existing[k] || '')) return false;
  }
  return true;
}

const FLAGS_MAP = {
  "MEXICO": "🇲🇽", "ESTADOS UNIDOS": "🇺🇸", "CANADA": "🇨🇦", "BRASIL": "🇧🇷",
  "ARGENTINA": "🇦🇷", "ECUADOR": "🇪🇨", "COLOMBIA": "🇨🇴", "URUGUAY": "🇺🇾",
  "PARAGUAY": "🇵🇾", "CHILE": "🇨🇱", "PERU": "🇵🇪", "VENEZUELA": "🇻🇪",
  "ALEMANIA": "🇩🇪", "ESPANA": "🇪🇸", "ESPAÑA": "🇪🇸", "FRANCIA": "🇫🇷", "PORTUGAL": "🇵🇹",
  "BELGICA": "🇧🇪", "PAISES BAJOS": "🇳🇱", "CROACIA": "🇭🇷", "SERBIA": "🇷🇸",
  "SUIZA": "🇨🇭", "TURQUIA": "🇹🇷", "DINAMARCA": "🇩🇰", "AUSTRIA": "🇦🇹",
  "POLONIA": "🇵🇱", "RUMANIA": "🇷🇴", "ESLOVENIA": "🇸🇮", "ESLOVAQUIA": "🇸🇰",
  "ALBANIA": "🇦🇱", "UCRANIA": "🇺🇦", "GRECIA": "🇬🇷", "MARRUECOS": "🇲🇦",
  "SENEGAL": "🇸🇳", "NIGERIA": "🇳🇬", "CAMERUN": "🇨🇲", "COSTA DE MARFIL": "🇨🇮",
  "EGIPTO": "🇪🇬", "GHANA": "🇬🇭", "TUNEZ": "🇹🇳", "JAPON": "🇯🇵",
  "COREA DEL SUR": "🇰🇷", "AUSTRALIA": "🇦🇺", "IRAN": "🇮🇷", "ARABIA SAUDITA": "🇸🇦",
  "INDONESIA": "🇮🇩", "COSTA RICA": "🇨🇷", "PANAMA": "🇵🇦", "JAMAICA": "🇯🇲",
  "SUDAFRICA": "🇿🇦", "REPUBLICA CHECA": "🇨🇿", "BOSNIA": "🇧🇦", "BOSNIA Y HERZEGOVINA": "🇧🇦",
  "QATAR": "🇶🇦", "HAITI": "🇭🇹", "HAITÍ": "🇭🇹", "ESCOCIA": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "CURAZAO": "🇨🇼", "SUECIA": "🇸🇪", "NUEVA ZELANDA": "🇳🇿", "CABO VERDE": "🇨🇻",
  "IRAK": "🇮🇶", "NORUEGA": "🇳🇴", "ARGELIA": "🇩🇿", "JORDANIA": "🇯🇴",
  "RD CONGO": "🇨🇬", "CONGO": "🇨🇬", "REPUBLICA DEL CONGO": "🇨🇬", "REPÚBLICA DEL CONGO": "🇨🇬",
  "UZBEKISTAN": "🇺🇿", "UZBEKISTÁN": "🇺🇿", "INGLATERRA": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "REPUBLICA DE COREA": "🇰🇷", "REPÚBLICA DE COREA": "🇰🇷"
};

// Title Case identico a PartidosMundial2025.equipo_local/equipo_visitante.
// Permite que el bracket guardado y los partidos reales se comparen con exact match
// y los puntos de bracket se otorguen correctamente.
const GROUP_TEAMS = {
  A: ["Mexico", "Sudafrica", "Republica de Corea", "Republica Checa"],
  B: ["Canada", "Bosnia y Herzegovina", "Qatar", "Suiza"],
  C: ["Brasil", "Marruecos", "Haiti", "Escocia"],
  D: ["Estados Unidos", "Paraguay", "Australia", "Turquia"],
  E: ["Alemania", "Curazao", "Costa de Marfil", "Ecuador"],
  F: ["Paises Bajos", "Japon", "Suecia", "Tunez"],
  G: ["Belgica", "Egipto", "Iran", "Nueva Zelanda"],
  H: ["Espana", "Cabo Verde", "Arabia Saudita", "Uruguay"],
  I: ["Francia", "Senegal", "Irak", "Noruega"],
  J: ["Argentina", "Argelia", "Austria", "Jordania"],
  K: ["Portugal", "RD Congo", "Uzbekistan", "Colombia"],
  L: ["Inglaterra", "Croacia", "Ghana", "Panama"]
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
  const lang = url.searchParams.get('lang') || 'es';

  const i18n = {
    es: {
      title: "MIS<br>CLASIFICADOS", title_doc: "Mis Clasificados", toast_saved: "¡CLASIFICADOS GUARDADOS!",
      tab_groups: "GRUPOS", tab_16vos: "16VOS", tab_8vos: "8VOS", tab_4tos: "4TOS", tab_semis: "SEMIS", tab_podio: "PODIO",
      btn_save: "GUARDAR CLASIFICADOS", btn_save_loading: "GUARDANDO...", btn_back: "VOLVER",
      instr_groups: "Elige 1°, 2° y (opcional) 3° por grupo. Máximo 8 terceros.", counter_thirds: "Terceros", group: "GRUPO",
      go_16vos: "IR A 16VOS", instr_complete_groups: "Completa GRUPOS para armar 16VOS", instr_r32: "Selecciona el ganador de cada partido de 16VOS",
      go_8vos: "IR A 8VOS", instr_r16: "Selecciona el ganador de cada partido de 8VOS", go_4tos: "IR A 4TOS", instr_qf: "Selecciona el ganador de cada partido de 4TOS",
      go_semis: "IR A SEMIS", instr_sf: "Selecciona el ganador de cada semifinal", go_podio: "IR A PODIO", instr_podio: "Selecciona podio final", instr_complete_semis: "Primero completa SEMIS",
      match: "MATCH", pending: "PENDIENTE", winner: "GANADOR", final_match: "🏆 FINAL MUNDIAL", champion: "CAMPEÓN", second_place: "2° PUESTO", third_match: "PARTIDO POR EL TERCER LUGAR", third_place: "3er PUESTO", fourth_place: "4to PUESTO",
      alert_closed: "Los pronósticos ya están cerrados.", alert_error_save: "Error al guardar", alert_net_error: "Error de red"
    },
    en: {
      title: "MY<br>BRACKETS", title_doc: "My Brackets", toast_saved: "BRACKETS SAVED!",
      tab_groups: "GROUPS", tab_16vos: "R32", tab_8vos: "R16", tab_4tos: "QF", tab_semis: "SF", tab_podio: "PODIUM",
      btn_save: "SAVE BRACKETS", btn_save_loading: "SAVING...", btn_back: "BACK",
      instr_groups: "Choose 1st, 2nd, and (optional) 3rd per group. Max 8 thirds.", counter_thirds: "Thirds", group: "GROUP",
      go_16vos: "GO TO R32", instr_complete_groups: "Complete GROUPS to build R32", instr_r32: "Select the winner of each Round of 32 match",
      go_8vos: "GO TO R16", instr_r16: "Select the winner of each Round of 16 match", go_4tos: "GO TO QF", instr_qf: "Select the winner of each Quarter-Final match",
      go_semis: "GO TO SF", instr_sf: "Select the winner of each Semi-Final", go_podio: "GO TO PODIUM", instr_podio: "Select final podium", instr_complete_semis: "First complete SF",
      match: "MATCH", pending: "TBD", winner: "WINNER", final_match: "🏆 WORLD CUP FINAL", champion: "CHAMPION", second_place: "2ND PLACE", third_match: "THIRD PLACE MATCH", third_place: "3RD PLACE", fourth_place: "4TH PLACE",
      alert_closed: "Predictions are already closed.", alert_error_save: "Error saving", alert_net_error: "Network error"
    },
    pt: {
      title: "MEUS<br>CLASSIFICADOS", title_doc: "Meus Classificados", toast_saved: "CLASSIFICADOS SALVOS!",
      tab_groups: "GRUPOS", tab_16vos: "16 AVOS", tab_8vos: "OITAVAS", tab_4tos: "QUARTAS", tab_semis: "SEMIS", tab_podio: "PÓDIO",
      btn_save: "SALVAR CLASSIFICADOS", btn_save_loading: "SALVANDO...", btn_back: "VOLTAR",
      instr_groups: "Escolha 1º, 2º e (opcional) 3º por grupo. Máximo 8 terceiros.", counter_thirds: "Terceiros", group: "GRUPO",
      go_16vos: "IR PARA 16 AVOS", instr_complete_groups: "Complete GRUPOS para montar 16 AVOS", instr_r32: "Selecione o vencedor de cada partida das 16 Avos",
      go_8vos: "IR PARA OITAVAS", instr_r16: "Selecione o vencedor de cada partida das Oitavas", go_4tos: "IR PARA QUARTAS", instr_qf: "Selecione o vencedor de cada partida das Quartas",
      go_semis: "IR PARA SEMIS", instr_sf: "Selecione o vencedor de cada semifinal", go_podio: "IR PARA PÓDIO", instr_podio: "Selecione o pódio final", instr_complete_semis: "Primeiro complete as SEMIS",
      match: "PARTIDA", pending: "PENDENTE", winner: "VENCEDOR", final_match: "🏆 FINAL DA COPA", champion: "CAMPEÃO", second_place: "2º LUGAR", third_match: "DISPUTA DO 3º LUGAR", third_place: "3º LUGAR", fourth_place: "4º LUGAR",
      alert_closed: "Os palpites já estão encerrados.", alert_error_save: "Erro ao salvar", alert_net_error: "Erro de rede"
    }
  };
  const t = i18n[lang] || i18n['es'];


  if (req.method === 'POST') {
    try {
      var fechaPost = await fetchFechaTorneoDesdeJelou();
      if (fechaPost > FECHA_LIMITE_PRONOSTICOS) {
        return new Response(JSON.stringify({ error: 'Pronósticos cerrados' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
      }
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
        if (bracketPayloadsEqual(payload, existingItems[0])) {
          return new Response(JSON.stringify({ success: true, unchanged: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        await fetchDatum('pronosticos_brackets', 'PATCH', payload, existingItems[0].id, '');
      } else {
        await fetchDatum('pronosticos_brackets', 'POST', payload, '', '');
      }
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  var fechaServidor = await fetchFechaTorneoDesdeJelou();
  var puedeEditar = fechaServidor <= FECHA_LIMITE_PRONOSTICOS;
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
  <title>${t.title_doc} · Jelou Mundial 2026</title>
  <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">
  <style>
    :root{--black:#000;--white:#fff;--lime:#C9FF24;--mag:#FF0055;--teal:#00FFCC;--purple:#6200EA;--dim:#181818;--dim2:#222;--bd:rgba(255,255,255,.12)}
    *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
    body{background:var(--black);color:var(--white);font-family:Inter,sans-serif;padding-bottom:140px}
    body.bracket-readonly .chip{pointer-events:none;opacity:.52;filter:grayscale(.12)}
    body.bracket-readonly .chip.sel{opacity:.62;border-color:rgba(255,255,255,.2)}
    body.bracket-readonly .btn-next-phase{pointer-events:none;opacity:.42}
    body.bracket-readonly .phase-tab{cursor:default;opacity:.85}
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
<body${puedeEditar ? '' : ' class="bracket-readonly"'}>
  <div class="toast" id="toast">${t.toast_saved}</div>
  <div class="app">
    <div class="header-box">
      <div class="badge-26">JELOU MUNDIAL 2026</div>
      <h1>${t.title}</h1>
    </div>
    <div class="phase-nav">
      <div class="phase-tab active" onclick="showPhase(0)">${t.tab_groups}</div>
      <div class="phase-tab" onclick="showPhase(1)">${t.tab_16vos}</div>
      <div class="phase-tab" onclick="showPhase(2)">${t.tab_8vos}</div>
      <div class="phase-tab" onclick="showPhase(3)">${t.tab_4tos}</div>
      <div class="phase-tab" onclick="showPhase(4)">${t.tab_semis}</div>
      <div class="phase-tab" onclick="showPhase(5)">${t.tab_podio}</div>
    </div>
    <div id="panel0" class="phase-panel active"></div>
    <div id="panel1" class="phase-panel"></div>
    <div id="panel2" class="phase-panel"></div>
    <div id="panel3" class="phase-panel"></div>
    <div id="panel4" class="phase-panel"></div>
    <div id="panel5" class="phase-panel"></div>
  </div>
  <div class="bottom-bar">
    <button class="btn-save" id="btnSave" onclick="guardar()">${t.btn_save}</button>
    <button class="btn-volver" onclick="volver()">${t.btn_back}</button>
  </div>
  <script>
    var T = ${JSON.stringify(t)};
    var GROUPS=${JSON.stringify(GROUP_TEAMS)};
    var FLAGS=${JSON.stringify(FLAGS_MAP)};
    var SAVED=${JSON.stringify(uBracket)};
    var PUEDE_EDITAR=${JSON.stringify(puedeEditar)};
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

      // Hidrata SF (los ganadores de semifinales = finalistas) derivando del podio.
      // El campeon SIEMPRE viene de una de las 2 semifinales; ubicamos cual mirando
      // sus contendientes. El subcampeon va a la otra SF.
      // Sin esto, al volver a abrir el bracket aparecia SEMIS 0/2 y PODIO bloqueado.
      if (SAVED.campeon && SAVED.subcampeon) {
        var sf101 = derived.sf.find(function(m){ return m.id === 101; });
        var sf102 = derived.sf.find(function(m){ return m.id === 102; });
        var c = SAVED.campeon, s = SAVED.subcampeon;
        if (sf101 && (sf101.home === c || sf101.away === c)) {
          state.winners.sf["101"] = c;
          if (sf102 && (sf102.home === s || sf102.away === s)) state.winners.sf["102"] = s;
        } else if (sf102 && (sf102.home === c || sf102.away === c)) {
          state.winners.sf["102"] = c;
          if (sf101 && (sf101.home === s || sf101.away === s)) state.winners.sf["101"] = s;
        }
        recompute();
      }
    }

    function thirdCount(){
      var total = 0;
      GROUP_ORDER.forEach(function(g){ if((state.groups[g] || []).length > 2) total++; });
      return total;
    }

    function toggleGroupTeam(group, team){
      if(!PUEDE_EDITAR) return;
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
      scheduleAutosave();
    }

    function toggleWinner(stage, matchId, team){
      if(!PUEDE_EDITAR) return;
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
      scheduleAutosave();
    }

    function pickFinalMatch(winKey, loseKey, t, other){
      if(!PUEDE_EDITAR) return;
      if(state.podium[winKey] === t){
        state.podium[winKey] = "";
        state.podium[loseKey] = "";
      }else{
        state.podium[winKey] = t;
        state.podium[loseKey] = other;
      }
      buildPanel(5);
      checkSaveButton();
      scheduleAutosave();
    }

    function renderMatchList(matches, stage, title){
      var selected = winnersCount(state.winners[stage]);
      var h = "<div class=\\"instr\\">" + title + "</div>";
      h += "<div class=\\"counter\\">" + selected + " <em>/ " + matches.length + "</em></div>";
      h += "<div class=\\"match-list\\">";
      matches.forEach(function(m){
        var winner = state.winners[stage][m.id] || "";
        var ready = !!(m.home && m.away);
        h += "<div class=\\"match-card\\"><div class=\\"match-head\\">" + T.match + " " + m.id + "</div><div class=\\"match-pick\\">";
        h += chip(m.home || T.pending, winner === m.home, !ready || !m.home, "toggleWinner(\\'" + stage + "\\'," + m.id + ",\\'" + (m.home || "") + "\\')", winner === m.home ? T.winner : "");
        h += chip(m.away || T.pending, winner === m.away, !ready || !m.away, "toggleWinner(\\'" + stage + "\\'," + m.id + ",\\'" + (m.away || "") + "\\')", winner === m.away ? T.winner : "");
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
        h += "<div class=\\"instr\\">" + T.instr_groups + "</div>";
        h += "<div class=\\"counter\\">" + T.counter_thirds + ": " + thirdCount() + " <em>/ 8</em></div>";
        h += "<div class=\\"group-wrap\\">";
        GROUP_ORDER.forEach(function(g){
          var picks = state.groups[g] || [];
          h += "<div class=\\"group-card\\"><div class=\\"group-title\\">" + T.group + " " + g + "</div><div class=\\"chip-grid\\">";
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
          h += nextShortcut(1, T.go_16vos);
        }
      } else if(idx === 1){
        if(!derived.placements.groupsReady){
          h += "<div class=\\"instr\\" style=\\"border-color:var(--mag)\\">" + T.instr_complete_groups + "</div>";
        } else {
          h += renderMatchList(derived.r32, "r32", T.instr_r32);
          if(winnersCount(state.winners.r32) === 16){
            h += nextShortcut(2, T.go_8vos);
          }
        }
      } else if(idx === 2){
        h += renderMatchList(derived.r16, "r16", T.instr_r16);
        if(winnersCount(state.winners.r16) === 8){
          h += nextShortcut(3, T.go_4tos);
        }
      } else if(idx === 3){
        h += renderMatchList(derived.qf, "qf", T.instr_qf);
        if(winnersCount(state.winners.qf) === 4){
          h += nextShortcut(4, T.go_semis);
        }
      } else if(idx === 4){
        h += renderMatchList(derived.sf, "sf", T.instr_sf);
        if(winnersCount(state.winners.sf) === 2){
          h += nextShortcut(5, T.go_podio);
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

        h += "<div class=\\"instr\\">" + T.instr_podio + "</div>";
        if(finalists.length < 2 || thirdFinal.length < 2){
          h += "<div class=\\"instr\\" style=\\"border-color:var(--mag)\\">" + T.instr_complete_semis + "</div>";
        } else {
          function matchFinal(label, winKey, loseKey, pool, winLabel, loseLabel){
            var html = "<div class=\\"podio-section\\"><div class=\\"podio-label\\">" + label + "</div><div class=\\"podio-chips\\">";
            var winner = state.podium[winKey];
            var loser = state.podium[loseKey];
            pool.forEach(function(t){
              var isWin = winner === t;
              var isLose = loser === t;
              var sel = isWin || isLose;
              var badge = isWin ? winLabel : (isLose ? loseLabel : "");
              var other = pool[0] === t ? pool[1] : pool[0];
              html += chip(t, sel, false, "pickFinalMatch(\\'" + winKey + "\\',\\'" + loseKey + "\\',\\'" + t + "\\',\\'" + other + "\\')", badge);
            });
            html += "</div></div>";
            return html;
          }
          h += matchFinal(T.final_match, "campeon", "sub", finalists, T.champion, T.second_place);
          h += matchFinal(T.third_match, "tercero", "cuarto", thirdFinal, T.third_place, T.fourth_place);
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

    function currentUid(){
      return new URLSearchParams(window.location.search).get("user_id") || "GUEST";
    }

    // Arma el payload del bracket actual (parcial o completo) con el mismo
    // formato que entiende el servidor y initFromSaved().
    function buildPayload(){
      return {
        dieciseisavos: derived.placements.legacyD16,
        octavos: orderedWinners([73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88], state.winners.r32),
        cuartos: orderedWinners([89,90,91,92,93,94,95,96], state.winners.r16),
        semis: orderedWinners([97,98,99,100], state.winners.qf),
        campeon: state.podium.campeon,
        subcampeon: state.podium.sub,
        tercer_lugar: state.podium.tercero,
        cuarto_lugar: state.podium.cuarto
      };
    }

    // Guarda el progreso en este dispositivo (sobrevive cerrar/volver sin red).
    function saveLocal(payload){
      try { localStorage.setItem("jelou_bracket_" + currentUid(), JSON.stringify(payload)); } catch(e){}
    }

    // POST del bracket al servidor, sin toast ni redirect (autoguardado silencioso).
    function postBracket(payload, useKeepalive){
      return fetch("/api/clasificatorias?user_id=" + currentUid(), {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(payload),
        keepalive: !!useKeepalive
      });
    }

    var autosaveTimer = null;

    // Autoguardado tras cada cambio: local inmediato + servidor con debounce.
    function scheduleAutosave(){
      if(!PUEDE_EDITAR) return;
      var payload = buildPayload();
      saveLocal(payload);
      if(currentUid() === "GUEST") return;
      if(autosaveTimer) clearTimeout(autosaveTimer);
      autosaveTimer = setTimeout(function(){
        autosaveTimer = null;
        postBracket(payload, false).catch(function(){});
      }, 900);
    }

    // Fuerza un guardado inmediato (al salir / ocultar / cerrar la webview).
    function flushAutosave(){
      if(!PUEDE_EDITAR) return;
      var payload = buildPayload();
      saveLocal(payload);
      if(currentUid() === "GUEST") return;
      if(autosaveTimer){ clearTimeout(autosaveTimer); autosaveTimer = null; }
      try { postBracket(payload, true); } catch(e){}
    }

    function hasServerData(){
      if(!SAVED) return false;
      if(Array.isArray(SAVED.dieciseisavos) && SAVED.dieciseisavos.length) return true;
      if(Array.isArray(SAVED.octavos) && SAVED.octavos.length) return true;
      if(SAVED.campeon) return true;
      return false;
    }

    // El servidor manda; si no hay nada guardado en el server, recupera lo que
    // quedo en este dispositivo (autosave local) para no perder el progreso.
    function resolveSavedSource(){
      if(hasServerData()) return SAVED;
      try {
        var ls = localStorage.getItem("jelou_bracket_" + currentUid());
        if(ls){
          var parsed = JSON.parse(ls);
          if(parsed && typeof parsed === "object") return parsed;
        }
      } catch(e){}
      return SAVED;
    }

    function guardar(){
      if(!PUEDE_EDITAR){
        alert(T.alert_closed);
        return;
      }
      var btn = document.getElementById("btnSave");
      btn.innerText = T.btn_save_loading;
      var payload = buildPayload();
      saveLocal(payload);
      var uid = new URLSearchParams(window.location.search).get("user_id") || "GUEST";
      var exId = new URLSearchParams(window.location.search).get("executionId") || "";
      fetch("/api/clasificatorias?user_id=" + uid, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(payload)
      })
      .then(function(r){
        if(r.status === 403){
          alert(T.alert_closed);
          return;
        }
        if(r.ok){
          document.getElementById("toast").classList.add("show");
          callbackSent = true;
          var cbBody = { executionId: exId, success: true, data: { action: "save_clasificados", summary: bracketSummaryForCallback(payload) } };
          fetch("https://workflows.jelou.ai/v1/webview/callback", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(cbBody)
          }).finally(function(){ setTimeout(function(){ window.location.href = "https://wa.me/593983456638"; }, 1500); });
        }else{
          alert(T.alert_error_save);
        }
      })
      .catch(function(){ alert(T.alert_net_error); })
      .finally(function(){ btn.innerText = T.btn_save; });
    }

    function volver(){
      if(callbackSent) return;
      callbackSent = true;
      flushAutosave();
      var exId = new URLSearchParams(window.location.search).get("executionId") || SERVER_EXECUTION_ID || "";
      fetch("https://workflows.jelou.ai/v1/webview/callback", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ executionId: exId, success: true, data: { action: "volver" } })
      }).finally(function(){ window.location.href = "https://wa.me/593983456638"; });
    }

    document.addEventListener("visibilitychange", function(){
      if(document.visibilityState !== "hidden") return;
      flushAutosave();
      if(callbackSent) return;
      callbackSent = true;
      var exId = new URLSearchParams(window.location.search).get("executionId") || SERVER_EXECUTION_ID || "";
      fetch("https://workflows.jelou.ai/v1/webview/callback", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ executionId: exId, success: true, data: { action: "volver" } }),
        keepalive:true
      });
    });
    window.addEventListener("pagehide", function(){ flushAutosave(); });

    window.toggleGroupTeam = toggleGroupTeam;
    window.toggleWinner = toggleWinner;
    window.pickFinalMatch = pickFinalMatch;
    window.showPhase = showPhase;
    window.guardar = guardar;
    window.volver = volver;

    SAVED = resolveSavedSource();
    initFromSaved();
    rerender();
  </script>
</body>
</html>`;

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
