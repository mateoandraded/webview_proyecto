export const config = {
  runtime: 'edge',
};

const API_KEY = "db_HQIwDXV9xkJTEU5F3wwYAGhHAGInsItCu79g5FSz6e3106ee";
const BASE_URL_COLL = "https://mateoacademy-9djnmu.jelou.cloud/api/collections";
const BASE_URL_MATCHES = "https://mateoacademy-9djnmu.jelou.cloud/api/collections/pbc_631836067/records?perPage=500";

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

const FLAGS = {"MEXICO":"🇲🇽","ESTADOS UNIDOS":"🇺🇸","CANADA":"🇨🇦","BRASIL":"🇧🇷","ARGENTINA":"🇦🇷","ECUADOR":"🇪🇨","COLOMBIA":"🇨🇴","PERU":"🇵🇪","CHILE":"🇨🇱","URUGUAY":"🇺🇾","PARAGUAY":"🇵🇾","BOLIVIA":"🇧🇴","VENEZUELA":"🇻🇪","ALEMANIA":"🇩🇪","ESPAÑA":"🇪🇸","FRANCIA":"🇫🇷","ITALIA":"🇮🇹","PORTUGAL":"🇵🇹","PAISES BAJOS":"🇳🇱","BELGICA":"🇧🇪","CROACIA":"🇭🇷","SERBIA":"🇷🇸","SUIZA":"🇨🇭","DINAMARCA":"🇩🇰","AUSTRIA":"🇦🇹","UCRANIA":"🇺🇦","TURQUIA":"🇹🇷","HUNGRIA":"🇭🇺","REPUBLICA CHECA":"🇨🇿","GRECIA":"🇬🇷","JAPON":"🇯🇵","COREA DEL SUR":"🇰🇷","AUSTRALIA":"🇦🇺","IRAN":"🇮🇷","ARABIA SAUDITA":"🇸🇦","QATAR":"🇶🇦","MARRUECOS":"🇲🇦","SENEGAL":"🇸🇳","GHANA":"🇬🇭","CAMERUN":"🇨🇲","NIGERIA":"🇳🇬","TUNEZ":"🇹🇳","SUDAFRICA":"🇿🇦","EGIPTO":"🇪🇬","COSTA RICA":"🇨🇷","PANAMA":"🇵🇦","HONDURAS":"🇭🇳","JAMAICA":"🇯🇲","INDONESIA":"🇮🇩","NUEVA ZELANDA":"🇳🇿","INGLATERRA":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","POLONIA":"🇵🇱","RUMANIA":"🇷🇴","ESLOVENIA":"🇸🇮","ESLOVAQUIA":"🇸🇰","ALBANIA":"🇦🇱","COSTA DE MARFIL":"🇨🇮"};
function flag(name) { return FLAGS[(name||'').toUpperCase()] || '🏳️'; }

/**
 * Procesa los partidos para generar tablas de posiciones de TODOS los grupos.
 */
function buildStandings(allMatches, fechaSimulada) {
  const table = {};
  
  // 1. Inicializar TODOS los equipos y grupos presentes en la base de datos
  allMatches.forEach(m => {
    const grp = m.Fase_o_Grupo || "X";
    if (grp.length > 1) return; // Saltamos fases eliminatorias
    
    if (!table[grp]) table[grp] = {};
    const teams = [m.equipo_local, m.equipo_visitante];
    teams.forEach(t => {
      if (t && !table[grp][t]) {
        table[grp][t] = { team: t, pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, gd: 0 };
      }
    });
  });

  // 2. Calcular puntos solo para los partidos jugados (estado TERMINADO o fecha pasada)
  allMatches.forEach(m => {
    const grp = m.Fase_o_Grupo || "X";
    if (grp.length > 1) return;
    
    // Si no hay resultado o la fecha aún no llega en la simulación, no computamos puntos
    if (m.resulltado_local === null || m.resulltado_local === undefined) return;
    if (m.fecha && m.fecha > fechaSimulada) return;

    const l = m.equipo_local, v = m.equipo_visitante;
    const rl = parseInt(m.resulltado_local);
    const rv = parseInt(m.resultado_visitante);

    const tL = table[grp][l];
    const tV = table[grp][v];
    if (!tL || !tV) return;

    tL.pj++; tV.pj++;
    tL.gf += rl; tL.gc += rv; tL.gd += (rl - rv);
    tV.gf += rv; tV.gc += rl; tV.gd += (rv - rl);

    if (rl > rv) { tL.pts += 3; tL.pg++; tV.pp++; }
    else if (rl < rv) { tV.pts += 3; tV.pg++; tL.pp++; }
    else { tL.pts++; tV.pts++; tL.pe++; tV.pe++; }
  });

  // 3. Ordenar y formatear resultado final
  const finalRes = {};
  Object.keys(table).sort().forEach(g => {
    const arr = Object.values(table[g]);
    arr.sort((a,b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });
    finalRes[g] = arr;
  });
  return finalRes;
}

export default async function handler(req) {
  const url = new URL(req.url);
  const paramFecha = url.searchParams.get('fecha');
  const executionId = url.searchParams.get('executionId') || '';

  let rawMatches = [];
  let fechaSimulada;
  try {
    const [res, fh] = await Promise.all([
      fetch(BASE_URL_MATCHES, { headers: { "X-Api-Key": API_KEY } }),
      fetchFechaTorneoDesdeJelou()
    ]);
    fechaSimulada = paramFecha || fh;
    if (res.ok) {
      const dbdata = await res.json();
      rawMatches = dbdata.items || [];
    }
  } catch (e) {
    fechaSimulada = paramFecha || await fetchFechaTorneoDesdeJelou();
  }

  // --- LOGICA DE SINCRONIZACIÓN AUTOMÁTICA ---
  // Si detectamos que hay partidos cuya fecha ya pasó pero no tienen resultado (null),
  // podríamos disparar un trigger a la Jelou Function que consulta API-Football.
  // Por ahora, procesamos lo que hay en Datum para que la vista sea instantánea.
  
  const standings = buildStandings(rawMatches, fechaSimulada);

  let htmlBody = '';
  Object.keys(standings).forEach(grp => {
    let rows = '';
    standings[grp].forEach((t, i) => {
      const qClass = (i < 2) ? 'qualify' : '';
      const dg = t.gd > 0 ? ('+' + t.gd) : String(t.gd);
      rows += `
        <div class="t-row ${qClass}">
          <div class="c-pos">${i+1}</div>
          <div class="c-team">
            <span class="t-flag">${flag(t.team)}</span>
            <span class="t-name">${t.team}</span>
          </div>
          <div class="c-st">${t.pj}</div>
          <div class="c-st bold">${dg}</div>
          <div class="c-st lime">${t.pts}</div>
        </div>`;
    });

    htmlBody += `
      <div class="group-table">
        <div class="g-header">GRUPO ${grp}</div>
        <div class="t-head">
          <div class="c-pos">#</div>
          <div class="c-team">SELECCIÓN</div>
          <div class="c-st">PJ</div>
          <div class="c-st">DG</div>
          <div class="c-st lime">PTS</div>
        </div>
        <div class="t-body">${rows}</div>
      </div>`;
  });

  const css = `
    :root{--black:#000;--white:#fff;--lime:#C9FF24;--magenta:#FF0055;--teal:#00FFCC;--dim:#141414;--tb:#262626}
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:var(--black);color:var(--white);font-family:'Inter',sans-serif;padding-bottom:100px;overflow-x:hidden}
    .app-container{max-width:450px;margin:auto;padding:0 16px}
    .header-box{margin:40px 0 32px;border-bottom:4px solid var(--white);padding-bottom:12px;position:relative}
    .badge-26{background:var(--magenta);color:var(--white);font-weight:900;font-size:14px;padding:4px 10px;margin-bottom:12px;display:inline-block;letter-spacing:1px}
    h1{font-family:'Archivo Black',sans-serif;font-size:40px;line-height:.9;letter-spacing:-2px}
    .group-table{margin-bottom:40px;border:2px solid var(--tb);background:var(--dim);box-shadow: 10px 10px 0px rgba(201,255,36,0.05);}
    .g-header{font-family:'Archivo Black';font-size:24px;padding:12px 16px;background:var(--white);color:var(--black);letter-spacing:-1px;text-transform:uppercase}
    .t-head{display:flex;background:rgba(255,255,255,0.03);padding:10px 16px;font-size:10px;font-weight:900;letter-spacing:1px;color:rgba(255,255,255,.4);border-bottom:2px solid var(--tb)}
    .t-row{display:flex;padding:14px 16px;border-bottom:1px solid var(--tb);align-items:center;transition:.2s}
    .t-row:last-child{border-bottom:none}
    .t-row.qualify{background:rgba(201,255,36,.03)}
    .t-row.qualify .c-pos{color:var(--lime);font-family:'Archivo Black'}
    .c-pos{width:30px;font-weight:800;font-size:14px}
    .c-team{flex:1;display:flex;align-items:center;gap:10px;min-width:0}
    .t-flag{font-size:22px;line-height:1}
    .t-name{font-weight:900;font-size:14px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-0.5px}
    .c-st{width:40px;text-align:center;font-weight:700;font-size:14px;color:rgba(255,255,255,0.8)}
    .c-st.bold{font-weight:900;color:var(--white)}
    .c-st.lime{color:var(--lime);font-family:'Archivo Black';font-size:16px}
    .bottom-bar{position:fixed;bottom:0;left:0;width:100%;background:var(--black);padding:20px 16px;border-top:4px solid var(--lime);z-index:100}
    .btn-volver{width:100%;max-width:450px;margin:0 auto;display:block;background:var(--white);color:var(--black);border:none;padding:18px;font-family:'Archivo Black';font-size:18px;cursor:pointer;text-align:center;letter-spacing:1px;transition:.2s}
    .btn-volver:active{background:var(--lime);transform:scale(0.98)}
  `;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Posiciones - World Cup 26</title>
    <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">
    <style>${css}</style>
</head>
<body>
    <div class="app-container">
        <div class="header-box">
            <div class="badge-26">FASE DE GRUPOS</div>
            <h1>TABLAS DE<br>POSICIONES</h1>
        </div>
        <div>${htmlBody}</div>
    </div>
    <div class="bottom-bar">
        <button class="btn-volver" id="btnVolver" onclick="volver()">VOLVER AL MENÚ</button>
    </div>
    <script>
    let callbackSent = false;
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden" && !callbackSent) {
            callbackSent = true;
            const exId = new URLSearchParams(window.location.search).get("executionId") || "${executionId}";
            const cbBody = { executionId: exId, success: true, data: { action: "volver" } };
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
        const exId = "${executionId}";
        const btn = document.getElementById("btnVolver");
        if(btn) { btn.innerText = "SALIENDO..."; btn.disabled = true; }
        const cbBody = { executionId: exId, success: true, data: { action: "volver" } };
        fetch("https://workflows.jelou.ai/v1/webview/callback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cbBody)
        }).finally(() => { 
            window.location.href = "https://wa.me/13239183195"; 
        });
    }
    </script>
</body>
</html>`;

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

