export const config = {
  runtime: 'edge',
};

const API_KEY = "db_HQIwDXV9xkJTEU5F3wwYAGhHAGInsItCu79g5FSz6e3106ee";
const BASE_URL = "https://mateoacademy-9djnmu.jelou.cloud/api/collections";

const FLAGS = {"MEXICO":"🇲🇽","ESTADOS UNIDOS":"🇺🇸","CANADA":"🇨🇦","BRASIL":"🇧🇷","ARGENTINA":"🇦🇷","ECUADOR":"🇪🇨","COLOMBIA":"🇨🇴","PERU":"🇵🇪","CHILE":"🇨🇱","URUGUAY":"🇺🇾","PARAGUAY":"🇵🇾","BOLIVIA":"🇧🇴","VENEZUELA":"🇻🇪","ALEMANIA":"🇩🇪","ESPANA":"🇪🇸","ESPAÑA":"🇪🇸","FRANCIA":"🇫🇷","ITALIA":"🇮🇹","PORTUGAL":"🇵🇹","PAISES BAJOS":"🇳🇱","BELGICA":"🇧🇪","CROACIA":"🇭🇷","SERBIA":"🇷🇸","SUIZA":"🇨🇭","DINAMARCA":"🇩🇰","AUSTRIA":"🇦🇹","UCRANIA":"🇺🇦","TURQUIA":"🇹🇷","HUNGRIA":"🇭🇺","REPUBLICA CHECA":"🇨🇿","GRECIA":"🇬🇷","JAPON":"🇯🇵","REPUBLICA DE COREA":"🇰🇷","COREA DEL SUR":"🇰🇷","AUSTRALIA":"🇦🇺","IRAN":"🇮🇷","ARABIA SAUDITA":"🇸🇦","QATAR":"🇶🇦","MARRUECOS":"🇲🇦","SENEGAL":"🇸🇳","GHANA":"🇬🇭","CAMERUN":"🇨🇲","NIGERIA":"🇳🇬","TUNEZ":"🇹🇳","SUDAFRICA":"🇿🇦","EGIPTO":"🇪🇬","COSTA RICA":"🇨🇷","PANAMA":"🇵🇦","HONDURAS":"🇭🇳","JAMAICA":"🇯🇲","INDONESIA":"🇮🇩","NUEVA ZELANDA":"🇳🇿","GALES":"🏴󠁧󠁢󠁷󠁬󠁳󠁿","ESCOCIA":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","INGLATERRA":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","POLONIA":"🇵🇱","RUMANIA":"🇷🇴","ESLOVENIA":"🇸🇮","ESLOVAQUIA":"🇸🇰","ALBANIA":"🇦🇱","ARGELIA":"🇩🇿","COSTA DE MARFIL":"🇨🇮","NORUEGA":"🇳🇴","SUECIA":"🇸🇪","IRLANDA":"🇮🇪","TRINIDAD Y TOBAGO":"🇹🇹","EL SALVADOR":"🇸🇻","GUATEMALA":"🇬🇹"};
function flag(n) { return FLAGS[(n||'').toUpperCase()] || '🏳️'; }

async function fetchDatum(collection, method = 'GET', body = null, id = '', query = '') {
  const url = `${BASE_URL}/${collection}/records${id ? '/' + id : ''}?perPage=500${query}`;
  const options = { method, headers: { 'X-Api-Key': API_KEY, 'Content-Type': 'application/json' } };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
  if (method === 'DELETE' || res.status === 204) return true;
  return await res.json();
}

