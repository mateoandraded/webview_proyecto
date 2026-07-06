import { hasPairOfDatumScores, parseDatumScore, scoreEqDatum } from '../lib/datumScore.js';
import { getRequestUrl } from '../lib/requestUrl.js';
import { fetchFechaTorneoDesdeJelou } from '../lib/fechaTorneo.js';
import { flag } from '../lib/flags.js';

export const config = {
  runtime: 'edge',
};

const API_KEY = process.env.API_KEY || 'db_3cfJUDRR8mwrlazSod9Fo2YXIe3qUJxI57OkdvpCf1a5f863';
const BASE_URL = process.env.BASE_URL || 'https://mateoacademy-9djnmu.jelou.cloud/api/collections';
const BASE_URL_MATCHES = `${BASE_URL.replace(/\/$/, '')}/pbc_631836067/records?perPage=500`;

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function fetchDB(coll, query = '') {
  // Paginado: sin esto solo traía los primeros 500 registros, y a quien tuviera
  // sus pronósticos más allá de ese tope se le calculaba 0 (y se le borraban).
  let page = 1; let out = [];
  try {
    while (true) {
      const url = `${BASE_URL.replace(/\/$/, '')}/${coll}/records?perPage=500&page=${page}${query}`;
      const res = await fetch(url, { headers: { "X-Api-Key": API_KEY, "Accept": "application/json" }, cache: 'no-store' });
      if (!res.ok) break;
      const d = await res.json();
      const items = Array.isArray(d) ? d : (d.items || []);
      out = out.concat(items);
      if (Array.isArray(d) || !d.totalPages || page >= d.totalPages) break;
      page++;
    }
  } catch (e) { /* devolvemos lo leído hasta ahora */ }
  return out;
}

