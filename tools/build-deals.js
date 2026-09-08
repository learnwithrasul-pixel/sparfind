/**
 * SPARFIND — Produkte aus neue-produkte.txt in deals.js einbauen.
 *
 * Warum es das gibt: Produkte einzupflegen ist mechanische Arbeit. Sie soll
 * niemanden kosten — weder eine Chat-Sitzung noch Nerven. Der Betreiber
 * schreibt Bloecke in eine Textdatei, dieses Skript prueft sie streng und
 * schreibt sie zwischen die DEALS-Marker in deals.js.
 *
 * Grundsatz: lieber abbrechen und genau sagen was fehlt, als eine halbe
 * Karte zu veroeffentlichen. Eine Seite mit einem falschen Preis ist
 * schlimmer als eine Seite mit einem Produkt weniger.
 *
 * Aufruf:  node tools/build-deals.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const INPUT = path.join(ROOT, 'neue-produkte.txt');
const DEALSJS = path.join(ROOT, 'deals.js');
const BILDER = path.join(ROOT, 'bilder');
const ARCHIV = path.join(ROOT, 'tools', 'archiv');

/* ---------- Kategorien: deutsch und tuerkisch, damit niemand umdenken muss ---------- */
const KAT = {
  buero: 'buero', 'büro': 'buero', buro: 'buero', homeoffice: 'buero',
  ofis: 'buero', masa: 'buero', schreibtisch: 'buero', moebel: 'buero', 'möbel': 'buero',
  haushalt: 'haushalt', haus: 'haushalt', ev: 'haushalt', temizlik: 'haushalt',
  kueche: 'kueche', 'küche': 'kueche', kuche: 'kueche', mutfak: 'kueche',
  beauty: 'beauty', kosmetik: 'beauty', haar: 'beauty', guzellik: 'beauty',
  'güzellik': 'beauty', sac: 'beauty', 'saç': 'beauty',
  technik: 'technik', teknik: 'technik', elektronik: 'technik', elektro: 'technik',
  auto: 'auto', araba: 'auto', kfz: 'auto', oto: 'auto',
  reise: 'reise', koffer: 'reise', seyahat: 'reise', valiz: 'reise', bavul: 'reise',
  sport: 'sport', fitness: 'sport', hantel: 'sport', spor: 'sport',
  werkzeug: 'werkzeug', alet: 'werkzeug', takim: 'werkzeug', 'takım': 'werkzeug',
  garten: 'garten', bahce: 'garten', 'bahçe': 'garten',
};
const KAT_LISTE = [...new Set(Object.values(KAT))].join(', ');

/**
 * Links, die wie ein Partnerlink aussehen und keiner sind. Gemessen am
 * 07.09.2026: share.temu.com loest zu einer Adresse auf, die nur `goods_id`
 * traegt — kein _x_cid, kein _x_ads_channel. Das ist der Link zum Weitergeben
 * an Freunde, nicht der des Partnerprogramms.
 *
 * Ohne diesen Eintrag greift unten die Regel fuer "temu.com" (share.temu.com
 * enthaelt die Zeichenkette), der Link waere stillschweigend durchgegangen und
 * haette Traffic verschenkt, ohne dass es irgendwo auffaellt.
 */
const NICHT_VERDIENEND = [
  {
    muster: 'share.temu.com',
    grund: 'ist der Freunde-Teilen-Link ohne Partnerkennung — er verdient nichts. '
      + 'Nimm den temu.to/k/... Link aus dem Partnerprogramm.',
  },
];

const HAENDLER = [
  { host: 'temu.to', key: 'temu', partner: true },
  { host: 'temu.com', key: 'temu', partner: false },
  { host: 's.click.aliexpress.com', key: 'aliexpress', partner: true },
  { host: 'aliexpress.com', key: 'aliexpress', partner: false },
  { host: 'amzn.to', key: 'amazon', partner: true },
  { host: 'amazon.de', key: 'amazon', partner: false },
];

const heute = () => new Date().toISOString().slice(0, 10);

