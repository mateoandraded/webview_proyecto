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
  } catch (e) { top5 = []; }

  let userInTop5 = false;
  if (nombre) {
    userInTop5 = top5.some(function(t) {
      return String(t.nombre).trim().toLowerCase() === nombre.trim().toLowerCase();
    });
  }

  // Position accent colors — FIFA 2026 palette
  const posColors = [
    { accent: '#C9FF24', dark: '#000' },  // 1st - lime
    { accent: '#00FFCC', dark: '#000' },  // 2nd - teal
    { accent: '#FF0055', dark: '#fff' },  // 3rd - magenta
    { accent: '#6200EA', dark: '#fff' },  // 4th - purple
    { accent: '#ffffff', dark: '#000' },  // 5th - white
  ];

  function medalLabel(posNum) {
    if (posNum === 1) return '\uD83E\uDD47';
    if (posNum === 2) return '\uD83E\uDD48';
    if (posNum === 3) return '\uD83E\uDD49';
    return String(posNum);
  }

  let listHtml = '';

  if (top5.length > 0) {
    top5.forEach(function(t, idx) {
      const posNum = Number(t.posicion) || (idx + 1);
      const c = posColors[Math.min(idx, posColors.length - 1)];
      const isUser = nombre && String(t.nombre).trim().toLowerCase() === nombre.trim().toLowerCase();
      const badgeHtml = isUser ? '<div class="badge-tu">T\u00FA</div>' : '';

      listHtml +=
        '<div class="rank-card" style="--accent:' + c.accent + ';--dark:' + c.dark + '">' +
          badgeHtml +
          '<div class="rc-pos" style="background:' + c.accent + ';color:' + c.dark + '">' + medalLabel(posNum) + '</div>' +
          '<div class="rc-info">' +
            '<div class="rc-name' + (isUser ? ' is-user' : '') + '">' + esc(t.nombre) + '</div>' +
            '<div class="rc-sub">' + (t.aciertos || 0) + ' aciertos</div>' +
          '</div>' +
          '<div class="rc-score">' +
            '<div class="rc-pts" style="color:' + c.accent + '">' + (t.puntos || 0) + '</div>' +
            '<div class="rc-lbl">PTS</div>' +
          '</div>' +
        '</div>';
    });
  } else {
    listHtml = '<div class="empty-state">A\u00FAn no hay participantes</div>';
  }

  // Current user card if not in top5
  if (nombre && !userInTop5 && posicion > 5) {
    listHtml +=
      '<div class="divider"><span>TU POSICI\u00D3N</span></div>' +
      '<div class="rank-card" style="--accent:#FF6B35;--dark:#fff">' +
        '<div class="badge-tu">T\u00FA</div>' +
        '<div class="rc-pos" style="background:#FF6B35;color:#fff">' + posicion + '</div>' +
        '<div class="rc-info">' +
          '<div class="rc-name is-user">' + esc(nombre) + '</div>' +
          '<div class="rc-sub">' + aciertos + ' aciertos</div>' +
        '</div>' +
        '<div class="rc-score">' +
          '<div class="rc-pts" style="color:#FF6B35">' + puntos + '</div>' +
          '<div class="rc-lbl">PTS</div>' +
        '</div>' +
      '</div>';
  }

  const css = `
    :root{--black:#000;--white:#fff;--lime:#C9FF24;--magenta:#FF0055;--teal:#00FFCC;--purple:#6200EA;--dim:#141414}
    *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
    body{background:var(--black);color:var(--white);font-family:'Inter',sans-serif;padding-bottom:60px;overflow-x:hidden}
    .app{max-width:450px;margin:auto;padding:0 16px}

    /* HEADER */
    .header-box{margin:40px 0 32px;padding-bottom:12px;border-bottom:4px solid var(--white);position:relative}
    .badge-26{display:inline-block;background:var(--lime);color:var(--black);font-weight:900;font-size:14px;padding:4px 10px;margin-bottom:12px;letter-spacing:1px}
    h1{font-family:'Archivo Black',sans-serif;font-size:40px;line-height:.9;letter-spacing:-2px}
    .header-26{font-family:'Archivo Black';font-size:80px;line-height:1;letter-spacing:-4px;color:rgba(255,255,255,.06);position:absolute;right:0;top:0;pointer-events:none;user-select:none}

    /* SECTION LABEL */
    .section-label{font-size:11px;font-weight:800;letter-spacing:2px;color:rgba(255,255,255,.5);text-transform:uppercase;margin-bottom:16px}

    /* RANK CARDS */
    .rank-list{display:flex;flex-direction:column;gap:0}
    .rank-card{
      display:flex;align-items:center;gap:0;
      border:2px solid rgba(255,255,255,.1);
      border-left:4px solid var(--accent,#fff);
      background:var(--dim);
      margin-bottom:8px;
      position:relative;
      overflow:hidden;
      transition:.15s;
    }
    .rank-card:active{opacity:.8}
    .rc-pos{
      min-width:56px;width:56px;height:72px;
      display:flex;align-items:center;justify-content:center;
      font-family:'Archivo Black';font-size:20px;
      flex-shrink:0;
    }
    .rc-info{flex:1;padding:12px 10px;min-width:0}
    .rc-name{font-weight:900;font-size:15px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .rc-name.is-user{color:var(--lime)}
    .rc-sub{font-size:11px;color:rgba(255,255,255,.5);font-weight:600;margin-top:3px}
    .rc-score{padding:12px 16px 12px 0;text-align:right;flex-shrink:0}
    .rc-pts{font-family:'Archivo Black';font-size:28px;line-height:1}
    .rc-lbl{font-size:9px;letter-spacing:2px;color:rgba(255,255,255,.4);font-weight:800;margin-top:2px}

    .badge-tu{
      position:absolute;top:0;right:12px;
      background:var(--accent,var(--lime));color:var(--dark,#000);
      font-size:8px;font-weight:900;padding:3px 8px;
      border-radius:0 0 6px 6px;letter-spacing:1px;text-transform:uppercase;
    }

    /* DIVIDER */
    .divider{text-align:center;margin:20px 0;position:relative}
    .divider::before{content:"";position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(255,255,255,.1)}
    .divider span{position:relative;background:var(--black);padding:0 12px;font-size:10px;color:rgba(255,255,255,.4);font-weight:800;letter-spacing:2px}

    /* EMPTY */
    .empty-state{text-align:center;padding:40px 24px;color:rgba(255,255,255,.4);font-size:14px;background:var(--dim);font-weight:700;border:1px dashed rgba(255,255,255,.1)}

    /* FOOTER BUTTON */
    .footer-bar{margin-top:36px}
    .btn-back{width:100%;background:var(--white);color:var(--black);border:none;padding:16px;font-family:'Archivo Black';font-size:18px;cursor:pointer;letter-spacing:1px}
    .btn-back:active{background:var(--lime)}

    /* FOOTER */
    .footer{text-align:center;margin-top:24px;font-size:9px;letter-spacing:2px;color:rgba(255,255,255,.3);font-weight:700;text-transform:uppercase}
    .footer strong{display:block;font-family:'Archivo Black';font-size:20px;color:rgba(255,255,255,.08);letter-spacing:-1px;margin-bottom:4px}
  `;

  const html = '<!DOCTYPE html><html lang="es"><head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">' +
    '<title>Ranking \u00B7 World Cup 2026</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">' +
    '<style>' + css + '</style>' +
    '</head><body>' +
    '<div class="app">' +
      '<div class="header-box">' +
        '<div class="header-26">26</div>' +
        '<div class="badge-26">QUINIELA 2026</div>' +
        '<h1>TABLA DE<br>POSICIONES</h1>' +
      '</div>' +
      '<div class="section-label">\uD83C\uDFC6 RANKING TOP 5</div>' +
      '<div class="rank-list">' + listHtml + '</div>' +
      '<div class="footer-bar">' +
        '<button class="btn-back" id="btn-volver" onclick="volverMenu()">VOLVER</button>' +
      '</div>' +
      '<div class="footer"><strong>WE ARE 26</strong>FIFA WORLD CUP 2026 \u00B7 QUINIELA OFICIAL</div>' +
    '</div>' +
    '<script>' +
      'function volverMenu(){' +
        'var execId="' + esc(executionId) + '";' +
        'var btn=document.getElementById("btn-volver");' +
        'btn.innerText="Saliendo...";btn.disabled=true;' +
        'var cbBody={executionId:execId,success:true,data:{action:"volver"}};' +
        'fetch("https://workflows.jelou.ai/v1/webview/callback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(cbBody)})' +
          '.finally(function(){ window.location.href="https://wa.me/13239183195"; });' +
      '}' +
    '<\/script>' +
    '</body></html>';

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
