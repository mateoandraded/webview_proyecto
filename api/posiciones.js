export const config = {
  runtime: 'edge',
};

const API_KEY = "db_HQIwDXV9xkJTEU5F3wwYAGhHAGInsItCu79g5FSz6e3106ee";
const BASE_URL = "https://mateoacademy-9djnmu.jelou.cloud/api/collections/pbc_631836067/records?perPage=500";

const FLAGS = {"MEXICO":"🇲🇽","ESTADOS UNIDOS":"🇺🇸","CANADA":"🇨🇦","BRASIL":"🇧🇷","ARGENTINA":"🇦🇷","ECUADOR":"🇪🇨","COLOMBIA":"🇨🇴","PERU":"🇵🇪","CHILE":"🇨🇱","URUGUAY":"🇺🇾","PARAGUAY":"🇵🇾","BOLIVIA":"🇧🇴","VENEZUELA":"🇻🇪","ALEMANIA":"🇩🇪","ESPANA":"🇪🇸","ESPAÑA":"🇪🇸","FRANCIA":"🇫🇷","ITALIA":"🇮🇹","PORTUGAL":"🇵🇹","PAISES BAJOS":"🇳🇱","BELGICA":"🇧🇪","CROACIA":"🇭🇷","SERBIA":"🇷🇸","SUIZA":"🇨🇭","DINAMARCA":"🇩🇰","AUSTRIA":"🇦🇹","UCRANIA":"🇺🇦","TURQUIA":"🇹🇷","HUNGRIA":"🇭🇺","REPUBLICA CHECA":"🇨🇿","GRECIA":"🇬🇷","JAPON":"🇯🇵","REPUBLICA DE COREA":"🇰🇷","COREA DEL SUR":"🇰🇷","AUSTRALIA":"🇦🇺","IRAN":"🇮🇷","ARABIA SAUDITA":"🇸🇦","QATAR":"🇶🇦","MARRUECOS":"🇲🇦","SENEGAL":"🇸🇳","GHANA":"🇬🇭","CAMERUN":"🇨🇲","NIGERIA":"🇳🇬","TUNEZ":"🇹🇳","SUDAFRICA":"🇿🇦","EGIPTO":"🇪🇬","COSTA RICA":"🇨🇷","PANAMA":"🇵🇦","HONDURAS":"🇭🇳","JAMAICA":"🇯🇲","INDONESIA":"🇮🇩","NUEVA ZELANDA":"🇳🇿","GALES":"🏴󠁧󠁢󠁷󠁬󠁳󠁿","ESCOCIA":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","INGLATERRA":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","POLONIA":"🇵🇱","RUMANIA":"🇷🇴","ESLOVENIA":"🇸🇮","ESLOVAQUIA":"🇸🇰","ALBANIA":"🇦🇱","ARGELIA":"🇩🇿","COSTA DE MARFIL":"🇨🇮","NORUEGA":"🇳🇴","SUECIA":"🇸🇪","IRLANDA":"🇮🇪","TRINIDAD Y TOBAGO":"🇹🇹","EL SALVADOR":"🇸🇻","GUATEMALA":"🇬🇹"};
function flag(name) { return FLAGS[(name||'').toUpperCase()] || '🏳️'; }

function buildStandings(matches) {
  const table = {};
  matches.forEach(function(m) {
    const grp = m.Fase_o_Grupo || "X";
    if (grp.length > 1) return;
    const l = m.equipo_local, v = m.equipo_visitante;
    const rl = parseInt(m.resulltado_local || 0);
    const rv = parseInt(m.resultado_visitante || 0);
    if (!table[grp]) table[grp] = {};
    if (!table[grp][l]) table[grp][l] = { team: l, pts:0, pj:0, pg:0, pe:0, pp:0, gf:0, gc:0, gd:0 };
    if (!table[grp][v]) table[grp][v] = { team: v, pts:0, pj:0, pg:0, pe:0, pp:0, gf:0, gc:0, gd:0 };
    if (!m.fecha) return;
    table[grp][l].pj++; table[grp][v].pj++;
    table[grp][l].gf += rl; table[grp][l].gc += rv; table[grp][l].gd += (rl - rv);
    table[grp][v].gf += rv; table[grp][v].gc += rl; table[grp][v].gd += (rv - rl);
    if (rl > rv) { table[grp][l].pts += 3; table[grp][l].pg++; table[grp][v].pp++; }
    else if (rl < rv) { table[grp][v].pts += 3; table[grp][v].pg++; table[grp][l].pp++; }
    else { table[grp][l].pts++; table[grp][v].pts++; table[grp][l].pe++; table[grp][v].pe++; }
  });
  const finalRes = {};
  Object.keys(table).sort().forEach(function(g) {
    const arr = Object.values(table[g]);
    arr.sort(function(a,b) {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });
    finalRes[g] = arr;
  });
  return finalRes;
}

