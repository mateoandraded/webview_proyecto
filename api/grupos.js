export const config = {
  runtime: 'edge',
};

const API_KEY = "db_HQIwDXV9xkJTEU5F3wwYAGhHAGInsItCu79g5FSz6e3106ee";
const BASE_URL = "https://mateoacademy-9djnmu.jelou.cloud/api/collections";

const FLAGS = {"MEXICO":"🇲🇽","ESTADOS UNIDOS":"🇺🇸","CANADA":"🇨🇦","BRASIL":"🇧🇷","ARGENTINA":"🇦🇷","ECUADOR":"🇪🇨","COLOMBIA":"🇨🇴","PERU":"🇵🇪","CHILE":"🇨🇱","URUGUAY":"🇺🇾","PARAGUAY":"🇵🇾","BOLIVIA":"🇧🇴","VENEZUELA":"🇻🇪","ALEMANIA":"🇩🇪","ESPANA":"🇪🇸","ESPAÑA":"🇪🇸","FRANCIA":"🇫🇷","ITALIA":"🇮🇹","PORTUGAL":"🇵🇹","PAISES BAJOS":"🇳🇱","BELGICA":"🇧🇪","CROACIA":"🇭🇷","SERBIA":"🇷🇸","SUIZA":"🇨🇭","DINAMARCA":"🇩🇰","AUSTRIA":"🇦🇹","UCRANIA":"🇺🇦","TURQUIA":"🇹🇷","HUNGRIA":"🇭🇺","REPUBLICA CHECA":"🇨🇿","GRECIA":"🇬🇷","JAPON":"🇯🇵","REPUBLICA DE COREA":"🇰🇷","COREA DEL SUR":"🇰🇷","AUSTRALIA":"🇦🇺","IRAN":"🇮🇷","ARABIA SAUDITA":"🇸🇦","QATAR":"🇶🇦","MARRUECOS":"🇲🇦","SENEGAL":"🇸🇳","GHANA":"🇬🇭","CAMERUN":"🇨🇲","NIGERIA":"🇳🇬","TUNEZ":"🇹🇳","SUDAFRICA":"🇿🇦","EGIPTO":"🇪🇬","COSTA RICA":"🇨🇷","PANAMA":"🇵🇦","HONDURAS":"🇭🇳","JAMAICA":"🇯🇲","INDONESIA":"🇮🇩","NUEVA ZELANDA":"🇳🇿","GALES":"🏴󠁧󠁢󠁷󠁬󠁳󠁿","ESCOCIA":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","INGLATERRA":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","POLONIA":"🇵🇱","RUMANIA":"🇷🇴","ESLOVENIA":"🇸🇮","ESLOVAQUIA":"🇸🇰","ALBANIA":"🇦🇱","ARGELIA":"🇩🇿","COSTA DE MARFIL":"🇨🇮","NORUEGA":"🇳🇴","SUECIA":"🇸🇪","IRLANDA":"🇮🇪","TRINIDAD Y TOBAGO":"🇹🇹","EL SALVADOR":"🇸🇻","GUATEMALA":"🇬🇹"};
function flag(n) { return FLAGS[(n||'').toUpperCase()] || '🏳️'; }

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
      const body = await req.json();
      const existingReq = await fetchDatum('pbc_1944158292', 'GET', null, '', "&filter=(user_id='" + userId + "')");
      const existingItems = existingReq.items || existingReq;
      for (const p of body) {
        if (p.locked) continue;
        const record = existingItems.find(function(e) { return e.match_id === p.match_id; });
        const recordId = record ? record.id : null;
        const payload = {
          user_id: userId, match_id: p.match_id, equipo_local: p.equipo_local,
          equipo_visitante: p.equipo_visitante, pronostico_local: p.local_score,
          pronostico_visitante: p.visitor_score, fecha_partido: p.fecha,
          estado: 'PENDIENTE', resultado_real_local: 0, resultado_real_visitante: 0, puntos_ganados: 0
        };
        if (recordId) { await fetchDatum('pbc_1944158292', 'PATCH', payload, recordId, ''); }
        else { try { await fetchDatum('pbc_1944158292', 'POST', payload, '', ''); } catch(e) {} }
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

  const paramFecha = url.searchParams.get('fecha');
  const fechaSimulada = paramFecha || "2026-06-11";

  const groups = {};
  rawMatches.forEach(function(m) {
    const g = m.Fase_o_Grupo || "X";
    if (g.length > 1) return;
    if (!groups[g]) groups[g] = [];
    const up = userPredictions.find(function(pr) { return pr.match_id === m.id_partido; });
    const isLocked = m.fecha < fechaSimulada;
    groups[g].push({
      id: m.id_partido, local: m.equipo_local, visitante: m.equipo_visitante,
      fecha: m.fecha, real_l: m.resulltado_local || 0, real_v: m.resultado_visitante || 0,
      pred_l: up ? up.pronostico_local : null, pred_v: up ? up.pronostico_visitante : null,
      locked: isLocked
    });
  });
  const groupKeys = Object.keys(groups).sort();

  let groupsHtml = '';
  groupKeys.forEach(function(gk) {
    let matchHtml = '';
    groups[gk].forEach(function(m) {
      let valL = '', valV = '';
      if (m.locked) { valL = m.real_l; valV = m.real_v; }
      else { valL = m.pred_l !== null ? m.pred_l : ''; valV = m.pred_v !== null ? m.pred_v : ''; }
      const lockClass = m.locked ? 'locked' : '';
      const lockData = m.locked ? "data-locked='true'" : "";
      const st = m.locked ? "<div class='lock-badge'>FINALIZADO</div>" : "";
      const bg = m.locked ? "style='opacity: 0.6'" : "";

      matchHtml +=
        "<div class='match-row' " + lockData + " data-id='" + m.id + "' data-f='" + m.fecha + "' data-l='" + m.local + "' data-v='" + m.visitante + "' " + bg + ">" +
          "<div class='match-meta'><span>" + m.fecha + "</span> " + st + "</div>" +
          "<div class='match-body'>" +
            "<div class='team-side'>" +
              "<div class='t-flag'>" + flag(m.local) + "</div><div class='t-name'>" + m.local + "</div>" +
            "</div>" +
            "<div class='score-block " + lockClass + "'>" +
              "<button type='button' class='btn-step' onclick='step(this,-1)'>-</button>" +
              "<input type='number' class='input-score input-local' value='" + valL + "' readonly placeholder='-'>" +
              "<button type='button' class='btn-step' onclick='step(this,1)'>+</button>" +
            "</div>" +
            "<div class='vs'>x</div>" +
            "<div class='score-block " + lockClass + "'>" +
              "<button type='button' class='btn-step' onclick='step(this,-1)'>-</button>" +
              "<input type='number' class='input-score input-visitor' value='" + valV + "' readonly placeholder='-'>" +
              "<button type='button' class='btn-step' onclick='step(this,1)'>+</button>" +
            "</div>" +
            "<div class='team-side right'>" +
              "<div class='t-flag'>" + flag(m.visitante) + "</div><div class='t-name'>" + m.visitante + "</div>" +
            "</div>" +
          "</div>" +
        "</div>";
    });

    groupsHtml +=
      "<div class='group-block'>" +
        "<div class='group-header' onclick=\"this.parentElement.classList.toggle('open')\">GRUPO " + gk + "</div>" +
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
    .group-header{font-family:'Archivo Black';font-size:28px;padding:16px;background:var(--white);color:var(--black);cursor:pointer;position:relative}
    .group-header::after{content:'+';position:absolute;right:16px;top:50%;transform:translateY(-50%);font-weight:900;font-size:32px}
    .group-block.open .group-header{background:var(--magenta);color:var(--white)}
    .group-block.open .group-header::after{content:'-'}
    .group-content{display:none;padding:0}
    .group-block.open .group-content{display:block}
    .match-row{border-top:2px solid var(--white);padding:16px 12px}
    .match-meta{font-size:10px;font-weight:800;color:rgba(255,255,255,.6);display:flex;justify-content:space-between;margin-bottom:16px;letter-spacing:1px}
    .lock-badge{background:var(--purple);color:var(--white);padding:2px 6px}
    .match-body{display:flex;align-items:center;justify-content:space-between;gap:4px}
    .team-side{flex:1;display:flex;flex-direction:column;align-items:flex-start;min-width:0;overflow:hidden}
    .team-side.right{align-items:flex-end}
    .t-flag{font-size:32px;line-height:1}
    .t-name{font-weight:900;font-size:11px;text-transform:uppercase;white-space:nowrap;max-width:100%;text-overflow:ellipsis}
    .score-block{display:flex;flex-direction:column;align-items:center;gap:4px;background:var(--dim);padding:4px;border:1px solid rgba(255,255,255,.2)}
    .btn-step{width:32px;height:28px;background:var(--white);color:var(--black);border:none;font-size:16px;font-weight:900;cursor:pointer}
    .btn-step:active{background:var(--teal)}
    .input-score{width:32px;height:32px;background:transparent;border:none;color:var(--lime);font-size:24px;font-family:'Archivo Black';text-align:center}
    .score-block.locked{border-color:transparent;background:transparent}
    .score-block.locked .btn-step{display:none}
    .score-block.locked .input-score{color:var(--white)}
    .vs{font-family:'Archivo Black';font-size:14px;opacity:.5;padding:0 4px}
    .bottom-bar{position:fixed;bottom:0;left:0;width:100%;background:var(--black);padding:16px;border-top:4px solid var(--lime);z-index:50}
    .btn-save{width:100%;max-width:450px;margin:0 auto;display:block;background:var(--lime);color:var(--black);border:none;padding:16px;font-family:'Archivo Black';font-size:18px;cursor:pointer}
    .btn-save:active{background:var(--white)}
    .toast{position:fixed;top:16px;left:50%;transform:translateX(-50%) translateY(-100px);background:var(--white);color:var(--black);padding:12px 24px;font-family:'Archivo Black';font-size:14px;z-index:100;transition:.3s;border:4px solid var(--black)}
    .toast.show{transform:translateX(-50%) translateY(0)}
  `;

  const html = '<!DOCTYPE html><html lang="es"><head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">' +
    '<title>Grupos - World Cup 26</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">' +
    '<style>' + css + '</style>' +
    '</head><body>' +
    '<div class="toast" id="toast">¡GUARDADO!</div>' +
    '<div class="app-container">' +
      '<div class="header-box">' +
        '<div class="badge-26">FASE DE GRUPOS</div>' +
        '<h1>MIS<br>PRONOSTICOS</h1>' +
      '</div>' +
      '<div>' + groupsHtml + '</div>' +
    '</div>' +
    '<div class="bottom-bar"><button class="btn-save" id="btnSave" onclick="save()">GUARDAR TODO</button></div>' +
    '<script>' +
      'var firstGroup = document.querySelector(".group-block");' +
      'if (firstGroup) firstGroup.classList.add("open");' +
      'function step(btn, amount) {' +
        'var input = btn.parentElement.querySelector("input");' +
        'var val = parseInt(input.value);' +
        'if (isNaN(val)) val = 0;' +
        'val += amount;' +
        'if (val < 0) val = 0;' +
        'if (val > 20) val = 20;' +
        'input.value = val;' +
      '}' +
      'function save() {' +
        'var btn = document.getElementById("btnSave");' +
        'btn.innerHTML = "GUARDANDO...";' +
        'var payload = [];' +
        'document.querySelectorAll(".match-row").forEach(function(row) {' +
          'if (row.getAttribute("data-locked") === "true") return;' +
          'var valL = row.querySelector(".input-local").value;' +
          'var valV = row.querySelector(".input-visitor").value;' +
          'if (valL !== "" && valV !== "") {' +
            'payload.push({ match_id: row.getAttribute("data-id"), equipo_local: row.getAttribute("data-l"), equipo_visitante: row.getAttribute("data-v"), fecha: row.getAttribute("data-f"), local_score: parseInt(valL), visitor_score: parseInt(valV), locked: false });' +
          '}' +
        '});' +
        'if (payload.length === 0) { btn.innerHTML = "GUARDAR TODO"; return; }' +
        'var urlParams = new URLSearchParams(window.location.search);' +
        'var userId = urlParams.get("user_id") || "GUEST";' +
        'fetch("/api/grupos?user_id=" + userId, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })' +
          '.then(function(res) {' +
            'if (res.ok) { var t = document.getElementById("toast"); t.classList.add("show"); setTimeout(function() { t.classList.remove("show"); }, 2000); }' +
            'else { alert("Error al guardar."); }' +
          '}).catch(function() { alert("Error de red."); })' +
          '.finally(function() { btn.innerHTML = "GUARDAR TODO"; });' +
      '}' +
    '<\/script>' +
    '</body></html>';

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
