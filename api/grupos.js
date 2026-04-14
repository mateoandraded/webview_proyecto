export const config = {
  runtime: 'edge',
};

// Configuración de Datum API
const API_KEY = "db_HQIwDXV9xkJTEU5F3wwYAGhHAGInsItCu79g5FSz6e3106ee";
const BASE_URL = "https://mateoacademy-9djnmu.jelou.cloud/api/collections";

// Utilidad para fetch seguro
async function fetchDatum(collection, method = 'GET', body = null, id = '') {
  const url = `${BASE_URL}/${collection}/records${id ? '/' + id : ''}?perPage=500`;
  const options = {
    method,
    headers: {
      'X-Api-Key': API_KEY,
      'Content-Type': 'application/json'
    }
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

  // --- MANEJO DE POST (Guardar Pronósticos) ---
  if (req.method === 'POST') {
    try {
      const body = await req.json(); // Array de { match_id, local_score, visitor_score, ... }

      // 1. Obtener los pronósticos actuales del usuario para hacer PATCH o POST
      const existingReq = await fetchDatum(`pbc_1944158292?filter=(user_id='${userId}')`);
      const existingItems = existingReq.items || existingReq;

      for (const p of body) {
        // Ignorar si el partido ya estaba "Locked" (validación simple)
        if (p.locked) continue;

        const recordId = existingItems.find(e => e.match_id === p.match_id)?.id;

        const payload = {
          user_id: userId,
          match_id: p.match_id,
          equipo_local: p.equipo_local,
          equipo_visitante: p.equipo_visitante,
          pronostico_local: p.local_score,
          pronostico_visitante: p.visitor_score,
          fecha_partido: p.fecha,
          estado: 'PENDIENTE',
          resultado_real_local: 0,
          resultado_real_visitante: 0,
          puntos_ganados: 0
        };

        if (recordId) {
          // PATCH
          await fetchDatum('pbc_1944158292', 'PATCH', payload, recordId);
        } else {
          // POST
          try {
            await fetchDatum('pbc_1944158292', 'POST', payload);
          } catch (e) {
            console.error("Rate limit en batch POST. Omitiendo");
          }
        }
      }
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  // --- MANEJO DE GET (Renderizar WebView) ---

  // 1. Obtener todos los partidos
  let rawMatches = [];
  try {
    const dataMatches = await fetchDatum('pbc_631836067');
    rawMatches = Array.isArray(dataMatches) ? dataMatches : (dataMatches.items || []);
  } catch (e) {
    rawMatches = [];
  }

  // 2. Obtener pronósticos guardados del usuario (si tiene ID)
  let userPredictions = [];
  if (userId !== 'GUEST') {
    try {
      const dataPreds = await fetchDatum(`pbc_1944158292?filter=(user_id='${userId}')`);
      userPredictions = Array.isArray(dataPreds) ? dataPreds : (dataPreds.items || []);
    } catch (e) { }
  }

  // Máquina del tiempo simulada en frontend (hardcoded o env)
  // Usaremos un string YYYY-MM-DD para comparar. Por defecto, tomamos FECHA_HOY si existe.
  const fechaSimulada = "2026-06-11"; // Puedes cambiarla a "2026-06-12" para ver bloquearse partidos del 11.

  // 3. Procesar Partidos y agrupar por Fase_o_Grupo
  const groups = {};
  rawMatches.forEach(m => {
    const g = m.Fase_o_Grupo || "Sin Grupo";
    if (g.length > 1) return; // Solo grupos A-L, omitimos fases eliminatorias

    if (!groups[g]) groups[g] = [];

    // Validar predicción existente
    const up = userPredictions.find(pr => pr.match_id === m.id_partido);

    // Lógica Lock: Si la fecha del partido es menor a la simulada, SE BLOQUEA.
    const isLocked = m.fecha < fechaSimulada;

    groups[g].push({
      id: m.id_partido,
      local: m.equipo_local,
      visitante: m.equipo_visitante,
      fecha: m.fecha,
      hora: m.hora,
      real_l: m.resulltado_local || 0,
      real_v: m.resultado_visitante || 0,
      pred_l: up ? up.pronostico_local : null,
      pred_v: up ? up.pronostico_visitante : null,
      locked: isLocked,
      has_pred: !!up
    });
  });

  // Ordenar grupos alfabéticamente
  const groupKeys = Object.keys(groups).sort();

  // 4. Inyectar en HTML (Bordeaux & Gold Aesthetics)
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Fase de Grupos - Quiniela 2026</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Outfit:wght@700;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #4A0E17;     /* Bordeaux Profundo */
      --secondary: #900020;   /* Carmín */
      --accent: #D4AF37;      /* Gold */
      --accent-glow: rgba(212, 175, 55, 0.4);
      --bg-dark: #0A0A0A;
      --surface: #1A1A1A;
      --surface-light: #2A2A2A;
      --text: #F8F9FA;
      --text-muted: #A0AEC0;
      
      --radius-lg: 20px;
      --radius-md: 12px;
      --shadow-acc: 0 8px 32px var(--accent-glow);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    
    body {
      background-color: var(--bg-dark);
      background-image: 
        radial-gradient(circle at 100% 0%, rgba(144, 0, 32, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 0% 100%, rgba(212, 175, 55, 0.1) 0%, transparent 50%);
      color: var(--text);
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      padding-bottom: 90px;
    }

    .header {
      padding: 30px 20px 20px;
      background: linear-gradient(180deg, var(--primary) 0%, transparent 100%);
      position: sticky;
      top: 0;
      z-index: 10;
      backdrop-filter: blur(10px);
    }

    .title-wrap { text-align: center; }
    h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 28px;
      font-weight: 900;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 5px;
    }
    .subtitle { color: var(--text-muted); font-size: 14px; }

    .container {
      padding: 0 20px;
      max-width: 600px;
      margin: 0 auto;
    }

    /* Accordion / Groups */
    .group-card {
      background: var(--surface);
      border-radius: var(--radius-lg);
      margin-bottom: 20px;
      border: 1px solid rgba(255,255,255,0.05);
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }

    .group-header {
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--surface-light);
      cursor: pointer;
      font-family: 'Outfit', sans-serif;
      font-size: 20px;
      font-weight: 700;
      color: var(--accent);
    }
    
    .group-content { padding: 0 15px; }
    
    /* Matches */
    .match-row {
      padding: 20px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .match-row:last-child { border-bottom: none; }

    .match-info {
      text-align: center;
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 15px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
    }
    .badge-locked {
      background: #333;
      padding: 3px 8px;
      border-radius: 10px;
      font-size: 10px;
      color: #FFF;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    
    .match-teams {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .team-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    
    .team-name {
      font-weight: 600;
      font-size: 14px;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Stepper (Botones + / -) */
    .stepper {
      display: flex;
      align-items: center;
      background: #000;
      border-radius: var(--radius-md);
      padding: 5px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .stepper button {
      background: var(--surface-light);
      color: var(--text);
      border: none;
      width: 35px;
      height: 35px;
      border-radius: 8px;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
    }
    .stepper button:active { transform: scale(0.9); background: var(--secondary); }
    .stepper input {
      background: transparent;
      border: none;
      color: var(--accent);
      font-size: 22px;
      font-weight: 800;
      width: 40px;
      text-align: center;
      font-family: 'Outfit', sans-serif;
    }
    
    .stepper.locked { opacity: 0.7; pointer-events: none; border-color: var(--secondary); background: rgba(144,0,32,0.2); }
    .stepper.locked button { display: none; }
    .stepper.locked input { width: 100%; color: #FFF; }

    .vs-badge {
      font-family: 'Outfit', sans-serif;
      font-weight: 900;
      color: var(--secondary);
      font-size: 16px;
    }

    /* Fixed Bottom Bar */
    .bottom-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 20px;
      background: rgba(10, 10, 10, 0.95);
      backdrop-filter: blur(10px);
      border-top: 1px solid rgba(255,255,255,0.05);
      z-index: 50;
      display: flex;
      justify-content: center;
    }
    
    .btn-save {
      background: linear-gradient(135deg, var(--accent) 0%, #B89630 100%);
      color: var(--bg-dark);
      border: none;
      padding: 16px 40px;
      border-radius: 30px;
      font-family: 'Outfit', sans-serif;
      font-size: 18px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: var(--shadow-acc);
      width: 100%;
      max-width: 400px;
      transition: all 0.3s;
    }
    .btn-save:active { transform: scale(0.98); }
    .btn-save.loading { opacity: 0.7; pointer-events: none; }

    /* Modal / Toast */
    .toast {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(-100px);
      background: var(--accent);
      color: var(--bg-dark);
      padding: 15px 30px;
      border-radius: 30px;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      z-index: 100;
      transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: var(--shadow-acc);
    }
    .toast.show { transform: translateX(-50%) translateY(0); }

  </style>
</head>
<body>

  <div class="toast" id="toast">✅ ¡Pronósticos Guardados!</div>

  <div class="header">
    <div class="title-wrap">
      <h1>FASE DE GRUPOS</h1>
      <div class="subtitle">Pronostica los resultados del Mundial</div>
    </div>
  </div>

  <div class="container">
    ${groupKeys.map(gk => {
    const matchHtml = groups[gk].map(m => {

      let valL = '', valV = '';
      if (m.locked) {
        valL = m.real_l;
        valV = m.real_v;
      } else {
        valL = m.pred_l !== null ? m.pred_l : '';
        valV = m.pred_v !== null ? m.pred_v : '';
      }

      const lockClass = m.locked ? 'locked' : '';
      const badge = m.locked ? '<span class="badge-locked">🔒 Finalizado</span>' : '⏱ PENDIENTE';

      return \`
          <div class="match-row" data-id="\${m.id}" data-locked="\${m.locked}" data-f="\${m.fecha}" data-l="\${m.local}" data-v="\${m.visitante}">
            <div class="match-info">
              <span>\${m.fecha}</span>
              \${badge}
            </div>
            
            <div class="match-teams">
              <div class="team-col">
                <span class="team-name">\${m.local}</span>
                <div class="stepper \${lockClass}">
                  <button type="button" onclick="step(this, -1)">-</button>
                  <input type="number" class="score-input input-local" value="\${valL}" readonly placeholder="-">
                  <button type="button" onclick="step(this, 1)">+</button>
                </div>
              </div>
              
              <div class="vs-badge">VS</div>
              
              <div class="team-col">
                <span class="team-name">\${m.visitante}</span>
                <div class="stepper \${lockClass}">
                  <button type="button" onclick="step(this, -1)">-</button>
                  <input type="number" class="score-input input-visitor" value="\${valV}" readonly placeholder="-">
                  <button type="button" onclick="step(this, 1)">+</button>
                </div>
              </div>
            </div>
          </div>
        \`;
      }).join('');

      return \`
        <div class="group-card">
          <div class="group-header" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">
            GRUPO \${gk} <span style="font-size:12px; color:#A0AEC0;">▼</span>
          </div>
          <div class="group-content" style="display:block;">
            \${matchHtml}
          </div>
        </div>
      \`;
    }).join('')}
  </div>

  <div class="bottom-bar">
    <button class="btn-save" id="btnSave" onclick="save()">GUARDAR MIS PRONÓSTICOS</button>
  </div>

  <script>
    function step(btn, amount) {
      const input = btn.parentElement.querySelector('input');
      let val = parseInt(input.value);
      if (isNaN(val)) val = 0;
      val += amount;
      if (val < 0) val = 0;
      if (val > 20) val = 20;
      input.value = val;
    }

    async function save() {
      const btn = document.getElementById('btnSave');
      btn.innerHTML = 'GUARDANDO...';
      btn.classList.add('loading');

      const payload = [];
      document.querySelectorAll('.match-row').forEach(row => {
        const isLocked = row.getAttribute('data-locked') === 'true';
        if (isLocked) return;

        const valL = row.querySelector('.input-local').value;
        const valV = row.querySelector('.input-visitor').value;
        
        if (valL !== '' && valV !== '') {
          payload.push({
            match_id: row.getAttribute('data-id'),
            equipo_local: row.getAttribute('data-l'),
            equipo_visitante: row.getAttribute('data-v'),
            fecha: row.getAttribute('data-f'),
            local_score: parseInt(valL),
            visitor_score: parseInt(valV),
            locked: false
          });
        }
      });

      if (payload.length === 0) {
        btn.innerHTML = 'GUARDAR MIS PRONÓSTICOS';
        btn.classList.remove('loading');
        return;
      }

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('user_id') || 'GUEST';
        
        const res = await fetch('/api/grupos?user_id=' + userId, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (res.ok) {
          const toast = document.getElementById('toast');
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 3000);
        } else {
          alert('Error al guardar. Intenta de nuevo.');
        }
      } catch (err) {
        alert('Error de red.');
      }

      btn.innerHTML = 'GUARDAR MIS PRONÓSTICOS';
      btn.classList.remove('loading');
    }
  </script>
</body>
</html>`;

      return new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
