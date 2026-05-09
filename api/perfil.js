import { parseDatumScore } from '../lib/datumScore.js';
import { getRequestUrl } from '../lib/requestUrl.js';
import { buildRealBracketSets, teamInPhase } from '../lib/realBracketSets.js';

export const config = {
  runtime: 'edge',
};

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;

const JELOU_ESTADO_TORNEO_URL = 'https://torneo-libertadores.fn.jelou.ai/estado-torneo';

function fallbackHoyYMD() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const y = parts.find((p) => p.type === 'year').value;
  const mo = parts.find((p) => p.type === 'month').value;
  const d = parts.find((p) => p.type === 'day').value;
  return `${y}-${mo}-${d}`;
}

async function fetchFechaTorneoDesdeJelou() {
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(JELOU_ESTADO_TORNEO_URL, { method: 'GET', signal: ctrl.signal, headers: { Accept: 'application/json' } });
    clearTimeout(tid);
    if (!res.ok) return fallbackHoyYMD();
    const data = await res.json();
    const f = data && data.fecha_simulada_hoy;
    if (typeof f === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(f.trim())) return f.trim();
  } catch (e) { /* */ }
  return fallbackHoyYMD();
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
function flag(name) { return FLAGS[(name||'').toUpperCase()] || '🏳️'; }

async function fetchDB(coll, query='') {
  const res = await fetch(`${BASE_URL}/${coll}/records?perPage=500${query}`, { headers: {"X-Api-Key": API_KEY} });
  if(!res.ok) return []; const d = await res.json(); return d.items || d || [];
}

