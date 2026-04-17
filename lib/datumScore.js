/**
 * Datum: goles como number, string ("2") o null / vacío si no hubo partido.
 * Misma lógica que torneo-libertadores/datumScore.ts
 */

export function parseDatumScore(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return null;
  if (typeof value === 'string') {
    var t = value.trim();
    if (t === '') return null;
    var low = t.toLowerCase();
    if (low === 'null' || low === 'undefined' || low === 'n/a' || low === '-' || low === '\u2014') return null;
  }
  var n = typeof value === 'number' && !Number.isNaN(value)
    ? Math.trunc(value)
    : parseInt(String(value).trim(), 10);
  if (Number.isNaN(n)) return null;
  if (n < 0 || n > 99) return null;
  return n;
}

export function hasPairOfDatumScores(a, b) {
  return parseDatumScore(a) !== null && parseDatumScore(b) !== null;
}

export function scoreEqDatum(a, b) {
  var na = parseDatumScore(a);
  var nb = parseDatumScore(b);
  return na !== null && nb !== null && na === nb;
}
