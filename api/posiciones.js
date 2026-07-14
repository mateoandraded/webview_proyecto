import { hasPairOfDatumScores, parseDatumScore } from '../lib/datumScore.js';
import { getRequestUrl } from '../lib/requestUrl.js';
import { fetchFechaTorneoDesdeJelou } from '../lib/fechaTorneo.js';

export const config = {
  runtime: 'edge',
};

const API_KEY = 'db_3cfJUDRR8mwrlazSod9Fo2YXIe3qUJxI57OkdvpCf1a5f863';
const BASE_URL = 'https://mateoacademy-9djnmu.jelou.cloud/api/collections';
const BASE_URL_MATCHES = "https://mateoacademy-9djnmu.jelou.cloud/api/collections/pbc_631836067/records?perPage=500";

const FLAGS = {
  "MEXICO": "🇲🇽", "ESTADOS UNIDOS": "🇺🇸", "CANADA": "🇨🇦", "BRASIL": "🇧🇷",
  "ARGENTINA": "🇦🇷", "ECUADOR": "🇪🇨", "COLOMBIA": "🇨🇴", "URUGUAY": "🇺🇾",
  "PARAGUAY": "🇵🇾", "CHILE": "🇨🇱", "PERU": "🇵🇪", "VENEZUELA": "🇻🇪",
  "ALEMANIA": "🇩🇪", "ESPANA": "🇪🇸", "ESPAÑA": "🇪🇸", "FRANCIA": "🇫🇷", "PORTUGAL": "🇵🇹",
  "BELGICA": "🇧🇪", "PAISES BAJOS": "🇳🇱", "CROACIA": "🇭🇷", "SERBIA": "🇷🇸",
  "SUIZA": "🇨🇭", "TURQUIA": "🇹🇷", "DINAMARCA": "🇩🇰", "AUSTRIA": "🇦🇹",
  "POLONIA": "🇵🇱", "RUMANIA": "🇷🇴", "ESLOVENIA": "🇸🇮", "ESLOVAQUIA": "🇸🇰",
  "ALBANIA": "🇦🇱", "UCRANIA": "🇺🇦", "GRECIA": "🇬🇷", "MARRUECOS": "🇲🇦",
  "SENEGAL": "🇸🇳", "NIGERIA": "🇳🇬", "CAMERUN": "🇨🇲", "COSTA DE MARFIL": "🇨🇮",
  "EGIPTO": "🇪🇬", "GHANA": "🇬🇭", "TUNEZ": "🇹🇳", "JAPON": "🇯🇵",
  "COREA DEL SUR": "🇰🇷", "AUSTRALIA": "🇦🇺", "IRAN": "🇮🇷", "ARABIA SAUDITA": "🇸🇦",
  "INDONESIA": "🇮🇩", "COSTA RICA": "🇨🇷", "PANAMA": "🇵🇦", "JAMAICA": "🇯🇲",
  "SUDAFRICA": "🇿🇦", "REPUBLICA CHECA": "🇨🇿", "BOSNIA": "🇧🇦", "BOSNIA Y HERZEGOVINA": "🇧🇦",
  "QATAR": "🇶🇦", "HAITI": "🇭🇹", "HAITÍ": "🇭🇹", "ESCOCIA": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "CURAZAO": "🇨🇼", "SUECIA": "🇸🇪", "NUEVA ZELANDA": "🇳🇿", "CABO VERDE": "🇨🇻",
  "IRAK": "🇮🇶", "NORUEGA": "🇳🇴", "ARGELIA": "🇩🇿", "JORDANIA": "🇯🇴",
  "RD CONGO": "🇨🇬", "CONGO": "🇨🇬", "REPUBLICA DEL CONGO": "🇨🇬", "REPÚBLICA DEL CONGO": "🇨🇬",
  "UZBEKISTAN": "🇺🇿", "UZBEKISTÁN": "🇺🇿", "INGLATERRA": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "REPUBLICA DE COREA": "🇰🇷", "REPÚBLICA DE COREA": "🇰🇷"
};
function flag(name) { return FLAGS[(name||'').toUpperCase()] || '🏳️'; }