// Background async patch so we don't hold the Edge request
function silentPatch(coll, id, payload) {
  const url = `${BASE_URL.replace(/\/$/, '')}/${coll}/records/${id}`;
  fetch(url, {
    method: 'PATCH',
    headers: { "X-Api-Key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).catch(() => { });
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
  // Ya NO se exige fd <= hoy: si el resultado está cargado, el partido cuenta
  // (las fechas del calendario en la BD pueden ir por delante de la realidad).
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
  const url = getRequestUrl(req);
  const searchParams = url.searchParams;
  const loggedUser = searchParams.get('nombre') ? searchParams.get('nombre').trim().toLowerCase() : '';
  const loggedUserId = searchParams.get('user_id') || 'GUEST';
  const executionId = searchParams.get('executionId') || '';
  const lang = searchParams.get('lang') || 'es';

  const i18n = {
    es: {
      you: "Tú", anon: "Anónimo", exact_hits: " aciertos ext.", global_pts: "PTS GLOBALES",
      no_participants: "Aún no hay participantes", your_pos: "TU POSICIÓN GENERAL",
      hits: " aciertos", pts: "PTS", doc_title: "Ranking · World Cup 2026",
      badge: "JELOU MUNDIAL 2026", title: "TABLA DE<br>POSICIONES",
      subtitle: "🏆 RANKING GLOBAL TOP 5", btn_back: "VOLVER", btn_leaving: "Saliendo...",
      btn_show_all: "VER RANKING COMPLETO", btn_hide_all: "OCULTAR RANKING COMPLETO",
      full_section: "📋 RANKING COMPLETO"
    },
    en: {
      you: "You", anon: "Anonymous", exact_hits: " exact hits", global_pts: "GLOBAL PTS",
      no_participants: "No participants yet", your_pos: "YOUR OVERALL POSITION",
      hits: " hits", pts: "PTS", doc_title: "Leaderboard · World Cup 2026",
      badge: "JELOU WORLD CUP 2026", title: "LEADERBOARD",
      subtitle: "🏆 GLOBAL RANKING TOP 5", btn_back: "BACK", btn_leaving: "Leaving...",
      btn_show_all: "VIEW FULL RANKING", btn_hide_all: "HIDE FULL RANKING",
      full_section: "📋 FULL RANKING"
    },
    pt: {
      you: "Você", anon: "Anônimo", exact_hits: " acertos exat.", global_pts: "PTS GLOBAIS",
      no_participants: "Nenhum participante ainda", your_pos: "SUA POSIÇÃO GERAL",
      hits: " acertos", pts: "PTS", doc_title: "Classificação · World Cup 2026",
      badge: "JELOU COPA 2026", title: "CLASSIFICAÇÃO",
      subtitle: "🏆 RANKING GLOBAL TOP 5", btn_back: "VOLTAR", btn_leaving: "Saindo...",
      btn_show_all: "VER CLASSIFICAÇÃO COMPLETA", btn_hide_all: "OCULTAR CLASSIFICAÇÃO COMPLETA",
      full_section: "📋 CLASSIFICAÇÃO COMPLETA"
    }
  };
  const t = i18n[lang] || i18n['es'];

  // Ranking = SOLO LECTURA de torneo_ranking. El cron recalcularTodos ya mantiene
  // los puntos correctos (goles + brackets) en total_puntos. Antes se recalculaba
  // aquí bajando TODOS los pronósticos + partidos + brackets, y con el torneo ya
  // avanzado ese fetch pesado fallaba y dejaba la tabla VACÍA. Ahora solo leemos.
  const profiles = await fetchDB('pbc_3271891893');

  // Solo participantes OFICIALES aparecen en el ranking. Los no-oficiales
  // (registros nuevos + Ruddy) juegan de demo pero quedan fuera del torneo.
  const calculatedUsers = profiles.filter(function (pr) { return !!pr.es_oficial; }).map(function (pr) {
    return {
      nombre: String(pr.nombre || '').trim(),
      total_puntos: Number(pr.total_puntos) || 0,
      aciertos: Number(pr.pronosticos_correctos) || 0,
      esParticipante: !!pr.es_participante,
      nacionalidad: pr.nacionalidad || '',
      isCurrentUser: loggedUserId !== 'GUEST' ? (pr.user_id === loggedUserId) : (String(pr.nombre || '').trim().toLowerCase() === loggedUser)
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

  // Construye la fila central (bandera + nombre + medalla J de Jelou + subtítulo).
  // La bandera viene de torneo_ranking.nacionalidad; la J solo si es_participante=true.
  function buildRcInfo(u, isUser, subLabel) {
    var bandera = u.nacionalidad ? '<span class="nacion-flag">' + flag(u.nacionalidad) + '</span>' : '';
    var jelou = u.esParticipante ? '<img class="badge-jelou" src="/isotipo-jelou.png" alt="J">' : '';
    var sub = (u.aciertos || 0) + (subLabel || t.exact_hits);
    return '<div class="rc-info">' +
      '<div class="rc-name-row">' + bandera +
      '<span class="rc-name' + (isUser ? ' is-user' : '') + '">' + esc(u.nombre || t.anon) + '</span>' +
      jelou +
      '</div>' +
      '<div class="rc-sub">' + sub + '</div>' +
      '</div>';
  }

  let listHtml = '';
  if (top5.length > 0) {
    top5.forEach((u, idx) => {
      const posNum = idx + 1;
      const c = posColors[Math.min(idx, posColors.length - 1)];
      const isUser = u.isCurrentUser;
      const badgeHtml = isUser ? '<div class="badge-tu">' + t.you + '</div>' : '';

      listHtml +=
        '<div class="rank-card" style="--accent:' + c.accent + ';--dark:' + c.dark + '">' +
        badgeHtml +
        '<div class="rc-pos" style="background:' + c.accent + ';color:' + c.dark + '">' + medalLabel(posNum) + '</div>' +
        buildRcInfo(u, isUser, t.exact_hits) +
        '<div class="rc-score">' +
        '<div class="rc-pts" style="color:' + c.accent + '">' + (u.total_puntos || 0) + '</div>' +
        '<div class="rc-lbl">' + t.global_pts + '</div>' +
        '</div>' +
        '</div>';
    });
  } else {
    listHtml = '<div class="empty-state">' + t.no_participants + '</div>';
  }

  // Current user fallback if not top 5
  if (!userInTop5 && currentUserObj) {
    listHtml +=
      '<div class="divider"><span>' + t.your_pos + '</span></div>' +
      '<div class="rank-card" style="--accent:#FF6B35;--dark:#fff">' +
      '<div class="badge-tu">' + t.you + '</div>' +
      '<div class="rc-pos" style="background:#FF6B35;color:#fff">' + (currentUserIndex + 1) + '</div>' +
      buildRcInfo(currentUserObj, true, t.hits) +
      '<div class="rc-score">' +
      '<div class="rc-pts" style="color:#FF6B35">' + currentUserObj.total_puntos + '</div>' +
      '<div class="rc-lbl">' + t.pts + '</div>' +
      '</div>' +
      '</div>';
  }

  // Boton "Ver ranking completo" + lista colapsable con los N usuarios.
  // Renderizamos el HTML siempre pero ocultamos con display:none hasta el toggle.
  if (calculatedUsers.length > 0) {
    listHtml +=
      '<button id="btn-show-all" class="btn-show-all" onclick="toggleFullRank()">' + t.btn_show_all + '</button>' +
      '<div id="full-rank" class="full-rank-list">' +
      '<div class="section-label" style="margin-top:8px">' + t.full_section + '</div>';
    calculatedUsers.forEach((u, idx) => {
      const isUser = u.isCurrentUser;
      const accent = isUser ? '#C9FF24' : 'rgba(255,255,255,.18)';
      const dark = isUser ? '#000' : '#fff';
      const badgeTu = isUser ? '<div class="badge-tu">' + t.you + '</div>' : '';
      listHtml +=
        '<div class="rank-card compact" style="--accent:' + accent + ';--dark:' + dark + '">' +
        badgeTu +
        '<div class="rc-pos" style="background:' + accent + ';color:' + dark + '">' + (idx + 1) + '</div>' +
        buildRcInfo(u, isUser, t.exact_hits) +
        '<div class="rc-score">' +
        '<div class="rc-pts" style="color:' + (isUser ? '#C9FF24' : '#fff') + '">' + (u.total_puntos || 0) + '</div>' +
        '<div class="rc-lbl">' + t.global_pts + '</div>' +
        '</div>' +
        '</div>';
    });
    listHtml += '</div>';
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
    .rc-name-row{display:flex;align-items:center;gap:6px;min-width:0}
    .rc-name{font-weight:900;font-size:15px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:0 1 auto;min-width:0}
    .rc-name.is-user{color:var(--lime)}
    .rc-sub{font-size:11px;color:rgba(255,255,255,.5);font-weight:600;margin-top:3px}
    .nacion-flag{font-size:16px;line-height:1;flex-shrink:0}
    .badge-jelou{width:18px;height:18px;object-fit:contain;flex-shrink:0;border-radius:50%;background:var(--white);padding:1px}
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
    .btn-show-all{width:100%;background:var(--magenta);color:var(--white);border:none;padding:14px;font-family:'Archivo Black',sans-serif;font-size:13px;cursor:pointer;letter-spacing:1.5px;margin:28px 0 8px;text-transform:uppercase}
    .btn-show-all:active{background:var(--purple)}
    .full-rank-list{display:none}
    .full-rank-list.expanded{display:block;margin-top:8px;animation:fadeIn .2s ease-out}
    .full-rank-list .rank-card.compact{margin-bottom:4px}
    .full-rank-list .rank-card.compact .rc-pos{min-width:42px;width:42px;height:52px;font-size:14px}
    .full-rank-list .rank-card.compact .rc-name{font-size:13px}
    .full-rank-list .rank-card.compact .rc-sub{font-size:10px}
    .full-rank-list .rank-card.compact .rc-pts{font-size:20px}
    .full-rank-list .rank-card.compact .rc-lbl{font-size:8px}
    .full-rank-list .rank-card.compact .nacion-flag{font-size:14px}
    .full-rank-list .rank-card.compact .badge-jelou{width:14px;height:14px}
    @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
    .footer-bar{position:fixed;bottom:0;left:0;width:100%;background:var(--black);padding:16px;border-top:4px solid var(--lime);z-index:50}
    .btn-volver{width:100%;max-width:450px;margin:0 auto;display:block;background:var(--white);color:var(--black);border:none;padding:16px;font-family:'Archivo Black';font-size:18px;cursor:pointer;text-align:center;letter-spacing:1px}
    .btn-volver:active{background:var(--teal)}
  `;

  const html = '<!DOCTYPE html><html lang="es"><head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">' +
    '<title>' + t.doc_title + '</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">' +
    '<style>' + css + '</style>' +
    '</head><body>' +
    '<div class="app">' +
    '<div class="header-box">' +
    '<div class="header-26">26</div>' +
    '<div class="badge-26">' + t.badge + '</div>' +
    '<h1>' + t.title + '</h1>' +
    '</div>' +
    '<div class="section-label">' + t.subtitle + '</div>' +
    '<div class="rank-list">' + listHtml + '</div>' +
    '</div>' +
    '<div class="footer-bar">' +
    '<button class="btn-volver" id="btn-volver" onclick="volverMenu()">' + t.btn_back + '</button>' +
    '</div>' +
    '<script>' +
    'var BTN_SHOW_ALL="' + t.btn_show_all + '";var BTN_HIDE_ALL="' + t.btn_hide_all + '";' +
    'function toggleFullRank(){' +
    'var el=document.getElementById("full-rank");var btn=document.getElementById("btn-show-all");' +
    'if(el.classList.contains("expanded")){el.classList.remove("expanded");btn.innerText=BTN_SHOW_ALL;}' +
    'else{el.classList.add("expanded");btn.innerText=BTN_HIDE_ALL;}' +
    '}' +
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
    'btn.innerText="' + t.btn_leaving + '";btn.disabled=true;' +
    'var cbBody={executionId:execId,success:true,data:{action:"volver"}};' +
    'fetch("https://workflows.jelou.ai/v1/webview/callback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(cbBody)})' +
    '.finally(function(){ window.location.href="https://wa.me/593983456638"; });' +
    '}' +
    '<\/script>' +
    '</body></html>';

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
