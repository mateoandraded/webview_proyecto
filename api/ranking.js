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
  const executionId = searchParams.get('executionId') || '';
  const top5Raw = searchParams.get('top5') || '[]';

  let top5 = [];
  try {
    top5 = JSON.parse(decodeURIComponent(top5Raw));
    if (!Array.isArray(top5)) top5 = [];
  } catch (e) {
    top5 = [];
  }

  // Verificar si el usuario está en el top 5
  let userInTop5 = false;
  if (nombre) {
    userInTop5 = top5.some(t => String(t.nombre).trim().toLowerCase() === nombre.trim().toLowerCase());
  }

  let finalCards = [...top5];
  const emptyState = '<div class="empty-state">Aún no hay participantes en el ranking</div>';
  let listHtml = '';

  // Colores vibrantes del Mundial 2026 para cada posición
  const posColors = [
    { bg: 'linear-gradient(135deg, #00E6C3 0%, #00B896 100%)', accent: '#00E6C3', text: '#003D33' },  // 1st - turquesa
    { bg: 'linear-gradient(135deg, #E835A0 0%, #C42D87 100%)', accent: '#E835A0', text: '#3D0A28' },  // 2nd - magenta
    { bg: 'linear-gradient(135deg, #FFD100 0%, #F5C400 100%)', accent: '#FFD100', text: '#3D3200' },  // 3rd - amarillo
    { bg: 'linear-gradient(135deg, #7B61FF 0%, #6347E0 100%)', accent: '#7B61FF', text: '#1E154A' },  // 4th - púrpura
    { bg: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', accent: '#3B82F6', text: '#0F1D3D' },  // 5th - azul
  ];

  if (finalCards.length > 0) {
    listHtml = finalCards.map((t, idx) => {
      const posNum = Number(t.posicion) || 0;
      const colorSet = posColors[Math.min(idx, posColors.length - 1)];
      
      let medalEmoji = '';
      let medalContent = '';
      if (posNum === 1) { medalEmoji = '🥇'; medalContent = '1'; }
      else if (posNum === 2) { medalEmoji = '🥈'; medalContent = '2'; }
      else if (posNum === 3) { medalEmoji = '🥉'; medalContent = '3'; }
      else { medalContent = posNum; }

      const isUser = nombre && String(t.nombre).trim().toLowerCase() === nombre.trim().toLowerCase();
      const badgeHtml = isUser ? '<div class="badge-tu">Tú</div>' : '';
      const nameClass = isUser ? 'es-usuario' : '';

      return `
            <div class="top-card pos-${posNum}" style="--card-accent: ${colorSet.accent};" onclick="toggleStats(this)">
              ${badgeHtml}
              <div class="tc-rank-indicator" style="background: ${colorSet.bg};">
                <span class="rank-number">${medalContent}</span>
              </div>
              <div class="tc-main">
                <div class="tc-info">
                  <div class="tc-name ${nameClass}">${esc(t.nombre)}</div>
                  <div class="tc-subtitle">${t.aciertos || 0} aciertos</div>
                </div>
                <div class="tc-score">
                  <div class="tc-score-pts">${t.puntos || 0}</div>
                  <div class="tc-score-lbl">PTS</div>
                </div>
              </div>
              <div class="tc-expanded">
                 <div class="stat-detail">
                   <div class="stat-icon-wrap" style="background: ${colorSet.accent}20; color: ${colorSet.accent};">🎯</div>
                   <div class="stat-info">
                     <span class="stat-label">Aciertos totales</span>
                     <span class="stat-value">${t.aciertos || 0}</span>
                   </div>
                 </div>
                 <div class="stat-detail">
                   <div class="stat-icon-wrap" style="background: ${colorSet.accent}20; color: ${colorSet.accent};">⚽</div>
                   <div class="stat-info">
                     <span class="stat-label">Puntos acumulados</span>
                     <span class="stat-value">${t.puntos || 0}</span>
                   </div>
                 </div>
              </div>
            </div>
      `;
    }).join('');
  } else {
    listHtml = emptyState;
  }

  // Añadir la tarjeta extra del usuario si no está en el top 5
  if (nombre && !userInTop5 && posicion > 5) {
    listHtml += `
        <div class="divider"><span>TU POSICIÓN</span></div>
        <div class="top-card pos-user-extra" style="--card-accent: #FF6B35;" onclick="toggleStats(this)">
            <div class="badge-tu">Tú</div>
            <div class="tc-rank-indicator" style="background: linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%);">
              <span class="rank-number">${posicion}</span>
            </div>
            <div class="tc-main">
              <div class="tc-info">
                <div class="tc-name es-usuario">${esc(nombre)}</div>
                <div class="tc-subtitle">${aciertos} aciertos</div>
              </div>
              <div class="tc-score">
                <div class="tc-score-pts">${puntos}</div>
                <div class="tc-score-lbl">PTS</div>
              </div>
            </div>
            <div class="tc-expanded">
               <div class="stat-detail">
                 <div class="stat-icon-wrap" style="background: rgba(255,107,53,0.15); color: #FF6B35;">🎯</div>
                 <div class="stat-info">
                   <span class="stat-label">Aciertos totales</span>
                   <span class="stat-value">${aciertos}</span>
                 </div>
               </div>
               <div class="stat-detail">
                 <div class="stat-icon-wrap" style="background: rgba(255,107,53,0.15); color: #FF6B35;">⚽</div>
                 <div class="stat-info">
                   <span class="stat-label">Puntos acumulados</span>
                   <span class="stat-value">${puntos}</span>
                 </div>
               </div>
            </div>
        </div>
     `;
  }

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Ranking · FIFA World Cup 2026™</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --turquoise: #00E6C3;
      --turquoise-dark: #00B896;
      --magenta: #E835A0;
      --yellow: #FFD100;
      --green-lime: #7ED321;
      --blue: #3B82F6;
      --purple: #7B61FF;
      --red: #E63946;
      --orange: #FF6B35;
      --bg-dark: #0A0A1A;
      --bg-card: #141428;
      --bg-card-hover: #1C1C3A;
      --text-primary: #FFFFFF;
      --text-secondary: rgba(255, 255, 255, 0.6);
      --text-muted: rgba(255, 255, 255, 0.35);
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body { 
      background-color: var(--bg-dark); 
      color: var(--text-primary); 
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }
    
    .container { 
      max-width: 430px; 
      margin: 0 auto; 
      background: var(--bg-dark); 
      min-height: 100vh; 
      display: flex; 
      flex-direction: column; 
      position: relative;
    }

    /* ====== ANIMATED BG SHAPES ====== */
    .bg-shapes {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      overflow: hidden;
      pointer-events: none;
      z-index: 0;
    }
    .bg-shapes .shape {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.15;
      animation: floatShape 20s ease-in-out infinite;
    }
    .bg-shapes .shape-1 {
      width: 300px; height: 300px;
      background: var(--turquoise);
      top: -100px; left: -100px;
      animation-delay: 0s;
    }
    .bg-shapes .shape-2 {
      width: 250px; height: 250px;
      background: var(--magenta);
      top: 30%; right: -80px;
      animation-delay: -7s;
    }
    .bg-shapes .shape-3 {
      width: 200px; height: 200px;
      background: var(--yellow);
      bottom: 10%; left: -50px;
      animation-delay: -14s;
    }
    .bg-shapes .shape-4 {
      width: 180px; height: 180px;
      background: var(--purple);
      bottom: -50px; right: -30px;
      animation-delay: -4s;
    }

    @keyframes floatShape {
      0%, 100% { transform: translate(0, 0) scale(1); }
      25% { transform: translate(30px, -20px) scale(1.1); }
      50% { transform: translate(-10px, 30px) scale(0.95); }
      75% { transform: translate(20px, 10px) scale(1.05); }
    }

    /* ====== HEADER ====== */
    .header { 
      position: relative;
      overflow: hidden; 
      padding: 36px 24px 44px; 
      text-align: center; 
      z-index: 1;
    }
    .header::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(180deg, 
        rgba(0, 230, 195, 0.12) 0%, 
        rgba(232, 53, 160, 0.08) 50%, 
        transparent 100%);
      pointer-events: none;
    }
    .header::after {
      content: "";
      position: absolute;
      bottom: 0; left: 50%;
      transform: translateX(-50%);
      width: 80%;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
    }

    /* Geometric pattern overlay */
    .header-pattern {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      opacity: 0.04;
      background-image: 
        linear-gradient(30deg, var(--turquoise) 12%, transparent 12.5%, transparent 87%, var(--turquoise) 87.5%, var(--turquoise)),
        linear-gradient(150deg, var(--turquoise) 12%, transparent 12.5%, transparent 87%, var(--turquoise) 87.5%, var(--turquoise)),
        linear-gradient(30deg, var(--turquoise) 12%, transparent 12.5%, transparent 87%, var(--turquoise) 87.5%, var(--turquoise)),
        linear-gradient(150deg, var(--turquoise) 12%, transparent 12.5%, transparent 87%, var(--turquoise) 87.5%, var(--turquoise));
      background-size: 80px 140px;
      background-position: 0 0, 0 0, 40px 70px, 40px 70px;
      pointer-events: none;
    }

    .header-event-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(0, 230, 195, 0.12);
      border: 1px solid rgba(0, 230, 195, 0.2);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      padding: 5px 14px;
      border-radius: 24px;
      color: var(--turquoise);
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 16px;
      letter-spacing: 0.5px;
      position: relative;
    }

    .header-logo-text {
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: var(--text-secondary);
      margin-bottom: 6px;
      position: relative;
    }

    .header-title { 
      font-size: 28px; 
      font-weight: 900; 
      margin-bottom: 4px; 
      position: relative;
      line-height: 1.1;
      background: linear-gradient(135deg, #FFFFFF 0%, var(--turquoise) 50%, var(--magenta) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .header-subtitle { 
      color: var(--text-secondary); 
      font-size: 12px; 
      text-transform: uppercase; 
      letter-spacing: 3px; 
      font-weight: 700; 
      position: relative; 
      margin-top: 8px;
    }

    .header-26 {
      font-size: 72px;
      font-weight: 900;
      line-height: 1;
      letter-spacing: -4px;
      background: linear-gradient(135deg, var(--turquoise) 0%, var(--magenta) 40%, var(--yellow) 70%, var(--purple) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      opacity: 0.12;
      position: absolute;
      top: 12px;
      right: 16px;
      pointer-events: none;
    }

    /* ====== CONTENT ====== */
    .content { 
      padding: 0 20px 30px; 
      flex: 1; 
      margin-top: 6px; 
      position: relative; 
      z-index: 1; 
    }
    
    .section-title { 
      display: flex; 
      align-items: center; 
      margin-bottom: 18px; 
      padding: 0 2px;
    }
    .section-title h3 { 
      font-size: 14px; 
      font-weight: 800; 
      color: var(--text-primary); 
      text-transform: uppercase; 
      letter-spacing: 1.5px; 
      margin-right: 14px; 
      white-space: nowrap;
    }
    .section-title::after { 
      content: ""; 
      flex: 1; 
      height: 2px; 
      background: linear-gradient(to right, var(--turquoise), var(--magenta), transparent); 
      border-radius: 2px; 
      opacity: 0.5;
    }
    
    /* ====== TOP LIST ====== */
    .top-list { 
      display: flex; 
      flex-direction: column; 
      gap: 12px; 
    }
    
    /* ====== CARD ====== */
    .top-card { 
      background: var(--bg-card); 
      border-radius: 16px; 
      padding: 0;
      display: flex; 
      flex-direction: column; 
      position: relative; 
      overflow: hidden;
      cursor: pointer; 
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .top-card:active { transform: scale(0.98); }
    .top-card:hover { 
      background: var(--bg-card-hover);
      border-color: rgba(255, 255, 255, 0.1);
    }

    /* Glow bar at top of card */
    .top-card::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: var(--card-accent, #555);
      opacity: 0.8;
    }

    .tc-rank-indicator {
      position: absolute;
      top: 14px;
      left: 14px;
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }
    .rank-number {
      font-size: 16px;
      font-weight: 900;
      color: #FFFFFF;
      text-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }

    .tc-main { 
      display: flex; 
      align-items: center; 
      width: 100%; 
      padding: 16px 16px 16px 64px;
    }

    .badge-tu { 
      position: absolute; 
      top: -1px; 
      right: 16px; 
      background: linear-gradient(135deg, var(--turquoise), var(--turquoise-dark));
      color: #003D33; 
      font-size: 9px; 
      font-weight: 900; 
      padding: 3px 10px; 
      border-radius: 0 0 8px 8px; 
      text-transform: uppercase; 
      letter-spacing: 0.5px; 
      z-index: 2;
    }
    
    .tc-info { flex: 1; min-width: 0; padding-right: 10px; }
    .tc-name { 
      font-size: 15px; 
      font-weight: 800; 
      color: var(--text-primary); 
      white-space: nowrap; 
      overflow: hidden; 
      text-overflow: ellipsis; 
    }
    .tc-name.es-usuario { color: var(--turquoise); }
    .tc-subtitle {
      font-size: 11px;
      color: var(--text-secondary);
      font-weight: 600;
      margin-top: 2px;
    }
    
    .tc-score { text-align: right; margin-left: auto; }
    .tc-score-pts { 
      font-size: 26px; 
      font-weight: 900; 
      color: var(--text-primary); 
      line-height: 1; 
    }
    .top-card.pos-1 .tc-score-pts { color: var(--turquoise); }
    .top-card.pos-2 .tc-score-pts { color: var(--magenta); }
    .top-card.pos-3 .tc-score-pts { color: var(--yellow); }
    .tc-score-lbl { 
      font-size: 9px; 
      color: var(--text-muted); 
      text-transform: uppercase; 
      font-weight: 800; 
      margin-top: 2px; 
      letter-spacing: 1px;
    }
    
    /* ACCORDION STATS */
    .tc-expanded { 
      display: none; 
      padding: 0 16px 16px 64px; 
      animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
    }
    .top-card.open .tc-expanded { display: block; }
    
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .stat-detail { 
      display: flex; 
      align-items: center; 
      margin-bottom: 8px; 
      background: rgba(255,255,255,0.04); 
      padding: 10px 14px; 
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.04);
    }
    .stat-detail:last-child { margin-bottom: 0; }

    .stat-icon-wrap {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      margin-right: 12px;
      flex-shrink: 0;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }
    .stat-label {
      font-size: 10px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 700;
    }
    .stat-value {
      font-size: 15px;
      font-weight: 800;
      color: var(--text-primary);
    }
    
    .empty-state { 
      text-align: center; 
      padding: 40px 24px; 
      color: var(--text-secondary); 
      font-size: 14px; 
      background: var(--bg-card); 
      border-radius: 16px; 
      font-weight: 700;
      border: 1px dashed rgba(255,255,255,0.08);
    }
    
    .divider { 
      text-align: center; 
      margin: 28px 0; 
      position: relative; 
    }
    .divider::before { 
      content: ""; 
      position: absolute; 
      top: 50%; 
      left: 0; right: 0; 
      height: 1px; 
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); 
      z-index: 0; 
    }
    .divider span { 
      position: relative; 
      background: var(--bg-dark); 
      padding: 0 14px; 
      font-size: 11px; 
      color: var(--text-muted); 
      z-index: 1; 
      font-weight: 800; 
      letter-spacing: 2px;
    }
    
    /* ====== ACTIONS ====== */
    .actions { margin-top: 36px; text-align: center; }
    .btn-primary { 
      background: linear-gradient(135deg, var(--turquoise) 0%, #00B896 50%, var(--magenta) 100%);
      background-size: 200% 200%;
      animation: gradientShift 4s ease infinite;
      color: #003D33; 
      border: none; 
      border-radius: 14px; 
      padding: 16px 32px; 
      font-size: 15px; 
      font-weight: 800; 
      width: 100%;
      font-family: 'Outfit', sans-serif;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 24px rgba(0, 230, 195, 0.25);
    }
    .btn-primary:active { 
      transform: scale(0.96); 
      box-shadow: 0 2px 12px rgba(0, 230, 195, 0.15); 
    }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    
    /* ====== FOOTER ====== */
    .footer { 
      text-align: center; 
      color: var(--text-muted); 
      font-size: 10px; 
      text-transform: uppercase; 
      letter-spacing: 2px; 
      font-weight: 700; 
      margin-top: 28px; 
      padding-bottom: 24px;
    }
    .footer-slogan {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 2px;
      margin-bottom: 8px;
      background: linear-gradient(90deg, var(--turquoise), var(--magenta), var(--yellow));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* ====== ENTRANCE ANIMATIONS ====== */
    .top-card {
      opacity: 0;
      transform: translateY(20px);
      animation: cardEnter 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    .top-card:nth-child(1) { animation-delay: 0.05s; }
    .top-card:nth-child(2) { animation-delay: 0.12s; }
    .top-card:nth-child(3) { animation-delay: 0.19s; }
    .top-card:nth-child(4) { animation-delay: 0.26s; }
    .top-card:nth-child(5) { animation-delay: 0.33s; }

    @keyframes cardEnter {
      to { opacity: 1; transform: translateY(0); }
    }

    .header {
      opacity: 0;
      animation: headerFade 0.5s ease forwards;
    }
    @keyframes headerFade {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>
  <!-- Animated background blobs -->
  <div class="bg-shapes">
    <div class="shape shape-1"></div>
    <div class="shape shape-2"></div>
    <div class="shape shape-3"></div>
    <div class="shape shape-4"></div>
  </div>

  <div class="container">
    <div class="header">
      <div class="header-pattern"></div>
      <div class="header-26">26</div>
      <div class="header-event-tag">⚽ 11 Jun — 19 Jul 2026</div>
      <div class="header-logo-text">FIFA WORLD CUP</div>
      <div class="header-title">Quiniela 2026</div>
      <div class="header-subtitle">Tabla de Posiciones</div>
    </div>

    <div class="content">
      <div class="section-title">
        <h3>🏆 Ranking Top 5</h3>
      </div>

      <div class="top-list">
        ${listHtml}
      </div>

      <div class="actions">
        <button class="btn-primary" id="btn-volver" onclick="volverMenu()">Volver a Menú</button>
      </div>

      <div class="footer">
        <div class="footer-slogan">WE ARE 26</div>
        Quiniela del Mundial · FIFA 2026™
      </div>
    </div>
  </div>

  <script>
    function toggleStats(el) {
      el.classList.toggle('open');
    }

    function volverMenu() {
      const execId = "${esc(executionId)}";
      const btn = document.getElementById('btn-volver');
      
      if (!execId) {
        btn.innerText = 'Cerrando...';
        setTimeout(() => { 
           if (window.JelouApi && window.JelouApi.close) window.JelouApi.close(); 
        }, 500);
        return;
      }
      
      btn.innerText = 'Volviendo...';
      btn.disabled = true;

      fetch('https://workflows.jelou.ai/v1/webview/callback?executionId=' + execId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          executionId: execId,
          success: true,
          data: { action: 'volver_menu' }
        })
      })
      .then(res => {
         // Intentar cerrar de forma nativa con Jelou
         if (window.JelouApi && window.JelouApi.close) window.JelouApi.close();
         
         // Fallback 1: Intentar cerrar ventana de forma cruda
         try { window.close(); } catch(e) {}

         // Fallback 2: Forzar salir del historial o ir a blank (típico hack de WhatsApp WebView)
         setTimeout(() => { window.history.go(-(window.history.length)); }, 300);
         setTimeout(() => { window.location.href = 'about:blank'; }, 600);
      })
      .catch(e => {
         console.error(e);
         btn.innerText = 'Error al cerrar (Intenta de nuevo)';
         btn.disabled = false;
      });
    }
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}