function buildStandings(allMatches, fechaSimulada) {
  const table = {};
  allMatches.forEach(m => {
    const grp = m.Fase_o_Grupo || "X";
    if (grp.length > 1) return;
    if (!table[grp]) table[grp] = {};
    const teams = [m.equipo_local, m.equipo_visitante];
    teams.forEach(t => {
      if (t && !table[grp][t]) {
        table[grp][t] = { team: t, pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, gd: 0 };
      }
    });
  });
  allMatches.forEach(m => {
    const grp = m.Fase_o_Grupo || "X";
    if (grp.length > 1) return;
    if (m.fecha && m.fecha > fechaSimulada) return;
    if (!hasPairOfDatumScores(m.resulltado_local, m.resultado_visitante)) return;
    const l = m.equipo_local, v = m.equipo_visitante;
    const rl = parseDatumScore(m.resulltado_local);
    const rv = parseDatumScore(m.resultado_visitante);
    if (rl === null || rv === null) return;
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
  const url = getRequestUrl(req);
  const paramFecha = url.searchParams.get('fecha');
  const executionId = url.searchParams.get('executionId') || '';
  const lang = url.searchParams.get('lang') || 'es';

  const i18n = {
    es: {
      doc_title: "Posiciones - World Cup 26", badge: "FASE DE GRUPOS", title: "TABLAS DE<br>POSICIONES",
      group: "GRUPO", team: "SELECCIÓN", pj: "PJ", dg: "DG", pts: "PTS",
      btn_back: "VOLVER AL MENÚ", btn_leaving: "SALIENDO..."
    },
    en: {
      doc_title: "Standings - World Cup 26", badge: "GROUP STAGE", title: "LEAGUE<br>STANDINGS",
      group: "GROUP", team: "TEAM", pj: "GP", dg: "GD", pts: "PTS",
      btn_back: "BACK TO MENU", btn_leaving: "LEAVING..."
    },
    pt: {
      doc_title: "Classificação - World Cup 26", badge: "FASE DE GRUPOS", title: "TABELA DE<br>CLASSIFICAÇÃO",
      group: "GRUPO", team: "SELEÇÃO", pj: "J", dg: "SG", pts: "PTS",
      btn_back: "VOLTAR AO MENU", btn_leaving: "SAINDO..."
    }
  };
  const t = i18n[lang] || i18n['es'];

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

  const standings = buildStandings(rawMatches, fechaSimulada);

  let htmlBody = '';
  Object.keys(standings).forEach(grp => {
    let rows = '';
    standings[grp].forEach((team, i) => {
      const qClass = (i < 2) ? 'qualify' : '';
      const dg = team.gd > 0 ? ('+' + team.gd) : String(team.gd);
      rows +=
        '<div class="t-row ' + qClass + '">' +
        '<div class="c-pos">' + (i+1) + '</div>' +
        '<div class="c-team">' +
        '<span class="t-flag">' + flag(team.team) + '</span>' +
        '<span class="t-name">' + team.team + '</span>' +
        '</div>' +
        '<div class="c-st">' + team.pj + '</div>' +
        '<div class="c-st bold">' + dg + '</div>' +
        '<div class="c-st lime">' + team.pts + '</div>' +
        '</div>';
    });

    htmlBody +=
      '<div class="group-table">' +
      '<div class="g-header">' + t.group + ' ' + grp + '</div>' +
      '<div class="t-head">' +
      '<div class="c-pos">#</div>' +
      '<div class="c-team">' + t.team + '</div>' +
      '<div class="c-st">' + t.pj + '</div>' +
      '<div class="c-st">' + t.dg + '</div>' +
      '<div class="c-st lime">' + t.pts + '</div>' +
      '</div>' +
      '<div class="t-body">' + rows + '</div>' +
      '</div>';
  });

  const css =
    ':root{--black:#000;--white:#fff;--lime:#C9FF24;--magenta:#FF0055;--teal:#00FFCC;--dim:#141414;--tb:#262626}' +
    '*{box-sizing:border-box;margin:0;padding:0}' +
    'body{background:var(--black);color:var(--white);font-family:\'Inter\',sans-serif;padding-bottom:100px;overflow-x:hidden}' +
    '.app-container{max-width:450px;margin:auto;padding:0 16px}' +
    '.header-box{margin:40px 0 32px;border-bottom:4px solid var(--white);padding-bottom:12px;position:relative}' +
    '.badge-26{background:var(--magenta);color:var(--white);font-weight:900;font-size:14px;padding:4px 10px;margin-bottom:12px;display:inline-block;letter-spacing:1px}' +
    'h1{font-family:\'Archivo Black\',sans-serif;font-size:40px;line-height:.9;letter-spacing:-2px}' +
    '.group-table{margin-bottom:40px;border:2px solid var(--tb);background:var(--dim);box-shadow:10px 10px 0px rgba(201,255,36,0.05)}' +
    '.g-header{font-family:\'Archivo Black\';font-size:24px;padding:12px 16px;background:var(--white);color:var(--black);letter-spacing:-1px;text-transform:uppercase}' +
    '.t-head{display:flex;background:rgba(255,255,255,0.03);padding:10px 16px;font-size:10px;font-weight:900;letter-spacing:1px;color:rgba(255,255,255,.4);border-bottom:2px solid var(--tb)}' +
    '.t-row{display:flex;padding:14px 16px;border-bottom:1px solid var(--tb);align-items:center;transition:.2s}' +
    '.t-row:last-child{border-bottom:none}' +
    '.t-row.qualify{background:rgba(201,255,36,.03)}' +
    '.t-row.qualify .c-pos{color:var(--lime);font-family:\'Archivo Black\'}' +
    '.c-pos{width:30px;font-weight:800;font-size:14px}' +
    '.c-team{flex:1;display:flex;align-items:center;gap:10px;min-width:0}' +
    '.t-flag{font-size:22px;line-height:1}' +
    '.t-name{font-weight:900;font-size:14px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-0.5px}' +
    '.c-st{width:40px;text-align:center;font-weight:700;font-size:14px;color:rgba(255,255,255,0.8)}' +
    '.c-st.bold{font-weight:900;color:var(--white)}' +
    '.c-st.lime{color:var(--lime);font-family:\'Archivo Black\';font-size:16px}' +
    '.bottom-bar{position:fixed;bottom:0;left:0;width:100%;background:var(--black);padding:20px 16px;border-top:4px solid var(--lime);z-index:100}' +
    '.btn-volver{width:100%;max-width:450px;margin:0 auto;display:block;background:var(--white);color:var(--black);border:none;padding:18px;font-family:\'Archivo Black\';font-size:18px;cursor:pointer;text-align:center;letter-spacing:1px;transition:.2s}' +
    '.btn-volver:active{background:var(--lime);transform:scale(0.98)}';

  const html = '<!DOCTYPE html><html lang="es"><head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">' +
    '<title>' + t.doc_title + '</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">' +
    '<style>' + css + '</style>' +
    '</head><body>' +
    '<div class="app-container">' +
    '<div class="header-box">' +
    '<div class="badge-26">' + t.badge + '</div>' +
    '<h1>' + t.title + '</h1>' +
    '</div>' +
    '<div>' + htmlBody + '</div>' +
    '</div>' +
    '<div class="bottom-bar">' +
    '<button class="btn-volver" id="btnVolver" onclick="volver()">' + t.btn_back + '</button>' +
    '</div>' +
    '<script>' +
    'var callbackSent=false;' +
    'document.addEventListener("visibilitychange",function(){' +
    'if(document.visibilityState==="hidden"&&!callbackSent){' +
    'callbackSent=true;' +
    'var exId=new URLSearchParams(window.location.search).get("executionId")||"' + executionId + '";' +
    'var cbBody={executionId:exId,success:true,data:{action:"volver"}};' +
    'fetch("https://workflows.jelou.ai/v1/webview/callback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(cbBody),keepalive:true});' +
    '}});' +
    'function volver(){' +
    'if(callbackSent)return;callbackSent=true;' +
    'var exId="' + executionId + '";' +
    'var btn=document.getElementById("btnVolver");' +
    'if(btn){btn.innerText="' + t.btn_leaving + '";btn.disabled=true;}' +
    'var cbBody={executionId:exId,success:true,data:{action:"volver"}};' +
    'fetch("https://workflows.jelou.ai/v1/webview/callback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(cbBody)})' +
    '.finally(function(){window.location.href="https://wa.me/593983456638";});' +
    '}' +
    '<\/script>' +
    '</body></html>';

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
