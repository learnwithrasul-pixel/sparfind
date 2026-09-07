/**
 * Ein Produkt wieder von der Seite nehmen — ausverkauft, Preis daneben,
 * Haendler weg. Der Gegenpart zu build-deals.js.
 *
 * Aufruf:  node tools/remove-deal.js <id>
 *          node tools/remove-deal.js --liste     (zeigt alle ids)
 */
const fs = require('fs');
const path = require('path');

const DEALSJS = path.join(__dirname, '..', 'deals.js');
const ORDER = ['id', 'title', 'category', 'merchant', 'price', 'listPrice', 'uvp', 'url', 'affUrl',
  'image', 'sold', 'rating', 'checkedAt', 'note'];

const quelle = fs.readFileSync(DEALSJS, 'utf8');
const m = quelle.match(/(\/\* DEALS:START[\s\S]*?\*\/\s*)([\s\S]*?)(\/\* DEALS:END \*\/)/);
if (!m) {
  console.error('deals.js: DEALS:START/END Marker fehlen.');
  process.exit(1);
}
const deals = new Function(m[2] + '; return DEALS;')();

const arg = process.argv[2];
if (!arg || arg === '--liste') {
  console.log('\n  ' + deals.length + ' Produkte:\n');
  deals.forEach((d) => console.log('  ' + d.id.padEnd(28) + d.title.slice(0, 50)));
  console.log('\n  Entfernen:  node tools/remove-deal.js <id>\n');
  process.exit(0);
}

const uebrig = deals.filter((d) => d.id !== arg);
if (uebrig.length === deals.length) {
  console.error('\n  Keine Karte mit der id "' + arg + '". Liste: node tools/remove-deal.js --liste\n');
  process.exit(1);
}

const q = (v) => (typeof v === 'string' ? "'" + v.split('\\').join('\\\\').split("'").join("\\'") + "'" : String(v));
const body = uebrig
  .map((d) => '  {\n' + ORDER.filter((k) => d[k] !== undefined).map((k) => '    ' + k + ': ' + q(d[k]) + ',').join('\n') + '\n  },')
  .join('\n');

fs.writeFileSync(DEALSJS, quelle.replace(m[0], m[1] + 'const DEALS = [\n' + body + '\n];\n' + m[3]));
console.log('\n  "' + arg + '" entfernt — noch ' + uebrig.length + ' Produkte.\n');
