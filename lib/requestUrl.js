/**
 * En Node/Vercel, `req.url` puede ser solo la ruta (/api/foo?x=1).
 * `new URL(relativa)` lanza ERR_INVALID_URL; hace falta una base absoluta.
 */
export function getRequestUrl(req) {
  const raw = (req && req.url) || '/';
  if (/^https?:\/\//i.test(String(raw))) {
    return new URL(raw);
  }
  const h = req && req.headers;
  if (!h) {
    return new URL(String(raw), 'https://localhost');
  }
  let host = 'localhost';
  let proto = 'https';
  if (typeof h.get === 'function') {
    host = h.get('x-forwarded-host') || h.get('host') || host;
    proto = h.get('x-forwarded-proto') || proto;
  } else {
    host = h['x-forwarded-host'] || h.host || h.Host || host;
    proto = h['x-forwarded-proto'] || proto;
  }
  return new URL(String(raw), `${proto}://${host}`);
}
