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

const WC_TEAMS = ["MEXICO","ESTADOS UNIDOS","CANADA","BRASIL","ARGENTINA","ECUADOR","COLOMBIA","URUGUAY","PARAGUAY","CHILE","PERU","VENEZUELA","ALEMANIA","ESPAÑA","FRANCIA","PORTUGAL","BELGICA","PAISES BAJOS","CROACIA","SERBIA","SUIZA","TURQUIA","DINAMARCA","AUSTRIA","POLONIA","RUMANIA","ESLOVENIA","ESLOVAQUIA","ALBANIA","UCRANIA","GRECIA","MARRUECOS","SENEGAL","NIGERIA","CAMERUN","COSTA DE MARFIL","EGIPTO","GHANA","TUNEZ","JAPON","COREA DEL SUR","AUSTRALIA","IRAN","ARABIA SAUDITA","INDONESIA","COSTA RICA","PANAMA","JAMAICA"];

async function fetchDB(coll, query = '') {
  const url = `${BASE_URL}/${coll}/records?perPage=500${query}`;
  const res = await fetch(url, { headers: { "X-Api-Key": API_KEY, "Accept": "application/json" } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

async function deleteRecord(coll, id) {
  const url = `${BASE_URL}/${coll}/records/${id}`;
  const res = await fetch(url, { method: 'DELETE', headers: { "X-Api-Key": API_KEY } });
  return res.status === 204 || res.ok;
}

async function createRecord(coll, body) {
  const url = `${BASE_URL}/${coll}/records`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { "X-Api-Key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.ok;
}

function getRandomItems(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

export default async function handler(req) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  if (req.method === 'POST') {
    if (action === 'nuke') {
      let totalDeleted = 0;
      for (const coll of COLLECTIONS) {
        let items = [];
        let page = 1;
        while (true) {
          const fetched = await fetchDB(coll.id, `&page=${page}`);
          if (fetched.length === 0) break;
          for (const item of fetched) {
            const ok = await deleteRecord(coll.id, item.id);
            if (ok) totalDeleted++;
          }
          if (fetched.length < 500) break;
          page++;
        }
      }
      return new Response(JSON.stringify({ success: true, message: `☢️ TODO LIMPIO. Eliminados ${totalDeleted} registros.` }));
    }

    if (action === 'seed') {
      const matches = await fetchDB('pbc_631836067'); // Partidos base
      if (matches.length === 0) return new Response(JSON.stringify({ error: "No hay partidos en pbc_631836067" }), { status: 400 });

      for (let i = 1; i <= 20; i++) {
        const userId = `dummy_user_${i}`;
        const name = `Bot_${i}`;
        
        // 1. Perfil
        await createRecord('pbc_3271891893', {
          user_id: userId, nombre: name, apellido: "Tester",
          total_puntos: 0, puntos_goles: 0, puntos_brackets: 0, pronosticos_correctos: 0
        });

        // 2. Goles (Limitamos a 10 partidos para no saturar el runtime)
        const subset = matches.slice(0, 10);
        for (const m of subset) {
          await createRecord('pbc_1944158292', {
            user_id: userId, match_id: m.id_partido,
            equipo_local: m.equipo_local, equipo_visitante: m.equipo_visitante,
            pronostico_local: Math.floor(Math.random() * 5),
            pronostico_visitante: Math.floor(Math.random() * 5),
            fecha_partido: m.fecha, estado: 'PENDIENTE'
          });
        }

        // 3. Brackets
        const d16 = getRandomItems(WC_TEAMS, 32);
        const d8 = getRandomItems(d16, 16);
        const d4 = getRandomItems(d8, 8);
        const semis = getRandomItems(d4, 4);
        const finals = getRandomItems(semis, 4);
        
        await createRecord('pbc_3221812075', {
          user_id: userId, dieciseisavos: d16, octavos: d8, cuartos: d4, semis: semis,
          campeon: finals[0], subcampeon: finals[1], tercer_lugar: finals[2], cuarto_lugar: finals[3]
        });
      }
      return new Response(JSON.stringify({ success: true, message: "20 usuarios creados con éxito." }));
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
