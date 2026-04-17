import { getRequestUrl } from '../lib/requestUrl.js';

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
//  Primera fase · 12 grupos × 6 partidos = 72 (calendario oficial, etiquetas en español;
//  nombres alineados con FLAGS en grupos.js: mayúsculas sin tilde salvo Ñ en ESPAÑA, etc.)
// ═══════════════════════════════════════════════════════════════════
const GROUP_MATCHES = [
  { fecha: "2026-06-11", hora: "14:00", local: "Mexico", visitante: "Sudafrica", grupo: "A", estadio: "Estadio Ciudad de México (Ciudad de México)" },
  { fecha: "2026-06-11", hora: "21:00", local: "Republica de Corea", visitante: "Republica Checa", grupo: "A", estadio: "Estadio Guadalajara (Guadalajara)" },
  { fecha: "2026-06-12", hora: "14:00", local: "Canada", visitante: "Bosnia y Herzegovina", grupo: "B", estadio: "Estadio de Toronto (Toronto)" },
  { fecha: "2026-06-12", hora: "20:00", local: "Estados Unidos", visitante: "Paraguay", grupo: "D", estadio: "Estadio Los Angeles (Los Ángeles)" },
  { fecha: "2026-06-13", hora: "14:00", local: "Qatar", visitante: "Suiza", grupo: "B", estadio: "Estadio de la Bahía de San Francisco (Área de la Bahía)" },
  { fecha: "2026-06-13", hora: "17:00", local: "Brasil", visitante: "Marruecos", grupo: "C", estadio: "Estadio Nueva York/Nueva Jersey (Nueva York)" },
  { fecha: "2026-06-13", hora: "20:00", local: "Haiti", visitante: "Escocia", grupo: "C", estadio: "Estadio Boston (Boston)" },
  { fecha: "2026-06-13", hora: "23:00", local: "Australia", visitante: "Turquia", grupo: "D", estadio: "Estadio BC Place Vancouver (Vancouver)" },
  { fecha: "2026-06-14", hora: "12:00", local: "Alemania", visitante: "Curazao", grupo: "E", estadio: "Estadio Houston (Houston)" },
  { fecha: "2026-06-14", hora: "15:00", local: "Paises Bajos", visitante: "Japon", grupo: "F", estadio: "Estadio Dallas (Dallas)" },
  { fecha: "2026-06-14", hora: "18:00", local: "Costa de Marfil", visitante: "Ecuador", grupo: "E", estadio: "Estadio Filadelfia (Filadelfia)" },
  { fecha: "2026-06-14", hora: "21:00", local: "Suecia", visitante: "Tunez", grupo: "F", estadio: "Estadio Monterrey (Monterrey)" },
  { fecha: "2026-06-15", hora: "11:00", local: "España", visitante: "Cabo Verde", grupo: "H", estadio: "Estadio Atlanta (Atlanta)" },
  { fecha: "2026-06-15", hora: "14:00", local: "Belgica", visitante: "Egipto", grupo: "G", estadio: "Estadio de Seattle (Seattle)" },
  { fecha: "2026-06-15", hora: "17:00", local: "Arabia Saudita", visitante: "Uruguay", grupo: "H", estadio: "Estadio Miami (Miami)" },
  { fecha: "2026-06-15", hora: "20:00", local: "Iran", visitante: "Nueva Zelanda", grupo: "G", estadio: "Estadio Los Angeles (Los Ángeles)" },
  { fecha: "2026-06-16", hora: "14:00", local: "Francia", visitante: "Senegal", grupo: "I", estadio: "Estadio Nueva York/Nueva Jersey (Nueva York)" },
  { fecha: "2026-06-16", hora: "17:00", local: "Irak", visitante: "Noruega", grupo: "I", estadio: "Estadio Boston (Boston)" },
  { fecha: "2026-06-16", hora: "20:00", local: "Argentina", visitante: "Argelia", grupo: "J", estadio: "Estadio Kansas City (Kansas City)" },
  { fecha: "2026-06-16", hora: "23:00", local: "Austria", visitante: "Jordania", grupo: "J", estadio: "Estadio de la Bahía de San Francisco (Área de la Bahía)" },
  { fecha: "2026-06-17", hora: "12:00", local: "Portugal", visitante: "RD Congo", grupo: "K", estadio: "Estadio Houston (Houston)" },
  { fecha: "2026-06-17", hora: "15:00", local: "Inglaterra", visitante: "Croacia", grupo: "L", estadio: "Estadio Dallas (Dallas)" },
  { fecha: "2026-06-17", hora: "18:00", local: "Ghana", visitante: "Panama", grupo: "L", estadio: "Estadio de Toronto (Toronto)" },
  { fecha: "2026-06-17", hora: "21:00", local: "Uzbekistan", visitante: "Colombia", grupo: "K", estadio: "Estadio Ciudad de México (Ciudad de México)" },
  { fecha: "2026-06-18", hora: "11:00", local: "Republica Checa", visitante: "Sudafrica", grupo: "A", estadio: "Estadio Atlanta (Atlanta)" },
  { fecha: "2026-06-18", hora: "14:00", local: "Suiza", visitante: "Bosnia y Herzegovina", grupo: "B", estadio: "Estadio Los Angeles (Los Ángeles)" },
  { fecha: "2026-06-18", hora: "17:00", local: "Canada", visitante: "Qatar", grupo: "B", estadio: "Estadio BC Place Vancouver (Vancouver)" },
  { fecha: "2026-06-18", hora: "20:00", local: "Mexico", visitante: "Republica de Corea", grupo: "A", estadio: "Estadio Guadalajara (Guadalajara)" },
  { fecha: "2026-06-19", hora: "14:00", local: "Estados Unidos", visitante: "Australia", grupo: "D", estadio: "Estadio de Seattle (Seattle)" },
  { fecha: "2026-06-19", hora: "17:00", local: "Escocia", visitante: "Marruecos", grupo: "C", estadio: "Estadio Boston (Boston)" },
  { fecha: "2026-06-19", hora: "19:30", local: "Brasil", visitante: "Haiti", grupo: "C", estadio: "Estadio Filadelfia (Filadelfia)" },
  { fecha: "2026-06-19", hora: "22:00", local: "Turquia", visitante: "Paraguay", grupo: "D", estadio: "Estadio de la Bahía de San Francisco (Área de la Bahía)" },
  { fecha: "2026-06-20", hora: "12:00", local: "Paises Bajos", visitante: "Suecia", grupo: "F", estadio: "Estadio Houston (Houston)" },
  { fecha: "2026-06-20", hora: "15:00", local: "Alemania", visitante: "Costa de Marfil", grupo: "E", estadio: "Estadio de Toronto (Toronto)" },
  { fecha: "2026-06-20", hora: "19:00", local: "Ecuador", visitante: "Curazao", grupo: "E", estadio: "Estadio Kansas City (Kansas City)" },
  { fecha: "2026-06-20", hora: "23:00", local: "Tunez", visitante: "Japon", grupo: "F", estadio: "Estadio Monterrey (Monterrey)" },
  { fecha: "2026-06-21", hora: "11:00", local: "España", visitante: "Arabia Saudita", grupo: "H", estadio: "Estadio Atlanta (Atlanta)" },
  { fecha: "2026-06-21", hora: "14:00", local: "Belgica", visitante: "Iran", grupo: "G", estadio: "Estadio Los Angeles (Los Ángeles)" },
  { fecha: "2026-06-21", hora: "17:00", local: "Uruguay", visitante: "Cabo Verde", grupo: "H", estadio: "Estadio Miami (Miami)" },
  { fecha: "2026-06-21", hora: "20:00", local: "Nueva Zelanda", visitante: "Egipto", grupo: "G", estadio: "Estadio BC Place Vancouver (Vancouver)" },
  { fecha: "2026-06-22", hora: "12:00", local: "Argentina", visitante: "Austria", grupo: "J", estadio: "Estadio Dallas (Dallas)" },
  { fecha: "2026-06-22", hora: "16:00", local: "Francia", visitante: "Irak", grupo: "I", estadio: "Estadio Filadelfia (Filadelfia)" },
  { fecha: "2026-06-22", hora: "19:00", local: "Noruega", visitante: "Senegal", grupo: "I", estadio: "Estadio Nueva York/Nueva Jersey (Nueva York)" },
  { fecha: "2026-06-22", hora: "22:00", local: "Jordania", visitante: "Argelia", grupo: "J", estadio: "Estadio de la Bahía de San Francisco (Área de la Bahía)" },
  { fecha: "2026-06-23", hora: "12:00", local: "Portugal", visitante: "Uzbekistan", grupo: "K", estadio: "Estadio Houston (Houston)" },
  { fecha: "2026-06-23", hora: "15:00", local: "Inglaterra", visitante: "Ghana", grupo: "L", estadio: "Estadio Boston (Boston)" },
  { fecha: "2026-06-23", hora: "18:00", local: "Panama", visitante: "Croacia", grupo: "L", estadio: "Estadio de Toronto (Toronto)" },
  { fecha: "2026-06-23", hora: "21:00", local: "Colombia", visitante: "RD Congo", grupo: "K", estadio: "Estadio Guadalajara (Guadalajara)" },
  { fecha: "2026-06-24", hora: "14:00", local: "Suiza", visitante: "Canada", grupo: "B", estadio: "Estadio BC Place Vancouver (Vancouver)" },
  { fecha: "2026-06-24", hora: "14:00", local: "Bosnia y Herzegovina", visitante: "Qatar", grupo: "B", estadio: "Estadio de Seattle (Seattle)" },
  { fecha: "2026-06-24", hora: "17:00", local: "Escocia", visitante: "Brasil", grupo: "C", estadio: "Estadio Miami (Miami)" },
  { fecha: "2026-06-24", hora: "17:00", local: "Marruecos", visitante: "Haiti", grupo: "C", estadio: "Estadio Atlanta (Atlanta)" },
  { fecha: "2026-06-24", hora: "20:00", local: "Republica Checa", visitante: "Mexico", grupo: "A", estadio: "Estadio Ciudad de México (Ciudad de México)" },
  { fecha: "2026-06-24", hora: "20:00", local: "Sudafrica", visitante: "Republica de Corea", grupo: "A", estadio: "Estadio Monterrey (Monterrey)" },
  { fecha: "2026-06-25", hora: "15:00", local: "Curazao", visitante: "Costa de Marfil", grupo: "E", estadio: "Estadio Filadelfia (Filadelfia)" },
  { fecha: "2026-06-25", hora: "15:00", local: "Ecuador", visitante: "Alemania", grupo: "E", estadio: "Estadio Nueva York/Nueva Jersey (Nueva York)" },
  { fecha: "2026-06-25", hora: "18:00", local: "Japon", visitante: "Suecia", grupo: "F", estadio: "Estadio Dallas (Dallas)" },
  { fecha: "2026-06-25", hora: "18:00", local: "Tunez", visitante: "Paises Bajos", grupo: "F", estadio: "Estadio Kansas City (Kansas City)" },
  { fecha: "2026-06-25", hora: "21:00", local: "Turquia", visitante: "Estados Unidos", grupo: "D", estadio: "Estadio Los Angeles (Los Ángeles)" },
  { fecha: "2026-06-25", hora: "21:00", local: "Paraguay", visitante: "Australia", grupo: "D", estadio: "Estadio de la Bahía de San Francisco (Área de la Bahía)" },
  { fecha: "2026-06-26", hora: "14:00", local: "Noruega", visitante: "Francia", grupo: "I", estadio: "Estadio Boston (Boston)" },
  { fecha: "2026-06-26", hora: "14:00", local: "Senegal", visitante: "Irak", grupo: "I", estadio: "Estadio de Toronto (Toronto)" },
  { fecha: "2026-06-26", hora: "19:00", local: "Cabo Verde", visitante: "Arabia Saudita", grupo: "H", estadio: "Estadio Houston (Houston)" },
  { fecha: "2026-06-26", hora: "19:00", local: "Uruguay", visitante: "España", grupo: "H", estadio: "Estadio Guadalajara (Guadalajara)" },
  { fecha: "2026-06-26", hora: "22:00", local: "Egipto", visitante: "Iran", grupo: "G", estadio: "Estadio de Seattle (Seattle)" },
  { fecha: "2026-06-26", hora: "22:00", local: "Nueva Zelanda", visitante: "Belgica", grupo: "G", estadio: "Estadio BC Place Vancouver (Vancouver)" },
  { fecha: "2026-06-27", hora: "16:00", local: "Panama", visitante: "Inglaterra", grupo: "L", estadio: "Estadio Nueva York/Nueva Jersey (Nueva York)" },
  { fecha: "2026-06-27", hora: "16:00", local: "Croacia", visitante: "Ghana", grupo: "L", estadio: "Estadio Filadelfia (Filadelfia)" },
  { fecha: "2026-06-27", hora: "18:30", local: "Colombia", visitante: "Portugal", grupo: "K", estadio: "Estadio Miami (Miami)" },
  { fecha: "2026-06-27", hora: "18:30", local: "RD Congo", visitante: "Uzbekistan", grupo: "K", estadio: "Estadio Atlanta (Atlanta)" },
  { fecha: "2026-06-27", hora: "21:00", local: "Argelia", visitante: "Austria", grupo: "J", estadio: "Estadio Kansas City (Kansas City)" },
  { fecha: "2026-06-27", hora: "21:00", local: "Jordania", visitante: "Argentina", grupo: "J", estadio: "Estadio Dallas (Dallas)" },
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

function makeMatchId(local, visitante, fecha, faseExtra = '') {
  const base = `${local}_${visitante}_${fecha}`.replace(/\s+/g, '_');
  if (!faseExtra) return base;
  return `${base}_${String(faseExtra).replace(/\s+/g, '_')}`;
}

// ═══════════════════════════════════════════════════════════════════
//  NUKE por lotes (Edge): el cliente reenvía hasta vaciar cada colección
// ═══════════════════════════════════════════════════════════════════
const NUKE_DELETES_LIMIT = 32;
const NUKE_PARTIDOS_LIMIT = 32;

async function nukeCollectionsFinalize() {
  const remainingByCollection = {};
  for (const coll of COLLECTIONS) {
    const rem = await fetchAllRecords(coll.id);
    remainingByCollection[coll.name] = rem.length;
  }
  const ok = Object.values(remainingByCollection).every((x) => x === 0);
  const leftovers = Object.entries(remainingByCollection).map(([n, c]) => `${n}:${c}`).join(' | ');
  return {
    done: true,
    success: ok,
    remainingByCollection,
    message: ok ? `☢️ Nuke usuarios OK. ${leftovers}` : `☢️ Fin de lotes. Quedan -> ${leftovers}`,
  };
}

async function nukeCollectionsBatch(collIndex, limit = NUKE_DELETES_LIMIT) {
  if (collIndex >= COLLECTIONS.length) {
    return nukeCollectionsFinalize();
  }
  const coll = COLLECTIONS[collIndex];
  const res = await apiRequest(`${coll.id}/records?perPage=${limit}&page=1`);
  if (!res.ok) {
    return {
      done: false,
      success: false,
      collIndex,
      advancedCollection: false,
      message: `Error al leer ${coll.name} (HTTP ${res.status})`,
      errors: [`fetch ${coll.name}`],
    };
  }
  const items = (res.data && res.data.items) ? res.data.items : [];
  if (items.length === 0) {
    return {
      done: false,
      success: true,
      collIndex: collIndex + 1,
      advancedCollection: true,
      deleted: 0,
      message: `${coll.name} vacía → colección ${collIndex + 1}.`,
      errors: [],
    };
  }
  const errors = [];
  let deleted = 0;
  for (const item of items) {
    const ok = await deleteRecord(coll.id, item.id);
    if (ok) deleted++;
    else errors.push(`No se pudo eliminar ${coll.name}:${item.id}`);
    await sleep(6);
  }
  return {
    done: false,
    success: errors.length === 0,
    collIndex,
    advancedCollection: false,
    deleted,
    message: `☢️ ${coll.name}: -${deleted}/${items.length} en este lote.`,
    errors,
  };
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

const SEED_USERS_TOTAL = 20;

/** Un usuario por petición (Edge): el cliente llama i=1..20 con el mismo seedTs. */
async function seedOneUser(i, seedTs) {
  const matches = await fetchAllRecords(MATCHES_COLL);
  if (matches.length === 0) {
    return {
      success: false,
      message: 'No hay partidos en la BD. Primero usa CARGAR PARTIDOS.',
      userIndex: i,
      totalUsers: SEED_USERS_TOTAL,
    };
  }
  const subset = matches.slice(0, 12);
  const u = buildRandomUser(i, seedTs);
  const errors = [];
  let profileOk = 0;
  let predsOk = 0;
  let bracketOk = 0;

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
  else errors.push(`Perfil ${u.user_id}: ${profileRes.status}`);

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
    else errors.push(`Pred ${m.id_partido}: ${predRes.status}`);
    await sleep(5);
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
  else errors.push(`Bracket: ${bracketRes.status}`);

  return {
    success: errors.length === 0 && profileOk === 1 && predsOk === subset.length && bracketOk === 1,
    message: `Seed ${i}/${SEED_USERS_TOTAL} · ${u.user_id}: perfil ${profileOk}, preds ${predsOk}/${subset.length}, bracket ${bracketOk}`,
    userIndex: i,
    totalUsers: SEED_USERS_TOTAL,
    profileOk,
    predsOk,
    bracketOk,
    errors,
  };
}

// ═══════════════════════════════════════════════════════════════════
//  CARGAR PARTIDOS: Seed all 96 group stage matches
// ═══════════════════════════════════════════════════════════════════
async function cargarPartidos(offset = 0, limit = null) {
  const total = GROUP_MATCHES.length;
  const end = limit == null ? total : Math.min(offset + limit, total);
  const slice = GROUP_MATCHES.slice(offset, end);

  let created = 0;
  let failed = 0;
  const errors = [];

  for (const m of slice) {
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
      const errDetail = res.data && (res.data.message || res.data.data) ? JSON.stringify(res.data).slice(0, 200) : (res.raw || '').slice(0, 120);
      errors.push(`${m.local} vs ${m.visitante}: ${res.status} ${errDetail}`);
    }
    await sleep(15);
  }

  const nextOffset = end;
  const done = nextOffset >= total;

  return {
    success: failed === 0,
    message: `⚽ Lote: +${created} creados (índices ${offset}–${end - 1}). Total previsto fase grupos: ${total}.`,
    created,
    failed,
    errors,
    offset,
    nextOffset,
    totalExpected: total,
    done,
    sliceLen: slice.length
  };
}

// ═══════════════════════════════════════════════════════════════════
//  NUKE PARTIDOS por lotes
// ═══════════════════════════════════════════════════════════════════
async function nukePartidosBatch(limit = NUKE_PARTIDOS_LIMIT) {
  const res = await apiRequest(`${MATCHES_COLL}/records?perPage=${limit}&page=1`);
  if (!res.ok) {
    return {
      done: true,
      success: false,
      message: `Error al leer partidos (${res.status})`,
      remaining: -1,
      errors: ['fetch'],
    };
  }
  const items = (res.data && res.data.items) ? res.data.items : [];
  if (items.length === 0) {
    const remaining = await fetchAllRecords(MATCHES_COLL);
    return {
      done: true,
      success: remaining.length === 0,
      message: `💣 Partidos: vacío. Restantes: ${remaining.length}`,
      totalDeleted: 0,
      remaining: remaining.length,
      errors: [],
    };
  }
  const errors = [];
  let totalDeleted = 0;
  for (const item of items) {
    const ok = await deleteRecord(MATCHES_COLL, item.id);
    if (ok) totalDeleted++;
    else errors.push(`No se pudo eliminar partido ${item.id}`);
    await sleep(6);
  }
  const remaining = await fetchAllRecords(MATCHES_COLL);
  return {
    done: remaining.length === 0,
    success: errors.length === 0,
    message: `💣 Lote: -${totalDeleted}. Restantes: ${remaining.length}`,
    totalDeleted,
    remaining: remaining.length,
    errors,
  };
}

// ═══════════════════════════════════════════════════════════════════
//  SIMULAR MUNDIAL: Random scores for groups + hardcoded knockout
// ═══════════════════════════════════════════════════════════════════
async function simularMundialGrupos() {
  const allMatches = await fetchAllRecords(MATCHES_COLL);
  const groupMatches = allMatches.filter(m => m.Fase_o_Grupo && m.Fase_o_Grupo.length === 1);

  let patched = 0;
  const errors = [];

  for (const m of groupMatches) {
    const scoreL = Math.floor(Math.random() * 6);
    const scoreV = Math.floor(Math.random() * 6);
    const res = await patchRecord(MATCHES_COLL, m.id, {
      resulltado_local: scoreL,
      resultado_visitante: scoreV
    });
    if (res.ok) patched++;
    else errors.push(`Patch ${m.id}: status ${res.status}`);
    await sleep(12);
  }

  return {
    success: errors.length === 0,
    message: `🎲 Grupos: ${patched}/${groupMatches.length} marcadores aleatorios.`,
    patched,
    groupTotal: groupMatches.length,
    errors
  };
}

async function simularMundialKnockout(offset = 0, limit = null) {
  const total = KNOCKOUT_MATCHES.length;
  const end = limit == null ? total : Math.min(offset + limit, total);
  const slice = KNOCKOUT_MATCHES.slice(offset, end);

  let knockoutCreated = 0;
  const errors = [];

  for (const km of slice) {
    const scoreL = Math.floor(Math.random() * 3) + 1;
    const scoreV = Math.floor(Math.random() * scoreL);
    const record = {
      fecha: km.fecha,
      hora: km.hora,
      equipo_local: km.local,
      equipo_visitante: km.visitante,
      Fase_o_Grupo: km.fase,
      estadio: km.estadio,
      resulltado_local: scoreL,
      resultado_visitante: scoreV,
      id_partido: makeMatchId(km.local, km.visitante, km.fecha, km.fase),
      ganador_final: km.local
    };
    const res = await createRecord(MATCHES_COLL, record);
    if (res.ok) knockoutCreated++;
    else {
      const errDetail = res.data && res.data.message ? String(res.data.message).slice(0, 120) : (res.raw || '').slice(0, 80);
      errors.push(`Knockout ${km.local} vs ${km.visitante}: ${res.status} ${errDetail}`);
    }
    await sleep(15);
  }

  const nextOffset = end;
  const done = nextOffset >= total;

  return {
    success: errors.length === 0,
    message: `🎲 Eliminatorias: +${knockoutCreated} en este lote (índices ${offset}–${end - 1}, total KO ${total}).`,
    knockoutCreated,
    offset,
    nextOffset,
    totalKnockout: total,
    done,
    errors
  };
}

function rowHasScores(m) {
  const a = m.resulltado_local;
  const b = m.resultado_visitante;
  if (a == null && b == null) return false;
  if (String(a).trim() === '' && String(b).trim() === '') return false;
  return true;
}

// ═══════════════════════════════════════════════════════════════════
//  CLEAN SIMULACIÓN por fases: KO por páginas, luego grupos con marcador
// ═══════════════════════════════════════════════════════════════════
async function cleanSimulacionKnockoutPage(page) {
  const res = await apiRequest(`${MATCHES_COLL}/records?perPage=25&page=${page}`);
  if (!res.ok) {
    return { phase: 'ko', done: true, success: false, deleted: 0, message: 'Error fetch KO', errors: [] };
  }
  const items = (res.data && res.data.items) ? res.data.items : [];
  if (items.length === 0) {
    return { phase: 'ko', done: true, success: true, deleted: 0, page, empty: true, message: 'KO: sin más páginas.' };
  }
  let deleted = 0;
  const errors = [];
  for (const m of items) {
    const fase = m.Fase_o_Grupo || '';
    const isGroup = fase.length === 1;
    if (!isGroup) {
      const ok = await deleteRecord(MATCHES_COLL, m.id);
      if (ok) deleted++;
      else errors.push(`KO ${m.id}`);
      await sleep(6);
    }
  }
  return {
    phase: 'ko',
    done: false,
    success: errors.length === 0,
    deleted,
    page,
    empty: false,
    resetToPageOne: deleted > 0,
    message: `🧹 KO p.${page}: eliminados ${deleted}.`,
    errors,
  };
}

async function cleanSimulacionGroupsPage(page) {
  const res = await apiRequest(`${MATCHES_COLL}/records?perPage=30&page=${page}`);
  if (!res.ok) {
    return { phase: 'groups', done: true, success: false, patched: 0, message: 'Error fetch grupos', errors: [] };
  }
  const items = (res.data && res.data.items) ? res.data.items : [];
  if (items.length === 0) {
    return { phase: 'groups', done: true, success: true, patched: 0, page, message: 'Grupos: fin de paginación.' };
  }
  let patched = 0;
  const errors = [];
  for (const m of items) {
    const fase = m.Fase_o_Grupo || '';
    const isGroup = fase.length === 1;
    if (isGroup && rowHasScores(m)) {
      const pr = await patchRecord(MATCHES_COLL, m.id, {
        resulltado_local: null,
        resultado_visitante: null
      });
      if (pr.ok) patched++;
      else errors.push(`reset ${m.id}`);
      await sleep(6);
    }
  }
  return {
    phase: 'groups',
    done: false,
    success: errors.length === 0,
    patched,
    page,
    advancePage: patched === 0,
    message: `🧹 Grupos p.${page}: reseteados ${patched}.`,
    errors,
  };
}

// ═══════════════════════════════════════════════════════════════════
//  HANDLER
// ═══════════════════════════════════════════════════════════════════
export default async function handler(req) {
  const url = getRequestUrl(req);
  const action = url.searchParams.get('action');

  if (req.method === 'POST') {
    if (action === 'nuke_batch') {
      const collIndex = parseInt(url.searchParams.get('coll') || '0', 10);
      const limRaw = url.searchParams.get('limit');
      const limit = limRaw == null || limRaw === '' ? NUKE_DELETES_LIMIT : parseInt(limRaw, 10);
      const result = await nukeCollectionsBatch(collIndex, limit);
      return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
    }

    if (action === 'seed_one') {
      const i = parseInt(url.searchParams.get('i') || '1', 10);
      const seedTs = parseInt(url.searchParams.get('seedTs') || '0', 10) || Date.now();
      const result = await seedOneUser(i, seedTs);
      return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
    }

    if (action === 'cargar_partidos') {
      const offset = parseInt(url.searchParams.get('offset') || '0', 10);
      const limRaw = url.searchParams.get('limit');
      const limit = limRaw == null || limRaw === '' ? null : parseInt(limRaw, 10);
      const result = await cargarPartidos(offset, limit);
      return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
    }

    if (action === 'nuke_partidos_batch') {
      const limRaw = url.searchParams.get('limit');
      const limit = limRaw == null || limRaw === '' ? NUKE_PARTIDOS_LIMIT : parseInt(limRaw, 10);
      const result = await nukePartidosBatch(limit);
      return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
    }

    if (action === 'simular_grupos') {
      const result = await simularMundialGrupos();
      return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
    }

    if (action === 'simular_knockout') {
      const offset = parseInt(url.searchParams.get('offset') || '0', 10);
      const limRaw = url.searchParams.get('limit');
      const limit = limRaw == null || limRaw === '' ? 12 : parseInt(limRaw, 10);
      const result = await simularMundialKnockout(offset, limit);
      return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
    }

    /** Compat: una sola llamada = solo fase grupos (evita timeout); el UI encadena KO. */
    if (action === 'simular') {
      const g = await simularMundialGrupos();
      return new Response(JSON.stringify({
        ...g,
        message: g.message + ' Usa el botón SIMULAR completo o ejecuta simular_knockout por lotes.',
        hint: 'simular_knockout'
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (action === 'clean_ko') {
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const result = await cleanSimulacionKnockoutPage(page);
      return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
    }

    if (action === 'clean_groups') {
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const result = await cleanSimulacionGroupsPage(page);
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
            <button class="btn btn-cargar" onclick="run('cargar_partidos')">📦 CARGAR PARTIDOS (${GROUP_MATCHES.length})</button>
            <button class="btn btn-nuke-p" onclick="run('nuke_partidos')">💣 NUKE PARTIDOS</button>
        </div>

        <div class="section">
            <div class="section-label">🎲 SIMULACIÓN</div>
            <button class="btn btn-simular" onclick="run('simular')">🎲 SIMULAR (grupos + ${KNOCKOUT_MATCHES.length} KO)</button>
            <button class="btn btn-clean" onclick="run('clean_simulacion')">🧹 CLEAN SIMULACIÓN</button>
        </div>

        <div id="status"></div>
    </div>

    <script>
        var SEED_TOTAL = 20;
        async function parseJsonSafe(res) {
            const text = await res.text();
            try {
                return JSON.parse(text);
            } catch (e) {
                throw new Error('Respuesta no JSON (timeout o error de plataforma). HTTP ' + res.status + '. Inicio: ' + text.slice(0, 350));
            }
        }
        function setBusy(on) {
            document.querySelectorAll('.btn').forEach(function (b) { b.disabled = on; });
        }
        async function runCargarPartidos() {
            const st = document.getElementById('status');
            setBusy(true);
            st.style.color = 'white';
            const chunk = 25;
            var offset = 0;
            var lines = [];
            try {
                while (true) {
                    st.innerText = 'Cargando partidos… índice ' + offset;
                    var res = await fetch('?action=cargar_partidos&offset=' + offset + '&limit=' + chunk, { method: 'POST' });
                    var data = await parseJsonSafe(res);
                    lines.push(data.message);
                    if (data.errors && data.errors.length) lines = lines.concat(data.errors.slice(0, 5));
                    if (data.done) break;
                    offset = data.nextOffset;
                }
                st.innerText = lines.join('\\n');
                st.style.color = '#C9FF24';
            } catch (e) {
                st.innerText = String(e.message);
                st.style.color = '#FF0055';
            } finally {
                setBusy(false);
            }
        }
        async function runSimularCompleto() {
            const st = document.getElementById('status');
            setBusy(true);
            st.style.color = 'white';
            var lines = [];
            try {
                st.innerText = 'Simulando fase de grupos…';
                var r1 = await fetch('?action=simular_grupos', { method: 'POST' });
                var d1 = await parseJsonSafe(r1);
                lines.push(d1.message);
                var off = 0;
                var batch = 8;
                var guard = 0;
                while (true) {
                    st.innerText = lines.join(' | ') + ' — KO offset ' + off;
                    var r2 = await fetch('?action=simular_knockout&offset=' + off + '&limit=' + batch, { method: 'POST' });
                    var d2 = await parseJsonSafe(r2);
                    lines.push(d2.message);
                    if (d2.errors && d2.errors.length) lines = lines.concat(d2.errors.slice(0, 4));
                    if (d2.done) break;
                    off = d2.nextOffset;
                    guard++;
                    if (guard > 200) throw new Error('Demasiadas iteraciones KO');
                }
                st.innerText = lines.join('\\n');
                st.style.color = '#C9FF24';
            } catch (e) {
                st.innerText = String(e.message);
                st.style.color = '#FF0055';
            } finally {
                setBusy(false);
            }
        }
        async function runBatchedNuke() {
            const st = document.getElementById('status');
            setBusy(true);
            st.style.color = 'white';
                var lines = [];
            var collIndex = 0;
            var nukeGuard = 0;
            try {
                while (true) {
                    st.innerText = 'NUKE usuarios · colección ' + collIndex + '…';
                    var res = await fetch('?action=nuke_batch&coll=' + collIndex, { method: 'POST' });
                    var data = await parseJsonSafe(res);
                    lines.push(data.message);
                    if (data.errors && data.errors.length) lines = lines.concat(data.errors.slice(0, 4));
                    if (data.done) {
                        st.innerText = lines.join('\\n') + '\\n' + (data.message || '');
                        st.style.color = data.success ? '#C9FF24' : '#FF0055';
                        return;
                    }
                    if (data.advancedCollection) collIndex = data.collIndex;
                    nukeGuard++;
                    if (nukeGuard > 800) throw new Error('Límite NUKE usuarios');
                }
            } catch (e) {
                st.innerText = String(e.message);
                st.style.color = '#FF0055';
            } finally {
                setBusy(false);
            }
        }
        async function runBatchedNukePartidos() {
            const st = document.getElementById('status');
            setBusy(true);
            st.style.color = 'white';
            var lines = [];
            var guard = 0;
            try {
                while (true) {
                    st.innerText = 'NUKE partidos… lote ' + (guard + 1);
                    var res = await fetch('?action=nuke_partidos_batch', { method: 'POST' });
                    var data = await parseJsonSafe(res);
                    lines.push(data.message);
                    if (data.errors && data.errors.length) lines = lines.concat(data.errors.slice(0, 4));
                    if (data.done) {
                        st.innerText = lines.join('\\n');
                        st.style.color = data.success ? '#C9FF24' : '#FF0055';
                        return;
                    }
                    guard++;
                    if (guard > 500) throw new Error('Demasiadas iteraciones nuke partidos');
                }
            } catch (e) {
                st.innerText = String(e.message);
                st.style.color = '#FF0055';
            } finally {
                setBusy(false);
            }
        }
        async function runBatchedSeed() {
            const st = document.getElementById('status');
            setBusy(true);
            st.style.color = 'white';
            var lines = [];
            var seedTs = Date.now();
            try {
                var collIndex = 0;
                var sg = 0;
                while (true) {
                    st.innerText = 'Seed: limpiando usuarios · coll ' + collIndex + '…';
                    var nr = await fetch('?action=nuke_batch&coll=' + collIndex, { method: 'POST' });
                    var nd = await parseJsonSafe(nr);
                    lines.push(nd.message);
                    if (nd.done) break;
                    if (nd.advancedCollection) collIndex = nd.collIndex;
                    sg++;
                    if (sg > 800) throw new Error('Límite NUKE en seed');
                }
                for (var i = 1; i <= SEED_TOTAL; i++) {
                    st.innerText = 'Seed usuario ' + i + '/' + SEED_TOTAL + '…';
                    var sr = await fetch('?action=seed_one&i=' + i + '&seedTs=' + seedTs, { method: 'POST' });
                    var sd = await parseJsonSafe(sr);
                    lines.push(sd.message);
                    if (!sd.success && i === 1) {
                        st.innerText = lines.join('\\n');
                        st.style.color = '#FF0055';
                        return;
                    }
                }
                st.innerText = lines.join('\\n');
                st.style.color = '#C9FF24';
            } catch (e) {
                st.innerText = String(e.message);
                st.style.color = '#FF0055';
            } finally {
                setBusy(false);
            }
        }
        async function runBatchedClean() {
            const st = document.getElementById('status');
            setBusy(true);
            st.style.color = 'white';
            var lines = [];
            try {
                var page = 1;
                var g = 0;
                st.innerText = 'Clean: fase eliminatoria (KO)…';
                while (true) {
                    var res = await fetch('?action=clean_ko&page=' + page, { method: 'POST' });
                    var data = await parseJsonSafe(res);
                    lines.push(data.message);
                    if (data.done) break;
                    if (data.resetToPageOne) page = 1;
                    else page++;
                    g++;
                    if (g > 500) throw new Error('Límite clean KO');
                }
                page = 1;
                g = 0;
                st.innerText = 'Clean: grupos (marcadores)…';
                while (true) {
                    var res2 = await fetch('?action=clean_groups&page=' + page, { method: 'POST' });
                    var d2 = await parseJsonSafe(res2);
                    lines.push(d2.message);
                    if (d2.done) break;
                    if (d2.advancePage) page++;
                    else page = 1;
                    g++;
                    if (g > 500) throw new Error('Límite clean grupos');
                }
                st.innerText = lines.join('\\n');
                st.style.color = '#C9FF24';
            } catch (e) {
                st.innerText = String(e.message);
                st.style.color = '#FF0055';
            } finally {
                setBusy(false);
            }
        }
        async function run(action) {
            if (action === 'cargar_partidos') return runCargarPartidos();
            if (action === 'simular') return runSimularCompleto();
            if (action === 'nuke') return runBatchedNuke();
            if (action === 'seed') return runBatchedSeed();
            if (action === 'nuke_partidos') return runBatchedNukePartidos();
            if (action === 'clean_simulacion') return runBatchedClean();
            const st = document.getElementById('status');
            setBusy(true);
            st.innerText = 'PROCESANDO...';
            st.style.color = 'white';
            try {
                const res = await fetch('?action=' + encodeURIComponent(action), { method: 'POST' });
                const data = await parseJsonSafe(res);
                st.innerText = data.message || JSON.stringify(data);
                st.style.color = data.success !== false ? '#C9FF24' : '#FF0055';
            } catch (e) {
                st.innerText = 'ERROR: ' + e.message;
                st.style.color = '#FF0055';
            } finally {
                setBusy(false);
            }
        }
    </script>
</body>
</html>`;

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
