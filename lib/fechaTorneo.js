/**
 * Helper compartido para resolver la fecha del torneo simulada.
 * Cachea la respuesta de torneo-libertadores/estado-torneo durante TTL_MS
 * para evitar pegarle al function en cada hit de webview.
 *
 * En Vercel Edge cada instancia mantiene su propio caché. Es suficiente:
 * con 1 sola instancia activa, 1000 visitas se resuelven con 1 fetch real.
 * Cuando la "máquina del tiempo" avance, tarda hasta TTL_MS en notarlo.
 */

const JELOU_ESTADO_TORNEO_URL = 'https://torneo-libertadores.fn.jelou.ai/estado-torneo';
const TTL_MS = 30_000;

let cached = { value: null, expires: 0 };

function fallbackHoyYMD() {
  var parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  var y = parts.find(function (p) { return p.type === 'year'; }).value;
  var mo = parts.find(function (p) { return p.type === 'month'; }).value;
  var d = parts.find(function (p) { return p.type === 'day'; }).value;
  return y + '-' + mo + '-' + d;
}

export async function fetchFechaTorneoDesdeJelou() {
  var now = Date.now();
  if (cached.value && cached.expires > now) return cached.value;

  var resolved = null;
  try {
    var ctrl = new AbortController();
    var tid = setTimeout(function () { ctrl.abort(); }, 5000);
    var res = await fetch(JELOU_ESTADO_TORNEO_URL, {
      method: 'GET',
      signal: ctrl.signal,
      headers: { Accept: 'application/json' }
    });
    clearTimeout(tid);
    if (res.ok) {
      var data = await res.json();
      var f = data && data.fecha_simulada_hoy;
      if (typeof f === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(f.trim())) {
        resolved = f.trim();
      }
    }
  } catch (e) { /* timeout / red */ }

  if (!resolved) resolved = fallbackHoyYMD();
  cached = { value: resolved, expires: now + TTL_MS };
  return resolved;
}
