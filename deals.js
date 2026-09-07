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
  {
    id: 'temu-601099664725495',
    title: 'Lubluelu Akku-Staubsauger 46 kPa, 6-in-1 kabellos',
    category: 'haushalt',
    merchant: 'temu',
    price: 70.06,
    uvp: 104.28,
    url: 'https://temu.to/k/e7x24gpa12q',
    affUrl: 'https://temu.to/k/e7x24gpa12q',
    image: 'bilder/staubsauger.jpg',
    checkedAt: '2026-09-07',
    note: 'Beutellos, steht frei ohne Wandhalterung — fuer Teppich, Hartboden und Tierhaare.',
  },
  {
    id: 'temu-601102492091609',
    title: 'Schminktisch mit grossem Spiegel und Foehnhalter',
    category: 'beauty',
    merchant: 'temu',
    price: 116.54,
    uvp: 190.33,
    url: 'https://temu.to/k/e5pzllg6b1t',
    affUrl: 'https://temu.to/k/e5pzllg6b1t',
    image: 'bilder/schminktisch.jpg',
    checkedAt: '2026-09-07',
    note: '8 Schubladen, offene Faecher und Halter fuer Stylingtools, 135 cm breit.',
  },
  {
    id: 'temu-601101121121885',
    title: 'Elektronische Parkscheibe mit LED-Anzeige',
    category: 'auto',
    merchant: 'temu',
    price: 12.88,
    uvp: 19,
    url: 'https://temu.to/k/ea7sou4q4ko',
    affUrl: 'https://temu.to/k/ea7sou4q4ko',
    image: 'bilder/parkuhr.jpg',
    checkedAt: '2026-09-07',
    note: 'Digitale Parkuhr mit Nachtmodus — ersetzt die Pappscheibe im Auto.',
  },
  {
    id: 'temu-605706837164886',
    title: 'Hartschalen-Kofferset, 4- oder 5-teilig, erweiterbar',
    category: 'reise',
    merchant: 'temu',
    price: 61.33,
    uvp: 99.18,
    url: 'https://temu.to/k/ehyrbnwnfvi',
    affUrl: 'https://temu.to/k/ehyrbnwnfvi',
    image: 'bilder/kofferset.jpg',
    checkedAt: '2026-09-07',
    note: 'Spinner-Rollen und Dehnfalte, Groessen von 12 bis 28 Zoll.',
  },
  {
    id: 'temu-605958763845087',
    title: 'Schuhregal fuer 27 bis 35 Paar, ohne Werkzeug',
    category: 'haushalt',
    merchant: 'temu',
    price: 10.5,
    url: 'https://temu.to/k/eh20dif8r8u',
    affUrl: 'https://temu.to/k/eh20dif8r8u',
    image: 'bilder/schuhregal.jpg',
    checkedAt: '2026-09-07',
    note: 'Steht frei, schmales Hochformat fuer Flur, Schrank oder Wohnung.',
  },
  {
    id: 'temu-606271088512695',
    title: 'Powerbank 60.000 mAh mit 66 W Schnellladung',
    category: 'technik',
    merchant: 'temu',
    price: 23.57,
    url: 'https://temu.to/k/ebx1fg5xnwi',
    affUrl: 'https://temu.to/k/ebx1fg5xnwi',
    image: 'bilder/powerbank.jpg',
    checkedAt: '2026-09-07',
    note: 'Laedt mehrere Geraete gleichzeitig, mit digitaler Ladeanzeige.',
  },
  {
    id: 'temu-601103997517154',
    title: 'Ergonomischer Gaming-Stuhl mit Fussstuetze',
    category: 'buero',
    merchant: 'temu',
    price: 54.06,
    uvp: 80.24,
    url: 'https://temu.to/k/eybaj20uieb',
    affUrl: 'https://temu.to/k/eybaj20uieb',
    image: 'bilder/gamingstuhl.jpg',
    checkedAt: '2026-09-07',
    note: 'Verstellbare Neigung, ausklappbare Fussstuetze, Kopf- und Lendenstuetze.',
  },
  {
    id: 'temu-605824881624971',
    title: 'Gaming-Schreibtisch mit RGB-Licht und Steckdosen',
    category: 'buero',
    merchant: 'temu',
    price: 54.55,
    url: 'https://temu.to/k/e0merol1wk5',
    affUrl: 'https://temu.to/k/e0merol1wk5',
    image: 'bilder/gamingtisch.jpg',
    checkedAt: '2026-09-07',
    note: 'Mit Monitorhalterung, Ablagefaechern und mehreren Farbvarianten.',
  },
  {
    id: 'temu-601101921325110',
    title: 'OUKITEL P1000Y Plus Powerstation, 1024 Wh / 1800 W',
    category: 'technik',
    merchant: 'temu',
    price: 399.67,
    uvp: 504.17,
    url: 'https://temu.to/k/egt1izi4xre',
    affUrl: 'https://temu.to/k/egt1izi4xre',
    image: 'bilder/powerstation.jpg',
    checkedAt: '2026-09-07',
    note: 'LiFePO4-Akku, in 40 Minuten auf 80 Prozent — 4x AC, 2x USB, 2x USB-C.',
  },
  {
    id: 'temu-601102620938880',
    title: 'Laufband fuer unter den Schreibtisch, ohne Aufbau',
    category: 'buero',
    merchant: 'temu',
    price: 79.79,
    url: 'https://temu.to/k/ebcrqc4d3ys',
    affUrl: 'https://temu.to/k/ebcrqc4d3ys',
    image: 'bilder/laufband.jpg',
    checkedAt: '2026-09-07',
    note: 'Flach genug fuer den Schreibtisch, mit Fernbedienung und LED-Anzeige.',
  },
  {
    id: 'temu-601099685558935',
    title: 'Eck-Schreibtisch in L-Form, 118 x 100 cm, weiss',
    category: 'buero',
    merchant: 'temu',
    price: 58.36,
    uvp: 67.76,
    url: 'https://temu.to/k/edliukgb2h5',
    affUrl: 'https://temu.to/k/edliukgb2h5',
    image: 'bilder/schreibtisch.jpg',
    checkedAt: '2026-09-07',
    note: 'Nutzt die Zimmerecke aus, mit Ablage, 75 cm Arbeitshoehe.',
  },
];
/* DEALS:END */
