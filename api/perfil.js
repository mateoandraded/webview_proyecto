export const config = {
  runtime: 'edge',
};

const API_KEY = "db_HQIwDXV9xkJTEU5F3wwYAGhHAGInsItCu79g5FSz6e3106ee";
const BASE_URL = "https://mateoacademy-9djnmu.jelou.cloud/api/collections";

const FLAGS = {"MEXICO":"🇲🇽","ESTADOS UNIDOS":"🇺🇸","CANADA":"🇨🇦","BRASIL":"🇧🇷","ARGENTINA":"🇦🇷","ECUADOR":"🇪🇨","COLOMBIA":"🇨🇴","PERU":"🇵🇪","CHILE":"🇨🇱","URUGUAY":"🇺🇾","PARAGUAY":"🇵🇾","BOLIVIA":"🇧🇴","VENEZUELA":"🇻🇪","ALEMANIA":"🇩🇪","ESPANA":"🇪🇸","ESPAÑA":"🇪🇸","FRANCIA":"🇫🇷","ITALIA":"🇮🇹","PORTUGAL":"🇵🇹","PAISES BAJOS":"🇳🇱","BELGICA":"🇧🇪","CROACIA":"🇭🇷","SERBIA":"🇷🇸","SUIZA":"🇨🇭","DINAMARCA":"🇩🇰","AUSTRIA":"🇦🇹","UCRANIA":"🇺🇦","TURQUIA":"🇹🇷","HUNGRIA":"🇭🇺","REPUBLICA CHECA":"🇨🇿","GRECIA":"🇬🇷","JAPON":"🇯🇵","REPUBLICA DE COREA":"🇰🇷","COREA DEL SUR":"🇰🇷","AUSTRALIA":"🇦🇺","IRAN":"🇮🇷","ARABIA SAUDITA":"🇸🇦","QATAR":"🇶🇦","MARRUECOS":"🇲🇦","SENEGAL":"🇸🇳","GHANA":"🇬🇭","CAMERUN":"🇨🇲","NIGERIA":"🇳🇬","TUNEZ":"🇹🇳","SUDAFRICA":"🇿🇦","EGIPTO":"🇪🇬","COSTA RICA":"🇨🇷","PANAMA":"🇵🇦","HONDURAS":"🇭🇳","JAMAICA":"🇯🇲","INDONESIA":"🇮🇩","NUEVA ZELANDA":"🇳🇿","ARABIA SAUDITA":"🇸🇦","GALES":"🏴󠁧󠁢󠁷󠁬󠁳󠁿","ESCOCIA":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","INGLATERRA":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","POLAND":"🇵🇱","POLONIA":"🇵🇱","RUMANIA":"🇷🇴","ESLOVENIA":"🇸🇮","ESLOVAQUIA":"🇸🇰","ALBANIA":"🇦🇱","ARGELIA":"🇩🇿","MALI":"🇲🇱","COSTA DE MARFIL":"🇨🇮","CONGO":"🇨🇬","UZBEKISTAN":"🇺🇿","CHINA":"🇨🇳","INDIA":"🇮🇳","BAHREIN":"🇧🇭","IRAK":"🇮🇶","TRINIDAD Y TOBAGO":"🇹🇹","EL SALVADOR":"🇸🇻","GUATEMALA":"🇬🇹","REPUBLICA DOMINICANA":"🇩🇴","HAITI":"🇭🇹","CURACAO":"🇨🇼","SURINAM":"🇸🇷","NORUEGA":"🇳🇴","SUECIA":"🇸🇪","FINLANDIA":"🇫🇮","ISLANDIA":"🇮🇸","IRLANDA":"🇮🇪"};
function flag(name) { return FLAGS[(name||'').toUpperCase()] || '🏳️'; }

async function fetchDB(coll, query='') {
  const res = await fetch(`${BASE_URL}/${coll}/records?perPage=500${query}`, { headers: {"X-Api-Key": API_KEY} });
  if(!res.ok) return []; const d = await res.json(); return d.items || d || [];
}