export default async function handler(req) {
  let rawMatches = [];
  try {
    const res = await fetch(BASE_URL, { headers: { "X-Api-Key": API_KEY } });
    if (res.ok) {
      const dbdata = await res.json();
      rawMatches = dbdata.items || [];
    }
  } catch (e) {}

  const url = new URL(req.url);
  const paramFecha = url.searchParams.get('fecha');
  const fechaSimulada = paramFecha || "2100-01-01";

  const validMatches = rawMatches.filter(function(m) {
    return m.fecha && m.fecha < fechaSimulada && m.resulltado_local !== null;
  });
  const standings = buildStandings(validMatches);

  let htmlBody = '';
  Object.keys(standings).forEach(function(grp) {
    let rows = '';
    standings[grp].forEach(function(t, i) {
      const qClass = (i < 2) ? 'qualify' : '';
      const dg = t.gd > 0 ? ('+' + t.gd) : String(t.gd);
      rows +=
        "<div class='t-row " + qClass + "'>" +
          "<div class='c-pos'>" + (i+1) + "</div>" +
          "<div class='c-team'>" +
            "<span class='t-flag'>" + flag(t.team) + "</span>" +
            "<span class='t-name'>" + t.team + "</span>" +
          "</div>" +
          "<div class='c-st'>" + t.pj + "</div>" +
          "<div class='c-st bold'>" + dg + "</div>" +
          "<div class='c-st lime'>" + t.pts + "</div>" +
        "</div>";
    });

    htmlBody +=
      "<div class='group-table'>" +
        "<div class='g-header'>GRUPO " + grp + "</div>" +
        "<div class='t-head'>" +
          "<div class='c-pos'>#</div>" +
          "<div class='c-team'>SELECCIÓN</div>" +
          "<div class='c-st'>PJ</div>" +
          "<div class='c-st'>DG</div>" +
          "<div class='c-st lime'>PTS</div>" +
        "</div>" +
        "<div class='t-body'>" + rows + "</div>" +
      "</div>";
  });

  const css = `
    :root{--black:#000;--white:#fff;--lime:#C9FF24;--magenta:#FF0055;--teal:#00FFCC;--dim:#1F1F1F;--tb:#333}
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:var(--black);color:var(--white);font-family:'Inter',sans-serif;padding-bottom:60px}
    .app-container{max-width:450px;margin:auto;padding:0 16px}
    .header-box{margin:40px 0 30px;border-bottom:4px solid var(--white);padding-bottom:10px}
    .badge-26{background:var(--magenta);color:var(--white);font-weight:900;font-size:14px;padding:4px 8px;margin-bottom:12px;display:inline-block}
    h1{font-family:'Archivo Black',sans-serif;font-size:40px;line-height:.9;letter-spacing:-2px}
    .group-table{margin-bottom:32px;border:2px solid var(--tb);background:var(--black)}
    .g-header{font-family:'Archivo Black';font-size:24px;padding:12px 16px;background:var(--white);color:var(--black);letter-spacing:-1px}
    .t-head{display:flex;background:var(--dim);padding:8px 16px;font-size:10px;font-weight:800;letter-spacing:1px;color:rgba(255,255,255,.6);border-bottom:2px solid var(--tb)}
    .t-row{display:flex;padding:12px 16px;border-bottom:1px solid var(--tb);align-items:center}
    .t-row:last-child{border-bottom:none}
    .t-row.qualify{background:rgba(201,255,36,.05)}
    .t-row.qualify .c-pos{color:var(--lime);font-family:'Archivo Black'}
    .c-pos{width:30px;font-weight:800}
    .c-team{flex:1;display:flex;align-items:center;gap:8px;min-width:0}
    .t-flag{font-size:20px}
    .t-name{font-weight:900;font-size:14px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .c-st{width:40px;text-align:center;font-weight:600;font-size:14px}
    .c-st.bold{font-weight:800}
    .c-st.lime{color:var(--lime);font-family:'Archivo Black';font-size:16px}
    .bottom-bar{position:fixed;bottom:0;left:0;width:100%;background:var(--black);padding:16px;border-top:4px solid var(--lime);z-index:50}
    .btn-volver{width:100%;max-width:450px;margin:0 auto;display:block;background:var(--white);color:var(--black);border:none;padding:16px;font-family:'Archivo Black';font-size:18px;cursor:pointer;text-align:center;letter-spacing:1px}
    .btn-volver:active{background:var(--teal)}
  `;

  const html = '<!DOCTYPE html><html lang="es"><head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">' +
    '<title>Posiciones - World Cup 26</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;600;800&display=swap" rel="stylesheet">' +
    '<style>' + css + '</style>' +
    '</head><body>' +
    '<div class="app-container">' +
      '<div class="header-box">' +
        '<div class="badge-26">FASE DE GRUPOS</div>' +
        '<h1>TABLAS DE<br>POSICIONES</h1>' +
      '</div>' +
      '<div>' + htmlBody + '</div>' +
    '</div>' +
    '<div class="bottom-bar">' +
    '  <button class="btn-volver" id="btnVolver" onclick="volver()">VOLVER</button>' +
    '</div>' +
    '<script>' +
    'function volver(){' +
    '  var exId=new URLSearchParams(window.location.search).get("executionId")||"";' +
    '  var btn=document.getElementById("btnVolver");if(btn)btn.innerText="SALIENDO...";' +
    '  var cbBody={executionId:exId,success:true,data:{action:"volver"}};' +
    '  fetch("https://workflows.jelou.ai/v1/webview/callback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(cbBody)})' +
    '    .finally(function(){ window.location.href="https://wa.me/13239183195"; });' +
    '}' +
    '<\/script>' +
    '</body></html>';

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
