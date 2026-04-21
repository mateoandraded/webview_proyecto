import { hasPairOfDatumScores, parseDatumScore } from '../lib/datumScore.js';
import { getRequestUrl } from '../lib/requestUrl.js';

export const config = {
  runtime: 'edge',
};

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;

const JELOU_ESTADO_TORNEO_URL = 'https://torneo-libertadores.fn.jelou.ai/estado-torneo';
const FECHA_LIMITE_PRONOSTICOS = '2026-06-10';

function fallbackHoyYMD() {
  var parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  var y = parts.find(function (p) { return p.type === 'year'; }).value;
  var mo = parts.find(function (p) { return p.type === 'month'; }).value;
  var d = parts.find(function (p) { return p.type === 'day'; }).value;
  return y + '-' + mo + '-' + d;
}

async function fetchFechaTorneoDesdeJelou() {
  try {
    var ctrl = new AbortController();
    var tid = setTimeout(function () { ctrl.abort(); }, 5000);
    var res = await fetch(JELOU_ESTADO_TORNEO_URL, {
      method: 'GET',
      signal: ctrl.signal,
      headers: { Accept: 'application/json' }
    });
    clearTimeout(tid);
    if (!res.ok) return fallbackHoyYMD();
    var data = await res.json();
    var f = data && data.fecha_simulada_hoy;
    if (typeof f === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(f.trim())) return f.trim();
  } catch (e) { /* timeout / red */ }
  return fallbackHoyYMD();
}

function predictionComplete(up) {
  if (!up) return false;
  return hasPairOfDatumScores(up.pronostico_local, up.pronostico_visitante);
}

