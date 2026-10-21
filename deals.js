/**
 * SPARFIND — Deal-Datenbestand
 *
 * Diese Datei ist die EINZIGE Quelle für alle Angebote auf der Seite.
 * Sie wird vom Commerce-OS automatisch neu geschrieben; index.html rendert
 * ausschließlich daraus. Wer ein Angebot ändern will, ändert diese Datei —
 * niemals das HTML.
 *
 * Pflichtfelder je Deal:
 *   id        eindeutig, stabil (Merchant + Artikelnummer)
 *   title     Produktname, so wie ihn ein Käufer suchen würde
 *   category  Schlüssel aus CATEGORIES
 *   price     aktueller Preis in EUR (Zahl, kein String)
 *   url       AFFILIATE-Link inkl. Tracking-Parameter
 *   merchant  Schlüssel aus MERCHANTS
 *   checkedAt ISO-Datum der letzten Preisprüfung  ← Pflicht, siehe unten
 *
 * Optional:
 *   listPrice  frueherer Verkaufspreis DES HAENDLERS. Wird durchgestrichen.
 *              NUR setzen, wenn er beim Händler wirklich steht.
 *   uvp        Preisempfehlung des HERSTELLERS. Wird mit Label "UVP" gezeigt,
 *              nie still durchgestrichen — der Händler hat nie so viel verlangt.
 *   affUrl     Partnerlink, falls er sich vom normalen Produktlink unterscheidet.
 *   sold       tatsächlich verkaufte Stück laut Händler (echte Zahl, kein Marketing)
 *   rating     Sternebewertung 0–5
 *   image      Produktfoto-URL (kein Werbebanner!)
 *   note       ein Satz, warum der Deal etwas taugt
 *
 * REGELN, die nicht verhandelbar sind:
 * 1. Preise ändern sich bei Temu/AliExpress ständig. Jeder Deal trägt sein
 *    `checkedAt`-Datum; die Seite zeigt den jüngsten davon oben im Badge —
 *    einmal statt auf jeder Karte.
 * 2. `listPrice` niemals erfinden, um einen Rabatt größer aussehen zu lassen.
 *    Ohne echten Streichpreis gibt es kein Prozent-Badge.
 * 3. Kein künstlicher Zeitdruck, keine erfundenen Countdowns.
 * 4. Jeder Link ist Werbung und wird als solche gekennzeichnet.
 */


/**
 * PARTNERLINKS — wo das Geld herkommt.
 *
 * Ein Produktlink verdient nur dann Provision, wenn er ein echter Partnerlink
 * ist. Deshalb trennt diese Datei zwei Felder:
 *
 *   url     der normale Produktlink. Funktioniert immer, verdient nichts.
 *   affUrl  der generierte Partnerlink. Verdient Provision.
 *
 * Die Seite verlinkt `affUrl`, sobald er da ist, sonst `url`. So ist die Seite
 * nie kaputt, und `affiliateCoverage()` sagt jederzeit, wie viele Karten
 * tatsaechlich Geld verdienen — statt es zu vermuten.
 *
 * Temu:       temu.to/k/… Kurzlinks SIND bereits Partnerlinks → direkt in `url`.
 * AliExpress: Partnerlinks muessen im AliExpress-Portal je Produkt erzeugt
 *             werden (s.click.aliexpress.com/e/…). Es gibt KEINEN Parameter,
 *             den man an einen normalen Link anhaengen kann — wer das glaubt,
 *             verschenkt die Provision. Deshalb steht hier nie eine erfundene ID.
 */
const AFFILIATE_HOSTS = ['temu.to', 's.click.aliexpress.com', 'amzn.to'];

/** Der Link, den die Seite tatsaechlich setzt. */
function dealUrl(d) {
  return d.affUrl || d.url;
}

/** Verdient dieser Deal Provision? Geprueft am Host, nicht am Wunsch. */
function isAffiliate(d) {
  const u = dealUrl(d);
  return AFFILIATE_HOSTS.some((h) => u.includes(h));
}

/** Wie viele Karten verdienen Geld — fuer die Konsole, nicht fuer Besucher. */
function affiliateCoverage(deals) {
  const paid = deals.filter(isAffiliate).length;
  return { paid, total: deals.length };
}

const MERCHANTS = {
  temu:       { name: 'Temu',       color: '#ff7a00' },
  aliexpress: { name: 'AliExpress', color: '#e62e04' },
  amazon:     { name: 'Amazon',     color: '#ff9900' },
};

/**
 * Kategorien. Die Liste folgt dem, was tatsaechlich im Bestand liegt — eine
 * Kategorie, die keinen Deal enthaelt, wird gar nicht erst angezeigt (siehe
 * index.html). Ein leerer Filter ist fuer den Besucher eine Sackgasse: er
 * klickt, sieht nichts und glaubt, die Seite sei kaputt.
 */
const CATEGORIES = [
  { key: 'alle',      label: 'Alle Deals',  icon: '✦' },
  { key: 'buero',     label: 'Homeoffice',  icon: '🪑' },
  { key: 'haushalt',  label: 'Haushalt',    icon: '🏠' },
  { key: 'technik',   label: 'Technik',     icon: '🔌' },
  { key: 'beauty',    label: 'Beauty',      icon: '💇' },
  { key: 'auto',      label: 'Auto',        icon: '🚗' },
  { key: 'reise',     label: 'Reise',       icon: '🧳' },
  { key: 'sport',     label: 'Sport',       icon: '🏋️' },
  { key: 'mode',      label: 'Taschen',     icon: '👜' },
  { key: 'mobilitaet',label: 'Mobilität',   icon: '🛴' },
  { key: 'kueche',    label: 'Küche',       icon: '🍳' },
  { key: 'werkzeug',  label: 'Werkzeug',    icon: '🔧' },
  { key: 'garten',    label: 'Garten',      icon: '🌿' },
];

/**
 * Startbestand. Die beiden Temu-Artikel sind echte Partnerlinks des Betreibers.
 * Preise fehlen bewusst, solange sie nicht verifiziert sind — die Karte zeigt
 * dann "Preis beim Händler prüfen" statt einer Zahl, die falsch sein könnte.
 */
/* DEALS:START — ab hier schreibt tools/build-deals.js. Nicht von Hand aendern,
   sonst ist die naechste Aenderung wieder weg. Neue Produkte: neue-produkte.txt */
const DEALS = [
];
/* DEALS:END */
