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
  {
    id: 'temu-601099634449634',
    title: 'Lubluelu SL60MAX+ Saugroboter mit Selbstreinigung',
    category: 'haushalt',
    merchant: 'temu',
    price: 167.07,
    uvp: 260.72,
    url: 'https://temu.to/k/errs7vcf8bc',
    affUrl: 'https://temu.to/k/errs7vcf8bc',
    image: 'bilder/saugroboter-sl60max.jpg',
    checkedAt: '2026-09-08',
    note: 'Saugt und wischt, reinigt die Station selbst — bis zu 60 Tage ohne Handgriff.',
  },
  {
    id: 'temu-606671829076640',
    title: 'Matratzenauflage 1000 g/m² mit Eckgummis',
    category: 'haushalt',
    merchant: 'temu',
    price: 15.98,
    uvp: 30.91,
    url: 'https://temu.to/k/ek7f7ip7wk4',
    affUrl: 'https://temu.to/k/ek7f7ip7wk4',
    image: 'bilder/matratzenauflage.jpg',
    checkedAt: '2026-09-08',
    note: 'Gepolsterte Mikrofaser, atmungsaktiv, haelt mit elastischen Eckgurten.',
  },
  {
    id: 'temu-601104834440512',
    title: 'Solar-Wandleuchten mit Bewegungsmelder, 2er-Pack',
    category: 'garten',
    merchant: 'temu',
    price: 15.89,
    uvp: 23.99,
    url: 'https://temu.to/k/e29bhb42env',
    affUrl: 'https://temu.to/k/e29bhb42env',
    image: 'bilder/solarleuchten.jpg',
    checkedAt: '2026-09-08',
    note: '234 LED, PIR-Sensor, laedt tagsueber ueber Solar — kein Kabel noetig.',
  },
  {
    id: 'temu-601099683890383',
    title: 'BoyKeep WLAN-Ueberwachungskamera fuer innen',
    category: 'technik',
    merchant: 'temu',
    price: 12.89,
    uvp: 25.19,
    url: 'https://temu.to/k/e6zc406cr6o',
    affUrl: 'https://temu.to/k/e6zc406cr6o',
    image: 'bilder/wlan-kamera.jpg',
    checkedAt: '2026-09-08',
    note: '5 GHz und 2,4 GHz, schwenkbar, fuer Wohnung, Buero oder Kinderzimmer.',
  },
  {
    id: 'temu-605848017458196',
    title: 'OBD2-Diagnosegeraet fuer Motorfehler',
    category: 'auto',
    merchant: 'temu',
    price: 10,
    url: 'https://temu.to/k/e4kgpba9gye',
    affUrl: 'https://temu.to/k/e4kgpba9gye',
    image: 'bilder/obd2-scanner.jpg',
    checkedAt: '2026-09-08',
    note: 'Liest Fehlercodes aus und loescht sie — spart den Weg in die Werkstatt.',
  },
  {
    id: 'temu-601099666836350',
    title: 'Druckerpatronen fuer Canon PG-545XL und CL-546XL',
    category: 'technik',
    merchant: 'temu',
    price: 13.26,
    uvp: 26.07,
    url: 'https://temu.to/k/en0jc0o5af8',
    affUrl: 'https://temu.to/k/en0jc0o5af8',
    image: 'bilder/canon-patronen.jpg',
    checkedAt: '2026-09-08',
    note: 'Ersatzpatronen fuer Pixma MX495, TR4550 und weitere Modelle, 1 bis 4 Stueck.',
  },
  {
    id: 'temu-601101052192980',
    title: '7D Kopfrasierer fuer Glatze, elektrisch',
    category: 'beauty',
    merchant: 'temu',
    price: 23.38,
    url: 'https://temu.to/k/elrg0chb3i9',
    affUrl: 'https://temu.to/k/elrg0chb3i9',
    image: 'bilder/kopfrasierer.jpg',
    checkedAt: '2026-09-08',
    note: 'Sieben rotierende Klingen, magnetisch abnehmbar, auch nass verwendbar.',
  },
  {
    id: 'temu-601099777284433',
    title: 'Airchros Akku-Staubsauger mit 72.000 Pa',
    category: 'haushalt',
    merchant: 'temu',
    price: 68.81,
    url: 'https://temu.to/k/eacax051s5z',
    affUrl: 'https://temu.to/k/eacax051s5z',
    image: 'bilder/airchros-72000pa.jpg',
    checkedAt: '2026-09-08',
    note: 'Drei Saugstufen, LED-Anzeige, bis zu 70 Minuten Laufzeit ohne Kabel.',
  },
  {
    id: 'temu-603686289917530',
    title: 'Kono Hartschalen-Kofferset, 4- oder 6-teilig',
    category: 'reise',
    merchant: 'temu',
    price: 122.86,
    uvp: 200,
    url: 'https://temu.to/k/eytyrw11ji2',
    affUrl: 'https://temu.to/k/eytyrw11ji2',
    image: 'bilder/kofferset-kono.jpg',
    checkedAt: '2026-09-08',
    note: 'ABS und PC, Spinner-Rollen, Groessen von 14 bis 28 Zoll plus Taschen.',
  },
  {
    id: 'temu-606218944927110',
    title: 'Elektrischer Fleischwolf 1600 W mit Glasbehaelter',
    category: 'kueche',
    merchant: 'temu',
    price: 14.58,
    url: 'https://temu.to/k/er66xfvppvg',
    affUrl: 'https://temu.to/k/er66xfvppvg',
    image: 'bilder/fleischwolf.jpg',
    checkedAt: '2026-09-08',
    note: '2-Liter-Glasbehaelter und vier Edelstahlklingen, auch fuer Gemuese.',
  },
  {
    id: 'temu-601102027813351',
    title: 'Drehbarer Schuhturm fuer 20 bis 28 Paar',
    category: 'haushalt',
    merchant: 'temu',
    price: 56.08,
    url: 'https://temu.to/k/eys94onvx2r',
    affUrl: 'https://temu.to/k/eys94onvx2r',
    image: 'bilder/schuhturm.jpg',
    checkedAt: '2026-09-08',
    note: '360 Grad drehbar, 5 bis 7 Ebenen — nutzt die Ecke statt der Wand.',
  },
  {
    id: 'temu-603777557995507',
    title: 'MONZANA Schwerlastregal 3er-Set, 2625 kg',
    category: 'haushalt',
    merchant: 'temu',
    price: 69.15,
    uvp: 84.17,
    url: 'https://temu.to/k/ep3tzuz3i3h',
    affUrl: 'https://temu.to/k/ep3tzuz3i3h',
    image: 'bilder/schwerlastregal.jpg',
    checkedAt: '2026-09-08',
    note: '15 MDF-Boeden, steckbar ohne Werkzeug — fuer Keller, Garage oder Lager.',
  },
  {
    id: 'temu-601104409302433',
    title: 'Akku-Staubsauger 38 bis 70 kPa, kabellos',
    category: 'haushalt',
    merchant: 'temu',
    price: 58.28,
    uvp: 69.76,
    url: 'https://temu.to/k/e77yc3f8mlf',
    affUrl: 'https://temu.to/k/e77yc3f8mlf',
    image: 'bilder/staubsauger-70kpa.jpg',
    checkedAt: '2026-09-08',
    note: 'Leicht genug fuer Treppen und Auto, mit mehreren Aufsaetzen.',
  },
  {
    id: 'temu-605993056476933',
    title: 'Elektronische Parkscheibe mit Solarzelle',
    category: 'auto',
    merchant: 'temu',
    price: 17.31,
    url: 'https://temu.to/k/ei4s8scuznx',
    affUrl: 'https://temu.to/k/ei4s8scuznx',
    image: 'bilder/solar-parkuhr.jpg',
    checkedAt: '2026-09-08',
    note: 'Stellt die Ankunftszeit selbst, laedt ueber Solar, amtlich zugelassen (E1).',
  },
  {
    id: 'temu-603561735899878',
    title: 'RE:SPORT Hantelset 20 kg, 2-in-1 verstellbar',
    category: 'sport',
    merchant: 'temu',
    price: 20.4,
    uvp: 37.99,
    url: 'https://temu.to/k/efv55q9w6ov',
    affUrl: 'https://temu.to/k/efv55q9w6ov',
    image: 'bilder/hantelset.jpg',
    checkedAt: '2026-09-08',
    note: 'Zwei Kurzhanteln oder eine Langhantel, Gewichte einzeln steckbar.',
  },
  {
    id: 'temu-601100355051990',
    title: 'Gaming-Stuhl mit Fussstuetze und Lendenstuetze',
    category: 'buero',
    merchant: 'temu',
    price: 50.99,
    url: 'https://temu.to/k/e3ivqtct3lu',
    affUrl: 'https://temu.to/k/e3ivqtct3lu',
    image: 'bilder/gamingstuhl-2.jpg',
    checkedAt: '2026-09-08',
    note: 'Neigung verstellbar, ausklappbare Fussstuetze, Kopfkissen inklusive.',
  },
  {
    id: 'temu-601105623150143',
    title: 'Lubluelu Stabstaubsauger 40 kPa, 180 Grad biegsam',
    category: 'haushalt',
    merchant: 'temu',
    price: 72.94,
    url: 'https://temu.to/k/e39d0o4af1e',
    affUrl: 'https://temu.to/k/e39d0o4af1e',
    image: 'bilder/lubluelu-40kpa.jpg',
    checkedAt: '2026-09-08',
    note: 'Rohr knickt ab — kommt unters Bett und unters Sofa, ohne sich zu buecken.',
  },
  {
    id: 'temu-606579789243993',
    title: 'Laresar V11 Akku-Staubsauger, 90 Minuten Laufzeit',
    category: 'haushalt',
    merchant: 'temu',
    price: 123.12,
    uvp: 199.97,
    url: 'https://temu.to/k/em8jxxa87nx',
    affUrl: 'https://temu.to/k/em8jxxa87nx',
    image: 'bilder/laresar-v11.jpg',
    checkedAt: '2026-09-08',
    note: 'Lange Laufzeit fuer die ganze Wohnung in einem Durchgang.',
  },
  {
    id: 'temu-601102861744523',
    title: 'Airchros Staubsauger mit Display und Ladestation',
    category: 'haushalt',
    merchant: 'temu',
    price: 103.95,
    uvp: 127.14,
    url: 'https://temu.to/k/ew7r07m2swh',
    affUrl: 'https://temu.to/k/ew7r07m2swh',
    image: 'bilder/airchros-70min.jpg',
    checkedAt: '2026-09-08',
    note: '70 Minuten Laufzeit, Restlaufzeit im Display, steht in der Ladestation.',
  },
  {
    id: 'temu-601099746480438',
    title: 'Lubluelu SL60Pro Saugroboter mit Selbstentleerung',
    category: 'haushalt',
    merchant: 'temu',
    price: 168.18,
    url: 'https://temu.to/k/e7ku1whgaoy',
    affUrl: 'https://temu.to/k/e7ku1whgaoy',
    image: 'bilder/saugroboter-sl60pro.jpg',
    checkedAt: '2026-09-08',
    note: '4500 Pa, entleert den Staubbehaelter selbst in die Station.',
  },
  {
    id: 'temu-601099643271815',
    title: 'Lubluelu Stabstaubsauger 6-in-1, 35 kPa',
    category: 'haushalt',
    merchant: 'temu',
    price: 74.1,
    uvp: 86.9,
    url: 'https://temu.to/k/el0pke11hnv',
    affUrl: 'https://temu.to/k/el0pke11hnv',
    image: 'bilder/lubluelu-35kpa.jpg',
    checkedAt: '2026-09-08',
    note: 'Steht frei ohne Wandhalterung, sechs Aufsaetze fuer Boden, Polster und Fugen.',
  },
  {
    id: 'temu-604395479649039',
    title: 'Damen-Parfuemset, 4 mal 30 ml',
    category: 'beauty',
    merchant: 'temu',
    price: 15.46,
    uvp: 16.15,
    url: 'https://temu.to/k/e8u4aw7yx0e',
    affUrl: 'https://temu.to/k/e8u4aw7yx0e',
    image: 'bilder/parfuemset.png',
    checkedAt: '2026-09-08',
    note: 'Vier Eau de Parfum mit orientalisch-gourmandigen Noten im Set.',
  },
  {
    id: 'temu-603945044938471',
    title: 'TABWEE T60 Pro Tablet 13,4 Zoll, Android 16',
    category: 'technik',
    merchant: 'temu',
    price: 161.75,
    uvp: 199,
    url: 'https://temu.to/k/elzk2ode646',
    affUrl: 'https://temu.to/k/elzk2ode646',
    image: 'bilder/tablet-tabwee.jpg',
    checkedAt: '2026-09-08',
    note: '120-Hz-Display, 24 GB RAM und 256 GB Speicher — gross genug fuers Sofa.',
  },
  {
    id: 'temu-605647311623249',
    title: 'Klappbarer Besen mit Kehrblech-Set',
    category: 'haushalt',
    merchant: 'temu',
    price: 7.28,
    uvp: 13.78,
    url: 'https://temu.to/k/eyho5u7sqq1',
    affUrl: 'https://temu.to/k/eyho5u7sqq1',
    image: 'bilder/besen-set.jpg',
    checkedAt: '2026-09-08',
    note: 'Drehbarer Kopf, faltbarer Stiel und Haarentferner — passt in jede Ecke.',
  },
  {
    id: 'temu-606249680740604',
    title: 'Tragbares Stromaggregat 600 W, 100.000 mAh',
    category: 'technik',
    merchant: 'temu',
    price: 155.38,
    uvp: 258.56,
    url: 'https://temu.to/k/eigl2c4n6j8',
    affUrl: 'https://temu.to/k/eigl2c4n6j8',
    image: 'bilder/stromaggregat-600w.jpg',
    checkedAt: '2026-09-08',
    note: 'Bis 1200 W Spitze, AC-Steckdose — fuer Camping, Balkon oder Stromausfall.',
  },
  {
    id: 'temu-601103416801096',
    title: 'RGB Neon-Lichtleiste mit App-Steuerung',
    category: 'technik',
    merchant: 'temu',
    price: 6.6,
    uvp: 9.5,
    url: 'https://temu.to/k/etsmve22oqd',
    affUrl: 'https://temu.to/k/etsmve22oqd',
    image: 'bilder/neon-lichtleiste.jpg',
    checkedAt: '2026-09-08',
    note: 'IP65 wasserfest, per Fernbedienung oder Handy in jeder Farbe.',
  },
  {
    id: 'temu-601099637484631',
    title: 'Lubluelu SL60Ultra Saug- und Wischroboter, 5500 Pa',
    category: 'haushalt',
    merchant: 'temu',
    price: 107.05,
    uvp: 147.74,
    url: 'https://temu.to/k/egfpsfuwy2c',
    affUrl: 'https://temu.to/k/egfpsfuwy2c',
    image: 'bilder/saugroboter-sl60ultra.jpg',
    checkedAt: '2026-09-08',
    note: 'Saugt und wischt in einem Durchgang, mit App und Kartenspeicher.',
  },
  {
    id: 'temu-605917961680592',
    title: 'Drehbares Schuhregal mit 7 Ebenen',
    category: 'haushalt',
    merchant: 'temu',
    price: 76.94,
    url: 'https://temu.to/k/ec6yhpo5bl5',
    affUrl: 'https://temu.to/k/ec6yhpo5bl5',
    image: 'bilder/schuhregal-drehbar7.jpg',
    checkedAt: '2026-09-08',
    note: 'Schmaler Turm, 360 Grad drehbar — nutzt die Ecke statt die Wand.',
  },
  {
    id: 'temu-607669066804113',
    title: 'Elektroroller mit Strassenzulassung, bis 120 kg',
    category: 'mobilitaet',
    merchant: 'temu',
    price: 202.99,
    uvp: 259.49,
    url: 'https://temu.to/k/eloezhgvlso',
    affUrl: 'https://temu.to/k/eloezhgvlso',
    image: 'bilder/e-roller.jpg',
    checkedAt: '2026-09-08',
    note: 'Erfuellt die StVO-Vorgaben, also im Strassenverkehr erlaubt.',
  },
  {
    id: 'temu-601102931530169',
    title: 'Damen-Handtaschen-Set, 6-teilig',
    category: 'mode',
    merchant: 'temu',
    price: 19.36,
    uvp: 86.91,
    url: 'https://temu.to/k/ev0nkf92pad',
    affUrl: 'https://temu.to/k/ev0nkf92pad',
    image: 'bilder/handtaschen-set.jpg',
    checkedAt: '2026-09-08',
    note: 'Sechs Teile vom Shopper bis zur Geldboerse, im gleichen Muster.',
  },
  {
    id: 'temu-601102069189815',
    title: 'Hartschalen-Reisegepaeck-Set, 5-teilig',
    category: 'reise',
    merchant: 'temu',
    price: 77.88,
    uvp: 92.22,
    url: 'https://temu.to/k/esd7v5fao8j',
    affUrl: 'https://temu.to/k/esd7v5fao8j',
    image: 'bilder/kofferset-5tlg.jpg',
    checkedAt: '2026-09-08',
    note: 'ABS-Schale mit Spinner-Raedern, vom Handgepaeck bis zum grossen Koffer.',
  },
  {
    id: 'temu-601102028415548',
    title: 'Elektronischer Parktimer mit LED-Anzeige',
    category: 'auto',
    merchant: 'temu',
    price: 13.2,
    uvp: 19,
    url: 'https://temu.to/k/e61fpirnp7c',
    affUrl: 'https://temu.to/k/e61fpirnp7c',
    image: 'bilder/parktimer-led.jpg',
    checkedAt: '2026-09-08',
    note: 'Digitale Parkscheibe, stellt die Ankunftszeit selbst ein.',
  },
  {
    id: 'temu-601104476901893',
    title: 'Teleskop-Leiter aus Edelstahl, 2,6 bis 6,3 m',
    category: 'werkzeug',
    merchant: 'temu',
    price: 34.22,
    url: 'https://temu.to/k/eq5bt21w8m6',
    affUrl: 'https://temu.to/k/eq5bt21w8m6',
    image: 'bilder/teleskopleiter.jpg',
    checkedAt: '2026-09-08',
    note: 'Faehrt auf Handtaschengroesse zusammen, traegt trotzdem voll.',
  },
  {
    id: 'temu-601099656613769',
    title: 'Dashcam 1080p mit Front- und Innenkamera',
    category: 'auto',
    merchant: 'temu',
    price: 22.23,
    uvp: 30.07,
    url: 'https://temu.to/k/elc1ximspfi',
    affUrl: 'https://temu.to/k/elc1ximspfi',
    image: 'bilder/dashcam-dual.jpg',
    checkedAt: '2026-09-08',
    note: 'Zwei Linsen, Infrarot-Nachtsicht — nimmt Strasse und Innenraum auf.',
  },
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
