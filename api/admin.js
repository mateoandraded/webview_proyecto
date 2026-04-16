export const config = {
  runtime: 'edge',
};

const API_KEY = "db_HQIwDXV9xkJTEU5F3wwYAGhHAGInsItCu79g5FSz6e3106ee";
const BASE_URL = "https://mateoacademy-9djnmu.jelou.cloud/api/collections";

const COLLECTIONS = [
  { id: "pbc_1944158292", name: "torneo_pronosticos" },
  { id: "pbc_3271891893", name: "torneo_ranking/perfil" },
  { id: "pbc_3221812075", name: "brackets/clasificados" },
];

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

function getRandomItems(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

async function nukeCollections() {
  let totalDeleted = 0;
  const errors = [];

  for (const coll of COLLECTIONS) {
    // Segundo pase de verificación para evitar residuos por paginación/carrera.
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

export default async function handler(req) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  if (req.method === 'POST') {
    if (action === 'nuke') {
      const cleanup = await nukeCollections();
      const leftovers = Object.entries(cleanup.remainingByCollection)
        .map(([name, count]) => `${name}:${count}`)
        .join(' | ');

      return new Response(JSON.stringify({
        success: cleanup.errors.length === 0 && Object.values(cleanup.remainingByCollection).every((x) => x === 0),
        message: `☢️ LIMPIEZA COMPLETA. Eliminados ${cleanup.totalDeleted}. Restantes -> ${leftovers}`,
        deleted: cleanup.totalDeleted,
        remaining: cleanup.remainingByCollection,
        errors: cleanup.errors
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (action === 'seed') {
      // Seed robusto: primero limpia tablas objetivo.
      const cleanup = await nukeCollections();
      const matches = await fetchAllRecords('pbc_631836067');
      if (matches.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          message: "No hay partidos en pbc_631836067",
          cleanup
        }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

      const subset = matches.slice(0, 12); // cobertura razonable y runtime estable
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
  }

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Mundial 2026</title>
    <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;900&display=swap" rel="stylesheet">
    <style>
        :root { --black: #000; --white: #fff; --lime: #C9FF24; --mag: #FF0055; --bg: #111; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); color: var(--white); font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; }
        .card { background: var(--black); border: 2px solid var(--white); padding: 40px; width: 90%; max-width: 400px; }
        h1 { font-family: 'Archivo Black'; font-size: 24px; margin-bottom: 30px; letter-spacing: -1px; }
        .btn { width: 100%; padding: 20px; font-family: 'Archivo Black'; font-size: 16px; border: none; cursor: pointer; margin-bottom: 15px; transition: 0.2s; text-transform: uppercase; }
        .btn-nuke { background: var(--mag); color: var(--white); }
        .btn-seed { background: var(--lime); color: var(--black); }
        .btn:active { transform: scale(0.95); opacity: 0.8; }
        #status { margin-top: 20px; font-size: 12px; font-weight: 900; color: var(--lime); min-height: 20px; }
    </style>
</head>
<body>
    <div class="card">
        <h1>🛠 PANEL DE CONTROL</h1>
        <button class="btn btn-nuke" onclick="run('nuke')">☢️ ELIMINAR TODO (NUKE)</button>
        <button class="btn btn-seed" onclick="run('seed')">🌱 POBLAR (BRING TO LIFE)</button>
        <div id="status"></div>
    </div>

    <script>
        async function run(action) {
            const st = document.getElementById('status');
            st.innerText = 'PROCESANDO...';
            st.style.color = 'white';
            try {
                const res = await fetch(\`?action=\${action}\`, { method: 'POST' });
                const data = await res.json();
                st.innerText = data.message || 'OK';
                st.style.color = data.success ? '#C9FF24' : '#FF0055';
            } catch (e) {
                st.innerText = 'ERROR EN LA PETICIÓN';
                st.style.color = '#FF0055';
            }
        }
    </script>
</body>
</html>`;

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
