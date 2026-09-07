/**
 * Was der Chrome-Sammler in Downloads\sparfind\ abgelegt hat, hierher holen.
 *
 * Die Erweiterung kann nicht in den Projektordner schreiben — sie darf nur
 * herunterladen. Also legt sie dort ab, und dieses Skript raeumt auf:
 * Bilder nach bilder\, Textbloecke ans Ende von neue-produkte.txt.
 *
 * Laeuft vor build-deals.js und ist absichtlich stumpf: verschieben, anhaengen,
 * fertig. Geprueft wird erst im naechsten Schritt, an einer Stelle.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const EINGANG = path.join(os.homedir(), 'Downloads', 'sparfind');
const INPUT = path.join(ROOT, 'neue-produkte.txt');
const BILDER = path.join(ROOT, 'bilder');

if (!fs.existsSync(EINGANG)) {
  console.log('  (Chrome-Sammler: noch nichts eingegangen)');
  process.exit(0);
}

const dateien = fs.readdirSync(EINGANG);
const bloecke = dateien.filter((f) => /^deal-\d+\.txt$/i.test(f)).sort();
const bildDateien = dateien.filter((f) => /^sparfind-\d+\.(jpe?g|png|webp|avif)$/i.test(f));

if (!bloecke.length && !bildDateien.length) {
  console.log('  (Chrome-Sammler: noch nichts eingegangen)');
  process.exit(0);
}

fs.mkdirSync(BILDER, { recursive: true });
for (const b of bildDateien) {
  fs.renameSync(path.join(EINGANG, b), path.join(BILDER, b));
}

let angehaengt = 0;
if (bloecke.length) {
  let text = fs.existsSync(INPUT) ? fs.readFileSync(INPUT, 'utf8') : '';
  if (text && !text.endsWith('\n\n')) text += '\n\n';
  for (const b of bloecke) {
    const inhalt = fs.readFileSync(path.join(EINGANG, b), 'utf8').replace(/^﻿/, '').trim();
    if (inhalt) {
      text += inhalt + '\n\n';
      angehaengt++;
    }
    fs.unlinkSync(path.join(EINGANG, b));
  }
  fs.writeFileSync(INPUT, text);
}

console.log(
  '  Chrome-Sammler: ' + angehaengt + ' Produkt(e), ' + bildDateien.length + ' Bild(er) uebernommen.',
);
