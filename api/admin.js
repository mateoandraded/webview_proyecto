export const config = {
  runtime: 'edge',
};

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;

const COLLECTIONS = [
  { id: "pbc_1944158292", name: "torneo_pronosticos" },
  { id: "pbc_3271891893", name: "torneo_ranking/perfil" },
  { id: "pbc_3221812075", name: "brackets/clasificados" },
];

const MATCHES_COLL = "pbc_631836067";

const WC_TEAMS = [
  "MEXICO","SUDAFRICA","COREA DEL SUR","REPUBLICA CHECA","CANADA","BOSNIA","QATAR","SUIZA",
  "BRASIL","MARRUECOS","HAITI","ESCOCIA","ESTADOS UNIDOS","PARAGUAY","AUSTRALIA","TURQUIA",
  "ALEMANIA","CURAZAO","COSTA DE MARFIL","ECUADOR","PAISES BAJOS","JAPON","SUECIA","TUNEZ",
  "BELGICA","EGIPTO","IRAN","NUEVA ZELANDA","ESPAÑA","CABO VERDE","ARABIA SAUDITA","URUGUAY",
  "FRANCIA","SENEGAL","IRAK","NORUEGA","ARGENTINA","ARGELIA","AUSTRIA","JORDANIA",
  "PORTUGAL","RD CONGO","UZBEKISTAN","COLOMBIA","INGLATERRA","CROACIA","GHANA","PANAMA"
];

const NOMBRES = [
  "Maria","Juan","Pedro","Ana","Luis","Sofia","Diego","Camila","Mateo","Valentina",
  "Carlos","Lucia","Andres","Elena","Javier","Paula","Martin","Isabella","Nicolas","Julieta",
  "Fernando","Gabriela","Samuel","Marta","Daniel","Emilia","Rafael","Agustina","Ricardo","Carolina"
];

const APELLIDOS = [
  "Gomez","Fernandez","Rodriguez","Perez","Lopez","Martinez","Gonzalez","Sanchez","Ramirez","Torres",
  "Flores","Diaz","Romero","Herrera","Castro","Vargas","Rojas","Navarro","Mendoza","Silva"
];

