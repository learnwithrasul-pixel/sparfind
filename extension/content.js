/**
 * SPARFIND Sammler — liest das Produkt von der Seite, die gerade offen ist.
 *
 * Warum ueberhaupt so: Temu und AliExpress zeigen einem Server eine
 * CAPTCHA-Wand. Einem eingeloggten Menschen, der normal browst, nicht. Also
 * liest dieses Skript genau das, was der Betreiber ohnehin vor sich sieht —
 * kein Umgehen von irgendetwas, nur Tippen sparen.
 *
 * Grundhaltung: raten ja, behaupten nein. Jedes Feld ist im Fenster
 * aenderbar, und was nicht sicher erkannt wurde, bleibt leer statt falsch
 * gefuellt. Ein leeres Feld sieht man und fuellt es; ein falsch geratener
 * Preis geht ungeprueft live.
 */
(() => {
  if (window.__sparfindSammler) return;
  window.__sparfindSammler = true;

  /* ============================ Hilfsmittel ============================ */

  const txt = (el) => (el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : '');
  const meta = (name) => {
    const el = document.querySelector(
      `meta[property="${name}"], meta[name="${name}"], meta[itemprop="${name}"]`,
    );
    return el ? (el.getAttribute('content') || '').trim() : '';
  };

  /** "39,99" · "€39.99" · "1.234,56" → 39.99 / 1234.56 */
  function zuPreis(s) {
    if (s === null || s === undefined) return null;
    const m = String(s).match(/(\d{1,3}(?:[.\s]\d{3})+|\d+)([.,]\d{1,2})?/);
    if (!m) return null;
    const ganz = m[1].replace(/[.\s]/g, '');
    const rest = m[2] ? m[2].replace(',', '.') : '';
    const v = Number(ganz + rest);
    return Number.isFinite(v) && v > 0 && v < 100000 ? v : null;
  }

  const alsText = (n) => (n === null || n === undefined ? '' : String(n).replace('.', ','));

  /* ========================= Produktdaten lesen ========================= */

  /**
   * JSON-LD ist die einzige Quelle, die alle drei Haendler freiwillig und
   * maschinenlesbar anbieten. Sie kommt zuerst, alles andere ist Rueckfall.
   */
  function ausJsonLd() {
    const treffer = {};
    for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
      let daten;
      try {
        daten = JSON.parse(s.textContent);
      } catch (e) {
        continue;
      }
      const liste = Array.isArray(daten) ? daten : [daten, ...(daten['@graph'] || [])];
      for (const d of liste) {
        if (!d || String(d['@type']).toLowerCase() !== 'product') continue;
        if (d.name && !treffer.titel) treffer.titel = String(d.name).trim();
        const bild = Array.isArray(d.image) ? d.image[0] : d.image;
        if (bild && !treffer.bild) treffer.bild = String(bild);
        const angebot = Array.isArray(d.offers) ? d.offers[0] : d.offers;
        if (angebot && angebot.price && !treffer.preis) treffer.preis = zuPreis(angebot.price);
        const bewertung = d.aggregateRating;
        if (bewertung) {
          if (bewertung.ratingValue && !treffer.sterne) treffer.sterne = zuPreis(bewertung.ratingValue);
          if (bewertung.reviewCount && !treffer.bewertungen) treffer.bewertungen = parseInt(bewertung.reviewCount, 10);
        }
      }
    }
    return treffer;
  }

  const HAENDLER = (() => {
    const h = location.hostname;
    if (h.includes('temu')) return 'temu';
    if (h.includes('aliexpress')) return 'aliexpress';
    if (h.includes('amazon')) return 'amazon';
    return 'unbekannt';
  })();

  /**
   * Die Artikelnummer des Haendlers — die einzige Kennung, die gleich bleibt,
   * egal ob die Seite ueber den normalen Link oder den Partner-Kurzlink
   * erreicht wurde. Ohne sie liegt dasselbe Produkt zweimal auf der Seite,
   * sobald der Link wechselt.
   */
  function artikelNummer() {
    const u = location.href;
    const m =
      u.match(/[?&]goods_id=(\d+)/) ||
      u.match(/\/item\/(\d+)/) ||
      u.match(/\/dp\/([A-Z0-9]{10})/) ||
      u.match(/[?&]asin=([A-Z0-9]{10})/i);
    return m ? m[1] : '';
  }

  function titelLesen() {
    const wahl = {
      amazon: '#productTitle',
      aliexpress: 'h1[data-pl="product-title"], .title--wrap--UUHae_g h1, h1',
      temu: 'h1',
    }[HAENDLER];
    const t = txt(document.querySelector(wahl || 'h1'));
    if (t && t.length > 6) return t;
    const og = meta('og:title');
    return og && og.length > 6 ? og : '';
  }

  /**
   * Preis: erst die Stelle, an der der Haendler ihn selbst auszeichnet, dann
   * die Seite absuchen. Durchgestrichene Preise werden dabei ausgeschlossen —
   * sonst landet der alte Preis als aktueller auf der Karte.
   */
  function preisLesen() {
    const feste = {
      amazon: ['.a-price:not(.a-text-price) .a-offscreen', '#corePrice_feature_div .a-offscreen'],
      aliexpress: ['.product-price-value', '[class*="price--currentPriceText"]', '[class*="uniformBanerBox"] [class*="price"]'],
      temu: ['[class*="currentPrice"]', '[class*="_2S8tqZTe"]', '[aria-label*="€"]'],
    }[HAENDLER] || [];

    for (const s of feste) {
      const p = zuPreis(txt(document.querySelector(s)));
      if (p) return p;
    }

    const ausMeta = zuPreis(meta('product:price:amount') || meta('og:price:amount'));
    if (ausMeta) return ausMeta;

    // Letzter Ausweg: der erste Euro-Betrag im oberen Seitendrittel, der
    // nicht durchgestrichen ist. Findet er nichts, bleibt das Feld leer.
    const grenze = Math.max(window.innerHeight, 900);
    for (const el of document.querySelectorAll('span, div, p, strong, b')) {
      if (el.children.length > 2) continue;
      const t = txt(el);
      if (!/€|EUR/.test(t) || t.length > 40) continue;
      const stil = getComputedStyle(el);
      if (/line-through/.test(stil.textDecorationLine)) continue;
      const kasten = el.getBoundingClientRect();
      if (kasten.top + window.scrollY > grenze || kasten.width === 0) continue;
      const p = zuPreis(t);
      if (p) return p;
    }
    return null;
  }

  /** Der durchgestrichene Preis — nur wenn er wirklich durchgestrichen ist. */
  function stattPreisLesen() {
    for (const el of document.querySelectorAll('span, div, del, s')) {
      if (el.children.length > 2) continue;
      const t = txt(el);
      if (!/€|EUR/.test(t) || t.length > 40) continue;
      const stil = getComputedStyle(el);
      const durch = /line-through/.test(stil.textDecorationLine) || ['DEL', 'S'].includes(el.tagName);
      if (!durch) continue;
      const p = zuPreis(t);
      if (p) return p;
    }
    return null;
  }

  /** "3.000+ verkauft" · "10Tsd.+ verkauft" · "500+ Mal gekauft" */
  function verkauftLesen() {
    const koerper = (document.body.innerText || '').slice(0, 20000);
    const m = koerper.match(/([\d][\d.,\s]*)\s*(Tsd\.?|Tausend|K)?\s*\+?\s*(?:mal\s+)?(?:verkauft|gekauft|sold)/i);
    if (!m) return null;
    const zahl = Number(m[1].replace(/[.\s]/g, '').replace(',', '.'));
    if (!Number.isFinite(zahl)) return null;
    return Math.round(/tsd|tausend|k/i.test(m[2] || '') ? zahl * 1000 : zahl);
  }

  function sterneLesen() {
    const marke = document.querySelector('[class*="star"], [aria-label*="von 5"], [title*="von 5"]');
    const quellen = [
      marke && marke.getAttribute('aria-label'),
      marke && marke.getAttribute('title'),
      txt(marke),
      (document.body.innerText || '').slice(0, 6000),
    ];
    for (const q of quellen) {
      const m = String(q || '').match(/\b([0-5][.,]\d)\b/);
      if (m) {
        const v = Number(m[1].replace(',', '.'));
        if (v > 0 && v <= 5) return v;
      }
    }
    return null;
  }

  /**
   * Bildkandidaten. Temu liefert als og:image gern ein Werbebanner
   * ("100€ Gutschein") statt des Produkts — deshalb sammelt der Sammler
   * mehrere Bilder und der Betreiber blaettert im Fenster durch, bis das
   * richtige zu sehen ist. Geraten wird nichts.
   */
  function bilderSammeln() {
    const gefunden = [];
    const dazu = (u) => {
      if (!u || !/^https?:/i.test(u)) return;
      const sauber = u.split('?')[0];
      if (/sprite|logo|icon|placeholder/i.test(sauber)) return;
      if (!gefunden.includes(u)) gefunden.push(u);
    };

    const ldBild = ausJsonLd().bild;
    if (ldBild) dazu(ldBild);

    const bilder = [...document.querySelectorAll('img')]
      .filter((b) => b.naturalWidth >= 250 && b.naturalHeight >= 250)
      .map((b) => ({ b, flaeche: b.naturalWidth * b.naturalHeight, oben: b.getBoundingClientRect().top + window.scrollY }))
      .filter((x) => x.oben < 1600)
      .sort((a, b) => b.flaeche - a.flaeche)
      .slice(0, 8);
    bilder.forEach((x) => dazu(x.b.currentSrc || x.b.src));

    // og:image kommt bewusst zuletzt: bei Temu ist es oft Werbung.
    dazu(meta('og:image'));
    return gefunden;
  }

  /* ===================== Kategorie raten (nur raten) ===================== */

  const WOERTER = {
    kueche: ['küche', 'kuche', 'kaffee', 'espresso', 'milch', 'pfanne', 'topf', 'messer', 'schneid',
      'mixer', 'waage', 'back', 'geschirr', 'becher', 'tasse', 'kochen', 'obst', 'gemüse', 'flasche', 'thermo'],
    beauty: ['haar', 'föhn', 'fohn', 'glätt', 'glatt', 'locken', 'styling', 'rasier', 'gesicht',
      'creme', 'nagel', 'kosmetik', 'schmink', 'epilier', 'zahnbürste', 'massage', 'wimper', 'parfum'],
    technik: ['kabel', 'lade', 'usb', 'kopfhörer', 'kopfhorer', 'bluetooth', 'powerbank', 'monitor',
      'tastatur', 'maus', 'kamera', 'handy', 'smartphone', 'halterung', 'lautsprecher', 'adapter', 'ssd', 'speicher'],
    werkzeug: ['schrauber', 'bohr', 'werkzeug', 'zange', 'säge', 'sage', 'schleif', 'hammer',
      'schraub', 'messgerät', 'wasserwaage', 'akkuschrauber'],
    garten: ['garten', 'pflanz', 'solar', 'blumen', 'rasen', 'gieß', 'giess', 'grill', 'terrasse', 'schlauch'],
    haushalt: ['staubsauger', 'reinig', 'putz', 'wäsche', 'wasche', 'aufbewahr', 'organizer',
      'mülleimer', 'besen', 'wisch', 'regal', 'bügel', 'schrank', 'korb', 'ordnung'],
  };

  function kategorieRaten(titel) {
    const t = (titel || '').toLowerCase();
    let beste = '';
    let punkte = 0;
    for (const [kat, woerter] of Object.entries(WOERTER)) {
      const p = woerter.filter((w) => t.includes(w)).length;
      if (p > punkte) {
        punkte = p;
        beste = kat;
      }
    }
    return beste; // leer heisst: der Betreiber waehlt selbst
  }

  /* ============================== Fenster ============================== */

  const KATEGORIEN = [
    ['haushalt', 'Ev / Haushalt'],
    ['kueche', 'Mutfak / Küche'],
    ['beauty', 'Güzellik / Beauty'],
    ['technik', 'Teknik / Technik'],
    ['werkzeug', 'Alet / Werkzeug'],
    ['garten', 'Bahçe / Garten'],
  ];

  const STIL = `
    :host { all: initial; }
    * { box-sizing: border-box; font-family: system-ui, -apple-system, Segoe UI, sans-serif; }
    .knopf {
      position: fixed; right: 18px; bottom: 18px; z-index: 2147483000;
      background: linear-gradient(135deg,#ff5d3b,#ffb03b); color: #fff; border: 0;
      border-radius: 999px; padding: 13px 20px; font-size: 14.5px; font-weight: 700;
      cursor: pointer; box-shadow: 0 8px 26px rgba(255,93,59,.42); letter-spacing: -.2px;
    }
    .knopf:hover { transform: translateY(-1px); }
    .schatten {
      position: fixed; inset: 0; z-index: 2147483001; background: rgba(6,8,12,.72);
      display: flex; align-items: center; justify-content: center; padding: 20px;
    }
    .fenster {
      background: #12151d; color: #eef1f7; border: 1px solid #252b38; border-radius: 16px;
      width: 480px; max-width: 100%; max-height: 88vh; overflow: auto; padding: 20px 22px;
      box-shadow: 0 30px 80px rgba(0,0,0,.55);
    }
    h2 { margin: 0 0 3px; font-size: 18px; letter-spacing: -.4px; }
    .unter { color: #98a1b3; font-size: 12.5px; margin: 0 0 16px; }
    label { display: block; font-size: 12px; color: #98a1b3; margin: 12px 0 5px; font-weight: 600; }
    input, select, textarea {
      width: 100%; background: #0b0d12; color: #eef1f7; border: 1px solid #2b3242;
      border-radius: 9px; padding: 9px 11px; font-size: 14px; outline: none;
    }
    input:focus, select:focus, textarea:focus { border-color: #ff5d3b; }
    textarea { resize: vertical; min-height: 52px; }
    .zwei { display: flex; gap: 10px; }
    .zwei > div { flex: 1; }
    .leer { border-color: #6b4a2a; background: #1a1410; }
    .bildbox { display: flex; gap: 11px; align-items: center; margin-top: 7px; }
    .bildbox img { width: 76px; height: 76px; object-fit: cover; border-radius: 9px; border: 1px solid #2b3242; background:#0b0d12; }
    .bildnav { display: flex; gap: 6px; }
    .mini { background: #1c2130; color: #cfd6e4; border: 1px solid #2b3242; border-radius: 7px; padding: 6px 10px; font-size: 12px; cursor: pointer; }
    .mini:hover { border-color: #ff5d3b; }
    .hinweis { font-size: 11.5px; color: #69728a; margin-top: 5px; }
    .warnung { background: rgba(255,176,59,.09); border: 1px solid rgba(255,176,59,.33); color: #ffb03b;
      border-radius: 10px; padding: 9px 12px; font-size: 12.5px; margin-top: 14px; }
    .reihe { display: flex; gap: 10px; margin-top: 20px; }
    .haupt { flex: 1; background: linear-gradient(135deg,#ff5d3b,#ffb03b); color: #fff; border: 0;
      border-radius: 10px; padding: 12px; font-size: 14.5px; font-weight: 700; cursor: pointer; }
    .neben { background: transparent; color: #98a1b3; border: 1px solid #2b3242; border-radius: 10px;
      padding: 12px 16px; font-size: 14px; cursor: pointer; }
    .fertig { text-align: center; padding: 18px 4px 6px; }
    .fertig .gross { font-size: 34px; }
  `;

  const wurzel = document.createElement('div');
  const schatten = wurzel.attachShadow({ mode: 'open' });
  document.documentElement.appendChild(wurzel);

  const knopf = document.createElement('button');
  knopf.className = 'knopf';
  knopf.textContent = '✦ SPARFIND\'e ekle';
  const stil = document.createElement('style');
  stil.textContent = STIL;
  schatten.append(stil, knopf);

  let bilder = [];
  let bildNr = 0;

  function fensterOeffnen() {
    const daten = ausJsonLd();
    const titel = daten.titel || titelLesen();
    const preis = daten.preis || preisLesen();
    const statt = stattPreisLesen();
    bilder = bilderSammeln();
    bildNr = 0;

    const fehlt = [];
    if (!titel) fehlt.push('başlık');
    if (!preis) fehlt.push('fiyat');
    if (!bilder.length) fehlt.push('resim');

    const huelle = document.createElement('div');
    huelle.className = 'schatten';
    huelle.innerHTML = `
      <div class="fenster">
        <h2>SPARFIND'e ekle</h2>
        <p class="unter">${HAENDLER} · sayfadan okundu, istediğini değiştir</p>

        <label>Partner linki (temu.to/k/... ) *</label>
        <input id="f-aff" placeholder="https://temu.to/k/..." class="leer">
        <p class="hinweis">Temu uygulamasında ürünü paylaş → çıkan kısa link. <b>Bu olmadan kart para kazanmaz.</b></p>

        <label>Başlık *</label>
        <input id="f-titel" value="${(titel || '').replace(/"/g, '&quot;')}" class="${titel ? '' : 'leer'}">

        <label>Kategori *</label>
        <select id="f-kat">
          <option value="">— seç —</option>
          ${KATEGORIEN.map(([k, l]) => `<option value="${k}" ${kategorieRaten(titel) === k ? 'selected' : ''}>${l}</option>`).join('')}
        </select>

        <div class="zwei">
          <div>
            <label>Fiyat (€)</label>
            <input id="f-preis" value="${alsText(preis)}" class="${preis ? '' : 'leer'}">
          </div>
          <div>
            <label>Üstü çizili fiyat</label>
            <input id="f-statt" value="${alsText(statt)}">
            <p class="hinweis">Sadece sayfada gerçekten varsa</p>
          </div>
        </div>

        <div class="zwei">
          <div>
            <label>Satış adedi</label>
            <input id="f-verkauft" value="${alsText(verkauftLesen())}">
          </div>
          <div>
            <label>Yıldız</label>
            <input id="f-sterne" value="${alsText(sterneLesen())}">
          </div>
        </div>

        <label>Açıklama (bir cümle, Almanca)</label>
        <textarea id="f-text" placeholder="Kabellos, beutellos, mit Wandhalterung."></textarea>

        <label>Resim</label>
        <div class="bildbox">
          <img id="f-bild" src="${bilder[0] || ''}" alt="">
          <div>
            <div class="bildnav">
              <button class="mini" id="b-zurueck">‹ önceki</button>
              <button class="mini" id="b-vor">sonraki ›</button>
              <button class="mini" id="b-ohne">resimsiz</button>
            </div>
            <p class="hinweis" id="b-stand"></p>
          </div>
        </div>

        ${fehlt.length ? `<div class="warnung"><b>Bulamadım:</b> ${fehlt.join(', ')} — elle doldur.</div>` : ''}

        <div class="reihe">
          <button class="haupt" id="b-speichern">Kaydet</button>
          <button class="neben" id="b-abbrechen">Vazgeç</button>
        </div>
      </div>`;
    schatten.appendChild(huelle);

    const $ = (id) => huelle.querySelector('#' + id);
    let ohneBild = bilder.length === 0;

    function bildZeigen() {
      const b = $('f-bild');
      if (ohneBild || !bilder.length) {
        b.removeAttribute('src');
        b.style.opacity = '.25';
        $('b-stand').textContent = 'resim yok';
      } else {
        b.src = bilder[bildNr];
        b.style.opacity = '1';
        $('b-stand').textContent = `${bildNr + 1} / ${bilder.length} — doğru olanı seç`;
      }
    }
    bildZeigen();

    $('b-zurueck').onclick = (e) => { e.preventDefault(); ohneBild = false; bildNr = (bildNr - 1 + bilder.length) % (bilder.length || 1); bildZeigen(); };
    $('b-vor').onclick = (e) => { e.preventDefault(); ohneBild = false; bildNr = (bildNr + 1) % (bilder.length || 1); bildZeigen(); };
    $('b-ohne').onclick = (e) => { e.preventDefault(); ohneBild = true; bildZeigen(); };
    $('b-abbrechen').onclick = () => huelle.remove();
    huelle.onclick = (e) => { if (e.target === huelle) huelle.remove(); };

    $('b-speichern').onclick = () => {
      const wert = (id) => $(id).value.trim();
      const t = wert('f-titel');
      const k = wert('f-kat');
      if (!t || !k) {
        if (!t) $('f-titel').classList.add('leer');
        if (!k) $('f-kat').classList.add('leer');
        return;
      }

      // Der Block hat genau das Format, das tools/build-deals.js erwartet.
      // __BILD__ ersetzt der Hintergrund, sobald das Bild wirklich liegt —
      // sonst zeigt die Zeile auf eine Datei, die nie ankam.
      // Der Partnerlink ist der Link, der Geld verdient. Steht keiner da,
      // geht die normale Produktadresse mit — die Karte funktioniert dann,
      // verdient aber nichts, und genau das sagt die Bestaetigung auch.
      const aff = wert('f-aff');
      const nummer = artikelNummer();
      const zeilen = [
        'link:     ' + (aff || location.href.split('?')[0]),
        'titel:    ' + t,
        'kat:      ' + k,
      ];
      // Feste id aus der Artikelnummer: sonst gilt derselbe Artikel als neu,
      // sobald er einmal ueber den Kurzlink und einmal ueber die lange
      // Adresse eingetragen wird.
      if (nummer) zeilen.splice(1, 0, 'id:       ' + HAENDLER + '-' + nummer);
      const p = wert('f-preis');
      const s = wert('f-statt');
      const v = wert('f-verkauft');
      const st = wert('f-sterne');
      const b = wert('f-text');
      if (p) zeilen.push('preis:    ' + p);
      if (s) zeilen.push('statt:    ' + s);
      zeilen.push('__BILD__');
      if (v) zeilen.push('verkauft: ' + v);
      if (st) zeilen.push('sterne:   ' + st);
      if (b) zeilen.push('text:     ' + b);

      chrome.runtime.sendMessage(
        {
          typ: 'sichern',
          block: zeilen.join('\n') + '\n\n',
          bildUrl: ohneBild ? null : bilder[bildNr] || null,
        },
        (antwort) => {
          huelle.querySelector('.fenster').innerHTML = antwort && antwort.ok
            ? `<div class="fertig"><div class="gross">${aff ? '✓' : '⚠'}</div>
                 <h2>Kaydedildi</h2>
                 <p class="unter">Downloads\\sparfind\\ klasörüne düştü${antwort.bild ? ' (resimle birlikte)' : ' — resimsiz'}.<br>
                 ${aff ? '' : '<b style="color:#ffb03b">Partner linki yok — bu kart komisyon kazanmaz.</b><br>'}
                 Bitirince <b>YAYINLA.bat</b> çift tıkla.</p></div>`
            : `<div class="fertig"><div class="gross">✕</div>
                 <h2>Kaydedilemedi</h2>
                 <p class="unter">${(antwort && antwort.grund) || 'Bilinmeyen hata'}</p></div>`;
          setTimeout(() => huelle.remove(), 2600);
        },
      );
    };
  }

  knopf.onclick = fensterOeffnen;
})();
