// Comportamenti comuni a tutte le pagine. Scorrimento nativo: niente Lenis.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Testata piena appena si lascia l'apertura
const head = document.querySelector('header');
const onScroll = () => head.classList.toggle('solid', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

// Menu del telefono
const mm = document.getElementById('mobile-menu');
document.querySelector('.burger').addEventListener('click', () => mm.classList.add('open'));
mm.querySelector('.close').addEventListener('click', () => mm.classList.remove('open'));

// Ingresso: lo scrigno, solo in home e solo alla prima visita della sessione
const intro = document.getElementById('intro');
if (intro) {
  let seen = false;
  try { seen = sessionStorage.getItem('ab-intro') === '1'; } catch (e) {}
  if (seen || reduce) intro.remove();
  else {
    document.body.style.overflow = 'hidden';
    document.getElementById('open').addEventListener('click', () => {
      try { sessionStorage.setItem('ab-intro', '1'); } catch (e) {}
      const done = () => { intro.remove(); document.body.style.overflow = ''; };
      if (!window.gsap) return done();
      gsap.timeline({ onComplete: done })
        .to('#intro .box', { opacity: 0, duration: .4 })
        .to('#intro img', { scale: 2.2, duration: 1.3, ease: 'power3.in' }, '<')
        .to('#intro', { opacity: 0, duration: .5 }, '-=.35')
        .from('.map', { scale: 1.2, duration: 1.8, ease: 'power2.out' }, '-=.4')
        .from('.pin', { opacity: 0, scale: 0, stagger: .07, duration: .45 }, '-=1.1');
    });
  }
}

if (window.gsap && !reduce) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.utils.toArray('.reveal').forEach(el => gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));

  // La metamorfosi: fotogrammi su canvas legati allo scroll (solo nelle schede che la hanno)
  const cv = document.getElementById('mseq');
  if (cv) {
    const N = +cv.dataset.frames, base = cv.dataset.src, cx = cv.getContext('2d');
    const frames = Array.from({ length: N }, (_, i) => { const im = new Image(); im.src = `${base}${String(i + 1).padStart(3, '0')}.jpg`; return im; });
    let cur = 0;
    const draw = i => {
      cur = i; const im = frames[i]; if (!im.complete || !im.naturalWidth) return;
      const r = Math.max(cv.width / im.naturalWidth, cv.height / im.naturalHeight);
      const w = im.naturalWidth * r, h = im.naturalHeight * r;
      cx.drawImage(im, (cv.width - w) / 2, (cv.height - h) / 2, w, h);
    };
    const fit = () => { const d = Math.min(devicePixelRatio, 2); cv.width = cv.clientWidth * d; cv.height = cv.clientHeight * d; draw(cur); };
    frames[0].onload = fit; addEventListener('resize', fit); fit();
    ScrollTrigger.create({
      trigger: '.meta', start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: s => {
        draw(Math.min(N - 1, Math.round(s.progress * (N - 1))));
        gsap.set('.meta .a', { opacity: 1 - Math.min(1, s.progress * 2.5) });
        gsap.set('.meta .b', { opacity: Math.max(0, (s.progress - .7) * 3.3) });
      }
    });
  }
} else {
  document.querySelectorAll('.reveal').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
}
