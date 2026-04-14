export const config = {
  runtime: 'edge',
};

const API_KEY = "db_HQIwDXV9xkJTEU5F3wwYAGhHAGInsItCu79g5FSz6e3106ee";
const BASE_URL = "https://mateoacademy-9djnmu.jelou.cloud/api/collections/pbc_3271891893/records";

export default async function handler(req) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('user_id') || 'GUEST';

  let profile = {
    nombre: 'Inbvitado',
    apellido: '',
    total_puntos: 0,
    puntos_goles: 0,
    puntos_brackets: 0,
    pronosticos_correctos: 0
  };

  if (userId !== 'GUEST') {
    try {
      const res = await fetch(`${BASE_URL}?filter=(user_id='${userId}')`, {
        headers: { 'X-Api-Key': API_KEY }
      });
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.items || []);
        if (items.length > 0) profile = items[0];
      }
    } catch (e) { }
  }

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Mi Perfil - Quiniela 2026</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Outfit:wght@700;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #4A0E17; --secondary: #900020; --accent: #D4AF37;
      --bg-dark: #0A0A0A; --surface: #1A1A1A; --surface-light: #2A2A2A; --text: #F8F9FA; --text-muted: #A0AEC0;
      --radius-lg: 20px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
    body { background-color: var(--bg-dark); color: var(--text); background-image: radial-gradient(circle at top, rgba(212, 175, 55, 0.15) 0%, transparent 50%); min-height: 100vh; display: flex; flex-direction: column; align-items: center; }

    .header { padding: 40px 20px 20px; text-align: center; width: 100%; max-width: 600px; }
    h1 { font-family: 'Outfit', sans-serif; font-size: 32px; color: var(--accent); margin-bottom: 5px; }
    .subtitle { color: var(--text-muted); font-size: 15px; }

    .profile-card { background: var(--surface); border-radius: var(--radius-lg); width: 100%; max-width: 500px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.05); margin-top: 20px; }
    .profile-head { background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); padding: 30px 20px; text-align: center; }
    
    .avatar-placeholder { width: 80px; height: 80px; background: rgba(0,0,0,0.5); border-radius: 50%; display: inline-flex; justify-content: center; align-items: center; font-size: 30px; border: 3px solid var(--accent); margin-bottom: 15px; }
    
    .user-name { font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 700; color: #FFF; }

    .stats-main { display: flex; justify-content: space-around; padding: 25px 10px; background: var(--surface-light); border-bottom: 1px solid rgba(255,255,255,0.05); }
    .stat-box { text-align: center; flex: 1; }
    .stat-val { font-family: 'Outfit', sans-serif; font-size: 36px; color: var(--accent); font-weight: 900; line-height: 1; margin-bottom: 5px; }
    .stat-lbl { font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600; letter-spacing: 0.5px; }

    .points-breakdown { padding: 20px; }
    .bd-row { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.02); }
    .bd-row:last-child { border-bottom: none; }
    
    .bd-icon { width: 35px; height: 35px; background: rgba(212,175,55,0.1); color: var(--accent); border-radius: 10px; display: flex; justify-content: center; align-items: center; font-size: 16px; margin-right: 15px; }
    .bd-title-wrap { flex: 1; }
    .bd-title { font-weight: 600; font-size: 14px; }
    .bd-sub { font-size: 12px; color: var(--text-muted); }
    
    .bd-val { font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 800; color: #FFF; }
    .bd-val.acc { color: #00E6C3; }

  </style>
</head>
<body>

  <div class="header">
    <h1>MI RENDIMIENTO</h1>
    <div class="subtitle">Estadísticas Oficiales</div>
  </div>

  <div class="profile-card">
    <div class="profile-head">
      <div class="avatar-placeholder">👤</div>
      <div class="user-name">${profile.nombre} ${profile.apellido}</div>
    </div>
    
    <div class="stats-main">
      <div class="stat-box">
        <div class="stat-val">${profile.total_puntos || 0}</div>
        <div class="stat-lbl">Puntos Totales</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">${profile.pronosticos_correctos || 0}</div>
        <div class="stat-lbl">Resultados Precisos</div>
      </div>
    </div>

    <div class="points-breakdown">
      <div class="bd-row">
        <div class="bd-icon">⚽</div>
        <div class="bd-title-wrap">
          <div class="bd-title">Puntos por Partidos</div>
          <div class="bd-sub">Fase de Grupos</div>
        </div>
        <div class="bd-val">${profile.puntos_goles || 0}</div>
      </div>
      
      <div class="bd-row">
        <div class="bd-icon">🏆</div>
        <div class="bd-title-wrap">
          <div class="bd-title">Puntos por Brackets</div>
          <div class="bd-sub">Fases Finales y Campeón</div>
        </div>
        <div class="bd-val">${profile.puntos_brackets || 0}</div>
      </div>
    </div>
  </div>

</body>
</html>`;

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