export default async function handler(req) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('user_id') || 'GUEST';

  // 1. Fetch ranking profile
  let profile = { nombre: 'Invitado', apellido: '', total_puntos: 0, puntos_goles: 0, puntos_brackets: 0, pronosticos_correctos: 0 };
  if (userId !== 'GUEST') {
    try {
      const items = await fetchDB('pbc_3271891893', `&filter=(user_id='${userId}')`);
      if (items.length > 0) profile = items[0];
    } catch (e) { }
  }

  // 2. Fetch match predictions history
  let predictions = [];
  if (userId !== 'GUEST') {
    try { predictions = await fetchDB('pbc_1944158292', `&filter=(user_id='${userId}')`); } catch(e) {}
  }

  // 3. Fetch bracket predictions
  let bracket = null;
  if (userId !== 'GUEST') {
    try {
      const bItems = await fetchDB('pronosticos_brackets', `&filter=(user_id='${userId}')`);
      if (bItems.length > 0) bracket = bItems[0];
    } catch(e) {}
  }

  // Build match history HTML
  let matchHistoryHtml = '';
  if (predictions.length > 0) {
    predictions.sort((a,b) => (a.fecha_partido||'').localeCompare(b.fecha_partido||''));
    predictions.forEach(p => {
      const est = p.estado || 'PENDIENTE';
      let icon = '⏳'; let statusClass = 'pending'; let statusText = 'Pendiente';
      if (est === 'GANADO_EXACTO') { icon = '✅'; statusClass = 'exact'; statusText = '+2 pts'; }
      else if (est === 'GANADO_PARCIAL') { icon = '⚡'; statusClass = 'partial'; statusText = '+1 pt'; }
      else if (est === 'PERDIDO') { icon = '❌'; statusClass = 'lost'; statusText = '0 pts'; }

      const realScore = (p.resultado_real_local !== undefined && p.resultado_real_local !== null && est !== 'PENDIENTE')
        ? (" | Real: " + p.resultado_real_local + "-" + p.resultado_real_visitante) : '';

      matchHistoryHtml +=
        "<div class='hist-row'>" +
          "<div class='hist-icon " + statusClass + "'>" + icon + "</div>" +
          "<div class='hist-info'>" +
            "<div class='hist-teams'>" + flag(p.equipo_local) + " " + (p.equipo_local||'') + " vs " + (p.equipo_visitante||'') + " " + flag(p.equipo_visitante) + "</div>" +
            "<div class='hist-detail'>Tu: " + (p.pronostico_local ?? '-') + " - " + (p.pronostico_visitante ?? '-') + realScore + "</div>" +
          "</div>" +
          "<div class='hist-status " + statusClass + "'>" + statusText + "</div>" +
        "</div>";
    });
  } else {
    matchHistoryHtml = "<div class='empty-msg'>Aún no has hecho pronósticos de partidos</div>";
  }

  // Build bracket history HTML
  let bracketHtml = '';
  if (bracket) {
    const phases = [
      { key: 'dieciseisavos', label: 'Dieciseisavos', icon: '🏟️' },
      { key: 'octavos', label: 'Octavos', icon: '⚔️' },
      { key: 'cuartos', label: 'Cuartos', icon: '🔥' },
      { key: 'semis', label: 'Semis', icon: '💎' }
    ];
    phases.forEach(ph => {
      const teams = bracket[ph.key] || [];
      if (teams.length > 0) {
        let chips = '';
        teams.forEach(t => {
          chips += "<span class='chip'>" + flag(t) + " " + t + "</span>";
        });
        bracketHtml +=
          "<div class='bracket-phase'>" +
            "<div class='phase-label'>" + ph.icon + " " + ph.label + " <span class='phase-count'>(" + teams.length + ")</span></div>" +
            "<div class='chips-wrap'>" + chips + "</div>" +
          "</div>";
      }
    });

    const podiumItems = [
      { key: 'campeon', label: '🏆 Campeón', cls: 'gold' },
      { key: 'subcampeon', label: '🥈 Sub', cls: 'silver' },
      { key: 'tercer_lugar', label: '🥉 3ro', cls: 'bronze' },
      { key: 'cuarto_lugar', label: '🏅 4to', cls: 'fourth' }
    ];
    let podiumHtml = '';
    podiumItems.forEach(pi => {
      const val = bracket[pi.key];
      if (val) {
        podiumHtml += "<div class='podium-item " + pi.cls + "'><span class='podium-label'>" + pi.label + "</span><span class='podium-team'>" + flag(val) + " " + val + "</span></div>";
      }
    });
    if (podiumHtml) {
      bracketHtml += "<div class='podium-grid'>" + podiumHtml + "</div>";
    }
  } else {
    bracketHtml = "<div class='empty-msg'>Aún no has armado tu bracket</div>";
  }

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Mi Perfil - Quiniela 2026</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --navy: #0A0A2E;
      --navy-light: #141440;
      --navy-surface: #1C1C50;
      --turquoise: #00E6C3;
      --turquoise-dark: #00B896;
      --magenta: #E835A0;
      --purple: #7B61FF;
      --blue: #3B82F6;
      --yellow: #FFD100;
      --red: #E63946;
      --text: #FFFFFF;
      --text-secondary: rgba(255,255,255,0.6);
      --text-muted: rgba(255,255,255,0.35);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Outfit', sans-serif; }
    body {
      background-color: var(--navy);
      color: var(--text);
      min-height: 100vh;
      padding-bottom: 40px;
    }

    /* Animated BG */
    body::before {
      content: "";
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background:
        radial-gradient(ellipse at 20% 0%, rgba(123,97,255,0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 100%, rgba(0,230,195,0.1) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 50%, rgba(232,53,160,0.08) 0%, transparent 60%);
      pointer-events: none; z-index: 0;
    }

    .header {
      position: relative; z-index: 1;
      padding: 36px 20px 24px;
      text-align: center;
      background: linear-gradient(180deg, rgba(123,97,255,0.2) 0%, transparent 100%);
    }
    .header-tag {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(0,230,195,0.12); border: 1px solid rgba(0,230,195,0.25);
      padding: 4px 14px; border-radius: 20px; color: var(--turquoise);
      font-size: 10px; font-weight: 700; letter-spacing: 1px; margin-bottom: 12px;
    }
    h1 {
      font-size: 28px; font-weight: 900;
      background: linear-gradient(135deg, #FFF 0%, var(--turquoise) 60%, var(--magenta) 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .subtitle { color: var(--text-secondary); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }

    .container { max-width: 500px; margin: 0 auto; padding: 0 20px; position: relative; z-index: 1; }

    /* Profile Card */
    .profile-card {
      background: var(--navy-light); border-radius: 20px; overflow: hidden;
      border: 1px solid rgba(255,255,255,0.06); margin-top: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .profile-head {
      background: linear-gradient(135deg, var(--purple) 0%, var(--blue) 50%, var(--turquoise) 100%);
      padding: 28px 20px; text-align: center;
    }
    .avatar { width: 72px; height: 72px; background: rgba(0,0,0,0.3); border-radius: 50%;
      display: inline-flex; justify-content: center; align-items: center; font-size: 28px;
      border: 3px solid rgba(255,255,255,0.3); margin-bottom: 12px; }
    .user-name { font-size: 22px; font-weight: 800; color: #FFF; }

    .stats-row {
      display: flex; justify-content: space-around; padding: 20px 10px;
      background: var(--navy-surface); border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .stat-box { text-align: center; flex: 1; }
    .stat-val { font-size: 32px; font-weight: 900; line-height: 1; margin-bottom: 4px; }
    .stat-val.turq { color: var(--turquoise); }
    .stat-val.mag { color: var(--magenta); }
    .stat-lbl { font-size: 10px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; letter-spacing: 0.5px; }

    .points-detail { padding: 16px 20px; }
    .pd-row {
      display: flex; align-items: center; padding: 14px 0;
      border-bottom: 1px solid rgba(255,255,255,0.03);
    }
    .pd-row:last-child { border-bottom: none; }
    .pd-icon {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; justify-content: center; align-items: center; font-size: 16px;
      margin-right: 14px; flex-shrink: 0;
    }
    .pd-icon.goals { background: rgba(0,230,195,0.12); }
    .pd-icon.brackets { background: rgba(123,97,255,0.12); }
    .pd-title { font-size: 14px; font-weight: 700; }
    .pd-sub { font-size: 11px; color: var(--text-muted); }
    .pd-val { margin-left: auto; font-size: 20px; font-weight: 900; }

    /* Section Title */
    .section-title {
      display: flex; align-items: center; margin: 28px 0 14px; gap: 12px;
    }
    .section-title h2 { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; white-space: nowrap; }
    .section-title::after { content: ""; flex: 1; height: 2px; background: linear-gradient(to right, var(--turquoise), var(--magenta), transparent); border-radius: 2px; opacity: 0.4; }

    /* Match History */
    .hist-row {
      display: flex; align-items: center; gap: 12px;
      background: var(--navy-light); border-radius: 14px; padding: 14px 16px;
      margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.04);
    }
    .hist-icon { font-size: 20px; flex-shrink: 0; width: 32px; text-align: center; }
    .hist-info { flex: 1; min-width: 0; }
    .hist-teams { font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .hist-detail { font-size: 11px; color: var(--text-secondary); margin-top: 2px; }
    .hist-status { font-size: 11px; font-weight: 800; flex-shrink: 0; padding: 4px 10px; border-radius: 8px; }
    .hist-status.exact { background: rgba(0,230,195,0.15); color: var(--turquoise); }
    .hist-status.partial { background: rgba(255,209,0,0.15); color: var(--yellow); }
    .hist-status.lost { background: rgba(230,57,70,0.15); color: var(--red); }
    .hist-status.pending { background: rgba(255,255,255,0.05); color: var(--text-muted); }

    /* Bracket History */
    .bracket-phase { margin-bottom: 16px; }
    .phase-label { font-size: 13px; font-weight: 800; margin-bottom: 8px; color: var(--text-secondary); }
    .phase-count { font-weight: 600; color: var(--text-muted); font-size: 11px; }
    .chips-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
    .chip {
      background: var(--navy-surface); border: 1px solid rgba(255,255,255,0.08);
      padding: 6px 12px; border-radius: 10px; font-size: 12px; font-weight: 600;
    }
    .podium-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
    .podium-item {
      background: var(--navy-surface); border-radius: 12px; padding: 14px; text-align: center;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .podium-item.gold { border-color: rgba(255,209,0,0.3); background: rgba(255,209,0,0.06); }
    .podium-item.silver { border-color: rgba(192,192,192,0.3); }
    .podium-item.bronze { border-color: rgba(205,127,50,0.3); }
    .podium-label { display: block; font-size: 11px; color: var(--text-muted); font-weight: 700; margin-bottom: 4px; }
    .podium-team { font-size: 14px; font-weight: 800; }

    .empty-msg {
      text-align: center; padding: 30px; color: var(--text-muted); font-size: 13px;
      background: var(--navy-light); border-radius: 14px;
      border: 1px dashed rgba(255,255,255,0.08);
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="header-tag">⚽ FIFA WORLD CUP 2026</div>
    <h1>MI RENDIMIENTO</h1>
    <div class="subtitle">Estadisticas Oficiales</div>
  </div>

  <div class="container">
    <div class="profile-card">
      <div class="profile-head">
        <div class="avatar">👤</div>
        <div class="user-name">${profile.nombre || 'Jugador'} ${profile.apellido || ''}</div>
      </div>

      <div class="stats-row">
        <div class="stat-box">
          <div class="stat-val turq">${profile.total_puntos || 0}</div>
          <div class="stat-lbl">Puntos Totales</div>
        </div>
        <div class="stat-box">
          <div class="stat-val mag">${profile.pronosticos_correctos || 0}</div>
          <div class="stat-lbl">Exactos</div>
        </div>
      </div>

      <div class="points-detail">
        <div class="pd-row">
          <div class="pd-icon goals">⚽</div>
          <div>
            <div class="pd-title">Puntos por Partidos</div>
            <div class="pd-sub">Fase de Grupos</div>
          </div>
          <div class="pd-val" style="color:var(--turquoise)">${profile.puntos_goles || 0}</div>
        </div>
        <div class="pd-row">
          <div class="pd-icon brackets">🏆</div>
          <div>
            <div class="pd-title">Puntos por Brackets</div>
            <div class="pd-sub">Fases Finales</div>
          </div>
          <div class="pd-val" style="color:var(--purple)">${profile.puntos_brackets || 0}</div>
        </div>
      </div>
    </div>

    <div class="section-title"><h2>⚽ Historial de Partidos</h2></div>
    ${matchHistoryHtml}

    <div class="section-title"><h2>🏆 Mi Bracket</h2></div>
    ${bracketHtml}
  </div>

</body>
</html>`;

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
