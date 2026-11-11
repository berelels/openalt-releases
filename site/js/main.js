// Animações do site (GSAP 3.13 + ScrollTrigger, em vendor/). Regras seguidas (skills gsap-*):
// - tudo dentro de gsap.matchMedia(): quem pede "reduzir movimento" vê a página parada e completa;
// - um momento de verdade (a mesa se desenha no herói), o resto só entra quando chega na tela;
// - ScrollTriggers criados de cima para baixo, na ordem da página; só transforms, autoAlpha e traço.
(function () {
  const lang = { en: 'en', 'pt-BR': 'pt', es: 'es' }[document.documentElement.lang] || 'en';
  const T = (window.OpenAltT || {})[lang] || {};

  // ── idioma: a raiz é em inglês; na primeira visita, quem usa português ou espanhol vai para a sua página ──
  const KEY = 'openalt-site-lang';
  document.querySelectorAll('[data-lang-link]').forEach((a) => a.addEventListener('click', () => {
    try { localStorage.setItem(KEY, a.dataset.langLink); } catch (e) { /* vale só agora */ }
  }));
  if (lang === 'en' && !/bot|crawl|spider/i.test(navigator.userAgent)) {
    let chosen = null;
    try { chosen = localStorage.getItem(KEY); } catch (e) { /* sem armazenamento */ }
    const want = chosen || (navigator.languages || [navigator.language || 'en']).map((l) => String(l).slice(0, 2).toLowerCase()).find((l) => l === 'pt' || l === 'es' || l === 'en');
    // no arquivo local (file://) a pasta não abre o index.html sozinha
    if (want === 'pt' || want === 'es') { location.replace(`${want}/${location.protocol === 'file:' ? 'index.html' : ''}${location.hash}`); return; }
  }

  // ── abertura (a mesma dos apps), sem pular; a página entra quando a cortina sobe ──
  const introRoot = document.getElementById('intro');
  const revealed = new Promise((resolve) => {
    if (!introRoot || typeof window.playIntro !== 'function') {
      introRoot?.remove();
      document.body.classList.remove('intro-on');
      resolve();
      return;
    }
    window.playIntro(introRoot, resolve, { skippable: false }).then(() => {
      introRoot.remove();
      document.body.classList.remove('intro-on');
    });
  });

  // ── palavras da manchete em <span class="w"> (para entrarem uma a uma) ──
  function splitWords(root) {
    for (const child of [...root.childNodes]) {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
          else { const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s); }
        });
        root.replaceChild(frag, child);
      } else if (child.nodeType === 1 && child.tagName !== 'BR') splitWords(child);
    }
  }
  document.querySelectorAll('[data-split]').forEach(splitWords);

  // ── "qualquer lado": onde o aparelho está, no idioma da página ──
  const STOPS = [
    // em % da planta; deitado (rot 90) a caixa gira no centro, por isso o topo compensa
    { side: 'right', of: 'DP-1', left: 79, top: 24, rot: 0 },
    { side: 'below', of: 'DP-1', left: 55, top: 63, rot: 90 },
    { side: 'left', of: 'HDMI-1', left: 5, top: 30, rot: 0 },
    { side: 'above', of: 'DP-1', left: 55, top: 1, rot: 90 },
  ];
  let stopIdx = 0;
  const readout = () => {
    const s = STOPS[stopIdx];
    document.getElementById('planSide').textContent = T[`side.${s.side}`] || s.side;
    document.getElementById('planOf').textContent = s.of;
  };
  readout();

  if (!window.gsap || !window.ScrollTrigger) return; // sem o GSAP: a página continua completa e parada
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.defaults({ ease: 'power3.out', duration: 0.9 });

  const mm = gsap.matchMedia();
  mm.add({ motion: '(prefers-reduced-motion: no-preference)', small: '(max-width: 1100px)' }, (ctx) => {
    if (!ctx.conditions.motion) return;
    const small = ctx.conditions.small;

    // 1) herói: as palavras sobem, a mesa se desenha em traço e o tablet chega por último
    const draw = gsap.utils.toArray('.desk .draw');
    draw.forEach((el) => { const n = el.getTotalLength(); gsap.set(el, { strokeDasharray: n, strokeDashoffset: n }); });
    const intro = gsap.timeline({ paused: true });
    revealed.then(() => intro.play());
    intro.from('.h1 .w', { yPercent: 70, autoAlpha: 0, duration: 0.8, stagger: 0.05 })
      .from('.hero .lede, .hero .ctas', { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, '-=0.45')
      .to(draw, { strokeDashoffset: 0, duration: 1.1, stagger: 0.06, ease: 'power2.inOut' }, 0.2)
      .from('.desk .tablet', { y: 36, autoAlpha: 0, duration: 0.9 }, '-=0.6')
      .from('.desk .dims > *', { autoAlpha: 0, duration: 0.5, stagger: 0.05 }, '-=0.4')
      .from('.index li', { y: 24, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, '-=0.5');

    // 2) entradas do catálogo: entram juntas quando chegam na tela
    const batch = (sel, vars = {}) => {
      gsap.set(sel, { y: 32, autoAlpha: 0 });
      ScrollTrigger.batch(sel, { start: 'top 88%', onEnter: (els) => gsap.to(els, { y: 0, autoAlpha: 1, stagger: 0.08, overwrite: true, ...vars }) });
    };
    batch('.entry');

    // 3) o Dock: a captura se abre de cima para baixo e as páginas entram em fila
    gsap.from('.dock .shot img', { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'power3.inOut', scrollTrigger: { trigger: '.dock .spread', start: 'top 75%' } });
    batch('.pages li');
    batch('.strip figure');

    // 4) como funciona e os fatos
    batch('.steps li');

    // 5) qualquer lado: o aparelho dá a volta nos monitores conforme a rolagem
    const dev = document.getElementById('planDev');
    gsap.set(dev, { left: STOPS[0].left + '%', top: STOPS[0].top + '%' });
    const sides = gsap.timeline({
      defaults: { duration: 1, ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: '#sides', start: small ? 'top 60%' : 'top 25%', end: small ? '+=900' : '+=1300', scrub: 0.8, pin: !small,
        onUpdate: (st) => { const i = Math.min(STOPS.length - 1, Math.floor(st.progress * STOPS.length)); if (i !== stopIdx) { stopIdx = i; readout(); } },
      },
    });
    STOPS.slice(1).forEach((s) => sides.to(dev, { left: s.left + '%', top: s.top + '%', rotation: s.rot }));

    batch('.facts li');
    gsap.from('.dl > *', { y: 24, autoAlpha: 0, stagger: 0.08, scrollTrigger: { trigger: '.dl', start: 'top 80%' } });
  });

  // fontes carregadas mudam o tamanho do texto: recalcula as posições
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
