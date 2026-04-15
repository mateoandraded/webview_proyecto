export const config = {
  runtime: 'edge',
};

const API_KEY = "db_HQIwDXV9xkJTEU5F3wwYAGhHAGInsItCu79g5FSz6e3106ee";
const BASE_URL = "https://mateoacademy-9djnmu.jelou.cloud/api/collections/pbc_631836067/records?perPage=500";

const FLAGS = {"MEXICO":"🇲🇽","ESTADOS UNIDOS":"🇺🇸","CANADA":"🇨🇦","BRASIL":"🇧🇷","ARGENTINA":"🇦🇷","ECUADOR":"🇪🇨","COLOMBIA":"🇨🇴","PERU":"🇵🇪","CHILE":"🇨🇱","URUGUAY":"🇺🇾","PARAGUAY":"🇵🇾","BOLIVIA":"🇧🇴","VENEZUELA":"🇻🇪","ALEMANIA":"🇩🇪","ESPANA":"🇪🇸","ESPAÑA":"🇪🇸","FRANCIA":"🇫🇷","ITALIA":"🇮🇹","PORTUGAL":"🇵🇹","PAISES BAJOS":"🇳🇱","BELGICA":"🇧🇪","CROACIA":"🇭🇷","SERBIA":"🇷🇸","SUIZA":"🇨🇭","DINAMARCA":"🇩🇰","AUSTRIA":"🇦🇹","UCRANIA":"🇺🇦","TURQUIA":"🇹🇷","HUNGRIA":"🇭🇺","REPUBLICA CHECA":"🇨🇿","GRECIA":"🇬🇷","JAPON":"🇯🇵","REPUBLICA DE COREA":"🇰🇷","COREA DEL SUR":"🇰🇷","AUSTRALIA":"🇦🇺","IRAN":"🇮🇷","ARABIA SAUDITA":"🇸🇦","QATAR":"🇶🇦","MARRUECOS":"🇲🇦","SENEGAL":"🇸🇳","GHANA":"🇬🇭","CAMERUN":"🇨🇲","NIGERIA":"🇳🇬","TUNEZ":"🇹🇳","SUDAFRICA":"🇿🇦","EGIPTO":"🇪🇬","COSTA RICA":"🇨🇷","PANAMA":"🇵🇦","HONDURAS":"🇭🇳","JAMAICA":"🇯🇲","INDONESIA":"🇮🇩","NUEVA ZELANDA":"🇳🇿","GALES":"🏴󠁧󠁢󠁷󠁬󠁳󠁿","ESCOCIA":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","INGLATERRA":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","POLONIA":"🇵🇱","RUMANIA":"🇷🇴","ESLOVENIA":"🇸🇮","ESLOVAQUIA":"🇸🇰","ALBANIA":"🇦🇱","ARGELIA":"🇩🇿","COSTA DE MARFIL":"🇨🇮","NORUEGA":"🇳🇴","SUECIA":"🇸🇪","IRLANDA":"🇮🇪"};
function flag(n) { return FLAGS[(n||'').toUpperCase()] || '🏳️'; }

