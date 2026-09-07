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
 *   listPrice  Streichpreis. NUR setzen, wenn er beim Händler wirklich steht.
 *   sold       tatsächlich verkaufte Stück laut Händler (echte Zahl, kein Marketing)
 *   rating     Sternebewertung 0–5
 *   image      Produktfoto-URL (kein Werbebanner!)
 *   note       ein Satz, warum der Deal etwas taugt
 *
 * REGELN, die nicht verhandelbar sind:
 * 1. Preise ändern sich bei Temu/AliExpress ständig. Deshalb trägt jede Karte
 *    ihr `checkedAt`-Datum. Ist ein Preis älter als STALE_AFTER_DAYS, zeigt die
 *    Seite ihn als "Preis kann abweichen" statt als Tatsache.
 * 2. `listPrice` niemals erfinden, um einen Rabatt größer aussehen zu lassen.
 *    Ohne echten Streichpreis gibt es kein Prozent-Badge.
 * 3. Kein künstlicher Zeitdruck, keine erfundenen Countdowns.
 * 4. Jeder Link ist Werbung und wird als solche gekennzeichnet.
 */

const STALE_AFTER_DAYS = 3;

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

const CATEGORIES = [
  { key: 'alle',      label: 'Alle Deals',    icon: '✦' },
  { key: 'haushalt',  label: 'Haushalt',      icon: '🏠' },
  { key: 'kueche',    label: 'Küche',         icon: '🍳' },
  { key: 'beauty',    label: 'Beauty & Haar', icon: '💇' },
  { key: 'technik',   label: 'Technik',       icon: '🔌' },
  { key: 'werkzeug',  label: 'Werkzeug',      icon: '🔧' },
  { key: 'garten',    label: 'Garten',        icon: '🌿' },
];

/**
 * Startbestand. Die beiden Temu-Artikel sind echte Partnerlinks des Betreibers.
 * Preise fehlen bewusst, solange sie nicht verifiziert sind — die Karte zeigt
 * dann "Preis beim Händler prüfen" statt einer Zahl, die falsch sein könnte.
 */
const DEALS = [
  {
    id: 'temu-601099664725495',
    title: 'Freistehender Akku-Staubsauger, 46 kPa',
    category: 'haushalt',
    merchant: 'temu',
    price: null,
    url: 'https://temu.to/k/e7x24gpa12q',
    checkedAt: '2026-09-06',
    note: 'Kabellos, beutellos, steht frei ohne Wandhalterung.',
  },
  {
    id: 'temu-601102492091609',
    title: 'Schminktisch mit großem Spiegel & Föhnhalter',
    category: 'beauty',
    merchant: 'temu',
    price: null,
    url: 'https://temu.to/k/e5pzllg6b1t',
    checkedAt: '2026-09-06',
    note: 'Frisiertisch mit Stauraum und Halter für Stylingtools.',
  },
];