const FLAGS = {
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
function flag(n) { return FLAGS[(n || '').toUpperCase()] || '\uD83C\uDFF3\uFE0F'; }

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
  const url = getRequestUrl(req);
  const userId = url.searchParams.get('user_id') || 'GUEST';

  if (req.method === 'POST') {
    try {
      const fechaServidor = await fetchFechaTorneoDesdeJelou();
      if (fechaServidor > FECHA_LIMITE_PRONOSTICOS) {
        return new Response(JSON.stringify({ error: 'Pronósticos cerrados' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
      }
      const body = await req.json();
      let existingItems = [];
      try {
        const existingReq = await fetchDatum('pbc_1944158292', 'GET', null, '', "&filter=(user_id='" + userId + "')");
        existingItems = existingReq.items || existingReq;
      } catch (e) { existingItems = []; }

      for (const p of body) {
        if (p.locked) continue;
        const found = existingItems.find(function (e) { return e.match_id === p.match_id; });
        const recordId = found ? found.id : null;
        const payload = {
          user_id: userId, match_id: p.match_id, equipo_local: p.equipo_local,
          equipo_visitante: p.equipo_visitante, pronostico_local: p.local_score,
          pronostico_visitante: p.visitor_score, fecha_partido: p.fecha,
          estado: 'PENDIENTE', resultado_real_local: 0, resultado_real_visitante: 0, puntos_ganados: 0
        };
        if (recordId) { await fetchDatum('pbc_1944158292', 'PATCH', payload, recordId, ''); }
        else { try { await fetchDatum('pbc_1944158292', 'POST', payload, '', ''); } catch (e) { } }
      }
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  const [fechaServidor, dataMatches, dataPreds] = await Promise.all([
    fetchFechaTorneoDesdeJelou(),
    fetchDatum('pbc_631836067', 'GET', null, '', '').catch(function () { return { items: [] }; }),
    userId !== 'GUEST'
      ? fetchDatum('pbc_1944158292', 'GET', null, '', "&filter=(user_id='" + userId + "')").catch(function () { return { items: [] }; })
      : Promise.resolve({ items: [] })
  ]);
  const rawMatches = Array.isArray(dataMatches) ? dataMatches : (dataMatches.items || []);
  const userPredictions = Array.isArray(dataPreds) ? dataPreds : (dataPreds.items || []);
  const puedeEditarPronosticos = fechaServidor <= FECHA_LIMITE_PRONOSTICOS;

  const groups = {};
  rawMatches.forEach(function (m) {
    const g = m.Fase_o_Grupo || "X";
    if (g.length > 1) return;
    if (!groups[g]) groups[g] = [];
    const up = userPredictions.find(function (pr) { return pr.match_id === m.id_partido; });
    const partidoFinalizado = hasPairOfDatumScores(m.resulltado_local, m.resultado_visitante);
    const rl = parseDatumScore(m.resulltado_local);
    const rv = parseDatumScore(m.resultado_visitante);
    groups[g].push({
      id: m.id_partido, local: m.equipo_local, visitante: m.equipo_visitante,
      fecha: m.fecha,
      partidoFinalizado: partidoFinalizado,
      realDispL: partidoFinalizado ? String(rl) : '-',
      realDispV: partidoFinalizado ? String(rv) : '-',
      pred_l: up ? up.pronostico_local : null, pred_v: up ? up.pronostico_visitante : null,
      locked: !puedeEditarPronosticos
    });
  });
  const groupKeys = Object.keys(groups).sort();

  let groupsHtml = '';
  groupKeys.forEach(function (gk) {
    const list = groups[gk];
    const total = list.length;
    var hechos = 0;
    list.forEach(function (m) {
      const up = userPredictions.find(function (pr) { return pr.match_id === m.id; });
      if (predictionComplete(up)) hechos++;
    });
    const pct = total > 0 ? Math.round((hechos / total) * 100) : 0;
    const pctHtml = "<span class='group-pct'>" + pct + "%</span>";

    let matchHtml = '';
    list.forEach(function (m) {
      const up = userPredictions.find(function (pr) { return pr.match_id === m.id; });
      var valL = '', valV = '';
      if (m.pred_l !== null && m.pred_l !== undefined && String(m.pred_l) !== '') {
        var pln = parseDatumScore(m.pred_l);
        if (pln !== null) valL = String(pln);
      }
      if (m.pred_v !== null && m.pred_v !== undefined && String(m.pred_v) !== '') {
        var pvn = parseDatumScore(m.pred_v);
        if (pvn !== null) valV = String(pvn);
      }

      const lockClass = m.locked ? 'locked' : '';
      const lockData = m.locked ? "data-locked='true'" : '';
      const statusBadge = m.partidoFinalizado
        ? "<span class='lock-badge'>FIN</span>"
        : "<span class='pending-badge'>PENDIENTE</span>";

      var predSubline = '';
      if (m.locked) {
        if (predictionComplete(up)) {
          predSubline = "<div class='pred-subline'>Tu pron\u00F3stico: " + parseDatumScore(m.pred_l) + " \u2013 " + parseDatumScore(m.pred_v) + '</div>';
        } else {
          predSubline = "<div class='pred-subline'>Tu pron\u00F3stico: \u2014</div>";
        }
      }

      var predRowHtml = '';
      if (!m.locked) {
        predRowHtml =
          "<div class='pred-row'>" +
          "<div class='score-block " + lockClass + "'>" +
          "<button type='button' class='btn-step step-up' onclick='step(this,1)'>\u25B2</button>" +
          "<input type='number' class='input-score input-local' value='" + valL + "' readonly placeholder='-'>" +
          "<button type='button' class='btn-step step-down' onclick='step(this,-1)'>\u25BC</button>" +
          "</div>" +
          "<div class='vs'>x</div>" +
          "<div class='score-block " + lockClass + "'>" +
          "<button type='button' class='btn-step step-up' onclick='step(this,1)'>\u25B2</button>" +
          "<input type='number' class='input-score input-visitor' value='" + valV + "' readonly placeholder='-'>" +
          "<button type='button' class='btn-step step-down' onclick='step(this,-1)'>\u25BC</button>" +
          "</div>" +
          "</div>";
      }

      matchHtml +=
        "<div class='match-row' " + lockData + " data-id='" + m.id + "' data-f='" + m.fecha + "' data-l='" + m.local + "' data-v='" + m.visitante + "'>" +
        "<div class='match-meta'><span>" + m.fecha + "</span> " + statusBadge + "</div>" +
        "<div class='match-body'>" +
        "<div class='team-side'>" +
        "<div class='t-flag'>" + flag(m.local) + "</div>" +
        "<div class='t-name'>" + m.local + "</div>" +
        "</div>" +
        "<div class='match-center'>" +
        "<div class='real-line'>" +
        "<span class='real-num'>" + m.realDispL + "</span>" +
        "<span class='real-x'>x</span>" +
        "<span class='real-num'>" + m.realDispV + "</span>" +
        "</div>" +
        predRowHtml +
        predSubline +
        "</div>" +
        "<div class='team-side right'>" +
        "<div class='t-flag'>" + flag(m.visitante) + "</div>" +
        "<div class='t-name'>" + m.visitante + "</div>" +
        "</div>" +
        "</div>" +
        "</div>";
    });

    groupsHtml +=
      "<div class='group-block'>" +
      "<div class='group-header' onclick=\"this.parentElement.classList.toggle('open')\">" +
      "<span class='group-title'>GRUPO " + gk + '</span>' + pctHtml +
      "</div>" +
      "<div class='group-content'>" + matchHtml + "</div>" +
      "</div>";
  });

  const css = `
    :root{--black:#000;--white:#fff;--lime:#C9FF24;--magenta:#FF0055;--teal:#00FFCC;--purple:#6200EA;--dim:#1F1F1F;--pending:#1a6b3a}
    *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
    body{background:var(--black);color:var(--white);font-family:'Inter',sans-serif;padding-bottom:90px}
    body.read-only-mode .btn-save{display:none}
    .app-container{max-width:450px;margin:auto;padding:0 16px}
    .header-box{margin:40px 0 30px;border-bottom:4px solid var(--white);padding-bottom:10px}
    .badge-26{background:var(--teal);color:var(--black);font-weight:900;font-size:14px;padding:4px 8px;margin-bottom:12px;display:inline-block}
    h1{font-family:'Archivo Black',sans-serif;font-size:40px;line-height:.9;letter-spacing:-2px}
    .group-block{border:2px solid var(--white);margin-bottom:16px;background:var(--black)}
    .group-header{font-family:'Archivo Black';font-size:28px;padding:16px 56px 16px 16px;background:var(--white);color:var(--black);cursor:pointer;position:relative;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
    .group-title{flex:1;min-width:0}
    .group-pct{font-family:'Inter',sans-serif;font-size:14px;font-weight:800;color:rgba(0,0,0,.55);white-space:nowrap;margin-right:8px}
    .group-block.open .group-pct{color:rgba(255,255,255,.75)}
    .group-header::after{content:'+';position:absolute;right:16px;top:50%;transform:translateY(-50%);font-weight:900;font-size:32px}
    .group-block.open .group-header{background:var(--magenta);color:var(--white)}
    .group-block.open .group-header::after{content:'-'}
    .group-content{display:none;padding:0}
    .group-block.open .group-content{display:block}
    .match-row{border-top:2px solid var(--white);padding:16px 12px}
    .match-meta{font-size:10px;font-weight:800;color:rgba(255,255,255,.6);display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;letter-spacing:1px}
    .lock-badge{background:var(--purple);color:var(--white);padding:2px 6px;font-size:9px}
    .pending-badge{background:var(--pending);color:var(--white);padding:2px 6px;font-size:9px;font-weight:800}
    .match-body{display:flex;align-items:flex-start;justify-content:space-between;gap:6px}
    .match-center{display:flex;flex-direction:column;align-items:center;gap:8px;flex:0 0 auto;min-width:100px;max-width:140px}
    .real-line{display:flex;align-items:center;justify-content:center;gap:6px;font-family:'Archivo Black',sans-serif;font-size:20px;color:var(--white);padding-top:4px}
    .real-num{min-width:1.2em;text-align:center}
    .real-x{font-size:14px;opacity:.35;margin:0 2px}
    .pred-row{display:flex;align-items:flex-start;justify-content:center;gap:4px}
    .pred-subline{font-size:10px;font-weight:600;color:rgba(255,255,255,.45);text-align:center;width:100%;margin-top:2px;line-height:1.3}
    .team-side{flex:1;display:flex;flex-direction:column;align-items:flex-start;min-width:0;overflow:hidden;padding-top:2px}
    .team-side.right{align-items:flex-end}
    .t-flag{font-size:28px;line-height:1}
    .t-name{font-weight:900;font-size:10px;text-transform:uppercase;white-space:nowrap;max-width:100%;text-overflow:ellipsis;overflow:hidden}
    .score-block{display:flex;flex-direction:column;align-items:center;gap:2px;background:var(--dim);padding:4px;border:1px solid rgba(255,255,255,.1);border-radius:4px}
    .btn-step{width:34px;height:24px;background:rgba(255,255,255,0.05);color:var(--white);border:none;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.1s}
    .btn-step:active{background:var(--lime);color:var(--black)}
    .step-up{border-radius:4px 4px 0 0}
    .step-down{border-radius:0 0 4px 4px}
    .input-score{width:34px;height:34px;background:transparent;border:none;color:var(--lime);font-size:24px;font-family:'Archivo Black';text-align:center;line-height:34px}
    .score-block.locked{border-color:transparent;background:transparent}
    .score-block.locked .btn-step{display:none}
    .score-block.locked .input-score{color:var(--white)}
    .pred-row .vs{font-family:'Archivo Black';font-size:14px;opacity:.3;padding:0 4px;margin-top:22px}
    .bottom-bar{position:fixed;bottom:0;left:0;width:100%;background:var(--black);padding:16px;border-top:4px solid var(--lime);z-index:50;display:flex;flex-direction:column;gap:10px}
    .btn-save{width:100%;max-width:450px;margin:0 auto;display:block;background:var(--lime);color:var(--black);border:none;padding:16px;font-family:'Archivo Black';font-size:18px;cursor:pointer;letter-spacing:1px}
    .btn-save:active{background:var(--white)}
    .btn-volver{width:100%;max-width:450px;margin:0 auto;display:block;background:var(--white);color:var(--black);border:none;padding:12px;font-family:'Archivo Black';font-size:14px;cursor:pointer;text-align:center;letter-spacing:1px}
    .btn-volver:active{background:var(--teal)}
    .toast{position:fixed;top:16px;left:50%;transform:translateX(-50%) translateY(-100px);background:var(--white);color:var(--black);padding:12px 24px;font-family:'Archivo Black';font-size:14px;z-index:100;transition:.3s;border:4px solid var(--black)}
    .toast.show{transform:translateX(-50%) translateY(0)}
  `;

  const bodyClass = puedeEditarPronosticos ? '' : ' class="read-only-mode"';

  const jsCode =
    'var callbackSent=false;' +
    'document.addEventListener("visibilitychange",function(){' +
    'if(document.visibilityState==="hidden"&&!callbackSent){' +
    'callbackSent=true;' +
    'var exId=new URLSearchParams(window.location.search).get("executionId")||"";' +
    'fetch("https://workflows.jelou.ai/v1/webview/callback",{method:"POST",headers:{"Content-Type":"application/json"},' +
    'body:JSON.stringify({executionId:exId,success:true,data:{action:"volver"}}),keepalive:true});' +
    '}});' +
    'function step(btn,amount){var input=btn.parentElement.querySelector("input");var val=parseInt(input.value);if(isNaN(val))val=0;val+=amount;if(val<0)val=0;if(val>20)val=20;input.value=val;}' +
    'function save(){' +
    'var btn=document.getElementById("btnSave");if(!btn)return;btn.innerHTML="GUARDANDO...";' +
    'var payload=[];' +
    'document.querySelectorAll(".match-row").forEach(function(row){' +
    'if(row.getAttribute("data-locked")==="true")return;' +
    'var il=row.querySelector(".input-local");var iv=row.querySelector(".input-visitor");if(!il||!iv)return;' +
    'var valL=il.value;var valV=iv.value;' +
    'if(valL!==""&&valV!==""){payload.push({match_id:row.getAttribute("data-id"),equipo_local:row.getAttribute("data-l"),equipo_visitante:row.getAttribute("data-v"),fecha:row.getAttribute("data-f"),local_score:parseInt(valL),visitor_score:parseInt(valV),locked:false});}' +
    '});' +
    'if(payload.length===0){btn.innerHTML="GUARDAR TODO";return;}' +
    'var userId=new URLSearchParams(window.location.search).get("user_id")||"GUEST";' +
    'var exId=new URLSearchParams(window.location.search).get("executionId")||"";' +
    'fetch("/api/grupos?user_id="+userId,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)})' +
    '.then(function(res){' +
    '  if(res.status===403){alert("Los pron\\u00F3sticos ya est\\u00E1n cerrados.");return;}' +
    '  if(res.ok){' +
    '    var t=document.getElementById("toast");t.classList.add("show");' +
    '    var cbBody={executionId:exId,success:true,data:{action:"save_pronosticos",summary:payload}};' +
    '    fetch("https://workflows.jelou.ai/v1/webview/callback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(cbBody)})' +
    '    .finally(function(){ setTimeout(function(){window.location.href="https://wa.me/13239183195";},1500); });' +
    '  }else{alert("Error al guardar.");}' +
    '})' +
    '.catch(function(){alert("Error de red.");})' +
    '.finally(function(){btn.innerHTML="GUARDAR TODO";});' +
    '}' +
    'window.volver=function(){' +
    '  if(callbackSent)return;' +
    '  callbackSent=true;' +
    '  var exId=new URLSearchParams(window.location.search).get("executionId")||"";' +
    '  var cbBody={executionId:exId,success:true,data:{action:"volver"}}; ' +
    '  fetch("https://workflows.jelou.ai/v1/webview/callback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(cbBody)})' +
    '    .finally(function(){ window.location.href="https://wa.me/13239183195"; });' +
    '};';

  const html = '<!DOCTYPE html><html lang="es"><head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">' +
    '<title>Grupos - World Cup 26</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">' +
    '<style>' + css + '</style>' +
    '</head><body' + bodyClass + '>' +
    '<div class="toast" id="toast">\u00A1GUARDADO!</div>' +
    '<div class="app-container">' +
    '<div class="header-box"><div class="badge-26">FASE DE GRUPOS</div><h1>MIS<br>PRON\u00D3STICOS</h1></div>' +
    '<div>' + groupsHtml + '</div>' +
    '</div>' +
    '<div class="bottom-bar">' +
    '  <button class="btn-save" id="btnSave" onclick="save()">GUARDAR TODO</button>' +
    '  <button class="btn-volver" onclick="volver()">VOLVER</button>' +
    '</div>' +
    '<script>' + jsCode + '<\/script>' +
    '</body></html>';

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
