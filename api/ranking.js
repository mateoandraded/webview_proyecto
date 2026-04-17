import { hasPairOfDatumScores, parseDatumScore, scoreEqDatum } from '../lib/datumScore.js';

export const config = {
  runtime: 'edge',
};

/** Misma fuente que torneo-libertadores (secrets FECHA_HOY). Copiable suelto a otro repo. */
const JELOU_ESTADO_TORNEO_URL = 'https://torneo-libertadores.fn.jelou.ai/estado-torneo';

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

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;
const BASE_URL_MATCHES = "https://mateoacademy-9djnmu.jelou.cloud/api/collections/pbc_631836067/records?perPage=500";

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function fetchDB(coll, query = '') {
  const url = `${BASE_URL_COLL}/${coll}/records?perPage=500${query}`;
  try {
    const res = await fetch(url, { headers: { "X-Api-Key": API_KEY, "Accept": "application/json" } });
    if (!res.ok) return [];
    const d = await res.json();
    return Array.isArray(d) ? d : (d.items || []);
  } catch (e) {
    return [];
  }
}

// Background async patch so we don't hold the Edge request
function silentPatch(coll, id, payload) {
  const url = `${BASE_URL_COLL}/${coll}/records/${id}`;
  fetch(url, {
    method: 'PATCH',
    headers: { "X-Api-Key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).catch(() => {});
}

/** Inicio fase de grupos Mundial 2026 (Datum + grupos.js). */
const FECHA_INICIO_TORNEO = '2026-06-11';

function normalizeMatchDate(fechaRaw) {
  if (fechaRaw == null || fechaRaw === '') return null;
  var s = String(fechaRaw).trim();
  var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return m[1] + '-' + m[2] + '-' + m[3];
  var m2 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m2) {
    var dd = m2[1].length === 1 ? '0' + m2[1] : m2[1];
    var mm = m2[2].length === 1 ? '0' + m2[2] : m2[2];
    return m2[3] + '-' + mm + '-' + dd;
  }
  return null;
}

/** Resultado real cargado en Datum (null, texto vacío o no numérico = sin marcador). */
function hasResultadoMarcado(m) {
  return hasPairOfDatumScores(m.gl, m.gv);
}

function partidoPuedeCalificar(m, hoyStr) {
  var fd = normalizeMatchDate(m.fecha);
  if (!fd) return false;
  if (fd < FECHA_INICIO_TORNEO) return false;
  if (fd > hoyStr) return false;
  return hasResultadoMarcado(m);
}

function normalizeRondaLabel(r) {
  return String(r == null ? '' : r).trim().toLowerCase().replace(/\s+/g, ' ');
}

function isRoundOf32(r) {
  var x = normalizeRondaLabel(r);
  if (!x) return false;
  if (x === 'round of 32' || x === 'r32') return true;
  if (x === 'dieciseisavos' || x === '16avos') return true;
  return x.indexOf('round of 32') !== -1;
}

function isRoundOf16(r) {
  var x = normalizeRondaLabel(r);
  if (!x) return false;
  if (x === 'round of 16' || x === 'r16' || x === 'octavos') return true;
  if (x === '8vos' || x === '1/8') return true;
  return x.indexOf('round of 16') !== -1;
}

function isQuarterFinals(r) {
  var x = normalizeRondaLabel(r);
  if (!x) return false;
  if (x === 'quarter-finals' || x === 'quarterfinals' || x === 'quarter finals' || x === 'cuartos') return true;
  if (x === 'r8' || x === '1/4') return true;
  return x.indexOf('quarter') !== -1;
}

function isSemiFinals(r) {
  var x = normalizeRondaLabel(r);
  if (!x) return false;
  if (x === 'semi-finals' || x === 'semifinals' || x === 'semi finals' || x === 'semis') return true;
  if (x === 'r4' || x === '1/2') return true;
  return x.indexOf('semi-final') !== -1 || x.indexOf('semifinal') !== -1;
}

export default async function handler(req) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;
  const loggedUser = searchParams.get('nombre') ? searchParams.get('nombre').trim().toLowerCase() : '';
  const loggedUserId = searchParams.get('user_id') || 'GUEST';
  const executionId = searchParams.get('executionId') || '';

  // 1. Fetch Datum + fecha simulada desde Jelou Functions (mismos secrets que FECHA_HOY)
  const [rawMatches, profiles, predictions, brackets, hoy] = await Promise.all([
    fetch(BASE_URL_MATCHES, { headers: {"X-Api-Key": API_KEY} }).then(r=>r.ok?r.json().then(d=>d.items||[]):[]).catch(()=>[]),
    fetchDB('pbc_3271891893'), // Perfiles/Ranking
    fetchDB('pbc_1944158292'), // Pronosticos Goles
    fetchDB('pbc_3221812075'), // Pronosticos Brackets
    fetchFechaTorneoDesdeJelou()
  ]);

  const torneoIniciado = hoy >= FECHA_INICIO_TORNEO;

  // 1.5 Evaluar Fase Oficial de los Partidos Reales
  const mappedMatches = rawMatches.map(m => ({
    id_partido: m.id_partido, local: m.equipo_local, visitante: m.equipo_visitante,
    gl: m.resulltado_local, gv: m.resultado_visitante,
    fecha: m.fecha, ronda: m.Fase_o_Grupo, ganador: m.ganador_final
  }));

  const real32 = new Set(); const real16 = new Set(); const real8 = new Set(); const real4 = new Set();
  let campeonReal = ''; let subcampeonReal = ''; let terceroReal = ''; let cuartoReal = '';

  // Determinar quienes jugaron fases (heurística basada en 'Fase_o_Grupo' u otro asumiendo estructura de Mundial 26)
  // Como la DB puede no tener la fase bien escrita, nos basamos en nombre.
  if (torneoIniciado) {
    const r32M = mappedMatches.filter(function (m) {
      return isRoundOf32(m.ronda) && partidoPuedeCalificar(m, hoy);
    });
    r32M.forEach(m => { real32.add(m.local); real32.add(m.visitante); });
    const r16M = mappedMatches.filter(function (m) {
      return isRoundOf16(m.ronda) && partidoPuedeCalificar(m, hoy);
    });
    r16M.forEach(m => { real16.add(m.local); real16.add(m.visitante); });
    const r8M = mappedMatches.filter(function (m) {
      return isQuarterFinals(m.ronda) && partidoPuedeCalificar(m, hoy);
    });
    r8M.forEach(m => { real8.add(m.local); real8.add(m.visitante); });
    const r4M = mappedMatches.filter(function (m) {
      return isSemiFinals(m.ronda) && partidoPuedeCalificar(m, hoy);
    });
    r4M.forEach(m => { real4.add(m.local); real4.add(m.visitante); });

    const finalM = mappedMatches.find(function (m) {
      return normalizeRondaLabel(m.ronda) === 'final' && partidoPuedeCalificar(m, hoy);
    });
    if (finalM) {
      campeonReal = finalM.ganador || '';
      subcampeonReal = (campeonReal === finalM.local) ? finalM.visitante : finalM.local;
    }
    const thirdM = mappedMatches.find(function (m) {
      var x = normalizeRondaLabel(m.ronda);
      return (x.indexOf('third') !== -1 || x === 'tercer lugar' || x === '3er lugar' || x === '3º lugar') && partidoPuedeCalificar(m, hoy);
    });
    if (thirdM) {
      terceroReal = thirdM.ganador || '';
      cuartoReal = (terceroReal === thirdM.local) ? thirdM.visitante : thirdM.local;
    }
  }

  // 2. Calcular puntajes solo si el torneo ya empezó según fecha Jelou; si no, mostrar Datum sin PATCH
  const calculatedUsers = profiles.map(pr => {
    if (!torneoIniciado) {
      return {
        nombre: String(pr.nombre).trim(),
        total_puntos: Number(pr.total_puntos) || 0,
        aciertos: Number(pr.pronosticos_correctos) || 0,
        isCurrentUser: loggedUserId !== 'GUEST' ? (pr.user_id === loggedUserId) : (String(pr.nombre).trim().toLowerCase() === loggedUser)
      };
    }

    let ptsGoles = 0; let aciertos = 0;

    const userPreds = predictions.filter(p => p.user_id === pr.user_id);
    userPreds.forEach(p => {
      const match = mappedMatches.find(m => m.id_partido === p.match_id);
      if (!match || !partidoPuedeCalificar(match, hoy)) return;

      let pt = 0;
      if (scoreEqDatum(p.pronostico_local, match.gl) && scoreEqDatum(p.pronostico_visitante, match.gv)) { pt = 2; aciertos++; }
      else if (scoreEqDatum(p.pronostico_local, match.gl) || scoreEqDatum(p.pronostico_visitante, match.gv)) { pt = 1; }
      ptsGoles += pt;

      if (p.estado === 'PENDIENTE') {
        silentPatch('pbc_1944158292', p.id, {
          puntos_ganados: pt, estado: (pt === 2) ? 'GANADO_EXACTO' : (pt === 1 ? 'GANADO_PARCIAL' : 'PERDIDO'),
          resultado_real_local: parseDatumScore(match.gl), resultado_real_visitante: parseDatumScore(match.gv)
        });
      }
    });

    let ptsBrackets = 0;
    const b = brackets.find(br => br.user_id === pr.user_id);
    if (b) {
      const check = (arr, setRef, val) => { if (arr && Array.isArray(arr)) arr.forEach(t => { if (setRef.has(t)) ptsBrackets += val; }); };
      check(b.dieciseisavos, real32, 1);
      check(b.octavos, real16, 2);
      check(b.cuartos, real8, 3);
      check(b.semis, real4, 3);
      if (b.campeon === campeonReal && campeonReal) ptsBrackets += 10;
      if (b.subcampeon === subcampeonReal && subcampeonReal) ptsBrackets += 5;
      if (b.tercer_lugar === terceroReal && terceroReal) ptsBrackets += 4;
      if (b.cuarto_lugar === cuartoReal && cuartoReal) ptsBrackets += 4;
    }

    const totalCalculado = ptsGoles + ptsBrackets;

    if (totalCalculado !== pr.total_puntos || aciertos !== pr.pronosticos_correctos) {
      silentPatch('pbc_3271891893', pr.id, {
        total_puntos: totalCalculado, puntos_goles: ptsGoles, puntos_brackets: ptsBrackets, pronosticos_correctos: aciertos
      });
    }

    return {
      nombre: String(pr.nombre).trim(),
      total_puntos: totalCalculado,
      aciertos: aciertos,
      isCurrentUser: loggedUserId !== 'GUEST' ? (pr.user_id === loggedUserId) : (String(pr.nombre).trim().toLowerCase() === loggedUser)
    };
  });

  // 3. Ordernar y armar la interfaz
  calculatedUsers.sort((a, b) => {
    if (b.total_puntos !== a.total_puntos) return b.total_puntos - a.total_puntos;
    return b.aciertos - a.aciertos;
  });

  const top5 = calculatedUsers.slice(0, 5);
  const currentUserObj = calculatedUsers.find(u => u.isCurrentUser);
  const currentUserIndex = calculatedUsers.findIndex(u => u.isCurrentUser);
  const userInTop5 = currentUserIndex >= 0 && currentUserIndex < 5;

  // --- UI Rendereing ---
  const posColors = [
    { accent: '#C9FF24', dark: '#000' },
    { accent: '#00FFCC', dark: '#000' },
    { accent: '#FF0055', dark: '#fff' },
    { accent: '#6200EA', dark: '#fff' },
    { accent: '#ffffff', dark: '#000' },
  ];

  function medalLabel(posNum) {
    if (posNum === 1) return '\uD83E\uDD47';
    if (posNum === 2) return '\uD83E\uDD48';
    if (posNum === 3) return '\uD83E\uDD49';
    return String(posNum);
  }

  let listHtml = '';
  if (top5.length > 0) {
    top5.forEach((t, idx) => {
      const posNum = idx + 1;
      const c = posColors[Math.min(idx, posColors.length - 1)];
      const isUser = t.isCurrentUser;
      const badgeHtml = isUser ? '<div class="badge-tu">T\u00FA</div>' : '';

      listHtml +=
        '<div class="rank-card" style="--accent:' + c.accent + ';--dark:' + c.dark + '">' +
          badgeHtml +
          '<div class="rc-pos" style="background:' + c.accent + ';color:' + c.dark + '">' + medalLabel(posNum) + '</div>' +
          '<div class="rc-info">' +
            '<div class="rc-name' + (isUser ? ' is-user' : '') + '">' + esc(t.nombre || 'Anónimo') + '</div>' +
            '<div class="rc-sub">' + (t.aciertos || 0) + ' aciertos ext.</div>' +
          '</div>' +
          '<div class="rc-score">' +
            '<div class="rc-pts" style="color:' + c.accent + '">' + (t.total_puntos || 0) + '</div>' +
            '<div class="rc-lbl">PTS GLOBALES</div>' +
          '</div>' +
        '</div>';
    });
  } else {
    listHtml = '<div class="empty-state">A\u00FAn no hay participantes</div>';
  }

  // Current user fallback if not top 5
  if (!userInTop5 && currentUserObj) {
    listHtml +=
      '<div class="divider"><span>TU POSICI\u00D3N GENERAL</span></div>' +
      '<div class="rank-card" style="--accent:#FF6B35;--dark:#fff">' +
        '<div class="badge-tu">T\u00FA</div>' +
        '<div class="rc-pos" style="background:#FF6B35;color:#fff">' + (currentUserIndex + 1) + '</div>' +
        '<div class="rc-info">' +
          '<div class="rc-name is-user">' + esc(currentUserObj.nombre) + '</div>' +
          '<div class="rc-sub">' + currentUserObj.aciertos + ' aciertos</div>' +
        '</div>' +
        '<div class="rc-score">' +
          '<div class="rc-pts" style="color:#FF6B35">' + currentUserObj.total_puntos + '</div>' +
          '<div class="rc-lbl">PTS</div>' +
        '</div>' +
      '</div>';
  }

  const css = `
    :root{--black:#000;--white:#fff;--lime:#C9FF24;--magenta:#FF0055;--teal:#00FFCC;--purple:#6200EA;--dim:#141414}
    *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
    body{background:var(--black);color:var(--white);font-family:'Inter',sans-serif;padding-bottom:60px;overflow-x:hidden}
    .app{max-width:450px;margin:auto;padding:0 16px}
    .header-box{margin:40px 0 32px;padding-bottom:12px;border-bottom:4px solid var(--white);position:relative}
    .badge-26{display:inline-block;background:var(--lime);color:var(--black);font-weight:900;font-size:14px;padding:4px 10px;margin-bottom:12px;letter-spacing:1px}
    h1{font-family:'Archivo Black',sans-serif;font-size:40px;line-height:.9;letter-spacing:-2px}
    .header-26{font-family:'Archivo Black';font-size:80px;line-height:1;letter-spacing:-4px;color:rgba(255,255,255,.06);position:absolute;right:0;top:-10px;pointer-events:none;user-select:none}
    .section-label{font-size:11px;font-weight:800;letter-spacing:2px;color:rgba(255,255,255,.5);text-transform:uppercase;margin-bottom:16px}
    .rank-list{display:flex;flex-direction:column;gap:0}
    .rank-card{
      display:flex;align-items:center;gap:0;
      border:2px solid rgba(255,255,255,.1);
      border-left:4px solid var(--accent,#fff);
      background:var(--dim);
      margin-bottom:8px;
      position:relative;
      overflow:hidden;
      transition:.15s;
    }
    .rc-pos{
      min-width:56px;width:56px;height:72px;
      display:flex;align-items:center;justify-content:center;
      font-family:'Archivo Black';font-size:20px;
      flex-shrink:0;
    }
    .rc-info{flex:1;padding:12px 10px;min-width:0}
    .rc-name{font-weight:900;font-size:15px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .rc-name.is-user{color:var(--lime)}
    .rc-sub{font-size:11px;color:rgba(255,255,255,.5);font-weight:600;margin-top:3px}
    .rc-score{padding:12px 16px 12px 0;text-align:right;flex-shrink:0}
    .rc-pts{font-family:'Archivo Black';font-size:28px;line-height:1}
    .rc-lbl{font-size:9px;letter-spacing:2px;color:rgba(255,255,255,.4);font-weight:800;margin-top:2px}
    .badge-tu{
      position:absolute;top:0;right:12px;
      background:var(--accent,var(--lime));color:var(--dark,#000);
      font-size:8px;font-weight:900;padding:3px 8px;
      border-radius:0 0 6px 6px;letter-spacing:1px;text-transform:uppercase;
    }
    .divider{text-align:center;margin:30px 0 20px;position:relative}
    .divider::before{content:"";position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(255,255,255,.1)}
    .divider span{position:relative;background:var(--black);padding:0 12px;font-size:10px;color:var(--lime);font-weight:800;letter-spacing:2px}
    .empty-state{text-align:center;padding:40px 24px;color:rgba(255,255,255,.4);font-size:14px;background:var(--dim);font-weight:700;border:1px dashed rgba(255,255,255,.1)}
    .footer-bar{position:fixed;bottom:0;left:0;width:100%;background:var(--black);padding:16px;border-top:4px solid var(--lime);z-index:50}
    .btn-volver{width:100%;max-width:450px;margin:0 auto;display:block;background:var(--white);color:var(--black);border:none;padding:16px;font-family:'Archivo Black';font-size:18px;cursor:pointer;text-align:center;letter-spacing:1px}
    .btn-volver:active{background:var(--teal)}
  `;

  const html = '<!DOCTYPE html><html lang="es"><head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">' +
    '<title>Ranking \u00B7 World Cup 2026</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">' +
    '<style>' + css + '</style>' +
    '</head><body>' +
    '<div class="app">' +
      '<div class="header-box">' +
        '<div class="header-26">26</div>' +
        '<div class="badge-26">QUINIELA 2026</div>' +
        '<h1>TABLA DE<br>POSICIONES</h1>' +
      '</div>' +
      '<div class="section-label">\uD83C\uDFC6 RANKING GLOBAL TOP 5</div>' +
      '<div class="rank-list">' + listHtml + '</div>' +
    '</div>' +
    '<div class="footer-bar">' +
      '<button class="btn-volver" id="btn-volver" onclick="volverMenu()">VOLVER</button>' +
    '</div>' +
    '<script>' +
      'var callbackSent=false;' +
      'document.addEventListener("visibilitychange",function(){' +
        'if(document.visibilityState==="hidden"&&!callbackSent){' +
          'callbackSent=true;' +
          'var execId=new URLSearchParams(window.location.search).get("executionId")||"' + esc(executionId) + '";' +
          'var cbBody={executionId:execId,success:true,data:{action:"volver"}};' +
          'fetch("https://workflows.jelou.ai/v1/webview/callback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(cbBody),keepalive:true});' +
        '}' +
      '});' +
      'function volverMenu(){' +
        'if(callbackSent)return;' +
        'callbackSent=true;' +
        'var execId="' + esc(executionId) + '";' +
        'var btn=document.getElementById("btn-volver");' +
        'btn.innerText="Saliendo...";btn.disabled=true;' +
        'var cbBody={executionId:execId,success:true,data:{action:"volver"}};' +
        'fetch("https://workflows.jelou.ai/v1/webview/callback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(cbBody)})' +
          '.finally(function(){ window.location.href="https://wa.me/13239183195"; });' +
      '}' +
    '<\/script>' +
    '</body></html>';

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
