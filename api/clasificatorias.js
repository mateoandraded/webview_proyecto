export const config = {
  runtime: 'edge',
};

const API_KEY = "db_HQIwDXV9xkJTEU5F3wwYAGhHAGInsItCu79g5FSz6e3106ee";
const BASE_URL = "https://mateoacademy-9djnmu.jelou.cloud/api/collections";

const FLAGS = {"MEXICO":"🇲🇽","ESTADOS UNIDOS":"🇺🇸","CANADA":"🇨🇦","BRASIL":"🇧🇷","ARGENTINA":"🇦🇷","ECUADOR":"🇪🇨","COLOMBIA":"🇨🇴","PERU":"🇵🇪","CHILE":"🇨🇱","URUGUAY":"🇺🇾","PARAGUAY":"🇵🇾","BOLIVIA":"🇧🇴","VENEZUELA":"🇻🇪","ALEMANIA":"🇩🇪","ESPANA":"🇪🇸","ESPAÑA":"🇪🇸","FRANCIA":"🇫🇷","ITALIA":"🇮🇹","PORTUGAL":"🇵🇹","PAISES BAJOS":"🇳🇱","BELGICA":"🇧🇪","CROACIA":"🇭🇷","SERBIA":"🇷🇸","SUIZA":"🇨🇭","DINAMARCA":"🇩🇰","AUSTRIA":"🇦🇹","UCRANIA":"🇺🇦","TURQUIA":"🇹🇷","HUNGRIA":"🇭🇺","REPUBLICA CHECA":"🇨🇿","GRECIA":"🇬🇷","JAPON":"🇯🇵","REPUBLICA DE COREA":"🇰🇷","COREA DEL SUR":"🇰🇷","AUSTRALIA":"🇦🇺","IRAN":"🇮🇷","ARABIA SAUDITA":"🇸🇦","QATAR":"🇶🇦","MARRUECOS":"🇲🇦","SENEGAL":"🇸🇳","GHANA":"🇬🇭","CAMERUN":"🇨🇲","NIGERIA":"🇳🇬","TUNEZ":"🇹🇳","SUDAFRICA":"🇿🇦","EGIPTO":"🇪🇬","COSTA RICA":"🇨🇷","PANAMA":"🇵🇦","HONDURAS":"🇭🇳","JAMAICA":"🇯🇲","INDONESIA":"🇮🇩","NUEVA ZELANDA":"🇳🇿","GALES":"🏴󠁧󠁢󠁷󠁬󠁳󠁿","ESCOCIA":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","INGLATERRA":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","POLONIA":"🇵🇱","RUMANIA":"🇷🇴","ESLOVENIA":"🇸🇮","ESLOVAQUIA":"🇸🇰","ALBANIA":"🇦🇱","ARGELIA":"🇩🇿","COSTA DE MARFIL":"🇨🇮","NORUEGA":"🇳🇴","SUECIA":"🇸🇪","IRLANDA":"🇮🇪","TRINIDAD Y TOBAGO":"🇹🇹","EL SALVADOR":"🇸🇻","GUATEMALA":"🇬🇹"};
function flag(name) { return FLAGS[(name||'').toUpperCase()] || '🏳️'; }