async function fetchMatches() {
  try {
    const res = await fetch(BASE_URL, { headers: { 'X-Api-Key': API_KEY } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.items || []);
  } catch (e) { return []; }
}

export default async function handler(req) {
  const url = new URL(req.url);
  const paramFecha = url.searchParams.get('fecha');
  const fechaSimulada = paramFecha || "2026-06-11";
  const matches = await fetchMatches();

  const standingsByGroup = {};
  matches.forEach(m => {
    const g = m.Fase_o_Grupo;
    if (!g || g.length > 1) return;
    if (!standingsByGroup[g]) standingsByGroup[g] = {};
    const gs = standingsByGroup[g];
    [m.equipo_local, m.equipo_visitante].forEach(team => {
      if (!gs[team]) gs[team] = { equipo: team, PJ:0, PG:0, PE:0, PP:0, GF:0, GC:0, DG:0, Pts:0 };
    });
    if (m.fecha < fechaSimulada) {
      const gL = m.resulltado_local || 0; const gV = m.resultado_visitante || 0;
      const tL = gs[m.equipo_local]; const tV = gs[m.equipo_visitante];
      tL.PJ++; tV.PJ++; tL.GF += gL; tL.GC += gV; tV.GF += gV; tV.GC += gL;
      if (gL > gV) { tL.PG++; tL.Pts += 3; tV.PP++; }
      else if (gV > gL) { tV.PG++; tV.Pts += 3; tL.PP++; }
      else { tL.PE++; tL.Pts += 1; tV.PE++; tV.Pts += 1; }
    }
  });

  const sortedStandings = {};
  const groupKeys = Object.keys(standingsByGroup).sort();
  groupKeys.forEach(g => {
    const arr = Object.values(standingsByGroup[g]);
    arr.forEach(s => s.DG = s.GF - s.GC);
    arr.sort((a,b) => { if(b.Pts!==a.Pts) return b.Pts-a.Pts; if(b.DG!==a.DG) return b.DG-a.DG; return b.GF-a.GF; });
    sortedStandings[g] = arr;
  });

  // Build tables with flags
  let tablesHtml = '';
  groupKeys.forEach(gk => {
    const rows = sortedStandings[gk];
    let tbody = '';
    rows.forEach((row, idx) => {
      const posClass = idx < 2 ? 'qualify' : '';
      tbody +=
        "<tr>" +
          "<td class='pos-col " + posClass + "'>" + (idx+1) + "</td>" +
          "<td class='team-col'><span class='tbl-flag'>" + flag(row.equipo) + "</span> " + row.equipo + "</td>" +
          "<td class='num-col'>" + row.PJ + "</td>" +
          "<td class='num-col'>" + row.PG + "</td>" +
          "<td class='num-col'>" + row.PE + "</td>" +
          "<td class='num-col'>" + row.PP + "</td>" +
          "<td class='num-col'>" + (row.DG > 0 ? '+' : '') + row.DG + "</td>" +
          "<td class='pts-col'>" + row.Pts + "</td>" +
        "</tr>";
    });
    tablesHtml +=
      "<div class='table-container'>" +
        "<div class='group-title'>GRUPO " + gk + "</div>" +
        "<table><thead><tr><th>#</th><th style='text-align:left;'>Seleccion</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>DG</th><th>PTS</th></tr></thead>" +
        "<tbody>" + tbody + "</tbody></table>" +
      "</div>";
  });

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Posiciones - Quiniela 2026</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --navy: #0A0A2E; --navy-light: #141440; --navy-surface: #1C1C50;
      --turquoise: #00E6C3; --magenta: #E835A0; --purple: #7B61FF;
      --blue: #3B82F6; --yellow: #FFD100;
      --text: #FFFFFF; --text-secondary: rgba(255,255,255,0.6); --text-muted: rgba(255,255,255,0.35);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Outfit', sans-serif; }
    body {
      background-color: var(--navy); color: var(--text); min-height: 100vh; padding-bottom: 40px;
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
    .subtitle { color: var(--text-secondary); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }

    .container { padding: 0 20px; max-width: 600px; margin: 0 auto; }

    .table-container {
      background: var(--navy-light); border-radius: 20px; margin-top: 20px;
      border: 1px solid rgba(255,255,255,0.06); overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    }
    .group-title {
      padding: 14px 20px; background: var(--navy-surface); font-size: 16px; font-weight: 800;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      background-image: linear-gradient(90deg, var(--turquoise), var(--purple));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }

    table { width: 100%; border-collapse: collapse; text-align: center; font-size: 12px; }
    th { color: var(--text-muted); font-weight: 700; padding: 10px 4px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 12px 4px; border-bottom: 1px solid rgba(255,255,255,0.03); }
    tr:last-child td { border-bottom: none; }

    .team-col { text-align: left; font-weight: 700; font-size: 13px; padding-left: 12px; white-space: nowrap; }
    .tbl-flag { font-size: 16px; margin-right: 4px; vertical-align: middle; }
    .pos-col { width: 28px; font-weight: 900; color: var(--text-muted); }
    .pos-col.qualify { color: var(--turquoise); }
    .num-col { color: var(--text-secondary); font-size: 12px; }
    .pts-col { font-weight: 900; color: #FFF; font-size: 14px; }
  </style>
</head>
<body>

  <div class="header">
    <div class="header-tag">⚽ FIFA WORLD CUP 2026</div>
    <h1>TABLA DE POSICIONES</h1>
    <div class="subtitle">Clasificacion oficial en vivo</div>
  </div>

  <div class="container">
    ${tablesHtml}
  </div>

</body>
</html>`;

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
