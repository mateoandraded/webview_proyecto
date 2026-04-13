export const config = {
  runtime: 'edge',
};

function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default function handler(req) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;

  const nombre = searchParams.get('nombre') || '';
  const posicion = Number(searchParams.get('posicion')) || 0;
  const puntos = Number(searchParams.get('puntos')) || 0;
  const aciertos = Number(searchParams.get('aciertos')) || 0;
  const total = Number(searchParams.get('total')) || 0;
  const top5Raw = searchParams.get('top5') || '[]';

  let top5 = [];
  try {
    top5 = JSON.parse(decodeURIComponent(top5Raw));
    if (!Array.isArray(top5)) top5 = [];
  } catch (e) {
    top5 = [];
  }

  const liderPuntos = top5.length > 0 ? Number(top5[0].puntos) || 0 : 0;

  let motivacional = 'Cada pronóstico suma. ¡Tú puedes! ⚽';
  if (posicion === 1) motivacional = '¡Vas primero! Defendé el liderato 🔥';
  else if (posicion > 1 && posicion <= 3) motivacional = '¡Estás en el podio! 🏅';
  else if (posicion > 3 && posicion <= 5) motivacional = '¡Dentro del Top 5! Seguí así 💪';
  else if (posicion > 5 && posicion <= 10) motivacional = 'Vas bien, podés subir más 📈';

  const emptyState = '<div class="empty-state">Aún no hay participantes en el ranking</div>';
  
  const top5Html = top5.length > 0 ? top5.map(t => {
    const posNum = Number(t.posicion) || 0;
    let medalEmoji = `#${posNum}`;
    if (posNum === 1) medalEmoji = '🥇';
    else if (posNum === 2) medalEmoji = '🥈';
    else if (posNum === 3) medalEmoji = '🥉';

    const pct = liderPuntos > 0 ? Math.min(100, Math.max(0, (t.puntos / liderPuntos) * 100)) : 0;
    const isUser = nombre && String(t.nombre).trim().toLowerCase() === nombre.trim().toLowerCase();
    const badgeHtml = isUser ? '<div class="badge-tu">Tú</div>' : '';
    const nameClass = isUser ? 'es-usuario' : '';

    return `
          <div class="top-card pos-${posNum}">
            ${badgeHtml}
            <div class="medal">${medalEmoji}</div>
            <div class="tc-info">
              <div class="tc-name ${nameClass}">${esc(t.nombre)}</div>
              <div class="tc-meta">
                <div class="tc-chip">✓ ${t.aciertos || 0} aciertos</div>
                <div class="tc-bar-bg">
                  <div class="tc-bar-fill" style="width: ${pct}%;"></div>
                </div>
              </div>
            </div>
            <div class="tc-score">
              <div class="tc-score-pts">${t.puntos || 0}</div>
              <div class="tc-score-lbl">pts</div>
            </div>
          </div>
    `;
  }).join('') : emptyState;

  const totalHtml = total > 0 ? `<div class="tu-total">Entre ${total} participantes</div>` : '';
  const statPos = posicion > 0 ? `#${posicion}` : '—';
  const statPtos = puntos > 0 ? puntos : '—';
  const statAcier = aciertos > 0 ? aciertos : '—';

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Ranking Quiniela WebView</title>
  <style>
    :root {
      --bordeaux: #6B0F1A;
      --bordeaux-dark: #4A0A12;
      --gold: #C9A84C;
      --gold-light: #F0CC6E;
      --silver: #A8A9AD;
      --bronze: #CD7F32;
      --text-dark: #1A1A2E;
      --text-muted: #6B6B80;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background-color: #F8F9FA; color: var(--text-dark); -webkit-font-smoothing: antialiased; }
    .container { max-width: 430px; margin: 0 auto; background: #F8F9FA; min-height: 100vh; display: flex; flex-direction: column; }
    .header { background: linear-gradient(160deg, #4A0A12 0%, #6B0F1A 40%, #8B1A2A 70%, #3D0A10 100%); padding: 30px 20px 40px; text-align: center; position: relative; overflow: hidden; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; box-shadow: 0 4px 20px rgba(74, 10, 18, 0.4); }
    .header::before { content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: repeating-linear-gradient(45deg, var(--gold) 0, var(--gold) 1px, transparent 1px, transparent 10px); opacity: 0.06; pointer-events: none; }
    .header-chip { display: inline-block; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); padding: 4px 12px; border-radius: 20px; color: #FFF; font-size: 11px; font-weight: 600; margin-bottom: 12px; letter-spacing: 0.5px; }
    .header-title { color: var(--gold-light); font-size: 22px; font-weight: 800; margin-bottom: 6px; position: relative; }
    .header-subtitle { color: rgba(255, 255, 255, 0.55); font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; position: relative; }
    .content { padding: 0 20px 30px; margin-top: -25px; flex: 1; }
    .tu-card { background: linear-gradient(135deg, #C9A84C 0%, #F0CC6E 50%, #E8B84B 100%); border-radius: 20px; padding: 20px; box-shadow: 0 8px 32px rgba(201,168,76,0.35); position: relative; overflow: hidden; margin-bottom: 30px; }
    .tu-card::after { content: ""; position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.2); border-radius: 50%; pointer-events: none; }
    .tu-label { color: rgba(107, 15, 26, 0.65); text-transform: uppercase; font-size: 10px; font-weight: 800; letter-spacing: 1px; margin-bottom: 4px; }
    .tu-name { color: var(--bordeaux-dark); font-size: 20px; font-weight: 800; margin-bottom: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; position: relative; z-index: 1; }
    .tu-stats { display: flex; gap: 10px; margin-bottom: 12px; }
    .tu-stat-box { flex: 1; background: rgba(255,255,255,0.45); border-radius: 12px; padding: 12px 8px; text-align: center; }
    .tu-stat-val { color: var(--bordeaux-dark); font-size: 18px; font-weight: 900; margin-bottom: 2px; }
    .tu-stat-lbl { color: rgba(74, 10, 18, 0.7); font-size: 9px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
    .tu-total { text-align: right; color: rgba(74, 10, 18, 0.7); font-size: 11px; font-weight: 600; margin-bottom: 12px; }
    .tu-motivational { background: rgba(255,255,255,0.3); padding: 10px; border-radius: 10px; text-align: center; color: var(--bordeaux-dark); font-size: 12px; font-weight: 700; }
    .section-title { display: flex; align-items: center; margin-bottom: 16px; }
    .section-title h3 { font-size: 14px; font-weight: 800; color: rgba(26, 26, 46, 0.8); text-transform: uppercase; letter-spacing: 1px; margin-right: 12px; }
    .section-title::after { content: ""; flex: 1; height: 2px; background: linear-gradient(to right, rgba(201,168,76,0.4), transparent); border-radius: 2px; }
    .top-list { display: flex; flex-direction: column; gap: 12px; }
    .top-card { background: rgba(255,255,255,0.97); border-radius: 16px; padding: 14px 16px; display: flex; align-items: center; box-shadow: 0 4px 15px rgba(0,0,0,0.04); position: relative; border-left: 4px solid #E0E0E8; }
    .top-card.pos-1 { border-left-color: var(--gold); background: linear-gradient(to right, rgba(201,168,76,0.07), #FFF); }
    .top-card.pos-2 { border-left-color: var(--silver); }
    .top-card.pos-3 { border-left-color: var(--bronze); }
    .badge-tu { position: absolute; top: -6px; right: 16px; background: var(--bordeaux-dark); color: #FFF; font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 10px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 2px 5px rgba(74, 10, 18, 0.3); }
    .medal { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; flex-shrink: 0; margin-right: 14px; background: #F0F0F5; color: var(--text-muted); }
    .top-card.pos-1 .medal { background: rgba(201,168,76,0.15); }
    .top-card.pos-2 .medal { background: rgba(168,169,173,0.15); }
    .top-card.pos-3 .medal { background: rgba(205,127,50,0.15); }
    .tc-info { flex: 1; min-width: 0; padding-right: 10px; }
    .tc-name { font-size: 15px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tc-name.es-usuario { color: var(--bordeaux); }
    .tc-meta { display: flex; align-items: center; gap: 8px; }
    .tc-chip { background: #F0F4FF; color: #4A60A0; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 12px; }
    .tc-bar-bg { flex: 1; height: 3px; background: rgba(201,168,76,0.15); border-radius: 3px; overflow: hidden; }
    .tc-bar-fill { height: 100%; background: var(--gold); border-radius: 3px; }
    .tc-score { text-align: right; }
    .tc-score-pts { font-size: 20px; font-weight: 900; color: var(--bordeaux); line-height: 1; }
    .tc-score-lbl { font-size: 9px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-top: 2px; }
    .empty-state { text-align: center; padding: 30px 20px; color: var(--text-muted); font-size: 13px; background: #FFF; border-radius: 16px; font-weight: 600; }
    .divider { text-align: center; margin: 30px 0; position: relative; }
    .divider::before { content: ""; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: rgba(26, 26, 46, 0.08); z-index: 0; }
    .divider span { position: relative; background: #F8F9FA; padding: 0 10px; font-size: 14px; color: rgba(26, 26, 46, 0.3); z-index: 1; }
    .footer { text-align: center; color: rgba(26, 26, 46, 0.25); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-chip">📅 20 Nov — 18 Dic 2022</div>
      <div class="header-title">⚽ Quiniela Qatar 2022</div>
      <div class="header-subtitle">Tabla de Posiciones</div>
    </div>

    <div class="content">
      <div class="tu-card">
        <div class="tu-label">⚽ Tu posición</div>
        <div class="tu-name">${esc(nombre)}</div>
        <div class="tu-stats">
          <div class="tu-stat-box">
            <div class="tu-stat-val">${statPos}</div>
            <div class="tu-stat-lbl">Puesto</div>
          </div>
          <div class="tu-stat-box">
            <div class="tu-stat-val">${statPtos}</div>
            <div class="tu-stat-lbl">Puntos</div>
          </div>
          <div class="tu-stat-box">
            <div class="tu-stat-val">${statAcier}</div>
            <div class="tu-stat-lbl">Aciertos</div>
          </div>
        </div>
        ${totalHtml}
        <div class="tu-motivational">${motivacional}</div>
      </div>

      <div class="section-title">
        <h3>🏆 Top 5</h3>
      </div>

      <div class="top-list">
        ${top5Html}
      </div>

      <div class="divider"><span>⚽</span></div>
      <div class="footer">Quiniela del Mundial · Qatar 2022</div>
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}