/* ---------- Eingabe lesen ---------- */
function leseBloecke(text) {
  // BOM weg (Notepad schreibt ihn), Kommentarzeilen weg, dann an Leerzeilen teilen.
  const sauber = text
    .replace(/^﻿/, '')
    .split(/\r?\n/)
    .filter((z) => !/^\s*#/.test(z))
    .join('\n');
  return sauber
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((block, i) => {
      const felder = {};
      for (const zeile of block.split('\n')) {
        const m = zeile.match(/^\s*([A-Za-zÄÖÜäöü]+)\s*:\s*(.*)$/);
        if (m) felder[m[1].toLowerCase()] = m[2].trim();
      }
      return { nr: i + 1, felder };
    });
}

/* ---------- Stabile id, damit dasselbe Produkt nicht zweimal auf der Seite steht ---------- */
function machId(url, haendler) {
  const m =
    url.match(/temu\.to\/k\/([a-z0-9]+)/i) ||
    url.match(/\/item\/(\d+)/) ||
    url.match(/\/dp\/([A-Z0-9]{10})/) ||
    url.match(/([a-z0-9]{6,})\/?$/i);
  return haendler + '-' + (m ? m[1] : Date.now().toString(36)).toLowerCase();
}

function preisAusText(s) {
  if (!s) return null;
  const t = String(s).replace(/[^\d.,]/g, '');
  if (!t) return null;
  // "39,99" und "39.99" sind beide gemeint; "1.234,56" auch.
  const v = t.includes(',') ? Number(t.replace(/\./g, '').replace(',', '.')) : Number(t);
  return Number.isFinite(v) && v > 0 ? Math.round(v * 100) / 100 : null;
}

/* ---------- Pruefen ---------- */
function pruefe(b) {
  const f = b.felder;
  const fehler = [];

  const url = f.link || f.url || '';
  if (!url) fehler.push('link: fehlt');
  else if (!/^https?:\/\//i.test(url)) fehler.push('link: muss mit https:// anfangen');

  const titel = f.titel || f.title || '';
  if (!titel) fehler.push('titel: fehlt');
  else if (titel.length < 8) fehler.push('titel: zu kurz — so sucht niemand danach');

  const katRoh = (f.kat || f.kategorie || '').toLowerCase();
  const kat = KAT[katRoh];
  if (!katRoh) fehler.push('kat: fehlt (' + KAT_LISTE + ')');
  else if (!kat) fehler.push('kat: "' + katRoh + '" kenne ich nicht (' + KAT_LISTE + ')');

  const taub = NICHT_VERDIENEND.find((x) => url.includes(x.muster));
  if (taub) fehler.push('link: ' + taub.muster + ' ' + taub.grund);

  const h = HAENDLER.find((x) => url.includes(x.host));
  if (url && !taub && !h) {
    fehler.push('link: unbekannter Haendler — erlaubt: ' + HAENDLER.map((x) => x.host).join(', '));
  }

  const preisRoh = f.preis || f.price;
  const preis = preisAusText(preisRoh);
  if (preisRoh && preis === null) fehler.push('preis: "' + preisRoh + '" ist keine Zahl');

  const listPreis = preisAusText(f.statt || f.streichpreis);
  if (listPreis !== null && preis === null) fehler.push('statt: ohne preis sinnlos');
  if (listPreis !== null && preis !== null && listPreis <= preis) {
    fehler.push('statt: muss groesser als preis sein, sonst ist es kein Rabatt');
  }

  // uvp ist die Herstellerempfehlung, nicht der fruehere Preis des Haendlers.
  // Sie wird auf der Karte mit dem Label "UVP" gezeigt statt still
  // durchgestrichen — durchgestrichen hiesse "so teuer war es hier mal", und
  // das stimmt nicht.
  const uvp = preisAusText(f.uvp);
  if (uvp !== null && preis === null) fehler.push('uvp: ohne preis sinnlos');
  if (uvp !== null && preis !== null && uvp <= preis) {
    fehler.push('uvp: muss groesser als preis sein');
  }

  // Bild: entweder eine Datei in bilder/ oder eine vollstaendige URL.
  let bild = (f.bild || f.image || '').trim();
  if (bild && !/^https?:\/\//i.test(bild)) {
    if (!fs.existsSync(path.join(BILDER, bild))) fehler.push('bild: "' + bild + '" liegt nicht im Ordner bilder/');
    else bild = 'bilder/' + bild;
  }

  const verkauft = f.verkauft ? parseInt(String(f.verkauft).replace(/\D/g, ''), 10) : null;
  const sterne = f.sterne ? Number(String(f.sterne).replace(',', '.')) : null;
  if (sterne !== null && (!Number.isFinite(sterne) || sterne < 0 || sterne > 5)) {
    fehler.push('sterne: muss zwischen 0 und 5 liegen');
  }

  // Eine mitgelieferte id gewinnt: der Chrome-Sammler kennt die Artikelnummer
  // des Haendlers und die bleibt gleich, egal ob der Kurzlink oder die lange
  // Adresse eingetragen wird. Aus dem Link geraten wird nur, wenn keine da ist.
  const eigeneId = (f.id || '').trim();
  if (eigeneId && !/^[a-z]+-[a-z0-9]+$/i.test(eigeneId)) {
    fehler.push('id: "' + eigeneId + '" passt nicht ins Muster haendler-nummer');
  }

  // Alle Fehler auf einmal melden — wer dreimal hintereinander neu starten
  // muss, um drei Zeilen zu erfahren, macht es beim vierten Mal gar nicht mehr.
  if (fehler.length) return { fehler, nr: b.nr, titel };

  const deal = {
    id: eigeneId || machId(url, h.key),
    title: titel,
    category: kat,
    merchant: h.key,
    price: preis,
    checkedAt: heute(),
  };
  // Partnerlink gehoert in affUrl, ein normaler Produktlink nur in url. Wer das
  // vermischt, weiss spaeter nicht mehr, welche Karte ueberhaupt Provision bringt.
  deal.url = url;
  if (h.partner) deal.affUrl = url;
  if (listPreis !== null) deal.listPrice = listPreis;
  if (uvp !== null) deal.uvp = uvp;
  if (bild) deal.image = bild;
  if (Number.isFinite(verkauft) && verkauft > 0) deal.sold = verkauft;
  if (sterne !== null) deal.rating = sterne;
  if (f.text || f.note) deal.note = (f.text || f.note).trim();
  return { deal, nr: b.nr };
}

/* ---------- deals.js schreiben ---------- */
const ORDER = ['id', 'title', 'category', 'merchant', 'price', 'listPrice', 'uvp', 'url', 'affUrl',
  'image', 'sold', 'rating', 'checkedAt', 'note'];

function alsQuelltext(deals) {
  const q = (v) =>
    typeof v === 'string' ? "'" + v.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'" : String(v);
  const body = deals
    .map((d) => '  {\n' + ORDER.filter((k) => d[k] !== undefined).map((k) => '    ' + k + ': ' + q(d[k]) + ',').join('\n') + '\n  },')
    .join('\n');
  return 'const DEALS = [\n' + body + '\n];';
}

function lesBestand(quelle) {
  const m = quelle.match(/\/\* DEALS:START[\s\S]*?\*\/\s*([\s\S]*?)\/\* DEALS:END \*\//);
  if (!m) throw new Error('deals.js: DEALS:START/END Marker fehlen.');
  return new Function(m[1] + '; return DEALS;')();
}

/* ---------- Hauptlauf ---------- */
function main() {
  if (!fs.existsSync(INPUT)) {
    console.log('\n  neue-produkte.txt gibt es nicht — nichts zu tun.\n');
    return 0;
  }
  const bloecke = leseBloecke(fs.readFileSync(INPUT, 'utf8'));
  if (!bloecke.length) {
    console.log('\n  neue-produkte.txt ist leer — nichts zu tun.\n');
    return 0;
  }

  const ergebnisse = bloecke.map(pruefe);
  const kaputt = ergebnisse.filter((r) => r.fehler);
  if (kaputt.length) {
    console.log('\n  ABBRUCH — es wurde nichts geaendert.\n');
    for (const r of kaputt) {
      console.log('  Produkt ' + r.nr + (r.titel ? ' (' + r.titel.slice(0, 40) + ')' : '') + ':');
      r.fehler.forEach((f) => console.log('     - ' + f));
    }
    console.log('\n  neue-produkte.txt korrigieren und nochmal starten.\n');
    return 1;
  }

  const bestand = lesBestand(fs.readFileSync(DEALSJS, 'utf8'));
  const nachId = new Map(bestand.map((d) => [d.id, d]));
  let neu = 0;
  let ersetzt = 0;
  for (const r of ergebnisse) {
    if (nachId.has(r.deal.id)) {
      nachId.set(r.deal.id, Object.assign({}, nachId.get(r.deal.id), r.deal));
      ersetzt++;
    } else {
      nachId.set(r.deal.id, r.deal);
      neu++;
    }
  }
  // Neueste zuerst — oben soll stehen, was frisch geprueft ist.
  const alle = [...nachId.values()].sort((a, b) => String(b.checkedAt).localeCompare(String(a.checkedAt)));

  const quelle = fs.readFileSync(DEALSJS, 'utf8').replace(
    /(\/\* DEALS:START[\s\S]*?\*\/\s*)[\s\S]*?(\/\* DEALS:END \*\/)/,
    (_, kopf, fuss) => kopf + alsQuelltext(alle) + '\n' + fuss,
  );
  fs.writeFileSync(DEALSJS, quelle);

  // Am Host pruefen, nicht am Feld: ein temu.to-Link IST ein Partnerlink,
  // auch wenn er nur in `url` steht. Sonst warnt das Skript vor Karten,
  // die laengst Geld verdienen — und man gewoehnt sich die Warnung ab.
  const partnerHosts = HAENDLER.filter((h) => h.partner).map((h) => h.host);
  const ohnePartner = alle.filter(
    (d) => !partnerHosts.some((h) => String(d.affUrl || d.url).includes(h)),
  ).length;
  console.log('\n  ' + neu + ' neu, ' + ersetzt + ' aktualisiert — jetzt ' + alle.length + ' Produkte.');
  if (ohnePartner) {
    console.log('  ACHTUNG: ' + ohnePartner + ' davon ohne Partnerlink — die verdienen nichts.');
  }

  fs.mkdirSync(ARCHIV, { recursive: true });
  fs.renameSync(INPUT, path.join(ARCHIV, 'produkte-' + Date.now() + '.txt'));
  console.log('  neue-produkte.txt liegt jetzt im Archiv (tools/archiv/).\n');
  return 0;
}

process.exit(main());