// ═══════════════════════════════════════════════════════════════════
//  ALL 96 GROUP STAGE MATCHES — WORLD CUP 2026
// ═══════════════════════════════════════════════════════════════════
const GROUP_MATCHES = [
  // Jun 11
  {fecha:"2026-06-11",hora:"14:00",local:"Mexico",visitante:"South Africa",grupo:"A",estadio:"Estadio Azteca"},
  {fecha:"2026-06-11",hora:"21:00",local:"South Korea",visitante:"Czechia",grupo:"A",estadio:"TBD"},
  // Jun 12
  {fecha:"2026-06-12",hora:"14:00",local:"Canada",visitante:"Bosnia and Herzegovina",grupo:"B",estadio:"TBD"},
  {fecha:"2026-06-12",hora:"20:00",local:"USA",visitante:"Paraguay",grupo:"D",estadio:"TBD"},
  // Jun 13
  {fecha:"2026-06-13",hora:"14:00",local:"Qatar",visitante:"Switzerland",grupo:"B",estadio:"TBD"},
  {fecha:"2026-06-13",hora:"17:00",local:"Brazil",visitante:"Morocco",grupo:"C",estadio:"TBD"},
  {fecha:"2026-06-13",hora:"20:00",local:"Haiti",visitante:"Scotland",grupo:"C",estadio:"TBD"},
  {fecha:"2026-06-13",hora:"23:00",local:"Australia",visitante:"Türkiye",grupo:"D",estadio:"TBD"},
  // Jun 14
  {fecha:"2026-06-14",hora:"12:00",local:"Germany",visitante:"Curaçao",grupo:"E",estadio:"TBD"},
  {fecha:"2026-06-14",hora:"15:00",local:"Netherlands",visitante:"Japan",grupo:"F",estadio:"TBD"},
  {fecha:"2026-06-14",hora:"18:00",local:"Ivory Coast",visitante:"Ecuador",grupo:"E",estadio:"TBD"},
  {fecha:"2026-06-14",hora:"21:00",local:"Sweden",visitante:"Tunisia",grupo:"F",estadio:"TBD"},
  // Jun 15
  {fecha:"2026-06-15",hora:"11:00",local:"Spain",visitante:"Cape Verde",grupo:"H",estadio:"TBD"},
  {fecha:"2026-06-15",hora:"14:00",local:"Belgium",visitante:"Egypt",grupo:"G",estadio:"TBD"},
  {fecha:"2026-06-15",hora:"17:00",local:"Saudi Arabia",visitante:"Uruguay",grupo:"H",estadio:"TBD"},
  {fecha:"2026-06-15",hora:"20:00",local:"Iran",visitante:"New Zealand",grupo:"G",estadio:"TBD"},
  // Jun 16
  {fecha:"2026-06-16",hora:"14:00",local:"France",visitante:"Senegal",grupo:"I",estadio:"TBD"},
  {fecha:"2026-06-16",hora:"17:00",local:"Iraq",visitante:"Norway",grupo:"I",estadio:"TBD"},
  {fecha:"2026-06-16",hora:"20:00",local:"Argentina",visitante:"Algeria",grupo:"J",estadio:"TBD"},
  {fecha:"2026-06-16",hora:"23:00",local:"Austria",visitante:"Jordan",grupo:"J",estadio:"TBD"},
  // Jun 17
  {fecha:"2026-06-17",hora:"12:00",local:"Portugal",visitante:"DR Congo",grupo:"K",estadio:"TBD"},
  {fecha:"2026-06-17",hora:"15:00",local:"England",visitante:"Croatia",grupo:"L",estadio:"TBD"},
  {fecha:"2026-06-17",hora:"18:00",local:"Ghana",visitante:"Panama",grupo:"L",estadio:"TBD"},
  {fecha:"2026-06-17",hora:"21:00",local:"Uzbekistan",visitante:"Colombia",grupo:"K",estadio:"TBD"},
  // Jun 18 (Matchday 2)
  {fecha:"2026-06-18",hora:"11:00",local:"Czechia",visitante:"South Africa",grupo:"A",estadio:"TBD"},
  {fecha:"2026-06-18",hora:"14:00",local:"Switzerland",visitante:"Bosnia and Herzegovina",grupo:"B",estadio:"TBD"},
  {fecha:"2026-06-18",hora:"17:00",local:"Canada",visitante:"Qatar",grupo:"B",estadio:"TBD"},
  {fecha:"2026-06-18",hora:"20:00",local:"Mexico",visitante:"South Korea",grupo:"A",estadio:"TBD"},
  // Jun 19
  {fecha:"2026-06-19",hora:"14:00",local:"USA",visitante:"Australia",grupo:"D",estadio:"TBD"},
  {fecha:"2026-06-19",hora:"17:00",local:"Scotland",visitante:"Morocco",grupo:"C",estadio:"TBD"},
  {fecha:"2026-06-19",hora:"19:30",local:"Brazil",visitante:"Haiti",grupo:"C",estadio:"TBD"},
  {fecha:"2026-06-19",hora:"22:00",local:"Türkiye",visitante:"Paraguay",grupo:"D",estadio:"TBD"},
  // Jun 20
  {fecha:"2026-06-20",hora:"12:00",local:"Netherlands",visitante:"Sweden",grupo:"F",estadio:"TBD"},
  {fecha:"2026-06-20",hora:"15:00",local:"Germany",visitante:"Ivory Coast",grupo:"E",estadio:"TBD"},
  {fecha:"2026-06-20",hora:"19:00",local:"Ecuador",visitante:"Curaçao",grupo:"E",estadio:"TBD"},
  {fecha:"2026-06-20",hora:"23:00",local:"Tunisia",visitante:"Japan",grupo:"F",estadio:"TBD"},
  // Jun 21
  {fecha:"2026-06-21",hora:"11:00",local:"Spain",visitante:"Saudi Arabia",grupo:"H",estadio:"TBD"},
  {fecha:"2026-06-21",hora:"14:00",local:"Belgium",visitante:"Iran",grupo:"G",estadio:"TBD"},
  {fecha:"2026-06-21",hora:"17:00",local:"Uruguay",visitante:"Cape Verde",grupo:"H",estadio:"TBD"},
  {fecha:"2026-06-21",hora:"20:00",local:"New Zealand",visitante:"Egypt",grupo:"G",estadio:"TBD"},
  // Jun 22
  {fecha:"2026-06-22",hora:"12:00",local:"Argentina",visitante:"Austria",grupo:"J",estadio:"TBD"},
  {fecha:"2026-06-22",hora:"16:00",local:"France",visitante:"Iraq",grupo:"I",estadio:"TBD"},
  {fecha:"2026-06-22",hora:"19:00",local:"Norway",visitante:"Senegal",grupo:"I",estadio:"TBD"},
  {fecha:"2026-06-22",hora:"22:00",local:"Jordan",visitante:"Algeria",grupo:"J",estadio:"TBD"},
  // Jun 23
  {fecha:"2026-06-23",hora:"12:00",local:"Portugal",visitante:"Uzbekistan",grupo:"K",estadio:"TBD"},
  {fecha:"2026-06-23",hora:"15:00",local:"England",visitante:"Ghana",grupo:"L",estadio:"TBD"},
  {fecha:"2026-06-23",hora:"18:00",local:"Panama",visitante:"Croatia",grupo:"L",estadio:"TBD"},
  {fecha:"2026-06-23",hora:"21:00",local:"Colombia",visitante:"DR Congo",grupo:"K",estadio:"TBD"},
  // Jun 24 (Matchday 3)
  {fecha:"2026-06-24",hora:"14:00",local:"Switzerland",visitante:"Canada",grupo:"B",estadio:"TBD"},
  {fecha:"2026-06-24",hora:"14:00",local:"Bosnia and Herzegovina",visitante:"Qatar",grupo:"B",estadio:"TBD"},
  {fecha:"2026-06-24",hora:"17:00",local:"Morocco",visitante:"Haiti",grupo:"C",estadio:"TBD"},
  {fecha:"2026-06-24",hora:"17:00",local:"Scotland",visitante:"Brazil",grupo:"C",estadio:"TBD"},
  {fecha:"2026-06-24",hora:"20:00",local:"South Africa",visitante:"South Korea",grupo:"A",estadio:"TBD"},
  {fecha:"2026-06-24",hora:"20:00",local:"Czechia",visitante:"Mexico",grupo:"A",estadio:"TBD"},
  // Jun 25
  {fecha:"2026-06-25",hora:"15:00",local:"Curaçao",visitante:"Ivory Coast",grupo:"E",estadio:"TBD"},
  {fecha:"2026-06-25",hora:"15:00",local:"Ecuador",visitante:"Germany",grupo:"E",estadio:"TBD"},
  {fecha:"2026-06-25",hora:"18:00",local:"Tunisia",visitante:"Netherlands",grupo:"F",estadio:"TBD"},
  {fecha:"2026-06-25",hora:"18:00",local:"Japan",visitante:"Sweden",grupo:"F",estadio:"TBD"},
  {fecha:"2026-06-25",hora:"21:00",local:"Türkiye",visitante:"USA",grupo:"D",estadio:"TBD"},
  {fecha:"2026-06-25",hora:"21:00",local:"Paraguay",visitante:"Australia",grupo:"D",estadio:"TBD"},
  // Jun 26
  {fecha:"2026-06-26",hora:"14:00",local:"Norway",visitante:"France",grupo:"I",estadio:"TBD"},
  {fecha:"2026-06-26",hora:"14:00",local:"Senegal",visitante:"Iraq",grupo:"I",estadio:"TBD"},
  {fecha:"2026-06-26",hora:"19:00",local:"Cape Verde",visitante:"Saudi Arabia",grupo:"H",estadio:"TBD"},
  {fecha:"2026-06-26",hora:"19:00",local:"Uruguay",visitante:"Spain",grupo:"H",estadio:"TBD"},
  {fecha:"2026-06-26",hora:"22:00",local:"New Zealand",visitante:"Belgium",grupo:"G",estadio:"TBD"},
  {fecha:"2026-06-26",hora:"22:00",local:"Egypt",visitante:"Iran",grupo:"G",estadio:"TBD"},
  // Jun 27
  {fecha:"2026-06-27",hora:"16:00",local:"Panama",visitante:"England",grupo:"L",estadio:"TBD"},
  {fecha:"2026-06-27",hora:"16:00",local:"Croatia",visitante:"Ghana",grupo:"L",estadio:"TBD"},
  {fecha:"2026-06-27",hora:"18:30",local:"Colombia",visitante:"Portugal",grupo:"K",estadio:"TBD"},
  {fecha:"2026-06-27",hora:"18:30",local:"DR Congo",visitante:"Uzbekistan",grupo:"K",estadio:"TBD"},
  {fecha:"2026-06-27",hora:"21:00",local:"Algeria",visitante:"Austria",grupo:"J",estadio:"TBD"},
  {fecha:"2026-06-27",hora:"21:00",local:"Jordan",visitante:"Argentina",grupo:"J",estadio:"TBD"},
];