async function fetchDatum(collection, method = 'GET', body = null, id = '', query = '') {
  const url = `${BASE_URL}/${collection}/records${id ? '/' + id : ''}?perPage=500${query}`;
  const options = {
    method,
    headers: { 'X-Api-Key': API_KEY, 'Content-Type': 'application/json' }
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
  if (method === 'DELETE' || res.status === 204) return true;
  return await res.json();
}

export default async function handler(req) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('user_id') || 'GUEST';
  const paramFecha = url.searchParams.get('fecha');
  const fechaSimulada = paramFecha || "2026-06-11";

  const bracketLocked = "2026-06-11" <= fechaSimulada;

  // --- POST ---
  if (req.method === 'POST') {
    if (bracketLocked) {
      return new Response(JSON.stringify({ error: "El mundial ya inicio, los brackets estan cerrados." }), { status: 403 });
    }
    try {
      const body = await req.json();
      const existingReq = await fetchDatum('pronosticos_brackets', 'GET', null, '', `&filter=(user_id='${userId}')`);
      const existingItems = existingReq.items || existingReq;
      const payload = {
        user_id: userId, dieciseisavos: body.dieciseisavos, octavos: body.octavos,
        cuartos: body.cuartos, semis: body.semis, cuarto_lugar: body.cuarto_lugar,
        tercer_lugar: body.tercer_lugar, subcampeon: body.subcampeon, campeon: body.campeon, locked: false
      };
      if (existingItems && existingItems.length > 0) {
        await fetchDatum('pronosticos_brackets', 'PATCH', payload, existingItems[0].id);
      } else {
        await fetchDatum('pronosticos_brackets', 'POST', payload);
      }
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  // --- GET ---
  let teams = new Set();
  try {
    const dataMatches = await fetchDatum('pbc_631836067');
    const m = Array.isArray(dataMatches) ? dataMatches : (dataMatches.items || []);
    m.forEach(x => { teams.add(x.equipo_local); teams.add(x.equipo_visitante); });
  } catch (e) { }
  const allTeams = Array.from(teams).sort();

  let userBracket = { dieciseisavos: [], octavos: [], cuartos: [], semis: [], cuarto_lugar: '', tercer_lugar: '', subcampeon: '', campeon: '' };
  if (userId !== 'GUEST') {
    try {
      const dataB = await fetchDatum('pronosticos_brackets', 'GET', null, '', `&filter=(user_id='${userId}')`);
      const bItems = Array.isArray(dataB) ? dataB : (dataB.items || []);
      if (bItems.length > 0) userBracket = bItems[0];
    } catch (e) { }
  }

  // Build team buttons with flags (all string concat, no nested template literals)
  const flagsJson = JSON.stringify(FLAGS);

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Mi Bracket - Quiniela 2026</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --navy: #0A0A2E;
      --navy-light: #141440;
      --navy-surface: #1C1C50;
      --turquoise: #00E6C3;
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
      background-color: var(--navy); color: var(--text); padding-bottom: 100px;
      background-image:
        radial-gradient(ellipse at top right, rgba(123,97,255,0.12) 0%, transparent 50%),
        radial-gradient(ellipse at bottom left, rgba(0,230,195,0.08) 0%, transparent 50%);
    }

    .header {
      padding: 30px 20px 20px;
      background: linear-gradient(180deg, rgba(123,97,255,0.2) 0%, transparent 100%);
      text-align: center; position: sticky; top:0; z-index: 10; backdrop-filter: blur(10px);
    }
    .header-tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(0,230,195,0.12);
      border: 1px solid rgba(0,230,195,0.25); padding: 4px 14px; border-radius: 20px;
      color: var(--turquoise); font-size: 10px; font-weight: 700; letter-spacing: 1px; margin-bottom: 10px; }
    h1 { font-size: 26px; font-weight: 900;
      background: linear-gradient(135deg, #FFF 0%, var(--turquoise) 60%, var(--magenta) 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .subtitle { color: var(--text-secondary); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; }

    .container { padding: 20px; max-width: 600px; margin: 0 auto; }

    .phase-card {
      background: var(--navy-light); border-radius: 20px; margin-bottom: 24px;
      border: 1px solid rgba(255,255,255,0.06); padding: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    }
    .phase-title {
      font-size: 18px; font-weight: 800; margin-bottom: 12px; padding-bottom: 10px;
      border-bottom: 2px solid rgba(123,97,255,0.2);
      display: flex; justify-content: space-between; align-items: center;
      background: linear-gradient(90deg, var(--turquoise), var(--purple));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .phase-counter { font-size: 13px; color: var(--text-muted); font-weight: 600;
      -webkit-text-fill-color: var(--text-muted); }

    .grid-teams { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px; }

    .team-btn {
      background: var(--navy-surface); border: 1px solid rgba(255,255,255,0.08);
      color: var(--text-secondary); padding: 10px 6px; border-radius: 12px;
      text-align: center; cursor: pointer; transition: 0.2s;
      display: flex; flex-direction: column; align-items: center; gap: 4px;
    }
    .team-btn .team-flag { font-size: 28px; line-height: 1; }
    .team-btn .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }

    .team-btn.selected {
      background: rgba(0,230,195,0.12); border-color: var(--turquoise); color: var(--turquoise);
    }

    .select-podium {
      width: 100%; padding: 14px; background: var(--navy-surface); color: #FFF;
      border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; margin-bottom: 12px;
      font-size: 15px; font-family: 'Outfit', sans-serif; appearance: none;
    }
    .locked-badge {
      display: block; background: linear-gradient(135deg, var(--red), var(--magenta));
      color: #FFF; text-align: center; padding: 12px; border-radius: 12px;
      margin-bottom: 20px; font-weight: 800;
    }

    .bottom-bar { position: fixed; bottom: 0; left: 0; width: 100%; padding: 20px;
      background: rgba(10,10,46,0.95); backdrop-filter: blur(10px); z-index: 50;
      display: flex; justify-content: center; }
    .btn-save {
      background: linear-gradient(135deg, var(--turquoise) 0%, var(--blue) 50%, var(--purple) 100%);
      background-size: 200% 200%; animation: gradShift 4s ease infinite;
      color: #003D33; border: none; padding: 16px 40px; border-radius: 30px;
      font-family: 'Outfit'; font-size: 17px; font-weight: 900; cursor: pointer;
      width: 100%; max-width: 400px; text-transform: uppercase; letter-spacing: 1px;
      box-shadow: 0 4px 24px rgba(0,230,195,0.25);
    }
    @keyframes gradShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }

    .toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-100px);
      background: var(--turquoise); color: #003D33; padding: 15px 30px; border-radius: 30px;
      font-weight: 900; z-index: 100; transition: transform 0.4s; box-shadow: 0 4px 24px rgba(0,230,195,0.3); }
    .toast.show { transform: translateX(-50%) translateY(0); }

    label { display: block; font-size: 14px; font-weight: 700; margin: 10px 0 6px; color: var(--text-secondary); }
  </style>
