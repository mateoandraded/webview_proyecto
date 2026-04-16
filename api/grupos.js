export const config = {
  runtime: 'edge',
};

const API_KEY = "db_HQIwDXV9xkJTEU5F3wwYAGhHAGInsItCu79g5FSz6e3106ee";
const BASE_URL = "https://mateoacademy-9djnmu.jelou.cloud/api/collections";

const FLAGS = { "MEXICO": "\uD83C\uDDF2\uD83C\uDDFD", "ESTADOS UNIDOS": "\uD83C\uDDFA\uD83C\uDDF8", "CANADA": "\uD83C\uDDE8\uD83C\uDDE6", "BRASIL": "\uD83C\uDDE7\uD83C\uDDF7", "ARGENTINA": "\uD83C\uDDE6\uD83C\uDDF7", "ECUADOR": "\uD83C\uDDEA\uD83C\uDDE8", "COLOMBIA": "\uD83C\uDDE8\uD83C\uDDF4", "PERU": "\uD83C\uDDF5\uD83C\uDDEA", "CHILE": "\uD83C\uDDE8\uD83C\uDDF1", "URUGUAY": "\uD83C\uDDFA\uD83C\uDDFE", "PARAGUAY": "\uD83C\uDDF5\uD83C\uDDFE", "BOLIVIA": "\uD83C\uDDE7\uD83C\uDDF4", "VENEZUELA": "\uD83C\uDDFB\uD83C\uDDEA", "ALEMANIA": "\uD83C\uDDE9\uD83C\uDDEA", "ESPANA": "\uD83C\uDDEA\uD83C\uDDF8", "ESPAÑA": "\uD83C\uDDEA\uD83C\uDDF8", "FRANCIA": "\uD83C\uDDEB\uD83C\uDDF7", "ITALIA": "\uD83C\uDDEE\uD83C\uDDF9", "PORTUGAL": "\uD83C\uDDF5\uD83C\uDDF9", "PAISES BAJOS": "\uD83C\uDDF3\uD83C\uDDF1", "BELGICA": "\uD83C\uDDE7\uD83C\uDDEA", "CROACIA": "\uD83C\uDDED\uD83C\uDDF7", "SERBIA": "\uD83C\uDDF7\uD83C\uDDF8", "SUIZA": "\uD83C\uDDE8\uD83C\uDDED", "DINAMARCA": "\uD83C\uDDE9\uD83C\uDDF0", "AUSTRIA": "\uD83C\uDDE6\uD83C\uDDF9", "UCRANIA": "\uD83C\uDDFA\uD83C\uDDE6", "TURQUIA": "\uD83C\uDDF9\uD83C\uDDF7", "HUNGRIA": "\uD83C\uDDED\uD83C\uDDFA", "REPUBLICA CHECA": "\uD83C\uDDE8\uD83C\uDDFF", "GRECIA": "\uD83C\uDDEC\uD83C\uDDF7", "JAPON": "\uD83C\uDDEF\uD83C\uDDF5", "REPUBLICA DE COREA": "\uD83C\uDDF0\uD83C\uDDF7", "COREA DEL SUR": "\uD83C\uDDF0\uD83C\uDDF7", "AUSTRALIA": "\uD83C\uDDE6\uD83C\uDDFA", "IRAN": "\uD83C\uDDEE\uD83C\uDDF7", "ARABIA SAUDITA": "\uD83C\uDDF8\uD83C\uDDE6", "QATAR": "\uD83C\uDDF6\uD83C\uDDE6", "MARRUECOS": "\uD83C\uDDF2\uD83C\uDDE6", "SENEGAL": "\uD83C\uDDF8\uD83C\uDDF3", "GHANA": "\uD83C\uDDEC\uD83C\uDDED", "CAMERUN": "\uD83C\uDDE8\uD83C\uDDF2", "NIGERIA": "\uD83C\uDDF3\uD83C\uDDEC", "TUNEZ": "\uD83C\uDDF9\uD83C\uDDF3", "SUDAFRICA": "\uD83C\uDDFF\uD83C\uDDE6", "EGIPTO": "\uD83C\uDDEA\uD83C\uDDEC", "COSTA RICA": "\uD83C\uDDE8\uD83C\uDDF7", "PANAMA": "\uD83C\uDDF5\uD83C\uDDE6", "HONDURAS": "\uD83C\uDDED\uD83C\uDDF3", "JAMAICA": "\uD83C\uDDEF\uD83C\uDDF2", "INDONESIA": "\uD83C\uDDEE\uD83C\uDDE9", "NUEVA ZELANDA": "\uD83C\uDDF3\uD83C\uDDFF", "GALES": "\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73\uDB40\uDC7F", "ESCOCIA": "\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74\uDB40\uDC7F", "INGLATERRA": "\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67\uDB40\uDC7F", "POLONIA": "\uD83C\uDDF5\uD83C\uDDF1", "RUMANIA": "\uD83C\uDDF7\uD83C\uDDF4", "ESLOVENIA": "\uD83C\uDDF8\uD83C\uDDEE", "ESLOVAQUIA": "\uD83C\uDDF8\uD83C\uDDF0", "ALBANIA": "\uD83C\uDDE6\uD83C\uDDF1", "ARGELIA": "\uD83C\uDDE9\uD83C\uDDFF", "COSTA DE MARFIL": "\uD83C\uDDE8\uD83C\uDDEE", "NORUEGA": "\uD83C\uDDF3\uD83C\uDDF4", "SUECIA": "\uD83C\uDDF8\uD83C\uDDEA", "IRLANDA": "\uD83C\uDDEE\uD83C\uDDEA", "TRINIDAD Y TOBAGO": "\uD83C\uDDF9\uD83C\uDDF9", "EL SALVADOR": "\uD83C\uDDF8\uD83C\uDDFB", "GUATEMALA": "\uD83C\uDDEC\uD83C\uDDF9" };
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
  const url = new URL(req.url);
  const userId = url.searchParams.get('user_id') || 'GUEST';
  const executionId = url.searchParams.get('executionId') || '';

  if (req.method === 'POST') {
    try {
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

  let rawMatches = [];
  try {
    const dataMatches = await fetchDatum('pbc_631836067', 'GET', null, '', '');
    rawMatches = Array.isArray(dataMatches) ? dataMatches : (dataMatches.items || []);
  } catch (e) { rawMatches = []; }

  let userPredictions = [];
  if (userId !== 'GUEST') {
    try {
      const dataPreds = await fetchDatum('pbc_1944158292', 'GET', null, '', "&filter=(user_id='" + userId + "')");
      userPredictions = Array.isArray(dataPreds) ? dataPreds : (dataPreds.items || []);
    } catch (e) { }
  }

  const FECHA_CORTE = "2026-06-11";
  const hoy = new Date().toISOString().split('T')[0];
  const isFrozenGlobal = hoy >= FECHA_CORTE;

  const groups = {};
  rawMatches.forEach(function (m) {
    const g = m.Fase_o_Grupo || "X";
    if (g.length > 1) return;
    if (!groups[g]) groups[g] = [];
    const up = userPredictions.find(function (pr) { return pr.match_id === m.id_partido; });
    const hasRealResult = m.resulltado_local !== null && m.resulltado_local !== undefined &&
      m.resultado_visitante !== null && m.resultado_visitante !== undefined;
    const hasPrediction = !!(up && up.pronostico_local !== null && up.pronostico_local !== undefined &&
      up.pronostico_visitante !== null && up.pronostico_visitante !== undefined);

    const displayLocal = hasRealResult ? m.resulltado_local : (hasPrediction ? up.pronostico_local : "");
    const displayVisitante = hasRealResult ? m.resultado_visitante : (hasPrediction ? up.pronostico_visitante : "");

    groups[g].push({
      id: m.id_partido, local: m.equipo_local, visitante: m.equipo_visitante,
      fecha: m.fecha, real_l: m.resulltado_local, real_v: m.resultado_visitante,
      pred_l: up ? up.pronostico_local : null, pred_v: up ? up.pronostico_visitante : null,
      display_l: displayLocal, display_v: displayVisitante,
      hasReal: hasRealResult, hasPred: hasPrediction,
      locked: isFrozenGlobal
    });
  });
  const groupKeys = Object.keys(groups).sort();

  let groupsHtml = '';
  groupKeys.forEach(function (gk) {
    const totalMatches = groups[gk].length;
    const predictedMatches = groups[gk].filter(function (m) { return m.hasPred; }).length;
    const progressPct = totalMatches > 0 ? Math.round((predictedMatches / totalMatches) * 100) : 0;
    let matchHtml = '';
    groups[gk].forEach(function (m) {
      const valL = m.display_l;
      const valV = m.display_v;
      const lockClass = m.locked ? 'locked' : '';
      const lockData = m.locked ? "data-locked='true'" : "";
      const st = m.locked ? ("<span class='lock-badge'>" + (m.hasReal ? "FINALIZADO" : "CONGELADO") + "</span>") : "";
      let subline = "";
      if (m.locked && m.hasPred) {
        subline = "<div class='pred-note'>PRONÓSTICO: " + m.pred_l + " - " + m.pred_v + "</div>";
      }

      matchHtml +=
        "<div class='match-row' " + lockData + " data-id='" + m.id + "' data-f='" + m.fecha + "' data-l='" + m.local + "' data-v='" + m.visitante + "'>" +
        "<div class='match-meta'><span>" + m.fecha + "</span> " + st + "</div>" +
        "<div class='match-body'>" +
        "<div class='team-side'>" +
        "<div class='t-flag'>" + flag(m.local) + "</div>" +
        "<div class='t-name'>" + m.local + "</div>" +
        "</div>" +
        "<div class='score-block " + lockClass + "'>" +
        "<button type='button' class='btn-step step-up' onclick='step(this,1)'>▲</button>" +
        "<input type='number' class='input-score input-local' value='" + valL + "' readonly placeholder='-'>" +
        "<button type='button' class='btn-step step-down' onclick='step(this,-1)'>▼</button>" +
        "</div>" +
        "<div class='vs'>x</div>" +
        "<div class='score-block " + lockClass + "'>" +
        "<button type='button' class='btn-step step-up' onclick='step(this,1)'>▲</button>" +
        "<input type='number' class='input-score input-visitor' value='" + valV + "' readonly placeholder='-'>" +
        "<button type='button' class='btn-step step-down' onclick='step(this,-1)'>▼</button>" +
        "</div>" +
        "<div class='team-side right'>" +
        "<div class='t-flag'>" + flag(m.visitante) + "</div>" +
        "<div class='t-name'>" + m.visitante + "</div>" +
        "</div>" +
        "</div>" +
        subline +
        "</div>";
    });

    groupsHtml +=
      "<div class='group-block'>" +
      "<div class='group-header' onclick=\"this.parentElement.classList.toggle('open')\"><span class='gh-title'>GRUPO " + gk + "</span><span class='gh-progress'>" + progressPct + "%</span></div>" +
      "<div class='group-content'>" + matchHtml + "</div>" +
      "</div>";
  });

  const css = `
    :root{--black:#000;--white:#fff;--lime:#C9FF24;--magenta:#FF0055;--teal:#00FFCC;--purple:#6200EA;--dim:#1F1F1F}
    *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
    body{background:var(--black);color:var(--white);font-family:'Inter',sans-serif;padding-bottom:90px}
    .app-container{max-width:450px;margin:auto;padding:0 16px}
    .header-box{margin:40px 0 30px;border-bottom:4px solid var(--white);padding-bottom:10px}
    .badge-26{background:var(--teal);color:var(--black);font-weight:900;font-size:14px;padding:4px 8px;margin-bottom:12px;display:inline-block}
    h1{font-family:'Archivo Black',sans-serif;font-size:40px;line-height:.9;letter-spacing:-2px}
    .group-block{border:2px solid var(--white);margin-bottom:16px;background:var(--black)}
    .group-header{font-family:'Archivo Black';font-size:28px;padding:16px;padding-right:56px;background:var(--white);color:var(--black);cursor:pointer;position:relative;display:flex;align-items:center;justify-content:space-between;gap:8px}
    .group-header::after{content:'+';position:absolute;right:16px;top:50%;transform:translateY(-50%);font-weight:900;font-size:32px}
    .gh-title{line-height:1}
    .gh-progress{font-family:'Archivo Black';font-size:16px;line-height:1;background:var(--black);color:var(--white);padding:4px 8px;letter-spacing:0}
    .group-block.open .group-header{background:var(--magenta);color:var(--white)}
    .group-block.open .group-header::after{content:'-'}
    .group-content{display:none;padding:0}
    .group-block.open .group-content{display:block}
    .match-row{border-top:2px solid var(--white);padding:16px 12px}
    .match-meta{font-size:10px;font-weight:800;color:rgba(255,255,255,.6);display:flex;justify-content:space-between;margin-bottom:12px;letter-spacing:1px}
    .lock-badge{background:var(--purple);color:var(--white);padding:2px 6px;font-size:9px}
    .pred-note{margin-top:8px;font-size:10px;color:rgba(255,255,255,.55);font-weight:700;letter-spacing:.4px}
    .match-body{display:flex;align-items:center;justify-content:space-between;gap:4px}
    .team-side{flex:1;display:flex;flex-direction:column;align-items:flex-start;min-width:0;overflow:hidden}
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
    .vs{font-family:'Archivo Black';font-size:16px;opacity:.3;padding:0 8px;margin-top:28px}
    .bottom-bar{position:fixed;bottom:0;left:0;width:100%;background:var(--black);padding:16px;border-top:4px solid var(--lime);z-index:50;display:flex;flex-direction:column;gap:10px}
    .btn-save{width:100%;max-width:450px;margin:0 auto;display:block;background:var(--lime);color:var(--black);border:none;padding:16px;font-family:'Archivo Black';font-size:18px;cursor:pointer;letter-spacing:1px}
    .btn-save:active{background:var(--white)}
    .btn-volver{width:100%;max-width:450px;margin:0 auto;display:block;background:var(--white);color:var(--black);border:none;padding:12px;font-family:'Archivo Black';font-size:14px;cursor:pointer;text-align:center;letter-spacing:1px}
    .btn-volver:active{background:var(--teal)}
    .toast{position:fixed;top:16px;left:50%;transform:translateX(-50%) translateY(-100px);background:var(--white);color:var(--black);padding:12px 24px;font-family:'Archivo Black';font-size:14px;z-index:100;transition:.3s;border:4px solid var(--black)}
    .toast.show{transform:translateX(-50%) translateY(0)}
  `;

  const jsCode =
    'var IS_FROZEN_GLOBAL=' + (isFrozenGlobal ? 'true' : 'false') + ';' +
    'let callbackSent=false;' +
    'document.addEventListener("visibilitychange",function(){' +
    'if(document.visibilityState==="hidden"&&!callbackSent){' +
    'callbackSent=true;' +
    'var exId=new URLSearchParams(window.location.search).get("executionId")||' + JSON.stringify(executionId) + ';' +
    'var cbBody={executionId:exId,success:true,data:{action:"volver"}};' +
    'fetch("https://workflows.jelou.ai/v1/webview/callback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(cbBody),keepalive:true});' +
    '}' +
    '});' +
    'function step(btn,amount){var input=btn.parentElement.querySelector("input");var val=parseInt(input.value);if(isNaN(val))val=0;val+=amount;if(val<0)val=0;if(val>20)val=20;input.value=val;}' +
    'function save(){' +
    'var btn=document.getElementById("btnSave");btn.innerHTML="GUARDANDO...";' +
    'if(IS_FROZEN_GLOBAL){btn.innerHTML="CONGELADO";setTimeout(function(){btn.innerHTML="GUARDAR TODO";},900);return;}' +
    'var payload=[];' +
    'document.querySelectorAll(".match-row").forEach(function(row){' +
    'if(row.getAttribute("data-locked")==="true")return;' +
    'var valL=row.querySelector(".input-local").value;' +
    'var valV=row.querySelector(".input-visitor").value;' +
    'if(valL!==""&&valV!==""){payload.push({match_id:row.getAttribute("data-id"),equipo_local:row.getAttribute("data-l"),equipo_visitante:row.getAttribute("data-v"),fecha:row.getAttribute("data-f"),local_score:parseInt(valL),visitor_score:parseInt(valV),locked:false});}' +
    '});' +
    'if(payload.length===0){btn.innerHTML="GUARDAR TODO";return;}' +
    'var userId=new URLSearchParams(window.location.search).get("user_id")||"GUEST";' +
    'var exId=new URLSearchParams(window.location.search).get("executionId")||"";' +
    'fetch("/api/grupos?user_id="+userId,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)})' +
    '.then(function(res){' +
    '  if(res.ok){' +
    '    var t=document.getElementById("toast");t.classList.add("show");' +
    '    callbackSent=true;' +
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
    '</head><body>' +
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