// ═══════════════════════════════════════════════════════════════════
//  HARDCODED KNOCKOUT MATCHES FOR SIMULATION
// ═══════════════════════════════════════════════════════════════════
const KNOCKOUT_MATCHES = [
  // Round of 32 (16 matches)
  {fecha:"2026-06-30",hora:"15:00",local:"Mexico",visitante:"Switzerland",fase:"Round of 32",estadio:"TBD"},
  {fecha:"2026-06-30",hora:"18:00",local:"Brazil",visitante:"Australia",fase:"Round of 32",estadio:"TBD"},
  {fecha:"2026-06-30",hora:"21:00",local:"Germany",visitante:"Netherlands",fase:"Round of 32",estadio:"TBD"},
  {fecha:"2026-07-01",hora:"15:00",local:"Spain",visitante:"Belgium",fase:"Round of 32",estadio:"TBD"},
  {fecha:"2026-07-01",hora:"18:00",local:"France",visitante:"Argentina",fase:"Round of 32",estadio:"TBD"},
  {fecha:"2026-07-01",hora:"21:00",local:"Portugal",visitante:"England",fase:"Round of 32",estadio:"TBD"},
  {fecha:"2026-07-02",hora:"15:00",local:"USA",visitante:"Canada",fase:"Round of 32",estadio:"TBD"},
  {fecha:"2026-07-02",hora:"18:00",local:"Uruguay",visitante:"Colombia",fase:"Round of 32",estadio:"TBD"},
  {fecha:"2026-07-02",hora:"21:00",local:"South Korea",visitante:"Japan",fase:"Round of 32",estadio:"TBD"},
  {fecha:"2026-07-03",hora:"15:00",local:"Morocco",visitante:"Ecuador",fase:"Round of 32",estadio:"TBD"},
  {fecha:"2026-07-03",hora:"18:00",local:"Croatia",visitante:"Senegal",fase:"Round of 32",estadio:"TBD"},
  {fecha:"2026-07-03",hora:"21:00",local:"Egypt",visitante:"Tunisia",fase:"Round of 32",estadio:"TBD"},
  {fecha:"2026-07-04",hora:"15:00",local:"Algeria",visitante:"Iran",fase:"Round of 32",estadio:"TBD"},
  {fecha:"2026-07-04",hora:"18:00",local:"Norway",visitante:"Austria",fase:"Round of 32",estadio:"TBD"},
  {fecha:"2026-07-04",hora:"21:00",local:"Ghana",visitante:"DR Congo",fase:"Round of 32",estadio:"TBD"},
  {fecha:"2026-07-04",hora:"23:00",local:"Paraguay",visitante:"Scotland",fase:"Round of 32",estadio:"TBD"},
  // Round of 16 (8 matches)
  {fecha:"2026-07-06",hora:"15:00",local:"Mexico",visitante:"Brazil",fase:"Round of 16",estadio:"TBD"},
  {fecha:"2026-07-06",hora:"18:00",local:"Germany",visitante:"Spain",fase:"Round of 16",estadio:"TBD"},
  {fecha:"2026-07-06",hora:"21:00",local:"France",visitante:"Portugal",fase:"Round of 16",estadio:"TBD"},
  {fecha:"2026-07-07",hora:"15:00",local:"USA",visitante:"Uruguay",fase:"Round of 16",estadio:"TBD"},
  {fecha:"2026-07-07",hora:"18:00",local:"Argentina",visitante:"England",fase:"Round of 16",estadio:"TBD"},
  {fecha:"2026-07-07",hora:"21:00",local:"Morocco",visitante:"Croatia",fase:"Round of 16",estadio:"TBD"},
  {fecha:"2026-07-08",hora:"15:00",local:"South Korea",visitante:"Egypt",fase:"Round of 16",estadio:"TBD"},
  {fecha:"2026-07-08",hora:"18:00",local:"Colombia",visitante:"Norway",fase:"Round of 16",estadio:"TBD"},
  // Quarter-finals (4 matches)
  {fecha:"2026-07-10",hora:"15:00",local:"Brazil",visitante:"Germany",fase:"Quarter-finals",estadio:"TBD"},
  {fecha:"2026-07-10",hora:"21:00",local:"France",visitante:"USA",fase:"Quarter-finals",estadio:"TBD"},
  {fecha:"2026-07-11",hora:"15:00",local:"Argentina",visitante:"Morocco",fase:"Quarter-finals",estadio:"TBD"},
  {fecha:"2026-07-11",hora:"21:00",local:"Colombia",visitante:"South Korea",fase:"Quarter-finals",estadio:"TBD"},
  // Semi-finals (2 matches)
  {fecha:"2026-07-14",hora:"18:00",local:"Brazil",visitante:"France",fase:"Semi-finals",estadio:"TBD"},
  {fecha:"2026-07-14",hora:"21:00",local:"Argentina",visitante:"Colombia",fase:"Semi-finals",estadio:"TBD"},
  // Third-place
  {fecha:"2026-07-18",hora:"18:00",local:"France",visitante:"Colombia",fase:"Third-place",estadio:"TBD"},
  // Final
  {fecha:"2026-07-19",hora:"18:00",local:"Brazil",visitante:"Argentina",fase:"Final",estadio:"TBD"},
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiRequest(path, method = 'GET', body = null, attempt = 0) {
  const url = `${BASE_URL}/${path}`;
  try {
    const res = await fetch(url, {
      method,
      headers: {
        "X-Api-Key": API_KEY,
        "Accept": "application/json",
        ...(body ? { "Content-Type": "application/json" } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    });

    if ((res.status === 429 || res.status >= 500) && attempt < 3) {
      await sleep(250 * Math.pow(2, attempt));
      return apiRequest(path, method, body, attempt + 1);
    }

    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch (_) {}
    return { ok: res.ok, status: res.status, data: json, raw: text };
  } catch (err) {
    if (attempt < 3) {
      await sleep(250 * Math.pow(2, attempt));
      return apiRequest(path, method, body, attempt + 1);
    }
    return { ok: false, status: 0, error: String(err) };
  }
}

async function fetchAllRecords(coll) {
  const out = [];
  const perPage = 200;
  let page = 1;
  while (true) {
    const res = await apiRequest(`${coll}/records?perPage=${perPage}&page=${page}`);
    if (!res.ok) break;
    const items = (res.data && res.data.items) ? res.data.items : [];
    if (!Array.isArray(items) || items.length === 0) break;
    out.push(...items);
    if (items.length < perPage) break;
    page++;
  }
  return out;
}

async function deleteRecord(coll, id) {
  const res = await apiRequest(`${coll}/records/${id}`, 'DELETE');
  return res.ok || res.status === 204 || res.status === 404;
}

async function createRecord(coll, body) {
  const res = await apiRequest(`${coll}/records`, 'POST', body);
  return { ok: !!res.ok, status: res.status, data: res.data, raw: res.raw, error: res.error };
}

async function patchRecord(coll, id, body) {
  const res = await apiRequest(`${coll}/records/${id}`, 'PATCH', body);
  return { ok: !!res.ok, status: res.status, data: res.data };
}

function getRandomItems(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

function makeMatchId(local, visitante, fecha) {
  return `${local}_${visitante}_${fecha}`.replace(/\s+/g, '_');
}

// ═══════════════════════════════════════════════════════════════════
//  NUKE: Delete all 3 user-data collections
// ═══════════════════════════════════════════════════════════════════
async function nukeCollections() {
  let totalDeleted = 0;
  const errors = [];

  for (const coll of COLLECTIONS) {
    for (let pass = 1; pass <= 2; pass++) {
      const items = await fetchAllRecords(coll.id);
      if (items.length === 0) break;
      for (const item of items) {
        const ok = await deleteRecord(coll.id, item.id);
        if (ok) totalDeleted++;
        else errors.push(`No se pudo eliminar ${coll.name}:${item.id}`);
      }
      const remaining = await fetchAllRecords(coll.id);
      if (remaining.length === 0) break;
    }
  }

  const remainingByCollection = {};
  for (const coll of COLLECTIONS) {
    const rem = await fetchAllRecords(coll.id);
    remainingByCollection[coll.name] = rem.length;
  }

  return { totalDeleted, errors, remainingByCollection };
}

// ═══════════════════════════════════════════════════════════════════
//  SEED: Create 20 dummy users with predictions & brackets
// ═══════════════════════════════════════════════════════════════════
function buildRandomUser(i, seedTs) {
  const nombre = NOMBRES[Math.floor(Math.random() * NOMBRES.length)];
  const apellido = APELLIDOS[Math.floor(Math.random() * APELLIDOS.length)];
  const slugNombre = nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return {
    user_id: `user_${seedTs}_${i}_${slugNombre}`,
    nombre,
    apellido
  };
}

// ═══════════════════════════════════════════════════════════════════
//  CARGAR PARTIDOS: Seed all 96 group stage matches
// ═══════════════════════════════════════════════════════════════════
async function cargarPartidos() {
  let created = 0;
  let failed = 0;
  const errors = [];

  for (const m of GROUP_MATCHES) {
    const record = {
      fecha: m.fecha,
      hora: m.hora,
      equipo_local: m.local,
      equipo_visitante: m.visitante,
      Fase_o_Grupo: m.grupo,
      estadio: m.estadio,
      resulltado_local: null,
      resultado_visitante: null,
      id_partido: makeMatchId(m.local, m.visitante, m.fecha)
    };
    const res = await createRecord(MATCHES_COLL, record);
    if (res.ok) created++;
    else {
      failed++;
      errors.push(`${m.local} vs ${m.visitante}: status ${res.status}`);
    }
  }

  return {
    success: failed === 0,
    message: `⚽ Cargados ${created}/${GROUP_MATCHES.length} partidos de fase de grupos.`,
    created,
    failed,
    errors
  };
}

// ═══════════════════════════════════════════════════════════════════
//  NUKE PARTIDOS: Clear the matches collection
// ═══════════════════════════════════════════════════════════════════
async function nukePartidos() {
  let totalDeleted = 0;
  const errors = [];

  for (let pass = 1; pass <= 2; pass++) {
    const items = await fetchAllRecords(MATCHES_COLL);
    if (items.length === 0) break;
    for (const item of items) {
      const ok = await deleteRecord(MATCHES_COLL, item.id);
      if (ok) totalDeleted++;
      else errors.push(`No se pudo eliminar partido ${item.id}`);
    }
  }

  const remaining = await fetchAllRecords(MATCHES_COLL);
  return {
    success: errors.length === 0 && remaining.length === 0,
    message: `💣 Eliminados ${totalDeleted} partidos. Restantes: ${remaining.length}`,
    totalDeleted,
    remaining: remaining.length,
    errors
  };
}

// ═══════════════════════════════════════════════════════════════════
//  SIMULAR MUNDIAL: Random scores for groups + hardcoded knockout
// ═══════════════════════════════════════════════════════════════════
async function simularMundial() {
  // 1. Get all existing matches
  const allMatches = await fetchAllRecords(MATCHES_COLL);
  const groupMatches = allMatches.filter(m => m.Fase_o_Grupo && m.Fase_o_Grupo.length === 1);

  let patched = 0;
  let knockoutCreated = 0;
  const errors = [];

  // 2. Set random scores (0-5) for all group stage matches
  for (const m of groupMatches) {
    const scoreL = Math.floor(Math.random() * 6);
    const scoreV = Math.floor(Math.random() * 6);
    const res = await patchRecord(MATCHES_COLL, m.id, {
      resulltado_local: scoreL,
      resultado_visitante: scoreV
    });
    if (res.ok) patched++;
    else errors.push(`Patch ${m.id}: status ${res.status}`);
  }

  // 3. Create knockout matches with hardcoded results
  for (const km of KNOCKOUT_MATCHES) {
    // Winner is always local team (hardcoded for simplicity)
    const scoreL = Math.floor(Math.random() * 3) + 1; // 1-3
    const scoreV = Math.floor(Math.random() * scoreL);  // 0 to scoreL-1 (local always wins)
    const record = {
      fecha: km.fecha,
      hora: km.hora,
      equipo_local: km.local,
      equipo_visitante: km.visitante,
      Fase_o_Grupo: km.fase,
      estadio: km.estadio,
      resulltado_local: scoreL,
      resultado_visitante: scoreV,
      id_partido: makeMatchId(km.local, km.visitante, km.fecha),
      ganador_final: km.local
    };
    const res = await createRecord(MATCHES_COLL, record);
    if (res.ok) knockoutCreated++;
    else errors.push(`Knockout ${km.local} vs ${km.visitante}: status ${res.status}`);
  }

  return {
    success: errors.length === 0,
    message: `🎲 Simulación completa. Grupos: ${patched} resultados random. Eliminatorias: ${knockoutCreated} partidos creados. Campeón: Brazil 🇧🇷`,
    patched,
    knockoutCreated,
    errors
  };
}

// ═══════════════════════════════════════════════════════════════════
//  CLEAN SIMULACIÓN: Remove knockout, reset all scores to null
// ═══════════════════════════════════════════════════════════════════
async function cleanSimulacion() {
  const allMatches = await fetchAllRecords(MATCHES_COLL);
  let deletedKnockout = 0;
  let resetGroups = 0;
  const errors = [];

  for (const m of allMatches) {
    const fase = m.Fase_o_Grupo || '';
    const isGroup = fase.length === 1; // Single letter = group

    if (!isGroup) {
      // Delete knockout matches
      const ok = await deleteRecord(MATCHES_COLL, m.id);
      if (ok) deletedKnockout++;
      else errors.push(`No se pudo eliminar knockout ${m.id}`);
    } else {
      // Reset group match scores to null
      const res = await patchRecord(MATCHES_COLL, m.id, {
        resulltado_local: null,
        resultado_visitante: null
      });
      if (res.ok) resetGroups++;
      else errors.push(`No se pudo resetear ${m.id}`);
    }
  }

  return {
    success: errors.length === 0,
    message: `🧹 Limpieza completa. ${deletedKnockout} partidos eliminatorios borrados. ${resetGroups} partidos de grupos reseteados a null.`,
    deletedKnockout,
    resetGroups,
    errors
  };
}

// ═══════════════════════════════════════════════════════════════════
//  HANDLER
// ═══════════════════════════════════════════════════════════════════
export default async function handler(req) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  if (req.method === 'POST') {
    if (action === 'nuke') {
      const result = await nukeCollections();
      const leftovers = Object.entries(result.remainingByCollection)
        .map(([name, count]) => `${name}:${count}`)
        .join(' | ');
      return new Response(JSON.stringify({
        success: result.errors.length === 0 && Object.values(result.remainingByCollection).every((x) => x === 0),
        message: `☢️ LIMPIEZA COMPLETA. Eliminados ${result.totalDeleted}. Restantes -> ${leftovers}`,
        deleted: result.totalDeleted,
        remaining: result.remainingByCollection,
        errors: result.errors
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (action === 'seed') {
      const cleanup = await nukeCollections();
      const matches = await fetchAllRecords(MATCHES_COLL);
      if (matches.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          message: "No hay partidos en la BD. Primero usa CARGAR PARTIDOS.",
          cleanup
        }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

      const subset = matches.slice(0, 12);
      const seedTs = Date.now();
      const usersToCreate = 20;

      let profileOk = 0, profileFail = 0;
      let predsOk = 0, predsFail = 0;
      let bracketOk = 0, bracketFail = 0;
      const errors = [];

      for (let i = 1; i <= usersToCreate; i++) {
        const u = buildRandomUser(i, seedTs);

        const profileRes = await createRecord('pbc_3271891893', {
          user_id: u.user_id,
          nombre: u.nombre,
          apellido: u.apellido,
          total_puntos: 0,
          puntos_goles: 0,
          puntos_brackets: 0,
          pronosticos_correctos: 0
        });
        if (profileRes.ok) profileOk++;
        else {
          profileFail++;
          errors.push(`Perfil ${u.user_id}: status ${profileRes.status || 'N/A'}`);
        }

        for (const m of subset) {
          const predRes = await createRecord('pbc_1944158292', {
            user_id: u.user_id,
            match_id: m.id_partido,
            equipo_local: m.equipo_local,
            equipo_visitante: m.equipo_visitante,
            pronostico_local: Math.floor(Math.random() * 5),
            pronostico_visitante: Math.floor(Math.random() * 5),
            fecha_partido: m.fecha,
            estado: 'PENDIENTE'
          });
          if (predRes.ok) predsOk++;
          else {
            predsFail++;
            errors.push(`Pronóstico ${u.user_id}/${m.id_partido}: status ${predRes.status || 'N/A'}`);
          }
        }

        const d16 = getRandomItems(WC_TEAMS, 32);
        const d8 = getRandomItems(d16, 16);
        const d4 = getRandomItems(d8, 8);
        const semis = getRandomItems(d4, 4);
        const finals = getRandomItems(semis, 4);

        const bracketRes = await createRecord('pbc_3221812075', {
          user_id: u.user_id,
          dieciseisavos: d16,
          octavos: d8,
          cuartos: d4,
          semis: semis,
          campeon: finals[0],
          subcampeon: finals[1],
          tercer_lugar: finals[2],
          cuarto_lugar: finals[3]
        });
        if (bracketRes.ok) bracketOk++;
        else {
          bracketFail++;
          errors.push(`Bracket ${u.user_id}: status ${bracketRes.status || 'N/A'}`);
        }
      }

      return new Response(JSON.stringify({
        success: profileFail === 0 && predsFail === 0 && bracketFail === 0,
        message: `Seed finalizado. Usuarios: ${profileOk}/${usersToCreate}, Pronósticos: ${predsOk}/${usersToCreate * subset.length}, Brackets: ${bracketOk}/${usersToCreate}.`,
        cleanup,
        stats: {
          usersRequested: usersToCreate,
          matchesPerUser: subset.length,
          profileOk, profileFail,
          predsOk, predsFail,
          bracketOk, bracketFail
        },
        errors
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (action === 'cargar_partidos') {
      const result = await cargarPartidos();
      return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
    }

    if (action === 'nuke_partidos') {
      const result = await nukePartidos();
      return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
    }

    if (action === 'simular') {
      const result = await simularMundial();
      return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
    }

    if (action === 'clean_simulacion') {
      const result = await cleanSimulacion();
      return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
    }
  }

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Mundial 2026</title>
    <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;900&display=swap" rel="stylesheet">
    <style>
        :root { --black: #000; --white: #fff; --lime: #C9FF24; --mag: #FF0055; --teal: #00FFCC; --purple: #6200EA; --bg: #111; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); color: var(--white); font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; padding: 20px; }
        .card { background: var(--black); border: 2px solid var(--white); padding: 40px 30px; width: 90%; max-width: 420px; }
        h1 { font-family: 'Archivo Black'; font-size: 22px; margin-bottom: 10px; letter-spacing: -1px; }
        .sub { font-size: 10px; color: rgba(255,255,255,.4); margin-bottom: 30px; letter-spacing: 1px; font-weight: 800; }
        .section { margin-bottom: 24px; }
        .section-label { font-size: 10px; font-weight: 900; color: rgba(255,255,255,.5); letter-spacing: 2px; margin-bottom: 10px; text-align: left; border-bottom: 1px solid rgba(255,255,255,.1); padding-bottom: 6px; }
        .btn { width: 100%; padding: 18px; font-family: 'Archivo Black'; font-size: 14px; border: none; cursor: pointer; margin-bottom: 10px; transition: 0.2s; text-transform: uppercase; letter-spacing: 1px; }
        .btn:active { transform: scale(0.95); opacity: 0.8; }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .btn-nuke { background: var(--mag); color: var(--white); }
        .btn-seed { background: var(--lime); color: var(--black); }
        .btn-cargar { background: var(--teal); color: var(--black); }
        .btn-nuke-p { background: #FF6B35; color: var(--white); }
        .btn-simular { background: var(--purple); color: var(--white); }
        .btn-clean { background: var(--white); color: var(--black); }
        #status { margin-top: 20px; font-size: 11px; font-weight: 900; color: var(--lime); min-height: 40px; line-height: 1.5; word-break: break-word; }
    </style>
</head>
<body>
    <div class="card">
        <h1>🛠 PANEL DE CONTROL</h1>
        <div class="sub">ADMIN · MUNDIAL 2026</div>

        <div class="section">
            <div class="section-label">👥 USUARIOS & DATOS</div>
            <button class="btn btn-nuke" onclick="run('nuke')">☢️ ELIMINAR TODO (NUKE)</button>
            <button class="btn btn-seed" onclick="run('seed')">🌱 POBLAR (BRING TO LIFE)</button>
        </div>

        <div class="section">
            <div class="section-label">⚽ PARTIDOS</div>
            <button class="btn btn-cargar" onclick="run('cargar_partidos')">📦 CARGAR PARTIDOS (96)</button>
            <button class="btn btn-nuke-p" onclick="run('nuke_partidos')">💣 NUKE PARTIDOS</button>
        </div>

        <div class="section">
            <div class="section-label">🎲 SIMULACIÓN</div>
            <button class="btn btn-simular" onclick="run('simular')">🎲 SIMULAR MUNDIAL</button>
            <button class="btn btn-clean" onclick="run('clean_simulacion')">🧹 CLEAN SIMULACIÓN</button>
        </div>

        <div id="status"></div>
    </div>

    <script>
        async function run(action) {
            const st = document.getElementById('status');
            const btns = document.querySelectorAll('.btn');
            btns.forEach(b => b.disabled = true);
            st.innerText = 'PROCESANDO... (esto puede tardar)';
            st.style.color = 'white';
            try {
                const res = await fetch(\`?action=\${action}\`, { method: 'POST' });
                const data = await res.json();
                st.innerText = data.message || 'OK';
                st.style.color = data.success ? '#C9FF24' : '#FF0055';
            } catch (e) {
                st.innerText = 'ERROR EN LA PETICIÓN: ' + e.message;
                st.style.color = '#FF0055';
            } finally {
                btns.forEach(b => b.disabled = false);
            }
        }
    </script>
</body>
</html>`;

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
