/**
 * SPARFIND Sammler — Hintergrund.
 *
 * Der Content-Script darf nichts speichern, also erledigt dieser Worker die
 * beiden Downloads: den Produktblock als Textdatei und das Produktbild.
 * Beide landen in  Downloads\sparfind\ , wo YAYINLA.bat sie abholt.
 *
 * Warum Downloads und kein lokaler Server: ein Server muesste laufen. Ein
 * Ordner liegt einfach da. Weniger, das kaputtgehen kann.
 */

const ORDNER = 'sparfind';

function endungAus(url) {
  const m = String(url).split('?')[0].match(/\.(jpe?g|png|webp|avif)$/i);
  return m ? m[1].toLowerCase() : 'jpg';
}

function speichern(optionen) {
  return new Promise((fertig) => {
    chrome.downloads.download(optionen, (id) => {
      if (chrome.runtime.lastError || id === undefined) {
        fertig({ ok: false, grund: (chrome.runtime.lastError || {}).message || 'unbekannt' });
      } else {
        fertig({ ok: true, id });
      }
    });
  });
}

chrome.runtime.onMessage.addListener((nachricht, _absender, antwort) => {
  if (nachricht.typ !== 'sichern') return false;

  (async () => {
    const stempel = Date.now();
    let bildDatei = null;

    // Zuerst das Bild: schlaegt es fehl, soll der Textblock gar nicht erst
    // auf eine Datei zeigen, die es nicht gibt.
    if (nachricht.bildUrl) {
      bildDatei = 'sparfind-' + stempel + '.' + endungAus(nachricht.bildUrl);
      const bild = await speichern({
        url: nachricht.bildUrl,
        filename: ORDNER + '/' + bildDatei,
        saveAs: false,
      });
      if (!bild.ok) bildDatei = null;
    }

    const block = nachricht.block.replace('__BILD__', bildDatei ? 'bild:     ' + bildDatei : '#bild:    -');
    const text = await speichern({
      url: 'data:text/plain;charset=utf-8,' + encodeURIComponent(block),
      filename: ORDNER + '/deal-' + stempel + '.txt',
      saveAs: false,
    });

    antwort({ ok: text.ok, bild: !!bildDatei, grund: text.grund });
  })();

  return true; // Antwort kommt asynchron.
});
