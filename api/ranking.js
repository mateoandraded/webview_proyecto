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

  if (finalCards.length > 0) {
    listHtml = finalCards.map(t => {
      const posNum = Number(t.posicion) || 0;
      let medalEmoji = `#${posNum}`;
      if (posNum === 1) medalEmoji = '🥇';
      else if (posNum === 2) medalEmoji = '🥈';
      else if (posNum === 3) medalEmoji = '🥉';

      const isUser = nombre && String(t.nombre).trim().toLowerCase() === nombre.trim().toLowerCase();
      const badgeHtml = isUser ? '<div class="badge-tu">Tú</div>' : '';
      const nameClass = isUser ? 'es-usuario' : '';

      return `
            <div class="top-card pos-${posNum}" onclick="toggleStats(this)">
              ${badgeHtml}
              <div class="tc-main">
                <div class="medal">${medalEmoji}</div>
                <div class="tc-info">
                  <div class="tc-name ${nameClass}">${esc(t.nombre)}</div>
                </div>
                <div class="tc-score">
                  <div class="tc-score-pts">${t.puntos || 0}</div>
                  <div class="tc-score-lbl">pts</div>
                </div>
              </div>
              <div class="tc-expanded">
                 <div class="stat-detail">
                   <span class="stat-icon">🎯</span>
                   <span class="stat-text">${t.aciertos || 0} Aciertos en total</span>
                 </div>
                 <div class="stat-detail">
                   <span class="stat-icon">🏆</span>
                   <span class="stat-text">${t.puntos || 0} Puntos acumulados</span>
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
        <div class="top-card pos-user-extra" onclick="toggleStats(this)">
            <div class="badge-tu">Tú</div>
            <div class="tc-main">
              <div class="medal">#${posicion}</div>
              <div class="tc-info">
                <div class="tc-name es-usuario">${esc(nombre)}</div>
              </div>
              <div class="tc-score">
                <div class="tc-score-pts">${puntos}</div>
                <div class="tc-score-lbl">pts</div>
              </div>
            </div>
            <div class="tc-expanded">
               <div class="stat-detail">
                 <span class="stat-icon">🎯</span>
                 <span class="stat-text">${aciertos} Aciertos en total</span>
               </div>
               <div class="stat-detail">
                 <span class="stat-icon">🏆</span>
                 <span class="stat-text">${puntos} Puntos acumulados</span>
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
    body { background-color: var(--bordeaux); color: #FFF; -webkit-font-smoothing: antialiased; }
    .container { max-width: 430px; margin: 0 auto; background: var(--bordeaux); min-height: 100vh; display: flex; flex-direction: column; }
    
    .header { background: linear-gradient(160deg, #4A0A12 0%, #6B0F1A 40%, #8B1A2A 70%, #3D0A10 100%); padding: 30px 20px 40px; text-align: center; position: relative; overflow: hidden; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4); }
    .header::before { content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: repeating-linear-gradient(45deg, var(--gold) 0, var(--gold) 1px, transparent 1px, transparent 10px); opacity: 0.06; pointer-events: none; }
    .header-chip { display: inline-block; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); padding: 4px 12px; border-radius: 20px; color: #FFF; font-size: 11px; font-weight: 600; margin-bottom: 12px; letter-spacing: 0.5px; }
    .header-title { color: var(--gold-light); font-size: 22px; font-weight: 800; margin-bottom: 6px; position: relative; }
    .header-subtitle { color: rgba(255, 255, 255, 0.55); font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; position: relative; }
    
    .content { padding: 0 20px 30px; flex: 1; margin-top: 25px; }
    
    .section-title { display: flex; align-items: center; margin-bottom: 16px; }
    .section-title h3 { font-size: 14px; font-weight: 800; color: #FFF; text-transform: uppercase; letter-spacing: 1px; margin-right: 12px; }
    .section-title::after { content: ""; flex: 1; height: 2px; background: linear-gradient(to right, rgba(201,168,76,0.6), transparent); border-radius: 2px; }
    
    .top-list { display: flex; flex-direction: column; gap: 12px; }
    
    .top-card { background: rgba(255,255,255,0.97); border-radius: 16px; padding: 14px 16px; display: flex; flex-direction: column; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1); position: relative; border-left: 4px solid #E0E0E8; cursor: pointer; transition: all 0.2s ease; }
    .top-card:active { transform: scale(0.98); }
    
    .top-card.pos-1 { border-left-color: var(--gold); background: linear-gradient(to right, rgba(201,168,76,0.07), #FFF); }
    .top-card.pos-2 { border-left-color: var(--silver); background: linear-gradient(to right, rgba(168,169,173,0.07), #FFF); }
    .top-card.pos-3 { border-left-color: var(--bronze); background: linear-gradient(to right, rgba(205,127,50,0.07), #FFF); }
    .top-card.pos-user-extra { border-left-color: #6C757D; background: rgba(240, 240, 245, 0.95); opacity: 0.95; }
    
    .tc-main { display: flex; align-items: center; width: 100%; }
    
    .badge-tu { position: absolute; top: -6px; right: 16px; background: var(--bordeaux-dark); color: #FFF; font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 10px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 2px 5px rgba(74, 10, 18, 0.3); z-index: 2;}
    
    .medal { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; flex-shrink: 0; margin-right: 14px; background: #F0F0F5; color: var(--text-muted); }
    .top-card.pos-1 .medal { background: rgba(201,168,76,0.15); }
    .top-card.pos-2 .medal { background: rgba(168,169,173,0.15); }
    .top-card.pos-3 .medal { background: rgba(205,127,50,0.15); }
    .top-card.pos-user-extra .medal { background: #E2E3E5; color: #495057; }
    
    .tc-info { flex: 1; min-width: 0; padding-right: 10px; }
    .tc-name { font-size: 16px; font-weight: 800; color: var(--text-dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tc-name.es-usuario { color: var(--bordeaux); }
    
    .tc-score { text-align: right; margin-left: auto; }
    .tc-score-pts { font-size: 24px; font-weight: 900; color: var(--text-dark); line-height: 1; }
    .top-card.pos-1 .tc-score-pts { color: var(--gold); }
    .tc-score-lbl { font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-top: 2px; }
    
    /* ACORDEON STATS */
    .tc-expanded { display: none; margin-top: 15px; padding-top: 15px; border-top: 1px dashed rgba(0,0,0,0.1); animation: fadein 0.3s; }
    .top-card.open .tc-expanded { display: block; }
    
    @keyframes fadein {
       from { opacity: 0; transform: translateY(-5px); }
       to { opacity: 1; transform: translateY(0); }
    }
    
    .stat-detail { display: flex; align-items: center; margin-bottom: 8px; background: rgba(0,0,0,0.03); padding: 8px 12px; border-radius: 8px;}
    .stat-detail:last-child { margin-bottom: 0; }
    .stat-icon { font-size: 16px; margin-right: 12px; }
    .stat-text { font-size: 13px; font-weight: 700; color: var(--text-dark); }
    
    .empty-state { text-align: center; padding: 30px 20px; color: rgba(255, 255, 255, 0.7); font-size: 13px; background: rgba(0, 0, 0, 0.15); border-radius: 16px; font-weight: 600; }
    
    .divider { text-align: center; margin: 30px 0; position: relative; }
    .divider::before { content: ""; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: rgba(255, 255, 255, 0.15); z-index: 0; }
    .divider span { position: relative; background: var(--bordeaux); padding: 0 10px; font-size: 14px; color: rgba(255, 255, 255, 0.6); z-index: 1; font-weight: 700; letter-spacing: 1px;}
    
    .actions { margin-top: 40px; text-align: center; }
    .btn-yellow { 
       background: linear-gradient(135deg, #F0CC6E 0%, #E8B84B 100%); 
       color: #4A0A12; 
       border: none; 
       border-radius: 30px; 
       padding: 16px 32px; 
       font-size: 16px; 
       font-weight: 800; 
       width: 100%; 
       box-shadow: 0 4px 15px rgba(240, 204, 110, 0.3);
       cursor: pointer;
       text-transform: uppercase;
       letter-spacing: 1px;
       transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-yellow:active { transform: scale(0.96); box-shadow: 0 2px 8px rgba(240, 204, 110, 0.2); }
    .btn-yellow:disabled { opacity: 0.7; cursor: not-allowed; }
    
    .footer { text-align: center; color: rgba(255, 255, 255, 0.35); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-top: 30px; padding-bottom: 20px;}
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
      <div class="section-title">
        <h3>🏆 Ranking Top 5</h3>
      </div>

      <div class="top-list">
        ${listHtml}
      </div>

      <div class="actions">
        <button class="btn-yellow" id="btn-volver" onclick="volverMenu()">Volver a Menú</button>
      </div>

      <div class="footer">Quiniela del Mundial · Qatar 2022</div>
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
