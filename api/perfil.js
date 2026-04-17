import { parseDatumScore } from '../lib/datumScore.js';

export const config = {
  runtime: 'edge',
};

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;

const FLAGS = {"MEXICO":"🇲🇽","ESTADOS UNIDOS":"🇺🇸","CANADA":"🇨🇦","BRASIL":"🇧🇷","ARGENTINA":"🇦🇷","ECUADOR":"🇪🇨","COLOMBIA":"🇨🇴","PERU":"🇵🇪","CHILE":"🇨🇱","URUGUAY":"🇺🇾","PARAGUAY":"🇵🇾","BOLIVIA":"🇧🇴","VENEZUELA":"🇻🇪","ALEMANIA":"🇩🇪","ESPANA":"🇪🇸","ESPAÑA":"🇪🇸","FRANCIA":"🇫🇷","ITALIA":"🇮🇹","PORTUGAL":"🇵🇹","PAISES BAJOS":"🇳🇱","BELGICA":"🇧🇪","CROACIA":"🇭🇷","SERBIA":"🇷🇸","SUIZA":"🇨🇭","DINAMARCA":"🇩🇰","AUSTRIA":"🇦🇹","UCRANIA":"🇺🇦","TURQUIA":"🇹🇷","HUNGRIA":"🇭🇺","REPUBLICA CHECA":"🇨🇿","GRECIA":"🇬🇷","JAPON":"🇯🇵","REPUBLICA DE COREA":"🇰🇷","COREA DEL SUR":"🇰🇷","AUSTRALIA":"🇦🇺","IRAN":"🇮🇷","ARABIA SAUDITA":"🇸🇦","QATAR":"🇶🇦","MARRUECOS":"🇲🇦","SENEGAL":"🇸🇳","GHANA":"🇬🇭","CAMERUN":"🇨🇲","NIGERIA":"🇳🇬","TUNEZ":"🇹🇳","SUDAFRICA":"🇿🇦","EGIPTO":"🇪🇬","COSTA RICA":"🇨🇷","PANAMA":"🇵🇦","HONDURAS":"🇭🇳","JAMAICA":"🇯🇲","INDONESIA":"🇮🇩","NUEVA ZELANDA":"🇳🇿","GALES":"🏴󠁧󠁢󠁷󠁬󠁳󠁿","ESCOCIA":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","INGLATERRA":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","POLAND":"🇵🇱","POLONIA":"🇵🇱","RUMANIA":"🇷🇴","ESLOVENIA":"🇸🇮","ESLOVAQUIA":"🇸🇰","ALBANIA":"🇦🇱","ARGELIA":"🇩🇿","MALI":"🇲🇱","COSTA DE MARFIL":"🇨🇮","CONGO":"🇨🇬","UZBEKISTAN":"🇺🇿","CHINA":"🇨🇳","INDIA":"🇮🇳","BAHREIN":"🇧🇭","IRAK":"🇮🇶","TRINIDAD Y TOBAGO":"🇹🇹","EL SALVADOR":"🇸🇻","GUATEMALA":"🇬🇹","REPUBLICA DOMINICANA":"🇩🇴","HAITI":"🇭🇹","CURACAO":"🇨🇼","SURINAM":"🇸🇷","NORUEGA":"🇳🇴","SUECIA":"🇸🇪","FINLANDIA":"🇫🇮","ISLANDIA":"🇮🇸","IRLANDA":"🇮🇪"};
function flag(name) { return FLAGS[(name||'').toUpperCase()] || '🏳️'; }

async function fetchDB(coll, query='') {
  const res = await fetch(`${BASE_URL}/${coll}/records?perPage=500${query}`, { headers: {"X-Api-Key": API_KEY} });
  if(!res.ok) return []; const d = await res.json(); return d.items || d || [];
}

