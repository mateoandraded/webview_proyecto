/**
 * Mapping pais -> emoji bandera. Las keys estan en MAYUSCULAS para que
 * el lookup case-insensitive con .toUpperCase() siempre encuentre.
 * Incluye alias con/sin tilde y nombres oficiales (Republica de Corea).
 */
export const FLAGS = {
  "MEXICO": "🇲🇽", "ESTADOS UNIDOS": "🇺🇸", "CANADA": "🇨🇦", "BRASIL": "🇧🇷",
  "ARGENTINA": "🇦🇷", "ECUADOR": "🇪🇨", "COLOMBIA": "🇨🇴", "URUGUAY": "🇺🇾",
  "PARAGUAY": "🇵🇾", "CHILE": "🇨🇱", "PERU": "🇵🇪", "VENEZUELA": "🇻🇪",
  "ALEMANIA": "🇩🇪", "ESPANA": "🇪🇸", "ESPAÑA": "🇪🇸", "FRANCIA": "🇫🇷", "PORTUGAL": "🇵🇹",
  "BELGICA": "🇧🇪", "PAISES BAJOS": "🇳🇱", "CROACIA": "🇭🇷", "SERBIA": "🇷🇸",
  "SUIZA": "🇨🇭", "TURQUIA": "🇹🇷", "DINAMARCA": "🇩🇰", "AUSTRIA": "🇦🇹",
  "POLONIA": "🇵🇱", "RUMANIA": "🇷🇴", "ESLOVENIA": "🇸🇮", "ESLOVAQUIA": "🇸🇰",
  "ALBANIA": "🇦🇱", "UCRANIA": "🇺🇦", "GRECIA": "🇬🇷", "MARRUECOS": "🇲🇦",
  "SENEGAL": "🇸🇳", "NIGERIA": "🇳🇬", "CAMERUN": "🇨🇲", "COSTA DE MARFIL": "🇨🇮",
  "EGIPTO": "🇪🇬", "GHANA": "🇬🇭", "TUNEZ": "🇹🇳", "JAPON": "🇯🇵",
  "COREA DEL SUR": "🇰🇷", "AUSTRALIA": "🇦🇺", "IRAN": "🇮🇷", "ARABIA SAUDITA": "🇸🇦",
  "INDONESIA": "🇮🇩", "COSTA RICA": "🇨🇷", "PANAMA": "🇵🇦", "JAMAICA": "🇯🇲",
  "SUDAFRICA": "🇿🇦", "REPUBLICA CHECA": "🇨🇿", "BOSNIA": "🇧🇦", "BOSNIA Y HERZEGOVINA": "🇧🇦",
  "QATAR": "🇶🇦", "HAITI": "🇭🇹", "HAITÍ": "🇭🇹", "ESCOCIA": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "CURAZAO": "🇨🇼", "SUECIA": "🇸🇪", "NUEVA ZELANDA": "🇳🇿", "CABO VERDE": "🇨🇻",
  "IRAK": "🇮🇶", "NORUEGA": "🇳🇴", "ARGELIA": "🇩🇿", "JORDANIA": "🇯🇴",
  "RD CONGO": "🇨🇬", "CONGO": "🇨🇬", "REPUBLICA DEL CONGO": "🇨🇬", "REPÚBLICA DEL CONGO": "🇨🇬",
  "UZBEKISTAN": "🇺🇿", "UZBEKISTÁN": "🇺🇿", "INGLATERRA": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "REPUBLICA DE COREA": "🇰🇷", "REPÚBLICA DE COREA": "🇰🇷"
};

export function flag(name) {
  return FLAGS[(name || '').toUpperCase()] || '🏳️';
}
