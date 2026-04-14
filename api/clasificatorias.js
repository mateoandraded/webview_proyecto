export const config = {
  runtime: 'edge',
};

const API_KEY = "db_HQIwDXV9xkJTEU5F3wwYAGhHAGInsItCu79g5FSz6e3106ee";
const BASE_URL = "https://mateoacademy-9djnmu.jelou.cloud/api/collections";

async function fetchDatum(collection, method = 'GET', body = null, id = '') {
  const url = `${BASE_URL}/${collection}/records${id ? '/' + id : ''}?perPage=500`;
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
  const fechaSimulada = "2026-06-11";
  const hoyReal = new Date().toISOString().split('T')[0];

  // BLOQUEO GENERAL (Si el mundial ya empezó, se bloquean los brackets)
  const isLocked = fechaSimulada <= hoyReal; // Ejemplo de logica temporal estricta o simplemente lo dejamos disabled
  // Vamos a usar la lógica temporal estricta de "Si SimulationDate >= Inicio, lock".
  const bracketLocked = "2026-06-11" <= fechaSimulada; // Asumimos que si arranca el día 11, se cierra el bracket. Modifica esto luego.

  // --- POST ---
  if (req.method === 'POST') {
    if (bracketLocked) {
      return new Response(JSON.stringify({ error: "El mundial ya inició, los brackets están cerrados." }), { status: 403 });
    }

    try {
      const body = await req.json();
      const existingReq = await fetchDatum(`pronosticos_brackets?filter=(user_id='${userId}')`);
      const existingItems = existingReq.items || existingReq;

      const payload = {
        user_id: userId,
        dieciseisavos: body.dieciseisavos,
        octavos: body.octavos,
        cuartos: body.cuartos,
        semis: body.semis,
        cuarto_lugar: body.cuarto_lugar,
        tercer_lugar: body.tercer_lugar,
        subcampeon: body.subcampeon,
        campeon: body.campeon,
        locked: false
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
  // Obtener equipos
  let teams = new Set();
  try {
    const dataMatches = await fetchDatum('pbc_631836067');
    const m = Array.isArray(dataMatches) ? dataMatches : (dataMatches.items || []);
    m.forEach(x => { teams.add(x.equipo_local); teams.add(x.equipo_visitante); });
  } catch (e) { }

  const allTeams = Array.from(teams).sort();

  // Obtener Bracket actual del user
  let userBracket = {
    dieciseisavos: [], octavos: [], cuartos: [], semis: [],
    cuarto_lugar: '', tercer_lugar: '', subcampeon: '', campeon: ''
  };

  if (userId !== 'GUEST') {
    try {
      const dataB = await fetchDatum(`pronosticos_brackets?filter=(user_id='${userId}')`);
      const bItems = Array.isArray(dataB) ? dataB : (dataB.items || []);
      if (bItems.length > 0) userBracket = bItems[0];
    } catch (e) { }
  }

  // Render HTML
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Mi Bracket - Quiniela 2026</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Outfit:wght@700;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #4A0E17; --secondary: #900020; --accent: #D4AF37;
      --bg-dark: #0A0A0A; --surface: #1A1A1A; --surface-light: #2A2A2A; --surface-hover: #333333;
      --text: #F8F9FA; --text-muted: #A0AEC0; --radius-lg: 20px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; text-decoration: none; }
    body {
      background-color: var(--bg-dark); color: var(--text); padding-bottom: 100px;
      background-image: radial-gradient(circle at top right, rgba(144, 0, 32, 0.15) 0%, transparent 40%);
    }

    .header { padding: 30px 20px 20px; background: linear-gradient(180deg, var(--primary) 0%, transparent 100%); text-align: center; position: sticky; top:0; z-index: 10; backdrop-filter: blur(10px); }
    h1 { font-family: 'Outfit', sans-serif; font-size: 26px; color: var(--accent); }
    .subtitle { color: var(--text-muted); font-size: 13px; }

    .container { padding: 20px; max-width: 600px; margin: 0 auto; }

    .phase-card {
      background: var(--surface); border-radius: var(--radius-lg); margin-bottom: 30px;
      border: 1px solid rgba(255,255,255,0.05); padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    }
    
    .phase-title {
      font-family: 'Outfit', sans-serif; font-size: 20px; color: var(--accent); margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;
      display: flex; justify-content: space-between;
    }
    .phase-counter { font-size: 14px; color: var(--text-muted); font-weight: 400; }

    .grid-teams { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; }
    
    .team-btn {
      background: var(--surface-light); border: 1px solid rgba(255,255,255,0.1); color: var(--text-muted);
      padding: 12px; border-radius: 10px; text-align: center; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s;
    }
    
    .team-btn.selected {
      background: rgba(212, 175, 55, 0.15); border-color: var(--accent); color: var(--accent);
    }
    .team-btn.disabled { opacity: 0.4; pointer-events: none; }

    .select-podium {
        width: 100%; padding: 15px; background: var(--surface-light); color: #FFF; border: 1px solid rgba(255,255,255,0.2);
        border-radius: 10px; margin-bottom: 15px; font-size: 15px; font-family: 'Inter', sans-serif; appearance: none;
    }
    .locked-badge {
      display: block; background: #900020; color: #FFF; text-align: center; padding: 10px; border-radius: 10px; margin-bottom: 20px; font-family: 'Outfit';
    }

    .bottom-bar { position: fixed; bottom: 0; left: 0; width: 100%; padding: 20px; background: rgba(10, 10, 10, 0.95); backdrop-filter: blur(10px); z-index: 50; display: flex; justify-content: center; }
    .btn-save { background: linear-gradient(135deg, var(--accent) 0%, #B89630 100%); color: var(--bg-dark); border: none; padding: 16px 40px; border-radius: 30px; font-family: 'Outfit'; font-size: 18px; font-weight: 800; cursor: pointer; width: 100%; max-width: 400px; }
    .toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-100px); background: var(--accent); color: var(--bg-dark); padding: 15px 30px; border-radius: 30px; font-family: 'Outfit'; font-weight: 800; z-index: 100; transition: transform 0.4s; }
    .toast.show { transform: translateX(-50%) translateY(0); }
  </style>
</head>
<body>
  
  <div class="toast" id="toast">✅ ¡Bracket Guardado!</div>

  <div class="header">
    <h1>CLASIFICATORIAS</h1>
    <div class="subtitle">Arma tu árbol de predicciones</div>
  </div>

  <div class="container">
    ${bracketLocked ? '<div class="locked-badge">🔒 Llaver CERRADAS. El mundial ha comenzado.</div>' : ''}

    <div class="phase-card" id="phase-32">
      <div class="phase-title">DIECISEISAVOS <span class="phase-counter"><span id="c-32"></span> / 32</span></div>
      <div class="subtitle" style="margin-bottom: 15px;">Selecciona 32 equipos que pasan de la fase de grupos.</div>
      <div class="grid-teams" id="grid-32"></div>
    </div>

    <div class="phase-card" id="phase-16">
      <div class="phase-title">OCTAVOS DE FINAL <span class="phase-counter"><span id="c-16"></span> / 16</span></div>
      <div class="grid-teams" id="grid-16"></div>
    </div>

    <div class="phase-card" id="phase-8">
      <div class="phase-title">CUARTOS DE FINAL <span class="phase-counter"><span id="c-8"></span> / 8</span></div>
      <div class="grid-teams" id="grid-8"></div>
    </div>

    <div class="phase-card" id="phase-4">
      <div class="phase-title">SEMIFINALES <span class="phase-counter"><span id="c-4"></span> / 4</span></div>
      <div class="grid-teams" id="grid-4"></div>
    </div>

    <div class="phase-card" id="phase-p">
      <div class="phase-title">EL GRAN PODIO</div>
      <div class="subtitle" style="margin-bottom: 10px;">Selecciona al Campeón y los siguientes lugares (Solo puedes elegir equipos que entraron a Semis).</div>
      
      <label>🏆 Campeón Mundial</label>
      <select id="sel-1" class="select-podium"><option value="">-- Elige Equipo --</option></select>
      
      <label>🥈 Subcampeón</label>
      <select id="sel-2" class="select-podium"><option value="">-- Elige Equipo --</option></select>
      
      <label>🥉 Tercer Lugar</label>
      <select id="sel-3" class="select-podium"><option value="">-- Elige Equipo --</option></select>
      
      <label>🏅 Cuarto Lugar</label>
      <select id="sel-4" class="select-podium"><option value="">-- Elige Equipo --</option></select>
    </div>
  </div>

  ${!bracketLocked ? '<div class="bottom-bar"><button class="btn-save" id="btnSave" onclick="save()">GUARDAR MI BRACKET</button></div>' : ''}

  <script>
    const ALL_TEAMS = ${JSON.stringify(allTeams)};
    const db_bracket = ${JSON.stringify(userBracket)};
    
    // State
    const sel = {
      32: new Set(db_bracket.dieciseisavos || []),
      16: new Set(db_bracket.octavos || []),
      8: new Set(db_bracket.cuartos || []),
      4: new Set(db_bracket.semis || [])
    };
    const podium = {
      campeon: db_bracket.campeon || '',
      subcampeon: db_bracket.subcampeon || '',
      tercero: db_bracket.tercer_lugar || '',
      cuarto: db_bracket.cuarto_lugar || ''
    };

    const isLocked = ${bracketLocked};

    function renderPhase(idNum, max, sourceArray) {
      const grid = document.getElementById('grid-'+idNum);
      const count = document.getElementById('c-'+idNum);
      
      grid.innerHTML = '';
      count.textContent = sel[idNum].size;

      // Limpiar eliminados (side-effect: si des-seleccionó arriba, se borra abajo)
      const currentSet = sel[idNum];
      Array.from(currentSet).forEach(t => { if (!sourceArray.includes(t)) currentSet.delete(t); });

      sourceArray.forEach(t => {
        const div = document.createElement('div');
        const isActive = sel[idNum].has(t);
        div.className = 'team-btn' + (isActive ? ' selected' : '');
        div.textContent = t;
        
        if (!isLocked) {
            div.onclick = () => {
              if (isActive) {
                 sel[idNum].delete(t);
              } else {
                 if (sel[idNum].size < max) sel[idNum].add(t);
                 else return; // límite
              }
              cascadeRender();
            };
        }
        grid.appendChild(div);
      });
    }

    function renderPodium() {
      const arr4 = Array.from(sel[4]);
      ['sel-1', 'sel-2', 'sel-3', 'sel-4'].forEach(id => {
        const el = document.getElementById(id);
        const currVal = el.value || podium[ { 'sel-1':'campeon', 'sel-2':'subcampeon', 'sel-3':'tercero', 'sel-4':'cuarto' }[id] ];
        
        el.innerHTML = '<option value="">-- Elige Equipo --</option>' + arr4.map(t => \`<option value="\${t}" \${currVal === t ? 'selected':''}>\${t}</option>\`).join('');
        if(isLocked) el.disabled = true;
      });
    }

    function cascadeRender() {
      // 32 lee de TODOS
      renderPhase(32, 32, ALL_TEAMS);
      // 16 lee de 32
      renderPhase(16, 16, Array.from(sel[32]));
      // 8 lee de 16
      renderPhase(8, 8, Array.from(sel[16]));
      // 4 lee de 8
      renderPhase(4, 4, Array.from(sel[8]));
      // Podio lee de 4
      renderPodium();
    }

    // Init
    cascadeRender();

    async function save() {
      if(isLocked) return;
      const payload = {
        dieciseisavos: Array.from(sel[32]),
        octavos: Array.from(sel[16]),
        cuartos: Array.from(sel[8]),
        semis: Array.from(sel[4]),
        campeon: document.getElementById('sel-1').value,
        subcampeon: document.getElementById('sel-2').value,
        tercer_lugar: document.getElementById('sel-3').value,
        cuarto_lugar: document.getElementById('sel-4').value
      };

      const btn = document.getElementById('btnSave');
      btn.innerHTML = 'GUARDANDO...';
      
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('user_id') || 'GUEST';

      const res = await fetch('/api/clasificatorias?user_id=' + userId, {
          method: 'POST', body: JSON.stringify(payload)
      });

      if(res.ok) {
        document.getElementById('toast').classList.add('show');
        setTimeout(() => document.getElementById('toast').classList.remove('show'), 3000);
      } else {
        alert("Error al guardar");
      }
      btn.innerHTML = 'GUARDAR MI BRACKET';
    }
  </script>
</body>
</html>`;

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