export default async function handler(req) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('user_id') || 'GUEST';
  const executionId = url.searchParams.get('executionId') || '';

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
      let icon = 'PENDIENTE'; let statusClass = 'status-pending'; 
      if (est === 'GANADO_EXACTO') { icon = 'EXACTO'; statusClass = 'status-exact'; }
      else if (est === 'GANADO_PARCIAL') { icon = 'PARCIAL'; statusClass = 'status-partial'; }
      else if (est === 'PERDIDO') { icon = 'FALLO'; statusClass = 'status-lost'; }

      var rlReal = parseDatumScore(p.resultado_real_local);
      var rvReal = parseDatumScore(p.resultado_real_visitante);
      var plPred = parseDatumScore(p.pronostico_local);
      var pvPred = parseDatumScore(p.pronostico_visitante);
      var realScore = (rlReal !== null && rvReal !== null && est !== 'PENDIENTE')
        ? ("REAL: " + rlReal + "-" + rvReal) : '';

      matchHistoryHtml +=
        "<div class='hist-row'>" +
          "<div class='hist-teams'>" +
            "<div>" + flag(p.equipo_local) + " " + (p.equipo_local||'') + "</div>" +
            "<div>" + flag(p.equipo_visitante) + " " + (p.equipo_visitante||'') + "</div>" +
          "</div>" +
          "<div class='hist-scores'>" +
            "<div class='pred-score'>PRONÓSTICO: " + (plPred != null ? plPred : '-') + " - " + (pvPred != null ? pvPred : '-') + "</div>" +
            "<div class='real-score'>" + realScore + "</div>" +
          "</div>" +
          "<div class='hist-state " + statusClass + "'>" + icon + "</div>" +
        "</div>";
    });
  } else {
    matchHistoryHtml = "<div class='empty-msg'>SIN PRONÓSTICOS REGISTRADOS</div>";
  }

  let bracketHtml = '';
  if (bracket) {
    const phases = [
      { key: 'dieciseisavos', label: '1/16' },
      { key: 'octavos', label: '1/8' },
      { key: 'cuartos', label: '1/4' },
      { key: 'semis', label: 'SEMIS' }
    ];
    phases.forEach(ph => {
      const teams = bracket[ph.key] || [];
      if (teams.length > 0) {
        let chips = '';
        teams.forEach(t => { chips += "<span class='chip'>" + flag(t) + " " + t + "</span>"; });
        bracketHtml +=
          "<div class='bracket-phase'>" +
            "<div class='phase-label'>" + ph.label + "</div>" +
            "<div class='chips-wrap'>" + chips + "</div>" +
          "</div>";
      }
    });

    const podiumItems = [
      { key: 'campeon', label: 'CAMPEÓN', cls: 'podium-champ' },
      { key: 'subcampeon', label: 'SUB', cls: 'podium-sub' },
      { key: 'tercer_lugar', label: 'TERCERO', cls: 'podium-third' }
    ];
    let podiumHtml = '';
    podiumItems.forEach(pi => {
      const val = bracket[pi.key];
      if (val) {
        podiumHtml += "<div class='podium-item " + pi.cls + "'><div class='p-label'>" + pi.label + "</div><div class='p-team'>" + flag(val) + " " + val + "</div></div>";
      }
    });
    if (podiumHtml) {
      bracketHtml += "<div class='podium-grid'>" + podiumHtml + "</div>";
    }
  } else {
    bracketHtml = "<div class='empty-msg'>CLASIFICADOS NO DISPONIBLES</div>";
  }

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Mi Perfil - Jelou Mundial 2026</title>
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
    .chip { background: var(--dim); padding: 8px 12px; font-weight: 800; font-size: 12px; letter-spacing: -0.5px; border: 1px solid rgba(255,255,255,0.1); }
    .podium-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 16px; }
    .podium-item { padding: 16px; }
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
      <div class="badge-26">JELOU MUNDIAL 2026</div>
      <h1>RESUMEN GLOBAL</h1>
    </div>

    <div class="profile-hero">
      <div class="p-name">${profile.nombre || 'FAN'} ${profile.apellido || ''}</div>
      <div style="font-weight: 800; font-size: 12px; opacity: 0.8">ESTADO DE RENDIMIENTO</div>
      
      <div class="p-stat-grid">
        <div>
          <div class="lbl">TOTAL PTS</div>
          <div class="val">${profile.total_puntos || 0}</div>
        </div>
        <div>
          <div class="lbl">EXACTOS</div>
          <div class="val">${profile.pronosticos_correctos || 0}</div>
        </div>
      </div>

      <div class="points-detail">
        <div class="pd-box">
          <div class="lbl">GRUPOS</div>
          <div class="val">${profile.puntos_goles || 0}</div>
        </div>
        <div class="pd-box secondary">
          <div class="lbl">CLASIFICADOS</div>
          <div class="val">${profile.puntos_brackets || 0}</div>
        </div>
      </div>
    </div>

    <div class="section-title">HISTORIAL</div>
    <div style="margin-bottom: 40px">${matchHistoryHtml}</div>

    <div class="section-title">MIS CLASIFICADOS</div>
    <div>${bracketHtml}</div>
  </div>

  <div class="bottom-bar">
    <button class="btn-volver" id="btn-volver" onclick="volver()">VOLVER</button>
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
      btn.innerText = "Saliendo...";
      var cbBody = { executionId: exId, success: true, data: { action: "volver" } };
      fetch("https://workflows.jelou.ai/v1/webview/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cbBody)
      }).finally(function() {
        window.location.href = "https://wa.me/13239183195";
      });
    }
  </script>
</body>
</html>`;

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
