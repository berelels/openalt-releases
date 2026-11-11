// Gera as páginas de cada idioma a partir de site/index.html (inglês, a fonte) e dos textos de site/js/i18n.js:
// site/index.html (en), site/pt/index.html e site/es/index.html, cada uma com o próprio <html lang>, canonical,
// hreflang, Open Graph e os JSON-LD (SoftwareApplication e FAQPage) no idioma certo. Assim os buscadores e as
// IAs leem cada idioma sem depender de JavaScript.
// uso (o Electron do repositório do OpenAlt, sem janela): npx electron releases/scripts/idiomas.mjs
import { app, BrowserWindow } from 'electron';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const site = join(dirname(fileURLToPath(import.meta.url)), '..', 'site');
const BASE = 'https://cattastudios.com.br/openalt-releases/';
const VERSION = '0.2.1';
const LANGS = { en: { html: 'en', og: 'en_US', dir: '' }, pt: { html: 'pt-BR', og: 'pt_BR', dir: 'pt/' }, es: { html: 'es', og: 'es_ES', dir: 'es/' } };

const ctx = {};
vm.runInNewContext(readFileSync(join(site, 'js', 'i18n.js'), 'utf8'), ctx);
const T = ctx.OpenAltT;
const source = readFileSync(join(site, 'index.html'), 'utf8');

// mesmas chaves nos três idiomas (um texto esquecido apareceria em inglês na página traduzida)
for (const l of ['pt', 'es']) {
  const missing = Object.keys(T.en).filter((k) => !(k in T[l]));
  if (missing.length) throw new Error(`${l}: faltam ${missing.join(', ')}`);
}

const strip = (html) => html.replace(/<[^>]+>/g, '');
function ld(l) {
  const d = T[l];
  const appLd = {
    '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'OpenAlt', url: BASE + LANGS[l].dir,
    description: d['meta.desc'], inLanguage: LANGS[l].html, applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Linux (GNOME on X11), Android 5+', softwareVersion: VERSION, license: 'https://www.gnu.org/licenses/gpl-3.0.html',
    isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    downloadUrl: `https://github.com/berelels/openalt-releases/releases/tag/v${VERSION}`,
    screenshot: `${BASE}img/dock/musica.webp`, image: `${BASE}img/og.png`,
    featureList: ['i1', 'i2', 'i3', 'i4', 'i5'].map((k) => `${d[`${k}.t`]}: ${d[`${k}.p`]}`),
    author: { '@type': 'Organization', name: 'Catta Studios', url: 'https://berelels.github.io' },
    codeRepository: 'https://github.com/berelels/openalt-releases',
  };
  const faqLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: LANGS[l].html,
    mainEntity: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ '@type': 'Question', name: d[`q${n}`], acceptedAnswer: { '@type': 'Answer', text: strip(d[`a${n}`]) } })),
  };
  return { app: JSON.stringify(appLd, null, 2), faq: JSON.stringify(faqLd, null, 2) };
}

// roda dentro de uma página em branco (DOMParser, sem executar os scripts da página)
function render(src, l, d, langs, base, json) {
  const doc = new DOMParser().parseFromString(src, 'text/html');
  const meta = langs[l];
  doc.documentElement.lang = meta.html;
  doc.querySelectorAll('[data-i18n]').forEach((el) => { const v = d[el.dataset.i18n]; if (v != null) el.innerHTML = v; });
  doc.querySelectorAll('[data-i18n-aria]').forEach((el) => { const v = d[el.dataset.i18nAria]; if (v != null) el.setAttribute('aria-label', v); });
  doc.querySelectorAll('[data-i18n-alt]').forEach((el) => { const v = d[el.dataset.i18nAlt]; if (v != null) el.setAttribute('alt', v.replace(/<[^>]+>/g, '')); });
  doc.querySelectorAll('[data-i18n-content]').forEach((el) => { const v = d[el.dataset.i18nContent]; if (v != null) el.setAttribute('content', v); });
  const url = base + meta.dir;
  doc.querySelector('link[rel=canonical]').href = url;
  doc.querySelector('meta[property="og:url"]').setAttribute('content', url);
  doc.querySelector('meta[property="og:locale"]').setAttribute('content', meta.og);
  const up = meta.dir ? '../' : '';
  doc.querySelectorAll('[data-lang-link]').forEach((a) => {
    const to = langs[a.dataset.langLink].dir;
    a.setAttribute('href', to === meta.dir ? './' : meta.dir ? (to ? `${up}${to}` : up) : to);
    if (a.dataset.langLink === l) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
  });
  if (up) {
    // caminhos relativos (css/, js/, img/, fonts/, vendor/) sobem uma pasta
    const rel = (v) => v && !/^([a-z]+:|#|\/|\.\.\/)/i.test(v);
    for (const [sel, attr] of [['link[href]', 'href'], ['script[src]', 'src'], ['img[src]', 'src'], ['image[href]', 'href']]) {
      doc.querySelectorAll(sel).forEach((el) => { const v = el.getAttribute(attr); if (rel(v)) el.setAttribute(attr, up + v); });
    }
  }
  doc.getElementById('ld-app').textContent = `\n${json.app}\n`;
  doc.getElementById('ld-faq').textContent = `\n${json.faq}\n`;
  return '<!doctype html>\n' + doc.documentElement.outerHTML + '\n';
}

app.on('window-all-closed', () => {});
app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, webPreferences: { offscreen: true } });
  await win.loadURL('about:blank');
  for (const l of Object.keys(LANGS)) {
    const args = [source, l, T[l], LANGS, BASE, ld(l)].map((a) => JSON.stringify(a)).join(',');
    const html = await win.webContents.executeJavaScript(`(${render.toString()})(${args})`);
    const out = join(site, LANGS[l].dir, 'index.html');
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, html);
    console.log('ok', l, out);
  }
  app.quit();
});
