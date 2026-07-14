import { hasPairOfDatumScores, parseDatumScore } from "../lib/datumScore.js";
import { getRequestUrl } from "../lib/requestUrl.js";
import { fetchFechaTorneoDesdeJelou } from "../lib/fechaTorneo.js";

export const config = {
  runtime: "edge",
};

const API_KEY = 'db_3cfJUDRR8mwrlazSod9Fo2YXIe3qUJxI57OkdvpCf1a5f863';
const BASE_URL = 'https://mateoacademy-9djnmu.jelou.cloud/api/collections';

const FECHA_LIMITE_PRONOSTICOS = "2026-06-14";

function predictionComplete(up) {
  if (!up) return false;
  return hasPairOfDatumScores(up.pronostico_local, up.pronostico_visitante);
}

const FLAGS = {
  MEXICO: "🇲🇽",
  "ESTADOS UNIDOS": "🇺🇸",
  CANADA: "🇨🇦",
  BRASIL: "🇧🇷",
  ARGENTINA: "🇦🇷",
  ECUADOR: "🇪🇨",
  COLOMBIA: "🇨🇴",
  URUGUAY: "🇺🇾",
  PARAGUAY: "🇵🇾",
  CHILE: "🇨🇱",
  PERU: "🇵🇪",
  VENEZUELA: "🇻🇪",
  ALEMANIA: "🇩🇪",
  ESPANA: "🇪🇸",
  ESPAÑA: "🇪🇸",
  FRANCIA: "🇫🇷",
  PORTUGAL: "🇵🇹",
  BELGICA: "🇧🇪",
  "PAISES BAJOS": "🇳🇱",
  CROACIA: "🇭🇷",
  SERBIA: "🇷🇸",
  SUIZA: "🇨🇭",
  TURQUIA: "🇹🇷",
  DINAMARCA: "🇩🇰",
  AUSTRIA: "🇦🇹",
  POLONIA: "🇵🇱",
  RUMANIA: "🇷🇴",
  ESLOVENIA: "🇸🇮",
  ESLOVAQUIA: "🇸🇰",
  ALBANIA: "🇦🇱",
  UCRANIA: "🇺🇦",
  GRECIA: "🇬🇷",
  MARRUECOS: "🇲🇦",
  SENEGAL: "🇸🇳",
  NIGERIA: "🇳🇬",
  CAMERUN: "🇨🇲",
  "COSTA DE MARFIL": "🇨🇮",
  EGIPTO: "🇪🇬",
  GHANA: "🇬🇭",
  TUNEZ: "🇹🇳",
  JAPON: "🇯🇵",
  "COREA DEL SUR": "🇰🇷",
  AUSTRALIA: "🇦🇺",
  IRAN: "🇮🇷",
  "ARABIA SAUDITA": "🇸🇦",
  INDONESIA: "🇮🇩",
  "COSTA RICA": "🇨🇷",
  PANAMA: "🇵🇦",
  JAMAICA: "🇯🇲",
  SUDAFRICA: "🇿🇦",
  "REPUBLICA CHECA": "🇨🇿",
  BOSNIA: "🇧🇦",
  "BOSNIA Y HERZEGOVINA": "🇧🇦",
  QATAR: "🇶🇦",
  HAITI: "🇭🇹",
  HAITÍ: "🇭🇹",
  ESCOCIA: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  CURAZAO: "🇨🇼",
  SUECIA: "🇸🇪",
  "NUEVA ZELANDA": "🇳🇿",
  "CABO VERDE": "🇨🇻",
  IRAK: "🇮🇶",
  NORUEGA: "🇳🇴",
  ARGELIA: "🇩🇿",
  JORDANIA: "🇯🇴",
  "RD CONGO": "🇨🇬",
  CONGO: "🇨🇬",
  "REPUBLICA DEL CONGO": "🇨🇬",
  "REPÚBLICA DEL CONGO": "🇨🇬",
  UZBEKISTAN: "🇺🇿",
  UZBEKISTÁN: "🇺🇿",
  INGLATERRA: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "REPUBLICA DE COREA": "🇰🇷",
  "REPÚBLICA DE COREA": "🇰🇷",
};
function flag(n) {
  return FLAGS[(n || "").toUpperCase()] || "\uD83C\uDFF3\uFE0F";
}

