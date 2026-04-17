/**
 * Construye los conjuntos de equipos que realmente jugaron cada fase (misma lógica que ranking.js).
 */

import { hasPairOfDatumScores } from './datumScore.js';

const FECHA_INICIO_TORNEO = '2026-06-11';

function normalizeMatchDate(fechaRaw) {
  if (fechaRaw == null || fechaRaw === '') return null;
  var s = String(fechaRaw).trim();
  var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return m[1] + '-' + m[2] + '-' + m[3];
  var m2 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m2) {
    var dd = m2[1].length === 1 ? '0' + m2[1] : m2[1];
    var mm = m2[2].length === 1 ? '0' + m2[2] : m2[2];
    return m2[3] + '-' + mm + '-' + dd;
  }
  return null;
}

function hasResultadoMarcado(m) {
  return hasPairOfDatumScores(m.gl, m.gv);
}

function partidoPuedeCalificar(m, hoyStr) {
  var fd = normalizeMatchDate(m.fecha);
  if (!fd) return false;
  if (fd < FECHA_INICIO_TORNEO) return false;
  if (fd > hoyStr) return false;
  return hasResultadoMarcado(m);
}

function normalizeRondaLabel(r) {
  return String(r == null ? '' : r).trim().toLowerCase().replace(/\s+/g, ' ');
}

function isRoundOf32(r) {
  var x = normalizeRondaLabel(r);
  if (!x) return false;
  if (x === 'round of 32' || x === 'r32') return true;
  if (x === 'dieciseisavos' || x === '16avos') return true;
  return x.indexOf('round of 32') !== -1;
}

function isRoundOf16(r) {
  var x = normalizeRondaLabel(r);
  if (!x) return false;
  if (x === 'round of 16' || x === 'r16' || x === 'octavos') return true;
  if (x === '8vos' || x === '1/8') return true;
  return x.indexOf('round of 16') !== -1;
}

function isQuarterFinals(r) {
  var x = normalizeRondaLabel(r);
  if (!x) return false;
  if (x === 'quarter-finals' || x === 'quarterfinals' || x === 'quarter finals' || x === 'cuartos') return true;
  if (x === 'r8' || x === '1/4') return true;
  return x.indexOf('quarter') !== -1;
}

function isSemiFinals(r) {
  var x = normalizeRondaLabel(r);
  if (!x) return false;
  if (x === 'semi-finals' || x === 'semifinals' || x === 'semi finals' || x === 'semis') return true;
  if (x === 'r4' || x === '1/2') return true;
  return x.indexOf('semi-final') !== -1 || x.indexOf('semifinal') !== -1;
}

export function buildRealBracketSets(rawMatches, hoyStr) {
  const torneoIniciado = hoyStr >= FECHA_INICIO_TORNEO;
  const mappedMatches = (rawMatches || []).map(function (m) {
    return {
      local: m.equipo_local,
      visitante: m.equipo_visitante,
      gl: m.resulltado_local,
      gv: m.resultado_visitante,
      fecha: m.fecha,
      ronda: m.Fase_o_Grupo,
      ganador: m.ganador_final
    };
  });

  const real32 = new Set();
  const real16 = new Set();
  const real8 = new Set();
  const real4 = new Set();
  let campeonReal = '';
  let subcampeonReal = '';
  let terceroReal = '';
  let cuartoReal = '';

  if (torneoIniciado) {
    mappedMatches.filter(function (m) {
      return isRoundOf32(m.ronda) && partidoPuedeCalificar(m, hoyStr);
    }).forEach(function (m) {
      real32.add(m.local);
      real32.add(m.visitante);
    });
    mappedMatches.filter(function (m) {
      return isRoundOf16(m.ronda) && partidoPuedeCalificar(m, hoyStr);
    }).forEach(function (m) {
      real16.add(m.local);
      real16.add(m.visitante);
    });
    mappedMatches.filter(function (m) {
      return isQuarterFinals(m.ronda) && partidoPuedeCalificar(m, hoyStr);
    }).forEach(function (m) {
      real8.add(m.local);
      real8.add(m.visitante);
    });
    mappedMatches.filter(function (m) {
      return isSemiFinals(m.ronda) && partidoPuedeCalificar(m, hoyStr);
    }).forEach(function (m) {
      real4.add(m.local);
      real4.add(m.visitante);
    });

    const finalM = mappedMatches.find(function (m) {
      return normalizeRondaLabel(m.ronda) === 'final' && partidoPuedeCalificar(m, hoyStr);
    });
    if (finalM) {
      campeonReal = finalM.ganador || '';
      subcampeonReal = (campeonReal === finalM.local) ? finalM.visitante : finalM.local;
    }
    const thirdM = mappedMatches.find(function (m) {
      var x = normalizeRondaLabel(m.ronda);
      return (x.indexOf('third') !== -1 || x === 'tercer lugar' || x === '3er lugar' || x === '3º lugar') && partidoPuedeCalificar(m, hoyStr);
    });
    if (thirdM) {
      terceroReal = thirdM.ganador || '';
      cuartoReal = (terceroReal === thirdM.local) ? thirdM.visitante : thirdM.local;
    }
  }

  return {
    torneoIniciado,
    real32,
    real16,
    real8,
    real4,
    campeonReal,
    subcampeonReal,
    terceroReal,
    cuartoReal
  };
}

export function teamInPhase(team, phaseKey, sets) {
  if (!team) return false;
  if (phaseKey === 'dieciseisavos') return sets.real32.has(team);
  if (phaseKey === 'octavos') return sets.real16.has(team);
  if (phaseKey === 'cuartos') return sets.real8.has(team);
  if (phaseKey === 'semis') return sets.real4.has(team);
  return false;
}