export default async function handler(req) {
  const url = getRequestUrl(req);
  const userId = url.searchParams.get('user_id') || 'GUEST';
  const executionId = url.searchParams.get('executionId') || '';
  const lang = url.searchParams.get('lang') || 'es';

  const i18n = {
    es: {
      pending: "PENDIENTE", exact: "EXACTO", partial: "PARCIAL", miss: "FALLO",
      real: "REAL: ", pred: "PRONÓSTICO: ", no_preds: "SIN PRONÓSTICOS REGISTRADOS",
      ph_16: "1/16", ph_8: "1/8", ph_4: "1/4", ph_2: "SEMIS",
      champ: "CAMPEÓN", sub: "SUB", third: "TERCERO",
      no_brackets: "CLASIFICADOS NO DISPONIBLES", doc_title: "Mi Perfil - Jelou Mundial 2026",
      badge: "JELOU MUNDIAL 2026", title: "RESUMEN GLOBAL", fan: "FAN",
      perf_status: "ESTADO DE RENDIMIENTO", total_pts: "TOTAL PTS", exacts: "EXACTOS",
      groups: "GRUPOS", brackets: "CLASIFICADOS", history: "HISTORIAL",
      my_brackets: "MIS CLASIFICADOS", btn_back: "VOLVER", btn_leaving: "Saliendo..."
    },
    en: {
      pending: "TBD", exact: "EXACT", partial: "PARTIAL", miss: "MISS",
      real: "REAL: ", pred: "PREDICTION: ", no_preds: "NO PREDICTIONS RECORDED",
      ph_16: "R32", ph_8: "R16", ph_4: "QF", ph_2: "SF",
      champ: "CHAMPION", sub: "RUNNER-UP", third: "THIRD",
      no_brackets: "BRACKETS UNAVAILABLE", doc_title: "My Profile - World Cup 26",
      badge: "JELOU WORLD CUP 2026", title: "GLOBAL SUMMARY", fan: "FAN",
      perf_status: "PERFORMANCE STATUS", total_pts: "TOTAL PTS", exacts: "EXACT HITS",
      groups: "GROUPS", brackets: "BRACKETS", history: "HISTORY",
      my_brackets: "MY BRACKETS", btn_back: "BACK", btn_leaving: "Leaving..."
    },
    pt: {
      pending: "PENDENTE", exact: "EXATO", partial: "PARCIAL", miss: "ERRO",
      real: "REAL: ", pred: "PALPITE: ", no_preds: "NENHUM PALPITE REGISTRADO",
      ph_16: "16 AVOS", ph_8: "OITAVAS", ph_4: "QUARTAS", ph_2: "SEMIS",
      champ: "CAMPEÃO", sub: "VICE", third: "TERCEIRO",
      no_brackets: "CLASSIFICADOS INDISPONÍVEIS", doc_title: "Meu Perfil - Copa 2026",
      badge: "JELOU COPA 2026", title: "RESUMO GLOBAL", fan: "FÃ",
      perf_status: "STATUS DE DESEMPENHO", total_pts: "TOTAL PTS", exacts: "EXATOS",
      groups: "GRUPOS", brackets: "CLASSIFICADOS", history: "HISTÓRICO",
      my_brackets: "MEUS CLASSIFICADOS", btn_back: "VOLTAR", btn_leaving: "Saindo..."
    }
  };
  const t = i18n[lang] || i18n['es'];

  const [fechaServidor, rawMatches] = await Promise.all([
    fetchFechaTorneoDesdeJelou(),
    fetchDB('pbc_631836067', '').catch(() => [])
  ]);
  const reality = buildRealBracketSets(rawMatches, fechaServidor);

  let profile = { nombre: 'Invitado', apellido: '', total_puntos: 0, puntos_goles: 0, puntos_brackets: 0, pronosticos_correctos: 0 };
  if (userId !== 'GUEST') {
    try {
      const items = await fetchDB('pbc_3271891893', `&filter=(user_id='${userId}')`);
      if (items.length > 0) profile = items[0];
    } catch (e) { }
  }

  let predictions = [];
  if (userId !== 'GUEST') {
    try { predictions = await fetchDB('pbc_1944158292', `&filter=(user_id='${userId}')`); } catch(e) {}
  }

  let bracket = null;
  if (userId !== 'GUEST') {
    try {
      const bItems = await fetchDB('pronosticos_brackets', `&filter=(user_id='${userId}')`);
      if (bItems.length > 0) bracket = bItems[0];
    } catch(e) {}
  }

  let matchHistoryHtml = '';
  if (predictions.length > 0) {
    predictions.sort((a,b) => (a.fecha_partido||'').localeCompare(b.fecha_partido||''));
    predictions.forEach(p => {
      const est = p.estado || 'PENDIENTE';
      let icon = t.pending; let statusClass = 'status-pending'; 
      if (est === 'GANADO_EXACTO') { icon = t.exact; statusClass = 'status-exact'; }
      else if (est === 'GANADO_PARCIAL') { icon = t.partial; statusClass = 'status-partial'; }
      else if (est === 'PERDIDO') { icon = t.miss; statusClass = 'status-lost'; }

      var rlReal = parseDatumScore(p.resultado_real_local);
      var rvReal = parseDatumScore(p.resultado_real_visitante);
      var plPred = parseDatumScore(p.pronostico_local);
      var pvPred = parseDatumScore(p.pronostico_visitante);
      var realScore = (rlReal !== null && rvReal !== null && est !== 'PENDIENTE')
        ? (t.real + rlReal + "-" + rvReal) : '';

      matchHistoryHtml +=
        "<div class='hist-row'>" +
          "<div class='hist-teams'>" +
            "<div>" + flag(p.equipo_local) + " " + (p.equipo_local||'') + "</div>" +
            "<div>" + flag(p.equipo_visitante) + " " + (p.equipo_visitante||'') + "</div>" +
          "</div>" +
          "<div class='hist-scores'>" +
            "<div class='pred-score'>" + t.pred + (plPred != null ? plPred : '-') + " - " + (pvPred != null ? pvPred : '-') + "</div>" +
            "<div class='real-score'>" + realScore + "</div>" +
          "</div>" +
          "<div class='hist-state " + statusClass + "'>" + icon + "</div>" +
        "</div>";
    });
  } else {
    matchHistoryHtml = "<div class='empty-msg'>" + t.no_preds + "</div>";
  }

  let bracketHtml = '';
  if (bracket) {
    const phases = [
      { key: 'dieciseisavos', label: t.ph_16 },
      { key: 'octavos', label: t.ph_8 },
      { key: 'cuartos', label: t.ph_4 },
      { key: 'semis', label: t.ph_2 }
    ];
    phases.forEach(ph => {
      const teams = bracket[ph.key] || [];
      if (teams.length > 0) {
        let chips = '';
        teams.forEach(t => {
          let extra = ' chip-neutral';
          if (reality.torneoIniciado) {
            extra = teamInPhase(t, ph.key, reality) ? ' chip-hit' : ' chip-miss';
          }
          chips += "<span class='chip" + extra + "'>" + flag(t) + " " + t + "</span>";
        });
        bracketHtml +=
          "<div class='bracket-phase'>" +
            "<div class='phase-label'>" + ph.label + "</div>" +
            "<div class='chips-wrap'>" + chips + "</div>" +
          "</div>";
      }
    });

    const podiumItems = [
      { key: 'campeon', label: t.champ, cls: 'podium-champ' },
      { key: 'subcampeon', label: t.sub, cls: 'podium-sub' },
      { key: 'tercer_lugar', label: t.third, cls: 'podium-third' }
    ];
    let podiumHtml = '';
    const realMap = {
      campeon: reality.campeonReal,
      subcampeon: reality.subcampeonReal,
      tercer_lugar: reality.terceroReal,
      cuarto_lugar: reality.cuartoReal
    };
    podiumItems.forEach(pi => {
      const val = bracket[pi.key];
      if (val) {
        let pExtra = ' podium-neutral';
        if (reality.torneoIniciado) {
          const ok = realMap[pi.key] && val === realMap[pi.key];
          pExtra = ok ? ' podium-hit' : ' podium-miss';
        }
        podiumHtml += "<div class='podium-item " + pi.cls + pExtra + "'><div class='p-label'>" + pi.label + "</div><div class='p-team'>" + flag(val) + " " + val + "</div></div>";
      }
    });
    if (podiumHtml) {
      bracketHtml += "<div class='podium-grid'>" + podiumHtml + "</div>";
    }
  } else {
    bracketHtml = "<div class='empty-msg'>" + t.no_brackets + "</div>";
  }

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>\${t.doc_title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --black: #000000;
      --white: #FFFFFF;
      --lime: #C9FF24;
      --magenta: #FF0055;
      --teal: #00FFCC;
      --purple: #6200EA;
      --dim: #1F1F1F;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--black);
      color: var(--white);
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      display: flex; justify-content: center;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
    }

    .app-container {
      width: 100%; max-width: 450px;
      padding: 0 16px 120px;
      margin: 0 auto;
    }

    h1, .display-font { font-family: 'Archivo Black', sans-serif; text-transform: uppercase; line-height: 0.9; }

    .header-box {
      margin-top: 40px; margin-bottom: 30px;
      border-bottom: 4px solid var(--white);
      padding-bottom: 10px;
    }
    .badge-26 {
      display: inline-block; background: var(--white); color: var(--black);
      font-weight: 900; font-size: 14px; padding: 4px 8px; margin-bottom: 12px;
      letter-spacing: -0.5px;
    }
    .header-box h1 { font-size: 48px; letter-spacing: -2px; }

    .profile-hero {
      background: var(--lime); color: var(--black);
      padding: 24px;
      margin-bottom: 32px;
      position: relative; overflow: hidden;
    }
    .profile-hero::after {
      content: '26';
      position: absolute; right: -10px; bottom: -20px;
      font-family: 'Archivo Black'; font-size: 140px; opacity: 0.15;
      line-height: 1; pointer-events: none;
    }
    .p-name { font-family: 'Archivo Black'; font-size: 28px; letter-spacing: -1px; margin-bottom: 4px; }
    .p-stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 24px; z-index: 2; }
    
    .lbl { font-size: 11px; font-weight: 800; letter-spacing: 1px; color: rgba(0,0,0,0.6); }
    .val { font-size: 36px; font-family: 'Archivo Black'; letter-spacing: -1px; }

    .points-detail { display: flex; gap: 8px; margin-top: 16px; }
    .pd-box { flex: 1; background: var(--black); color: var(--white); padding: 12px; }
    .pd-box .lbl { color: rgba(255,255,255,0.6); }
    .pd-box .val { color: var(--lime); font-size: 24px; }
    .pd-box.secondary .val { color: var(--teal); }

    .section-title {
      font-family: 'Archivo Black'; font-size: 24px; margin-bottom: 16px; 
      letter-spacing: -0.5px; border-left: 8px solid var(--magenta); padding-left: 12px;
    }

    .hist-row { background: var(--dim); display: flex; align-items: stretch; margin-bottom: 8px; }
    .hist-teams { flex: 1; padding: 12px; font-weight: 900; font-size: 14px; display: flex; flex-direction: column; justify-content: center; gap: 4px; }
    .hist-scores { padding: 12px; font-size: 11px; font-weight: 800; border-left: 2px solid var(--black); display: flex; flex-direction: column; justify-content: center; }
    .pred-score { color: var(--white); }
    .real-score { color: rgba(255,255,255,0.5); margin-top: 4px; }
    
    .hist-state { width: 40px; writing-mode: vertical-rl; text-align: center; font-weight: 900; font-size: 10px; letter-spacing: 2px; }
    .status-exact { background: var(--teal); color: var(--black); }
    .status-partial { background: var(--lime); color: var(--black); }
    .status-lost { background: var(--magenta); color: var(--white); }
    .status-pending { background: #333; color: var(--white); }

    .bracket-phase { margin-bottom: 24px; }
    .phase-label { font-family: 'Archivo Black'; font-size: 16px; color: var(--teal); margin-bottom: 8px; }
    .chips-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip { padding: 8px 12px; font-weight: 800; font-size: 12px; letter-spacing: -0.5px; border: 1px solid rgba(255,255,255,0.1); }
    .chip-neutral { background: var(--dim); color: var(--white); }
    .chip-hit { background: var(--teal); color: var(--black); border-color: var(--teal); }
    .chip-miss { background: rgba(255,0,85,0.14); color: rgba(255,255,255,0.72); border-color: rgba(255,0,85,0.4); }
    .podium-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 16px; }
    .podium-item { padding: 16px; border: 2px solid transparent; }
    .podium-neutral { }
    .podium-hit { box-shadow: inset 0 0 0 2px var(--lime); }
    .podium-miss { opacity: 0.55; filter: grayscale(0.2); }
    .podium-champ { background: var(--lime); color: var(--black); grid-column: 1 / -1; }
    .podium-sub { background: var(--purple); color: var(--white); }
    .podium-third { background: var(--teal); color: var(--black); }
    
    .p-label { font-size: 10px; font-weight: 900; opacity: 0.8; margin-bottom: 4px; }
    .p-team { font-family: 'Archivo Black'; font-size: 18px; }

    .empty-msg { background: var(--dim); padding: 24px; text-align: center; font-weight: 900; font-size: 12px; color: rgba(255,255,255,0.4); border: 1px dashed rgba(255,255,255,0.2); }

    .bottom-bar { position: fixed; bottom: 0; left: 0; width: 100%; background: var(--black); padding: 16px; border-top: 4px solid var(--lime); z-index: 50; }
    .btn-volver { width: 100%; max-width: 450px; margin: 0 auto; display: block; background: var(--white); color: var(--black); border: none; padding: 16px; font-family: 'Archivo Black'; font-size: 18px; cursor: pointer; letter-spacing: 1px; }
    .btn-volver:active { background: var(--teal); }
  </style>