async function fetchDatum(collection, method, body, id, query) {
  method = method || "GET";
  id = id || "";
  query = query || "";
  const url =
    BASE_URL +
    "/" +
    collection +
    "/records" +
    (id ? "/" + id : "") +
    "?perPage=500" +
    query;
  const options = {
    method: method,
    headers: { "X-Api-Key": API_KEY, "Content-Type": "application/json" },
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  if (!res.ok) throw new Error("HTTP Error " + res.status);
  if (method === "DELETE" || res.status === 204) return true;
  return await res.json();
}

// Reintenta un fetch a Datum ante hipos transitorios. Sin esto, un fallo
// puntual del fetch de partidos dejaba la pagina sin grupos (en blanco).
async function fetchDatumRetry(collection, method, body, id, query, attempts) {
  attempts = attempts || 3;
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetchDatum(collection, method, body, id, query);
    } catch (e) {
      lastErr = e;
      if (i < attempts - 1)
        await new Promise(function (r) {
          setTimeout(r, 300);
        });
    }
  }
  throw lastErr;
}

export default async function handler(req) {
  const url = getRequestUrl(req);
  const userId = url.searchParams.get("user_id") || "GUEST";
  const lang = url.searchParams.get("lang") || "es";

  const i18n = {
    es: {
      doc_title: "Grupos - World Cup 26",
      toast: "¡GUARDADO!",
      badge: "FASE DE GRUPOS",
      title: "MIS<br>PRONÓSTICOS",
      btn_save: "GUARDAR TODO",
      btn_back: "VOLVER",
      pending: "PENDIENTE",
      finished: "FIN",
      live: "EN VIVO",
      your_pred: "Tu pronóstico: ",
      group: "GRUPO",
      alert_closed: "Los pronósticos ya están cerrados.",
      btn_saving: "GUARDANDO...",
      alert_save: "Error al guardar.",
      alert_net: "Error de red.",
      alert_partial_a: "Solo se guardaron ",
      alert_partial_b: " de ",
      alert_partial_c:
        " pronósticos. Volvé a darle Guardar Todo para reintentar los que faltan.",
    },
    en: {
      doc_title: "Groups - World Cup 26",
      toast: "SAVED!",
      badge: "GROUP STAGE",
      title: "MY<br>PREDICTIONS",
      btn_save: "SAVE ALL",
      btn_back: "BACK",
      pending: "TBD",
      finished: "END",
      live: "LIVE",
      your_pred: "Your prediction: ",
      group: "GROUP",
      alert_closed: "Predictions are already closed.",
      btn_saving: "SAVING...",
      alert_save: "Error saving.",
      alert_net: "Network error.",
      alert_partial_a: "Only ",
      alert_partial_b: " of ",
      alert_partial_c:
        " predictions were saved. Tap Save All again to retry the rest.",
    },
    pt: {
      doc_title: "Grupos - World Cup 26",
      toast: "SALVO!",
      badge: "FASE DE GRUPOS",
      title: "MEUS<br>PALPITES",
      btn_save: "SALVAR TUDO",
      btn_back: "VOLTAR",
      pending: "PENDENTE",
      finished: "FIM",
      live: "AO VIVO",
      your_pred: "Seu palpite: ",
      group: "GRUPO",
      alert_closed: "Os palpites já estão encerrados.",
      btn_saving: "SALVANDO...",
      alert_save: "Erro ao salvar.",
      alert_net: "Erro de rede.",
      alert_partial_a: "Apenas ",
      alert_partial_b: " de ",
      alert_partial_c:
        " palpites foram salvos. Clique em Salvar Tudo de novo para tentar os que faltam.",
    },
  };
  const t = i18n[lang] || i18n["es"];

  if (req.method === "POST") {
    try {
      // Participantes OFICIALES del torneo: pronósticos cerrados (no pueden editar).
      let esOficial = false;
      if (userId !== "GUEST") {
        try {
          const rk = await fetchDatumRetry("pbc_3271891893", "GET", null, "", "&filter=(user_id='" + userId + "')", 2);
          const rkItems = rk.items || rk || [];
          esOficial = rkItems.length > 0 ? !!rkItems[0].es_oficial : false;
        } catch (e) { esOficial = false; }
      }
      if (esOficial) {
        return new Response(JSON.stringify({ error: "Pronósticos cerrados para participantes del torneo" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
      const body = await req.json();

      // Partidos que YA tienen resultado cargado: no se pueden pronosticar.
      let finishedSet = {};
      try {
        const mRes = await fetchDatumRetry("pbc_631836067", "GET", null, "", "", 2);
        const ms = mRes.items || mRes || [];
        ms.forEach(function (m) {
          if (hasPairOfDatumScores(m.resulltado_local, m.resultado_visitante)) finishedSet[m.id_partido] = true;
        });
      } catch (e) { finishedSet = {}; }

      let existingItems = [];
      try {
        const existingReq = await fetchDatumRetry(
          "pbc_1944158292",
          "GET",
          null,
          "",
          "&filter=(user_id='" + userId + "')",
          3,
        );
        existingItems = existingReq.items || existingReq;
      } catch (e) {
        existingItems = [];
      }

      // Solo se aceptan partidos NO bloqueados y SIN resultado todavía.
      const valid = body.filter(function (p) {
        if (p.locked) return false;
        if (finishedSet[p.match_id]) return false; // ya jugado: no se pronostica
        return true;
      });

      const buildPayload = function (p) {
        return {
          user_id: userId,
          match_id: p.match_id,
          equipo_local: p.equipo_local,
          equipo_visitante: p.equipo_visitante,
          pronostico_local: p.local_score,
          pronostico_visitante: p.visitor_score,
          fecha_partido: p.fecha,
          estado: "PENDIENTE",
          resultado_real_local: 0,
          resultado_real_visitante: 0,
          puntos_ganados: 0,
        };
      };

      // --- Camino principal: Batch API de PocketBase/Datum ---
      // Guarda TODO el lote (crea/actualiza) en UNA sola peticion HTTP a Datum, en
      // vez de 1 peticion por registro. Elimina el tope de subrequests del Edge
      // runtime (que antes truncaba el guardado a ~58) y baja drasticamente la carga
      // sobre Datum (lo que causaba rate-limit en rafaga). El batch es transaccional:
      // entran todos o ninguno; si algo falla, hacemos fallback registro-por-registro.
      const saveViaBatch = async function (items) {
        const batchUrl = BASE_URL.replace(/\/collections\/?$/, "") + "/batch";
        const requests = items.map(function (p) {
          const found = existingItems.find(function (e) {
            return e.match_id === p.match_id;
          });
          if (found)
            return {
              method: "PATCH",
              url: "/api/collections/pbc_1944158292/records/" + found.id,
              body: buildPayload(p),
            };
          return {
            method: "POST",
            url: "/api/collections/pbc_1944158292/records",
            body: buildPayload(p),
          };
        });
        const res = await fetch(batchUrl, {
          method: "POST",
          headers: { "X-Api-Key": API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ requests: requests }),
        });
        if (!res.ok) {
          const txt = await res.text().catch(function () {
            return "";
          });
          throw new Error(
            "Batch HTTP " + res.status + " " + String(txt).slice(0, 160),
          );
        }
        return items.length;
      };

      // --- Fallback: upsert registro por registro (si el batch no estuviera disponible) ---
      const upsertOne = async function (p) {
        const found = existingItems.find(function (e) {
          return e.match_id === p.match_id;
        });
        const recordId = found ? found.id : null;
        const payload = buildPayload(p);
        let lastErr = "";
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            if (recordId)
              await fetchDatum(
                "pbc_1944158292",
                "PATCH",
                payload,
                recordId,
                "",
              );
            else await fetchDatum("pbc_1944158292", "POST", payload, "", "");
            return { ok: true, match_id: p.match_id };
          } catch (e) {
            lastErr = e && e.message ? e.message : "unknown";
            if (attempt === 0)
              await new Promise(function (r) {
                setTimeout(r, 400);
              });
          }
        }
        return { ok: false, match_id: p.match_id, error: lastErr };
      };
      const saveViaPerRecord = async function (items) {
        const CHUNK = 4;
        let okCount = 0;
        const failed = [];
        for (let i = 0; i < items.length; i += CHUNK) {
          const results = await Promise.all(
            items.slice(i, i + CHUNK).map(upsertOne),
          );
          results.forEach(function (r) {
            if (r.ok) okCount++;
            else failed.push(r.match_id);
          });
        }
        return { saved: okCount, failedIds: failed };
      };

      let saved = 0;
      let failedIds = [];
      let via = "batch";
      if (valid.length > 0) {
        try {
          saved = await saveViaBatch(valid);
        } catch (batchErr) {
          via = "perrecord";
          const r = await saveViaPerRecord(valid);
          saved = r.saved;
          failedIds = r.failedIds;
        }
      }
      return new Response(
        JSON.stringify({
          success: failedIds.length === 0,
          saved: saved,
          failed: failedIds.length,
          failed_ids: failedIds,
          total: valid.length,
          via: via,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
      });
    }
  }

  const [fechaServidor, dataMatches, dataPreds, dataRank] = await Promise.all([
    fetchFechaTorneoDesdeJelou(),
    fetchDatumRetry("pbc_631836067", "GET", null, "", "", 3).catch(function () {
      return { items: [] };
    }),
    userId !== "GUEST"
      ? fetchDatumRetry(
          "pbc_1944158292",
          "GET",
          null,
          "",
          "&filter=(user_id='" + userId + "')",
          3,
        ).catch(function () {
          return { items: [] };
        })
      : Promise.resolve({ items: [] }),
    userId !== "GUEST"
      ? fetchDatumRetry(
          "pbc_3271891893",
          "GET",
          null,
          "",
          "&filter=(user_id='" + userId + "')",
          2,
        ).catch(function () {
          return { items: [] };
        })
      : Promise.resolve({ items: [] }),
  ]);
  const rawMatches = Array.isArray(dataMatches)
    ? dataMatches
    : dataMatches.items || [];
  const userPredictions = Array.isArray(dataPreds)
    ? dataPreds
    : dataPreds.items || [];
  // es_oficial = participante del torneo (bloqueado). Los no-oficiales (nuevos + Ruddy)
  // SÍ pueden pronosticar, pero solo partidos sin resultado (ver 'locked').
  const rankItems = Array.isArray(dataRank) ? dataRank : dataRank.items || [];
  const esOficial = rankItems.length > 0 ? !!rankItems[0].es_oficial : false;

  // Si el fetch de partidos fallo aun con reintentos, NO renderizamos una pagina
  // vacia (que el usuario ve como "no me salen los grupos"). Mostramos una
  // pantalla de carga que se auto-recarga, con tope de intentos y boton manual.
  if (rawMatches.length === 0) {
    const L = {
      es: {
        loading: "Cargando partidos…",
        wait: "Estamos preparando tus pronósticos, un momento.",
        err: "No pudimos cargar los partidos. Revisa tu conexión e inténtalo de nuevo.",
        retry: "Reintentar",
      },
      en: {
        loading: "Loading matches…",
        wait: "Getting your predictions ready, one moment.",
        err: "We could not load the matches. Check your connection and try again.",
        retry: "Retry",
      },
      pt: {
        loading: "Carregando partidas…",
        wait: "Preparando seus palpites, um momento.",
        err: "Não foi possível carregar as partidas. Verifique sua conexão e tente novamente.",
        retry: "Tentar novamente",
      },
    };
    const lt = L[lang] || L.es;
    const reloadCount = parseInt(url.searchParams.get("_r") || "0", 10) || 0;
    const params = new URLSearchParams(url.search);
    params.set("_r", String(reloadCount + 1));
    const retryUrl = (url.pathname + "?" + params.toString()).replace(
      /"/g,
      "&quot;",
    );
    const canAuto = reloadCount < 4;
    const reloadHtml =
      '<!DOCTYPE html><html lang="' +
      lang +
      '"><head><meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      "<title>" +
      t.doc_title +
      "</title>" +
      (canAuto
        ? '<meta http-equiv="refresh" content="2;url=' + retryUrl + '">'
        : "") +
      "<style>*{box-sizing:border-box}body{background:#000;color:#fff;font-family:Inter,Arial,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;text-align:center;padding:24px}" +
      ".box{max-width:320px}.sp{width:42px;height:42px;border:4px solid #222;border-top-color:#C9FF24;border-radius:50%;margin:0 auto 18px;animation:s 1s linear infinite}@keyframes s{to{transform:rotate(360deg)}}" +
      "h2{font-size:18px;margin:0 0 8px}p{color:rgba(255,255,255,.6);font-size:13px;margin:0 0 18px;line-height:1.4}a{display:inline-block;background:#C9FF24;color:#000;text-decoration:none;font-weight:800;padding:12px 22px;border-radius:6px}</style></head>" +
      '<body><div class="box">' +
      (canAuto ? '<div class="sp"></div>' : "") +
      "<h2>" +
      (canAuto ? lt.loading : lt.retry) +
      "</h2>" +
      "<p>" +
      (canAuto ? lt.wait : lt.err) +
      "</p>" +
      '<a href="' +
      retryUrl +
      '">' +
      lt.retry +
      "</a>" +
      "</div></body></html>";
    return new Response(reloadHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }
  // Oficiales: bloqueados. No-oficiales (nuevos + Ruddy): pueden editar.
  const puedeEditarPronosticos = !esOficial;

  const groups = {};
  rawMatches.forEach(function (m) {
    const g = m.Fase_o_Grupo || "X";
    if (g.length > 1) return;
    if (!groups[g]) groups[g] = [];
    const up = userPredictions.find(function (pr) {
      return pr.match_id === m.id_partido;
    });
    const partidoFinalizado = hasPairOfDatumScores(
      m.resulltado_local,
      m.resultado_visitante,
    );
    // partidoYaEmpezo solo se usa para el badge EN VIVO/FIN; el bloqueo de edicion
    // ya NO depende de la fecha del partido (todos abiertos hasta FECHA_LIMITE).
    const partidoYaEmpezo = !!(m.fecha && m.fecha <= fechaServidor);
    const rl = parseDatumScore(m.resulltado_local);
    const rv = parseDatumScore(m.resultado_visitante);
    groups[g].push({
      id: m.id_partido,
      local: m.equipo_local,
      visitante: m.equipo_visitante,
      fecha: m.fecha,
      partidoFinalizado: partidoFinalizado,
      partidoEnCurso: partidoYaEmpezo && !partidoFinalizado,
      realDispL: partidoFinalizado ? String(rl) : "-",
      realDispV: partidoFinalizado ? String(rv) : "-",
      pred_l: up ? up.pronostico_local : null,
      pred_v: up ? up.pronostico_visitante : null,
      locked: !puedeEditarPronosticos || partidoFinalizado,
    });
  });
  const groupKeys = Object.keys(groups).sort();

  let groupsHtml = "";
  groupKeys.forEach(function (gk) {
    const list = groups[gk];
    const total = list.length;
    var hechos = 0;
    list.forEach(function (m) {
      const up = userPredictions.find(function (pr) {
        return pr.match_id === m.id;
      });
      if (predictionComplete(up)) hechos++;
    });
    const pct = total > 0 ? Math.round((hechos / total) * 100) : 0;
    const pctHtml = "<span class='group-pct'>" + pct + "%</span>";

    let matchHtml = "";
    list.forEach(function (m) {
      const up = userPredictions.find(function (pr) {
        return pr.match_id === m.id;
      });
      var valL = "",
        valV = "";
      if (
        m.pred_l !== null &&
        m.pred_l !== undefined &&
        String(m.pred_l) !== ""
      ) {
        var pln = parseDatumScore(m.pred_l);
        if (pln !== null) valL = String(pln);
      }
      if (
        m.pred_v !== null &&
        m.pred_v !== undefined &&
        String(m.pred_v) !== ""
      ) {
        var pvn = parseDatumScore(m.pred_v);
        if (pvn !== null) valV = String(pvn);
      }

      const lockClass = m.locked ? "locked" : "";
      const lockData = m.locked ? "data-locked='true'" : "";
      const statusBadge = m.partidoFinalizado
        ? "<span class='lock-badge'>" + t.finished + "</span>"
        : m.partidoEnCurso
          ? "<span class='live-badge'>" + t.live + "</span>"
          : "<span class='pending-badge'>" + t.pending + "</span>";

      var predSubline = "";
      if (m.locked) {
        if (predictionComplete(up)) {
          predSubline =
            "<div class='pred-subline'>" +
            t.your_pred +
            parseDatumScore(m.pred_l) +
            " \u2013 " +
            parseDatumScore(m.pred_v) +
            "</div>";
        } else {
          predSubline =
            "<div class='pred-subline'>" + t.your_pred + "\u2014</div>";
        }
      }

      var predRowHtml = "";
      if (!m.locked) {
        predRowHtml =
          "<div class='pred-row'>" +
          "<div class='score-block " +
          lockClass +
          "'>" +
          "<button type='button' class='btn-step step-up' onclick='step(this,1)'>\u25B2</button>" +
          "<input type='number' class='input-score input-local' value='" +
          valL +
          "' readonly placeholder='-'>" +
          "<button type='button' class='btn-step step-down' onclick='step(this,-1)'>\u25BC</button>" +
          "</div>" +
          "<div class='vs'>x</div>" +
          "<div class='score-block " +
          lockClass +
          "'>" +
          "<button type='button' class='btn-step step-up' onclick='step(this,1)'>\u25B2</button>" +
          "<input type='number' class='input-score input-visitor' value='" +
          valV +
          "' readonly placeholder='-'>" +
          "<button type='button' class='btn-step step-down' onclick='step(this,-1)'>\u25BC</button>" +
          "</div>" +
          "</div>";
      }

      matchHtml +=
        "<div class='match-row' " +
        lockData +
        " data-id='" +
        m.id +
        "' data-f='" +
        m.fecha +
        "' data-l='" +
        m.local +
        "' data-v='" +
        m.visitante +
        "'>" +
        "<div class='match-meta'><span>" +
        m.fecha +
        "</span> " +
        statusBadge +
        "</div>" +
        "<div class='match-body'>" +
        "<div class='team-side'>" +
        "<div class='t-flag'>" +
        flag(m.local) +
        "</div>" +
        "<div class='t-name'>" +
        m.local +
        "</div>" +
        "</div>" +
        "<div class='match-center'>" +
        "<div class='real-line'>" +
        "<span class='real-num'>" +
        m.realDispL +
        "</span>" +
        "<span class='real-x'>x</span>" +
        "<span class='real-num'>" +
        m.realDispV +
        "</span>" +
        "</div>" +
        predRowHtml +
        predSubline +
        "</div>" +
        "<div class='team-side right'>" +
        "<div class='t-flag'>" +
        flag(m.visitante) +
        "</div>" +
        "<div class='t-name'>" +
        m.visitante +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>";
    });

    groupsHtml +=
      "<div class='group-block'>" +
      "<div class='group-header' onclick=\"this.parentElement.classList.toggle('open')\">" +
      "<span class='group-title'>" +
      t.group +
      " " +
      gk +
      "</span>" +
      pctHtml +
      "</div>" +
      "<div class='group-content'>" +
      matchHtml +
      "</div>" +
      "</div>";
  });

  const css = `
    :root{--black:#000;--white:#fff;--lime:#C9FF24;--magenta:#FF0055;--teal:#00FFCC;--purple:#6200EA;--dim:#1F1F1F;--pending:#1a6b3a}
    *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
    body{background:var(--black);color:var(--white);font-family:'Inter',sans-serif;padding-bottom:90px}
    body.read-only-mode .btn-save{display:none}
    .app-container{max-width:450px;margin:auto;padding:0 16px}
    .header-box{margin:40px 0 30px;border-bottom:4px solid var(--white);padding-bottom:10px}
    .badge-26{background:var(--teal);color:var(--black);font-weight:900;font-size:14px;padding:4px 8px;margin-bottom:12px;display:inline-block}
    h1{font-family:'Archivo Black',sans-serif;font-size:40px;line-height:.9;letter-spacing:-2px}
    .group-block{border:2px solid var(--white);margin-bottom:16px;background:var(--black)}
    .group-header{font-family:'Archivo Black';font-size:28px;padding:16px 56px 16px 16px;background:var(--white);color:var(--black);cursor:pointer;position:relative;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
    .group-title{flex:1;min-width:0}
    .group-pct{font-family:'Inter',sans-serif;font-size:14px;font-weight:800;color:rgba(0,0,0,.55);white-space:nowrap;margin-right:8px}
    .group-block.open .group-pct{color:rgba(255,255,255,.75)}
    .group-header::after{content:'+';position:absolute;right:16px;top:50%;transform:translateY(-50%);font-weight:900;font-size:32px}
    .group-block.open .group-header{background:var(--magenta);color:var(--white)}
    .group-block.open .group-header::after{content:'-'}
    .group-content{display:none;padding:0}
    .group-block.open .group-content{display:block}
    .match-row{border-top:2px solid var(--white);padding:16px 12px}
    .match-meta{font-size:10px;font-weight:800;color:rgba(255,255,255,.6);display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;letter-spacing:1px}
    .lock-badge{background:var(--purple);color:var(--white);padding:2px 6px;font-size:9px}
    .live-badge{background:var(--magenta);color:var(--white);padding:2px 6px;font-size:9px;font-weight:800;letter-spacing:.5px;animation:livePulse 1.2s ease-in-out infinite}
    @keyframes livePulse{0%,100%{opacity:1}50%{opacity:.55}}
    .pending-badge{background:var(--pending);color:var(--white);padding:2px 6px;font-size:9px;font-weight:800}
    .match-body{display:flex;align-items:flex-start;justify-content:space-between;gap:6px}
    .match-center{display:flex;flex-direction:column;align-items:center;gap:8px;flex:0 0 auto;min-width:100px;max-width:140px}
    .real-line{display:flex;align-items:center;justify-content:center;gap:6px;font-family:'Archivo Black',sans-serif;font-size:20px;color:var(--white);padding-top:4px}
    .real-num{min-width:1.2em;text-align:center}
    .real-x{font-size:14px;opacity:.35;margin:0 2px}
    .pred-row{display:flex;align-items:flex-start;justify-content:center;gap:4px}
    .pred-subline{font-size:10px;font-weight:600;color:rgba(255,255,255,.45);text-align:center;width:100%;margin-top:2px;line-height:1.3}
    .team-side{flex:1;display:flex;flex-direction:column;align-items:flex-start;min-width:0;overflow:hidden;padding-top:2px}
    .team-side.right{align-items:flex-end}
    .t-flag{font-size:28px;line-height:1}
    .t-name{font-weight:900;font-size:10px;text-transform:uppercase;white-space:nowrap;max-width:100%;text-overflow:ellipsis;overflow:hidden}
    .score-block{display:flex;flex-direction:column;align-items:center;gap:2px;background:var(--dim);padding:4px;border:1px solid rgba(255,255,255,.1);border-radius:4px}
    .btn-step{width:34px;height:24px;background:rgba(255,255,255,0.05);color:var(--white);border:none;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.1s}
    .btn-step:active{background:var(--lime);color:var(--black)}
    .step-up{border-radius:4px 4px 0 0}
    .step-down{border-radius:0 0 4px 4px}
    .input-score{width:34px;height:34px;background:transparent;border:none;color:var(--lime);font-size:24px;font-family:'Archivo Black';text-align:center;line-height:34px}
    .score-block.locked{border-color:transparent;background:transparent}
    .score-block.locked .btn-step{display:none}
    .score-block.locked .input-score{color:var(--white)}
    .pred-row .vs{font-family:'Archivo Black';font-size:14px;opacity:.3;padding:0 4px;margin-top:22px}
    .bottom-bar{position:fixed;bottom:0;left:0;width:100%;background:var(--black);padding:16px;border-top:4px solid var(--lime);z-index:50;display:flex;flex-direction:column;gap:10px}
    .btn-save{width:100%;max-width:450px;margin:0 auto;display:block;background:var(--lime);color:var(--black);border:none;padding:16px;font-family:'Archivo Black';font-size:18px;cursor:pointer;letter-spacing:1px}
    .btn-save:active{background:var(--white)}
    .btn-volver{width:100%;max-width:450px;margin:0 auto;display:block;background:var(--white);color:var(--black);border:none;padding:12px;font-family:'Archivo Black';font-size:14px;cursor:pointer;text-align:center;letter-spacing:1px}
    .btn-volver:active{background:var(--teal)}
    .toast{position:fixed;top:16px;left:50%;transform:translateX(-50%) translateY(-100px);background:var(--white);color:var(--black);padding:12px 24px;font-family:'Archivo Black';font-size:14px;z-index:100;transition:.3s;border:4px solid var(--black)}
    .toast.show{transform:translateX(-50%) translateY(0)}
  `;

  const bodyClass = puedeEditarPronosticos ? "" : ' class="read-only-mode"';

  const jsCode = `
var T_SAVING=${JSON.stringify(t.btn_saving)};
var T_SAVE=${JSON.stringify(t.btn_save)};
var T_CLOSED=${JSON.stringify(t.alert_closed)};
var T_ERR_SAVE=${JSON.stringify(t.alert_save)};
var T_ERR_NET=${JSON.stringify(t.alert_net)};
var T_PA=${JSON.stringify(t.alert_partial_a)};
var T_PB=${JSON.stringify(t.alert_partial_b)};
var T_PC=${JSON.stringify(t.alert_partial_c)};
var PUEDE_EDITAR=${JSON.stringify(puedeEditarPronosticos)};
var callbackSent=false;

function qp(name){ return new URLSearchParams(window.location.search).get(name)||""; }
function currentUid(){ return qp("user_id")||"GUEST"; }

// Sube/baja el marcador y marca la fila para autoguardado.
function step(btn,amount){
  var input=btn.parentElement.querySelector("input");
  var val=parseInt(input.value); if(isNaN(val))val=0;
  val+=amount; if(val<0)val=0; if(val>20)val=20;
  input.value=val;
  var row=btn.closest(".match-row");
  if(row) markDirty(row);
}

// Convierte una fila a pronostico, o null si esta bloqueada / incompleta.
function rowToPred(row){
  if(row.getAttribute("data-locked")==="true")return null;
  var il=row.querySelector(".input-local"); var iv=row.querySelector(".input-visitor");
  if(!il||!iv)return null;
  var valL=il.value; var valV=iv.value;
  if(valL===""&&valV==="")return null;
  if(valL!==""&&valV==="")valV="0";
  if(valV!==""&&valL==="")valL="0";
  return { match_id:row.getAttribute("data-id"), equipo_local:row.getAttribute("data-l"),
    equipo_visitante:row.getAttribute("data-v"), fecha:row.getAttribute("data-f"),
    local_score:parseInt(valL), visitor_score:parseInt(valV), locked:false };
}

function collectAll(){
  var out=[];
  document.querySelectorAll(".match-row").forEach(function(row){
    var p=rowToPred(row); if(p)out.push(p);
  });
  return out;
}

// POST de un lote (cualquier tamano) reintentando solo los que el server reporte como fallidos.
function postBatch(items,retries,useKeepalive){
  return fetch("/api/grupos?user_id="+currentUid(),{
    method:"POST",cache:"no-store",
    headers:{"Content-Type":"application/json","Cache-Control":"no-cache"},
    body:JSON.stringify(items),keepalive:!!useKeepalive
  })
  .then(function(res){
    if(res.status===403){return {closed:true};}
    return res.json().then(function(d){return {ok:res.ok,data:d||{}};}).catch(function(){return {ok:res.ok,data:{}};});
  })
  .then(function(result){
    if(!result||result.closed)return result;
    if(!result.ok)return {hardError:true};
    var data=result.data||{};
    var failed=data.failed||0;
    if(failed===0||retries<=0)return data;
    var failedIds=data.failed_ids||[];
    var retryItems=items.filter(function(p){return failedIds.indexOf(p.match_id)!==-1;});
    if(retryItems.length===0)return data;
    return new Promise(function(r){setTimeout(r,500);}).then(function(){return postBatch(retryItems,retries-1,useKeepalive);});
  });
}

// --- Autoguardado incremental por partido (debounce, lotes chicos) ---
var dirtyRows={};
var autosaveTimer=null;
function cancelAutosave(){ if(autosaveTimer){clearTimeout(autosaveTimer);autosaveTimer=null;} dirtyRows={}; }
function markDirty(row){
  if(!PUEDE_EDITAR)return;
  if(currentUid()==="GUEST")return;
  var p=rowToPred(row);
  if(!p)return;
  dirtyRows[p.match_id]=p;
  if(autosaveTimer)clearTimeout(autosaveTimer);
  autosaveTimer=setTimeout(flushAutosave,800);
}
function flushAutosave(){
  if(autosaveTimer){clearTimeout(autosaveTimer);autosaveTimer=null;}
  if(!PUEDE_EDITAR)return;
  if(currentUid()==="GUEST")return;
  var items=Object.keys(dirtyRows).map(function(k){return dirtyRows[k];});
  if(items.length===0)return;
  dirtyRows={};
  postBatch(items,1,true).catch(function(){});
}

// --- GUARDAR TODO: lotes chicos en requests separados para no superar el tope
// de subrequests del Edge runtime (lo que antes truncaba a ~58 registros). ---
var BATCH=40;
function save(){
  var btn=document.getElementById("btnSave"); if(!btn)return;
  if(!PUEDE_EDITAR){alert(T_CLOSED);return;}
  cancelAutosave();
  btn.innerHTML=T_SAVING;
  var payload=collectAll();
  if(payload.length===0){btn.innerHTML=T_SAVE;return;}
  var exId=qp("executionId");
  var batches=[]; for(var i=0;i<payload.length;i+=BATCH)batches.push(payload.slice(i,i+BATCH));
  var totalFailed=0, closed=false, hard=false;
  function runBatch(idx){
    if(idx>=batches.length)return Promise.resolve();
    return postBatch(batches[idx],2,false).then(function(r){
      if(r&&r.closed){closed=true;return;}
      if(r&&r.hardError){hard=true;}
      else { totalFailed+=(r&&r.failed)||0; }
      return runBatch(idx+1);
    });
  }
  runBatch(0).then(function(){
    if(closed){alert(T_CLOSED);return;}
    if(hard){alert(T_ERR_SAVE);return;}
    if(totalFailed>0){
      var saved=payload.length-totalFailed;
      alert(T_PA+saved+T_PB+payload.length+T_PC);
      return;
    }
    var toast=document.getElementById("toast"); if(toast)toast.classList.add("show");
    var cbBody={executionId:exId,success:true,data:{action:"save_pronosticos",total:payload.length}};
    fetch("https://workflows.jelou.ai/v1/webview/callback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(cbBody)})
      .finally(function(){ setTimeout(function(){window.location.href="https://wa.me/593983456638";},1500); });
  })
  .catch(function(){alert(T_ERR_NET);})
  .finally(function(){btn.innerHTML=T_SAVE;});
}

window.volver=function(){
  if(callbackSent)return;
  callbackSent=true;
  flushAutosave();
  var exId=qp("executionId");
  var cbBody={executionId:exId,success:true,data:{action:"volver"}};
  fetch("https://workflows.jelou.ai/v1/webview/callback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(cbBody)})
    .finally(function(){ window.location.href="https://wa.me/593983456638"; });
};

document.addEventListener("visibilitychange",function(){
  if(document.visibilityState!=="hidden")return;
  flushAutosave();
  if(callbackSent)return;
  callbackSent=true;
  var exId=qp("executionId");
  fetch("https://workflows.jelou.ai/v1/webview/callback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({executionId:exId,success:true,data:{action:"volver"}}),keepalive:true});
});
window.addEventListener("pagehide",function(){ flushAutosave(); });

window.step=step;
window.save=save;
`;

  const html =
    '<!DOCTYPE html><html lang="es"><head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">' +
    "<title>" +
    t.doc_title +
    "</title>" +
    '<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">' +
    "<style>" +
    css +
    "</style>" +
    "</head><body" +
    bodyClass +
    ">" +
    '<div class="toast" id="toast">' +
    t.toast +
    "</div>" +
    '<div class="app-container">' +
    '<div class="header-box"><div class="badge-26">' +
    t.badge +
    "</div><h1>" +
    t.title +
    "</h1></div>" +
    "<div>" +
    groupsHtml +
    "</div>" +
    "</div>" +
    '<div class="bottom-bar">' +
    '  <button class="btn-save" id="btnSave" onclick="save()">' +
    t.btn_save +
    "</button>" +
    '  <button class="btn-volver" onclick="volver()">' +
    t.btn_back +
    "</button>" +
    "</div>" +
    "<script>" +
    jsCode +
    "<\/script>" +
    "</body></html>";

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