</head>
<body>

  <div class="toast" id="toast">✅ Bracket Guardado!</div>

  <div class="header">
    <div class="header-tag">⚽ FIFA WORLD CUP 2026</div>
    <h1>CLASIFICATORIAS</h1>
    <div class="subtitle">Arma tu arbol de predicciones</div>
  </div>

  <div class="container">
    ${bracketLocked ? '<div class="locked-badge">🔒 BRACKETS CERRADOS — El mundial ha comenzado</div>' : ''}

    <div class="phase-card"><div class="phase-title">DIECISEISAVOS <span class="phase-counter"><span id="c-32">0</span>/32</span></div>
      <div style="font-size:11px;color:var(--text-muted);margin-bottom:12px;">Selecciona 32 equipos que pasan de la fase de grupos</div>
      <div class="grid-teams" id="grid-32"></div></div>

    <div class="phase-card"><div class="phase-title">OCTAVOS DE FINAL <span class="phase-counter"><span id="c-16">0</span>/16</span></div>
      <div class="grid-teams" id="grid-16"></div></div>

    <div class="phase-card"><div class="phase-title">CUARTOS DE FINAL <span class="phase-counter"><span id="c-8">0</span>/8</span></div>
      <div class="grid-teams" id="grid-8"></div></div>

    <div class="phase-card"><div class="phase-title">SEMIFINALES <span class="phase-counter"><span id="c-4">0</span>/4</span></div>
      <div class="grid-teams" id="grid-4"></div></div>

    <div class="phase-card"><div class="phase-title">EL GRAN PODIO</div>
      <div style="font-size:11px;color:var(--text-muted);margin-bottom:12px;">Elige al campeon y los siguientes lugares (de las Semis)</div>
      <label>🏆 Campeon Mundial</label><select id="sel-1" class="select-podium"><option value="">-- Elige --</option></select>
      <label>🥈 Subcampeon</label><select id="sel-2" class="select-podium"><option value="">-- Elige --</option></select>
      <label>🥉 Tercer Lugar</label><select id="sel-3" class="select-podium"><option value="">-- Elige --</option></select>
      <label>🏅 Cuarto Lugar</label><select id="sel-4" class="select-podium"><option value="">-- Elige --</option></select>
    </div>
  </div>

  ${!bracketLocked ? '<div class="bottom-bar"><button class="btn-save" id="btnSave" onclick="save()">GUARDAR MI BRACKET</button></div>' : ''}

  <script>
    const ALL_TEAMS = ${JSON.stringify(allTeams)};
    const FLAGS_MAP = ${flagsJson};
    const db_bracket = ${JSON.stringify(userBracket)};
    function getFlag(name) { return FLAGS_MAP[(name||'').toUpperCase()] || '🏳️'; }

    const sel = {
      32: new Set(db_bracket.dieciseisavos || []),
      16: new Set(db_bracket.octavos || []),
      8: new Set(db_bracket.cuartos || []),
      4: new Set(db_bracket.semis || [])
    };
    const podium = {
      campeon: db_bracket.campeon || '', subcampeon: db_bracket.subcampeon || '',
      tercero: db_bracket.tercer_lugar || '', cuarto: db_bracket.cuarto_lugar || ''
    };
    const isLocked = ${bracketLocked};

    function renderPhase(idNum, max, sourceArray) {
      const grid = document.getElementById('grid-'+idNum);
      const count = document.getElementById('c-'+idNum);
      grid.innerHTML = ''; count.textContent = sel[idNum].size;
      const currentSet = sel[idNum];
      Array.from(currentSet).forEach(t => { if (!sourceArray.includes(t)) currentSet.delete(t); });
      sourceArray.forEach(t => {
        const div = document.createElement('div');
        const isActive = sel[idNum].has(t);
        div.className = 'team-btn' + (isActive ? ' selected' : '');
        div.innerHTML = '<span class="team-flag">' + getFlag(t) + '</span><span class="team-label">' + t + '</span>';
        if (!isLocked) {
          div.onclick = () => {
            if (isActive) { sel[idNum].delete(t); }
            else { if (sel[idNum].size < max) sel[idNum].add(t); else return; }
            cascadeRender();
          };
        }
        grid.appendChild(div);
      });
    }

    function renderPodium() {
      const arr4 = Array.from(sel[4]);
      ['sel-1','sel-2','sel-3','sel-4'].forEach(id => {
        const el = document.getElementById(id);
        const currVal = el.value || podium[{'sel-1':'campeon','sel-2':'subcampeon','sel-3':'tercero','sel-4':'cuarto'}[id]];
        el.innerHTML = '<option value="">-- Elige --</option>' + arr4.map(t =>
          '<option value="' + t + '" ' + (currVal === t ? 'selected':'') + '>' + getFlag(t) + ' ' + t + '</option>'
        ).join('');
        if(isLocked) el.disabled = true;
      });
    }

    function cascadeRender() {
      renderPhase(32, 32, ALL_TEAMS);
      renderPhase(16, 16, Array.from(sel[32]));
      renderPhase(8, 8, Array.from(sel[16]));
      renderPhase(4, 4, Array.from(sel[8]));
      renderPodium();
    }
    cascadeRender();

    async function save() {
      if(isLocked) return;
      const payload = {
        dieciseisavos: Array.from(sel[32]), octavos: Array.from(sel[16]),
        cuartos: Array.from(sel[8]), semis: Array.from(sel[4]),
        campeon: document.getElementById('sel-1').value,
        subcampeon: document.getElementById('sel-2').value,
        tercer_lugar: document.getElementById('sel-3').value,
        cuarto_lugar: document.getElementById('sel-4').value
      };
      const btn = document.getElementById('btnSave');
      btn.innerHTML = 'GUARDANDO...';
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('user_id') || 'GUEST';
      const fecha = urlParams.get('fecha') || '';
      const res = await fetch('/api/clasificatorias?user_id=' + userId + (fecha ? '&fecha=' + fecha : ''), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if(res.ok) {
        document.getElementById('toast').classList.add('show');
        setTimeout(() => document.getElementById('toast').classList.remove('show'), 3000);
      } else {
        try { const e = await res.json(); alert('Error: ' + e.error); } catch(x) { alert('Error HTTP: ' + res.status); }
      }
      btn.innerHTML = 'GUARDAR MI BRACKET';
    }
  </script>
</body>
</html>`;

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