export default async function handler(req) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('user_id') || 'GUEST';

  // --- POST ---
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const existingReq = await fetchDatum('pbc_1944158292', 'GET', null, '', `&filter=(user_id='${userId}')`);
      const existingItems = existingReq.items || existingReq;
      for (const p of body) {
        if (p.locked) continue;
        const recordId = existingItems.find(e => e.match_id === p.match_id)?.id;
        const payload = {
          user_id: userId, match_id: p.match_id, equipo_local: p.equipo_local,
          equipo_visitante: p.equipo_visitante, pronostico_local: p.local_score,
          pronostico_visitante: p.visitor_score, fecha_partido: p.fecha,
          estado: 'PENDIENTE', resultado_real_local: 0, resultado_real_visitante: 0, puntos_ganados: 0
        };
        if (recordId) { await fetchDatum('pbc_1944158292', 'PATCH', payload, recordId); }
        else { try { await fetchDatum('pbc_1944158292', 'POST', payload); } catch(e) {} }
      }
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  // --- GET ---
  let rawMatches = [];
  try {
    const dataMatches = await fetchDatum('pbc_631836067');
    rawMatches = Array.isArray(dataMatches) ? dataMatches : (dataMatches.items || []);
  } catch (e) { rawMatches = []; }

  let userPredictions = [];
  if (userId !== 'GUEST') {
    try {
      const dataPreds = await fetchDatum('pbc_1944158292', 'GET', null, '', `&filter=(user_id='${userId}')`);
      userPredictions = Array.isArray(dataPreds) ? dataPreds : (dataPreds.items || []);
    } catch (e) { }
  }

  const paramFecha = url.searchParams.get('fecha');
  const fechaSimulada = paramFecha || "2026-06-11";

  const groups = {};
  rawMatches.forEach(m => {
    const g = m.Fase_o_Grupo || "X";
    if (g.length > 1) return;
    if (!groups[g]) groups[g] = [];
    const up = userPredictions.find(pr => pr.match_id === m.id_partido);
    const isLocked = m.fecha < fechaSimulada;
    groups[g].push({
      id: m.id_partido, local: m.equipo_local, visitante: m.equipo_visitante,
      fecha: m.fecha, hora: m.hora, real_l: m.resulltado_local || 0, real_v: m.resultado_visitante || 0,
      pred_l: up ? up.pronostico_local : null, pred_v: up ? up.pronostico_visitante : null,
      locked: isLocked, has_pred: !!up
    });
  });
  const groupKeys = Object.keys(groups).sort();

  // Build body HTML using string concat (no nested template literals)
  let groupsHtml = '';
  groupKeys.forEach(gk => {
    let matchHtml = '';
    groups[gk].forEach(m => {
      let valL = '', valV = '';
      if (m.locked) { valL = m.real_l; valV = m.real_v; }
      else { valL = m.pred_l !== null ? m.pred_l : ''; valV = m.pred_v !== null ? m.pred_v : ''; }
      const lockClass = m.locked ? 'locked' : '';
      const badge = m.locked ? '<span class="badge-locked">🔒 Finalizado</span>' : '<span class="badge-pending">⏱ PENDIENTE</span>';

      matchHtml +=
        "<div class='match-row' data-id='" + m.id + "' data-locked='" + m.locked + "' data-f='" + m.fecha + "' data-l='" + m.local + "' data-v='" + m.visitante + "'>" +
          "<div class='match-info'><span>" + m.fecha + "</span> " + badge + "</div>" +
          "<div class='match-teams'>" +
            "<div class='team-col'>" +
              "<span class='team-flag'>" + flag(m.local) + "</span>" +
              "<span class='team-name'>" + m.local + "</span>" +
              "<div class='stepper " + lockClass + "'>" +
                "<button type='button' onclick='step(this,-1)'>−</button>" +
                "<input type='number' class='score-input input-local' value='" + valL + "' readonly placeholder='-'>" +
                "<button type='button' onclick='step(this,1)'>+</button>" +
              "</div>" +
            "</div>" +
            "<div class='vs-badge'>VS</div>" +
            "<div class='team-col'>" +
              "<span class='team-flag'>" + flag(m.visitante) + "</span>" +
              "<span class='team-name'>" + m.visitante + "</span>" +
              "<div class='stepper " + lockClass + "'>" +
                "<button type='button' onclick='step(this,-1)'>−</button>" +
                "<input type='number' class='score-input input-visitor' value='" + valV + "' readonly placeholder='-'>" +
                "<button type='button' onclick='step(this,1)'>+</button>" +
              "</div>" +
            "</div>" +
          "</div>" +
        "</div>";
    });

    groupsHtml +=
      "<div class='group-card'>" +
        "<div class='group-header' onclick=\"this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'\">" +
          "GRUPO " + gk + " <span style='font-size:12px;color:var(--text-muted);'>▼</span>" +
        "</div>" +
        "<div class='group-content' style='display:block;'>" + matchHtml + "</div>" +
      "</div>";
  });

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Fase de Grupos - Quiniela 2026</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --navy: #0A0A2E; --navy-light: #141440; --navy-surface: #1C1C50;
      --turquoise: #00E6C3; --magenta: #E835A0; --purple: #7B61FF;
      --blue: #3B82F6; --yellow: #FFD100; --red: #E63946;
      --text: #FFFFFF; --text-secondary: rgba(255,255,255,0.6); --text-muted: rgba(255,255,255,0.35);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Outfit', sans-serif; -webkit-tap-highlight-color: transparent; }
    body {
      background-color: var(--navy); color: var(--text); min-height: 100vh; padding-bottom: 90px;
      background-image:
        radial-gradient(ellipse at 100% 0%, rgba(123,97,255,0.12) 0%, transparent 50%),
        radial-gradient(ellipse at 0% 100%, rgba(0,230,195,0.08) 0%, transparent 50%);
    }

    .header {
      padding: 30px 20px 20px;
      background: linear-gradient(180deg, rgba(123,97,255,0.2) 0%, transparent 100%);
      position: sticky; top: 0; z-index: 10; backdrop-filter: blur(12px); text-align: center;
    }
    .header-tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(0,230,195,0.12);
      border: 1px solid rgba(0,230,195,0.25); padding: 4px 14px; border-radius: 20px;
      color: var(--turquoise); font-size: 10px; font-weight: 700; letter-spacing: 1px; margin-bottom: 10px; }
    h1 { font-size: 26px; font-weight: 900;
      background: linear-gradient(135deg, #FFF 0%, var(--turquoise) 60%, var(--magenta) 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .subtitle { color: var(--text-secondary); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; }

    .container { padding: 0 20px; max-width: 600px; margin: 0 auto; }

    .group-card {
      background: var(--navy-light); border-radius: 20px; margin-bottom: 20px;
      border: 1px solid rgba(255,255,255,0.06); overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    }
    .group-header {
      padding: 18px 20px; display: flex; justify-content: space-between; align-items: center;
      background: var(--navy-surface); cursor: pointer; font-size: 18px; font-weight: 800;
      background: linear-gradient(90deg, var(--turquoise), var(--purple));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .group-content { padding: 0 15px; }

    .match-row { padding: 18px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
    .match-row:last-child { border-bottom: none; }
    .match-info { text-align: center; font-size: 11px; color: var(--text-muted); margin-bottom: 14px;
      display: flex; justify-content: center; align-items: center; gap: 8px; }
    .badge-locked { background: rgba(230,57,70,0.15); color: var(--red); padding: 3px 8px;
      border-radius: 10px; font-size: 10px; font-weight: 700; }
    .badge-pending { color: var(--text-muted); font-size: 10px; }

    .match-teams { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .team-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .team-flag { font-size: 32px; line-height: 1; }
    .team-name { font-weight: 700; font-size: 11px; text-align: center; text-transform: uppercase; letter-spacing: 0.3px; color: var(--text-secondary); }

    .stepper {
      display: flex; align-items: center; background: rgba(0,0,0,0.3); border-radius: 12px;
      padding: 4px; border: 1px solid rgba(255,255,255,0.08);
    }
    .stepper button {
      background: var(--navy-surface); color: var(--text); border: none;
      width: 34px; height: 34px; border-radius: 8px; font-size: 18px; font-weight: bold;
      cursor: pointer; transition: 0.2s;
    }
    .stepper button:active { transform: scale(0.9); background: var(--purple); }
    .stepper input {
      background: transparent; border: none; color: var(--turquoise); font-size: 22px;
      font-weight: 900; width: 38px; text-align: center; font-family: 'Outfit';
    }
    .stepper.locked { opacity: 0.6; pointer-events: none; border-color: var(--red); background: rgba(230,57,70,0.1); }
    .stepper.locked button { display: none; }
    .stepper.locked input { width: 100%; color: #FFF; }

    .vs-badge { font-weight: 900; color: var(--purple); font-size: 14px; }

    .bottom-bar {
      position: fixed; bottom: 0; left: 0; width: 100%; padding: 20px;
      background: rgba(10,10,46,0.95); backdrop-filter: blur(10px);
      border-top: 1px solid rgba(255,255,255,0.05); z-index: 50; display: flex; justify-content: center;
    }
    .btn-save {
      background: linear-gradient(135deg, var(--turquoise) 0%, var(--blue) 50%, var(--purple) 100%);
      background-size: 200% 200%; animation: gradShift 4s ease infinite;
      color: #003D33; border: none; padding: 16px 40px; border-radius: 30px;
      font-size: 17px; font-weight: 900; cursor: pointer; width: 100%; max-width: 400px;
      text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 24px rgba(0,230,195,0.25);
    }
    .btn-save:active { transform: scale(0.98); }
    .btn-save.loading { opacity: 0.7; pointer-events: none; }
    @keyframes gradShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }

    .toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-100px);
      background: var(--turquoise); color: #003D33; padding: 15px 30px; border-radius: 30px;
      font-weight: 900; z-index: 100; transition: transform 0.4s; box-shadow: 0 4px 24px rgba(0,230,195,0.3); }
    .toast.show { transform: translateX(-50%) translateY(0); }
  </style>
</head>
<body>
  <div class="toast" id="toast">✅ Pronosticos Guardados!</div>

  <div class="header">
    <div class="header-tag">⚽ FIFA WORLD CUP 2026</div>
    <h1>FASE DE GRUPOS</h1>
    <div class="subtitle">Pronostica los resultados del Mundial</div>
  </div>

  <div class="container">
    ${groupsHtml}
  </div>

  <div class="bottom-bar">
    <button class="btn-save" id="btnSave" onclick="save()">GUARDAR MIS PRONOSTICOS</button>
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
        if (row.getAttribute('data-locked') === 'true') return;
        const valL = row.querySelector('.input-local').value;
        const valV = row.querySelector('.input-visitor').value;
        if (valL !== '' && valV !== '') {
          payload.push({
            match_id: row.getAttribute('data-id'), equipo_local: row.getAttribute('data-l'),
            equipo_visitante: row.getAttribute('data-v'), fecha: row.getAttribute('data-f'),
            local_score: parseInt(valL), visitor_score: parseInt(valV), locked: false
          });
        }
      });
      if (payload.length === 0) { btn.innerHTML = 'GUARDAR MIS PRONOSTICOS'; btn.classList.remove('loading'); return; }
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('user_id') || 'GUEST';
        const res = await fetch('/api/grupos?user_id=' + userId, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        if (res.ok) {
          const toast = document.getElementById('toast');
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 3000);
        } else { alert('Error al guardar.'); }
      } catch (err) { alert('Error de red.'); }
      btn.innerHTML = 'GUARDAR MIS PRONOSTICOS';
      btn.classList.remove('loading');
    }
  </script>
</body>
</html>`;

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
