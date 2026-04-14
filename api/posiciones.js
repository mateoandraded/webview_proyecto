export const config = {
  runtime: 'edge',
};

const API_KEY = "db_HQIwDXV9xkJTEU5F3wwYAGhHAGInsItCu79g5FSz6e3106ee";
const BASE_URL = "https://mateoacademy-9djnmu.jelou.cloud/api/collections/pbc_631836067/records?perPage=500";

async function fetchMatches() {
  try {
    const res = await fetch(BASE_URL, { headers: { 'X-Api-Key': API_KEY } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.items || []);
  } catch (e) {
    return [];
  }
}

export default async function handler(req) {
  const matches = await fetchMatches();
  const fechaSimulada = "2026-06-11";

  // Agrupar por "Fase_o_Grupo" A-L
  const standingsByGroup = {};

  matches.forEach(m => {
    const g = m.Fase_o_Grupo;
    if (!g || g.length > 1) return; // Ignorar si no es A, B, C, etc.

    if (!standingsByGroup[g]) standingsByGroup[g] = {};
    const groupStandings = standingsByGroup[g];

    // Inicializar equipos en el grupo si no existen
    [m.equipo_local, m.equipo_visitante].forEach(team => {
      if (!groupStandings[team]) {
        groupStandings[team] = { equipo: team, PJ: 0, PG: 0, PE: 0, PP: 0, GF: 0, GC: 0, DG: 0, Pts: 0 };
      }
    });

    const isPlayed = m.fecha < fechaSimulada;
    if (isPlayed) {
      const gL = m.resulltado_local || 0;
      const gV = m.resultado_visitante || 0;
      const tL = groupStandings[m.equipo_local];
      const tV = groupStandings[m.equipo_visitante];

      tL.PJ++; tV.PJ++;
      tL.GF += gL; tL.GC += gV;
      tV.GF += gV; tV.GC += gL;

      if (gL > gV) {
        tL.PG++; tL.Pts += 3;
        tV.PP++;
      } else if (gV > gL) {
        tV.PG++; tV.Pts += 3;
        tL.PP++;
      } else {
        tL.PE++; tL.Pts += 1;
        tV.PE++; tV.Pts += 1;
      }
    }
  });

  // Calcular DG y ordenar
  const sortedStandings = {};
  const groupKeys = Object.keys(standingsByGroup).sort();
  groupKeys.forEach(g => {
    const arr = Object.values(standingsByGroup[g]);
    arr.forEach(s => s.DG = s.GF - s.GC);
    arr.sort((a, b) => {
      if (b.Pts !== a.Pts) return b.Pts - a.Pts;
      if (b.DG !== a.DG) return b.DG - a.DG;
      return b.GF - a.GF;
    });
    sortedStandings[g] = arr;
  });

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Posiciones Oficiales - Quiniela 2026</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Outfit:wght@700;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #4A0E17;
      --secondary: #900020;
      --accent: #D4AF37;
      --bg-dark: #0A0A0A;
      --surface: #1A1A1A;
      --surface-light: #2A2A2A;
      --text: #F8F9FA;
      --text-muted: #A0AEC0;
      --radius-lg: 20px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      background-color: var(--bg-dark);
      background-image: 
        radial-gradient(circle at 100% 0%, rgba(144, 0, 32, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 0% 100%, rgba(212, 175, 55, 0.1) 0%, transparent 50%);
      color: var(--text);
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      padding-bottom: 40px;
    }

    .header {
      padding: 30px 20px 20px;
      background: linear-gradient(180deg, var(--primary) 0%, transparent 100%);
      position: sticky;
      top: 0;
      z-index: 10;
      backdrop-filter: blur(10px);
      text-align: center;
    }

    h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 26px;
      font-weight: 900;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .subtitle { color: var(--text-muted); font-size: 13px; margin-top: 5px; }

    .container {
      padding: 0 20px;
      max-width: 600px;
      margin: 0 auto;
    }

    /* Tablas */
    .table-container {
      background: var(--surface);
      border-radius: var(--radius-lg);
      margin-top: 20px;
      border: 1px solid rgba(255,255,255,0.05);
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    }
    .group-title {
      padding: 15px 20px;
      background: var(--surface-light);
      font-family: 'Outfit', sans-serif;
      font-size: 18px;
      font-weight: 700;
      color: var(--accent);
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: center;
      font-size: 13px;
    }

    th {
      color: var(--text-muted);
      font-weight: 600;
      padding: 12px 5px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    td {
      padding: 15px 5px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    
    tr:last-child td { border-bottom: none; }
    
    .team-col {
      text-align: left;
      font-weight: 600;
      font-size: 14px;
      padding-left: 15px;
    }

    .pos-col {
      width: 30px;
      color: var(--accent);
      font-weight: bold;
    }

    .pts-col {
      font-weight: 800;
      color: var(--text);
      font-size: 15px;
    }

    /* Zonas de clasificación */
    tbody tr:nth-child(1) td.pos-col, tbody tr:nth-child(2) td.pos-col {
      color: #00E6C3; /* Pasan a 16vos */
    }

  </style>
</head>
<body>

  <div class="header">
    <h1>TABLA DE POSICIONES</h1>
    <div class="subtitle">Clasificación oficial en vivo</div>
  </div>

  <div class="container">
    ${(function() {
      let _html = "";
      groupKeys.forEach(gk => {
        const rows = sortedStandings[gk];
        let tbody = "";
        rows.forEach((row, idx) => {
          tbody += "<tr>" +
                   "<td class='pos-col'>" + (idx + 1) + "</td>" +
                   "<td class='team-col'>" + row.equipo + "</td>" +
                   "<td style='color:var(--text-muted);'>" + row.PJ + "</td>" +
                   "<td style='color:var(--text-muted);'>" + row.PG + "</td>" +
                   "<td style='color:var(--text-muted);'>" + row.PE + "</td>" +
                   "<td style='color:var(--text-muted);'>" + row.PP + "</td>" +
                   "<td>" + (row.DG > 0 ? '+' : '') + row.DG + "</td>" +
                   "<td class='pts-col'>" + row.Pts + "</td>" +
                   "</tr>";
        });
        _html += "<div class='table-container'>" +
                 "<div class='group-title'>GRUPO " + gk + "</div>" +
                 "<table>" +
                 "<thead><tr><th>#</th><th style='text-align:left;'>Selección</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>DG</th><th>PTS</th></tr></thead>" +
                 "<tbody>" + tbody + "</tbody>" +
                 "</table></div>";
      });
      return _html;
    })()}
  </div>

</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