</head>
<body>
  <div class="app-container">
    <div class="header-box">
      <div class="badge-26">\${t.badge}</div>
      <h1>\${t.title}</h1>
    </div>

    <div class="profile-hero">
      <div class="p-name">\${profile.nombre || t.fan} \${profile.apellido || ''}</div>
      <div style="font-weight: 800; font-size: 12px; opacity: 0.8">\${t.perf_status}</div>
      
      <div class="p-stat-grid">
        <div>
          <div class="lbl">\${t.total_pts}</div>
          <div class="val">\${profile.total_puntos || 0}</div>
        </div>
        <div>
          <div class="lbl">\${t.exacts}</div>
          <div class="val">\${profile.pronosticos_correctos || 0}</div>
        </div>
      </div>

      <div class="points-detail">
        <div class="pd-box">
          <div class="lbl">\${t.groups}</div>
          <div class="val">\${profile.puntos_goles || 0}</div>
        </div>
        <div class="pd-box secondary">
          <div class="lbl">\${t.brackets}</div>
          <div class="val">\${profile.puntos_brackets || 0}</div>
        </div>
      </div>
    </div>

    <div class="section-title">\${t.history}</div>
    <div style="margin-bottom: 40px">\${matchHistoryHtml}</div>

    <div class="section-title">\${t.my_brackets}</div>
    <div>\${bracketHtml}</div>
  </div>

  <div class="bottom-bar">
    <button class="btn-volver" id="btn-volver" onclick="volver()">\${t.btn_back}</button>
  </div>

  <script>
    var callbackSent = false;
    document.addEventListener("visibilitychange", function() {
      if (document.visibilityState === "hidden" && !callbackSent) {
        callbackSent = true;
        var exId = new URLSearchParams(window.location.search).get("executionId") || "${executionId}";
        var cbBody = { executionId: exId, success: true, data: { action: "volver" } };
        fetch("https://workflows.jelou.ai/v1/webview/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cbBody),
          keepalive: true
        });
      }
    });
    function volver(){
      if (callbackSent) return;
      callbackSent = true;
      var exId = new URLSearchParams(window.location.search).get("executionId") || "";
      var btn = document.getElementById("btn-volver");
      btn.innerText = "\${t.btn_leaving}";
      var cbBody = { executionId: exId, success: true, data: { action: "volver" } };
      fetch("https://workflows.jelou.ai/v1/webview/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cbBody)
      }).finally(function() {
        window.location.href = "https://wa.me/593983456638";
      });
    }
  </script>
</body>
</html>`;

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
