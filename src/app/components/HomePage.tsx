import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

// ============================================================
// SETTINGS: the only lines you should need to edit
// ============================================================
const ENROLL_URL = 'https://buy.stripe.com/8x25kD94m6Khe0cfcAd7q00'; // English checkout (Stripe)
const ENROLL_URL_ES = ENROLL_URL; // Spanish checkout: paste the Spanish Stripe link here once it exists
const PRICE = 47; // founding price
const NEXT_PRICE = 297; // price after the founding class closes. Only show it if you will really raise it (0 hides it)
const VIRAL_VIDEO_URL = ''; // optional: direct .mp4 link (e.g. Supabase Storage). Adds a video section when filled in
const WORK = [1, 2, 3, 4, 5, 6, 7]; // /public/Brand/work-1.jpg … work-7.jpg

// Real student reviews only, never invented. The section stays hidden until you add one.
// Example: { quote: 'My brows finally match in photos.', quoteEs: 'Por fin mis cejas se ven parejas en fotos.', name: 'Ana R.', role: 'Brow artist, Miami' }
const TESTIMONIALS: { quote: string; quoteEs?: string; name: string; role: string }[] = [];
// ============================================================

type Lang = 'en' | 'es';

const EN = {
  langLabel: 'Language',
  kicker: 'Brow Mapping Mastery Certification™',
  title1: 'Map any face.',
  title2: 'Every time.',
  lede: 'The exact mapping method Mariel uses on every client. Learn it online, practice on real faces, and earn your certification.',
  ctaMain: 'Start my certification',
  ctaFree: 'Watch the free class first',
  priceNote: (next: number) => `Founding price. Rises to $${next} when the founding class closes.`,
  statYears: 'years behind the chair',
  statLessons: 'lessons in 5 modules',
  statLangs: 'taught in both languages',
  badgeA: ['Certified', 'Written + practical exam'],
  badgeB: ['EN · ES', 'One method, two languages'],
  marquee: ['Map any face', 'Get certified', 'Online', 'En Español', 'Brow Mapping Mastery'],
  problemKicker: 'Why brows go wrong',
  problem1: 'Uneven brows aren’t a talent problem.',
  problem2: 'They’re a mapping problem.',
  problemPoints: [
    { t: 'Eyeballing it', d: 'A freehand shape looks fine in the chair and uneven in every photo after.' },
    { t: 'Fighting the face', d: 'Every face is asymmetrical. Without a map, you copy the asymmetry instead of correcting it.' },
    { t: 'Guessing every time', d: 'No repeatable system means every client is a new gamble, and your confidence shows it.' },
  ],
  problemClose: 'The fix is a method. Here it is.',
  methodKicker: 'The method',
  method1: 'Five modules.',
  method2: 'One repeatable map.',
  methodSub: 'A clear path from your first line to your certificate.',
  mapLabels: ['Start', 'Arch', 'Tail'],
  mapCaption: 'Start, arch and tail, set before you touch a single hair.',
  modules: [
    { t: 'Start Here', d: 'The philosophy, the method and the standard behind the certification.' },
    { t: 'The Clean Map', d: 'Read a face before you draw a line: shape, structure, eyes and natural asymmetry.' },
    { t: 'Symmetry, Solved', d: 'Turn natural asymmetry into deliberate balance: height, length and parallelism, in the right order.' },
    { t: 'Real Brows, Real Fixes', d: 'The whole method in one repeatable workflow, demonstrated on different faces.' },
    { t: 'Certification', d: 'A written exam that proves you know the why, and a practical submission that proves you can do it.' },
  ],
  proofKicker: 'Real clients',
  proofTitle: 'The map makes the difference.',
  proofSub: 'Mariel’s real client work, done with the method you’ll learn.',
  videoTitle: 'The mapping video that went viral',
  reviewsKicker: 'Student results',
  reviewsTitle: 'In their words',
  aboutKicker: 'Your instructor',
  aboutTitle: 'Hi, I’m Mariel.',
  aboutBody: [
    'I’ve spent nine years behind the chair, and mapping is the step that changed everything for my clients.',
    'Brow Mapping Mastery is that exact method, the one I use on every face, taught step by step in English and en español. So you can stop guessing and start mapping with confidence.',
  ],
  aboutRole: 'Founder & lead educator',
  offerKicker: 'Everything included',
  offerTitle: 'Your certification, start to finish.',
  offerItems: [
    '21 lessons across 5 modules',
    'Video demos on real faces',
    '10 printable practice faces',
    'Written exam + practical certification',
    'Private student community',
    'Lifetime access on phone or desktop',
  ],
  cardKicker: 'Founding price',
  cardNote: (next: number) => `Rises to $${next} when the founding class closes.`,
  cardFine: 'One payment · Lifetime access',
  freeKicker: 'Free class',
  freeTitle: 'Watch a real client get mapped. Free.',
  freeSub: 'How to correct uneven brows: 5 short lessons, one real client, mapped start to finish.',
  freeTag: '5 lessons · Free',
  freePlaceholder: 'your@email.com',
  freeButton: 'Send me the class',
  freeFine: 'You’ll create a free account to watch.',
  faqKicker: 'Questions',
  faqTitle: 'Before you enroll',
  faq: [
    { q: 'Who is this for?', a: 'Brow artists, estheticians, beauty pros and students who want a repeatable way to map any face. If you’ve ever finished a set of brows and thought one looks higher, this is for you.' },
    { q: 'Do I need a license?', a: 'Mapping is the design step, and this course is education, not a state license. Follow your state’s rules for the services you offer.' },
    { q: 'Is it in Spanish?', a: 'Yes. Brow Mapping Mastery is taught in full in English and in Spanish.' },
    { q: 'How long do I have access?', a: 'Forever. One payment, lifetime access, on your phone or computer.' },
    { q: 'What tools do I need?', a: 'A mapping string, a brow pencil and the practice faces included in the course.', link: true },
    { q: 'Can I get a refund?', a: 'Because it’s a digital program, all sales are final. That’s why the free class exists: watch it first and see how I teach.' },
  ],
  toolsLink: 'See the tools I use',
  final1: 'Stop guessing.',
  final2: 'Start mapping.',
  finalSub: (price: number, next: number) =>
    next > price ? `Founding price $${price}. Rises to $${next} when the founding class closes.` : `$${price} · One payment · Lifetime access`,
  barLabel: 'Brow Mapping Mastery',
  barCta: 'Enroll',
};

type Copy = typeof EN;

const ES: Copy = {
  langLabel: 'Idioma',
  kicker: 'Certificación Brow Mapping Mastery™',
  title1: 'Mapea cualquier rostro.',
  title2: 'Cada vez.',
  lede: 'El método exacto de mapeo que Mariel usa con cada clienta. Apréndelo en línea, practica con rostros reales y obtén tu certificación.',
  ctaMain: 'Empezar mi certificación',
  ctaFree: 'Ver primero la clase gratis',
  priceNote: (next: number) => `Precio fundador. Sube a $${next} cuando cierre la clase fundadora.`,
  statYears: 'años detrás de la silla',
  statLessons: 'lecciones en 5 módulos',
  statLangs: 'se enseña en ambos idiomas',
  badgeA: ['Certificada', 'Examen escrito + práctico'],
  badgeB: ['EN · ES', 'Un método, dos idiomas'],
  marquee: ['Mapea cualquier rostro', 'Certifícate', 'En línea', 'In English', 'Brow Mapping Mastery'],
  problemKicker: 'Por qué fallan las cejas',
  problem1: 'Las cejas disparejas no son falta de talento.',
  problem2: 'Son falta de mapeo.',
  problemPoints: [
    { t: 'Trabajar a ojo', d: 'Una forma a mano alzada se ve bien en la silla y dispareja en cada foto después.' },
    { t: 'Pelear con el rostro', d: 'Todo rostro es asimétrico. Sin un mapeo, copias la asimetría en lugar de corregirla.' },
    { t: 'Adivinar cada vez', d: 'Sin un sistema repetible, cada clienta es una apuesta nueva, y tu confianza lo refleja.' },
  ],
  problemClose: 'La solución es un método. Aquí está.',
  methodKicker: 'El método',
  method1: 'Cinco módulos.',
  method2: 'Un mapeo repetible.',
  methodSub: 'Un camino claro desde tu primera línea hasta tu certificado.',
  mapLabels: ['Inicio', 'Arco', 'Final'],
  mapCaption: 'Inicio, arco y final, definidos antes de tocar un solo vello.',
  modules: [
    { t: 'Bienvenida y fundamentos', d: 'La filosofía, el método y el estándar detrás de la certificación.' },
    { t: 'El mapeo limpio', d: 'Aprende a leer un rostro antes de trazar una línea: forma, estructura, ojos y asimetría natural.' },
    { t: 'Simetría resuelta', d: 'Convierte la asimetría natural en equilibrio intencional: altura, largo y paralelismo, en el orden correcto.' },
    { t: 'Cejas reales, correcciones reales', d: 'Todo el método en un flujo de trabajo repetible, demostrado en distintos rostros.' },
    { t: 'Certificación', d: 'Un examen escrito que demuestra que entiendes el porqué y una entrega práctica que demuestra que sabes hacerlo.' },
  ],
  proofKicker: 'Clientas reales',
  proofTitle: 'El mapeo hace la diferencia.',
  proofSub: 'Trabajo real de Mariel, hecho con el método que vas a aprender.',
  videoTitle: 'El video de mapeo que se hizo viral',
  reviewsKicker: 'Resultados de alumnas',
  reviewsTitle: 'En sus palabras',
  aboutKicker: 'Tu instructora',
  aboutTitle: 'Hola, soy Mariel.',
  aboutBody: [
    'Llevo nueve años detrás de la silla, y el mapeo es el paso que lo cambió todo para mis clientas.',
    'Brow Mapping Mastery es ese método exacto, el que uso en cada rostro, enseñado paso a paso en inglés y en español. Para que dejes de adivinar y empieces a mapear con confianza.',
  ],
  aboutRole: 'Fundadora y educadora principal',
  offerKicker: 'Todo incluido',
  offerTitle: 'Tu certificación, de principio a fin.',
  offerItems: [
    '21 lecciones en 5 módulos',
    'Demostraciones en video con rostros reales',
    '10 rostros imprimibles para practicar',
    'Examen escrito + certificación práctica',
    'Comunidad privada de alumnas',
    'Acceso de por vida en celular o computadora',
  ],
  cardKicker: 'Precio fundador',
  cardNote: (next: number) => `Sube a $${next} cuando cierre la clase fundadora.`,
  cardFine: 'Un solo pago · Acceso de por vida',
  freeKicker: 'Clase gratis',
  freeTitle: 'Mira cómo se mapea a una clienta real. Gratis.',
  freeSub: 'Cómo corregir cejas disparejas: 5 lecciones cortas, una clienta real, mapeada de principio a fin.',
  freeTag: '5 lecciones · Gratis',
  freePlaceholder: 'tu@correo.com',
  freeButton: 'Quiero la clase',
  freeFine: 'Crearás una cuenta gratis para verla.',
  faqKicker: 'Preguntas',
  faqTitle: 'Antes de inscribirte',
  faq: [
    { q: '¿Para quién es?', a: 'Para artistas de cejas, esteticistas, profesionales de belleza y estudiantes que quieren una forma repetible de mapear cualquier rostro. Si alguna vez terminaste unas cejas y sentiste que una se ve más alta, es para ti.' },
    { q: '¿Necesito licencia?', a: 'El mapeo es el paso de diseño, y este curso es educación, no una licencia estatal. Sigue las reglas de tu estado para los servicios que ofreces.' },
    { q: '¿Está en español?', a: 'Sí. Brow Mapping Mastery se enseña completo en inglés y en español.' },
    { q: '¿Por cuánto tiempo tengo acceso?', a: 'Para siempre. Un solo pago, acceso de por vida, en tu celular o computadora.' },
    { q: '¿Qué herramientas necesito?', a: 'Un hilo de mapeo, un lápiz de cejas y los rostros de práctica incluidos en el curso.', link: true },
    { q: '¿Puedo pedir un reembolso?', a: 'Por ser un programa digital, todas las ventas son finales. Por eso existe la clase gratis: mírala primero y conoce cómo enseño.' },
  ],
  toolsLink: 'Ver las herramientas que uso',
  final1: 'Deja de adivinar.',
  final2: 'Empieza a mapear.',
  finalSub: (price: number, next: number) =>
    next > price ? `Precio fundador $${price}. Sube a $${next} cuando cierre la clase fundadora.` : `$${price} · Un solo pago · Acceso de por vida`,
  barLabel: 'Brow Mapping Mastery',
  barCta: 'Inscribirme',
};

const COPY: Record<Lang, Copy> = { en: EN, es: ES };

// Stagger helper for reveal animations
const delay = (s: number) => ({ '--d': `${s}s` } as CSSProperties);

function readInitialLang(params: URLSearchParams): Lang {
  const q = params.get('lang');
  if (q === 'es' || q === 'en') return q;
  try {
    const saved = localStorage.getItem('mba-lang');
    if (saved === 'es' || saved === 'en') return saved;
  } catch {
    /* storage unavailable: fall back to English */
  }
  return 'en';
}

// True when the browser supports scroll animations and the visitor hasn't asked for reduced motion
function canAnimate() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return false;
  return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

// Counts up from 0 the first time the number scrolls into view
function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(() => (canAnimate() ? 0 : to));
  useEffect(() => {
    const el = ref.current;
    if (!el || !canAnimate()) { setN(to); return; }
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / 1400);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={ref}>{n}{suffix}</span>;
}

// The brow map that draws itself: start, arch and tail lines over a mirrored brow
function BrowMap({ labels, caption }: { labels: string[]; caption: string }) {
  const side = (
    <>
      <path className="draw guide" style={delay(0.1)} pathLength={1} d="M340 292 L340 46" />
      <path className="draw guide" style={delay(0.35)} pathLength={1} d="M340 292 L470 46" />
      <path className="draw guide" style={delay(0.6)} pathLength={1} d="M340 292 L562 74" />
      <path className="draw eye" style={delay(0.2)} pathLength={1} d="M362 176 Q414 148 468 176 Q414 194 362 176 Z" />
      <circle className="iris" cx="411" cy="173" r="10" />
      <path className="draw brow browfill" style={delay(0.9)} pathLength={1}
        d="M340 124 C372 112 410 100 443 97 C470 95 498 102 520 114 C496 110 470 106 443 108 C412 110 376 122 342 138 Z" />
      <path className="draw nose" style={delay(0.2)} pathLength={1} d="M326 232 Q334 276 340 292" />
      <circle className="dot" cx="340" cy="292" r="4" />
    </>
  );
  return (
    <figure className="map-fig">
      <svg className="mapsvg" viewBox="0 0 640 320" role="img" aria-label={caption}>
        <path className="center" d="M320 24 L320 306" />
        <g>{side}</g>
        <g transform="translate(640 0) scale(-1 1)">{side}</g>
        <text className="lbl" x="340" y="34" textAnchor="middle">01 {labels[0]}</text>
        <text className="lbl" x="476" y="34" textAnchor="middle">02 {labels[1]}</text>
        <text className="lbl" x="568" y="64" textAnchor="middle">03 {labels[2]}</text>
      </svg>
      <p className="map-legend" aria-hidden="true">
        <span>01 {labels[0]}</span><span>02 {labels[1]}</span><span>03 {labels[2]}</span>
      </p>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export const HomePage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [lang, setLang] = useState<Lang>(() => readInitialLang(params));
  const [anim, setAnim] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const finalRef = useRef<HTMLElement>(null);
  const freeRef = useRef<HTMLInputElement>(null);

  const t = COPY[lang];
  const enrollUrl = lang === 'es' ? ENROLL_URL_ES : ENROLL_URL;
  const showNext = NEXT_PRICE > PRICE;

  function chooseLang(next: Lang) {
    setLang(next);
    try { localStorage.setItem('mba-lang', next); } catch { /* ignore */ }
  }

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lang === 'es'
      ? 'Mariels Brow Academy · Certificación Brow Mapping Mastery™'
      : 'Mariels Brow Academy · Brow Mapping Mastery Certification™';
  }, [lang]);

  // Scroll-reveal: sections fade up the first time they enter the screen
  useEffect(() => {
    if (!canAnimate()) return;
    setAnim(true);
    const els = document.querySelectorAll('.mba-home [data-reveal]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-in', '');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Mobile enroll bar: shows after the hero, hides at the final call to action
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    let heroVisible = true;
    let finalVisible = false;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === heroRef.current) heroVisible = entry.isIntersecting;
        if (entry.target === finalRef.current) finalVisible = entry.isIntersecting;
      });
      setShowBar(!heroVisible && !finalVisible);
    });
    if (heroRef.current) io.observe(heroRef.current);
    if (finalRef.current) io.observe(finalRef.current);
    return () => io.disconnect();
  }, []);

  async function handleFreeClass(e: FormEvent) {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean) return;
    setBusy(true);
    try {
      const { error } = await supabase
        .from('waitlist')
        .insert({ email: clean, source: 'mini-class', language: lang.toUpperCase() });
      if (error && error.code !== '23505') console.error('Free class signup failed:', error.message);
    } catch (err) {
      console.error('Free class signup error:', err);
    }
    navigate(`/signup?email=${encodeURIComponent(clean)}${lang === 'es' ? '&lang=es' : ''}`);
  }

  function goToFreeClass() {
    document.getElementById('free-class')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => freeRef.current?.focus({ preventScroll: true }), 600);
  }

  const marqueeItems = [...t.marquee, ...t.marquee, ...t.marquee];

  return (
    <div className={`mba-home${anim ? ' anim' : ''}`}>
      <style>{CSS}</style>

      {/* ───────── HERO ───────── */}
      <section className="hero" ref={heroRef}>
        <div className="hero-copy">
          <div className="hero-top">
            <span className="kicker">{t.kicker}</span>
            <div className="lang" role="group" aria-label={t.langLabel}>
              <button type="button" aria-pressed={lang === 'en'} onClick={() => chooseLang('en')}>EN</button>
              <button type="button" aria-pressed={lang === 'es'} onClick={() => chooseLang('es')}>ES</button>
            </div>
          </div>

          <h1 className="display h-title" key={lang}>
            <span className="h-line"><span>{t.title1}</span></span>
            <span className="h-line"><span className="txt-stroke">{t.title2}</span></span>
          </h1>

          <p className="lede">{t.lede}</p>

          <div className="cta-row">
            <a className="btn" href={enrollUrl}>
              <span>{t.ctaMain}</span>
              <span className="btn-price">${PRICE}</span>
              <span className="arrow" aria-hidden="true">→</span>
            </a>
            <button type="button" className="text-link" onClick={goToFreeClass}>{t.ctaFree}</button>
          </div>
          {showNext && <p className="price-note">{t.priceNote(NEXT_PRICE)}</p>}

          <div className="stats">
            <div className="stat"><b><CountUp to={9} /></b><span className="sl">{t.statYears}</span></div>
            <div className="stat"><b><CountUp to={21} /></b><span className="sl">{t.statLessons}</span></div>
            <div className="stat"><b>EN·ES</b><span className="sl">{t.statLangs}</span></div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="bigword" aria-hidden="true">MAP</div>
          <div className="rays" aria-hidden="true"><i /><i /><i /></div>
          <img className="portrait" src="/Brand/portrait.png" alt="Mariel, founder of Mariels Brow Academy" />
          <div className="badge badge-a"><b>{t.badgeA[0]}</b>{t.badgeA[1]}</div>
          <div className="badge badge-b"><b>{t.badgeB[0]}</b>{t.badgeB[1]}</div>
        </div>
      </section>

      {/* ───────── MARQUEE ───────── */}
      <section className="marquee" aria-hidden="true">
        <div className="mq-row"><div className="mq-track">
          {marqueeItems.map((m, i) => <span key={i}>{m}<em> • </em></span>)}
        </div></div>
        <div className="mq-row mq-outline"><div className="mq-track mq-reverse">
          {marqueeItems.map((m, i) => <span key={i}>{m}<em> • </em></span>)}
        </div></div>
      </section>

      {/* ───────── PROBLEM ───────── */}
      <section className="problem">
        <div data-reveal>
          <span className="kicker">{t.problemKicker}</span>
          <h2 className="display">
            <span className="block">{t.problem1}</span>
            <span className="block txt-stroke-w">{t.problem2}</span>
          </h2>
        </div>
        <div className="pgrid">
          {t.problemPoints.map((p, i) => (
            <div className="pitem" key={i} data-reveal style={delay(0.12 * i)}>
              <span className="pnum">0{i + 1}</span>
              <h3 className="display">{p.t}</h3>
              <p>{p.d}</p>
            </div>
          ))}
        </div>
        <p className="pclose display" data-reveal>{t.problemClose} <span className="down" aria-hidden="true">↓</span></p>
      </section>

      {/* ───────── METHOD ───────── */}
      <section className="method">
        <div className="method-copy">
          <div data-reveal>
            <span className="kicker">{t.methodKicker}</span>
            <h2 className="display sec-title">{t.method1}<br /><span className="txt-stroke">{t.method2}</span></h2>
            <p className="sec-sub">{t.methodSub}</p>
          </div>
          <ol className="modules">
            {t.modules.map((m, i) => (
              <li className="module" key={i} data-reveal style={delay(0.08 * i)}>
                <span className="mn display">0{i + 1}</span>
                <div>
                  <h3 className="display">{m.t}</h3>
                  <p>{m.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="method-visual" data-reveal>
          <BrowMap labels={t.mapLabels} caption={t.mapCaption} />
        </div>
      </section>

      {/* ───────── PROOF ───────── */}
      <section className="proof" aria-label={t.proofTitle}>
        <div className="proof-head" data-reveal>
          <div>
            <span className="kicker">{t.proofKicker}</span>
            <h2 className="display sec-title">{t.proofTitle}</h2>
          </div>
          <p className="sec-sub">{t.proofSub}</p>
        </div>
        <div className="photo-row">
          <div className="photo-track">
            {[...WORK, ...WORK].map((n, i) => (
              <div className="shot" key={i}>
                <img src={`/Brand/work-${n}.jpg`} alt={i < WORK.length ? 'Brow transformation by Mariel' : ''} loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        {VIRAL_VIDEO_URL && (
          <div className="viral" data-reveal>
            <div className="phone">
              <video src={VIRAL_VIDEO_URL} autoPlay muted loop playsInline preload="metadata" />
            </div>
            <div>
              <h3 className="display">{t.videoTitle}</h3>
            </div>
          </div>
        )}
      </section>

      {/* ───────── TESTIMONIALS (hidden until real reviews are added) ───────── */}
      {TESTIMONIALS.length > 0 && (
        <section className="reviews">
          <div data-reveal>
            <span className="kicker">{t.reviewsKicker}</span>
            <h2 className="display sec-title">{t.reviewsTitle}</h2>
          </div>
          <div className="rgrid">
            {TESTIMONIALS.map((r, i) => (
              <figure className="rcard" key={i} data-reveal style={delay(0.1 * i)}>
                <blockquote>“{lang === 'es' && r.quoteEs ? r.quoteEs : r.quote}”</blockquote>
                <figcaption><b>{r.name}</b>{r.role}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ───────── ABOUT ───────── */}
      <section className="about">
        <div className="about-media" data-reveal aria-hidden="true">
          <img className="m1" src="/Brand/work-5.jpg" alt="" loading="lazy" />
          <img className="m2" src="/Brand/work-6.jpg" alt="" loading="lazy" />
        </div>
        <div data-reveal style={delay(0.15)}>
          <span className="kicker">{t.aboutKicker}</span>
          <h2 className="display sec-title">{t.aboutTitle}</h2>
          {t.aboutBody.map((p, i) => <p className="about-p" key={i}>{p}</p>)}
          <div className="sign display">Mariel<span>{t.aboutRole}</span></div>
        </div>
      </section>

      {/* ───────── OFFER ───────── */}
      <section className="offer" id="enroll">
        <div data-reveal>
          <span className="kicker">{t.offerKicker}</span>
          <h2 className="display sec-title">{t.offerTitle}</h2>
          <ul className="incl">
            {t.offerItems.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
        <div className="card" data-reveal style={delay(0.15)}>
          <span className="ck">{t.cardKicker}</span>
          <div className="big display"><sup>$</sup>{PRICE}</div>
          {showNext && <p className="note">{t.cardNote(NEXT_PRICE)}</p>}
          <a className="btn btn-w" href={enrollUrl}>
            <span>{t.ctaMain}</span>
            <span className="arrow" aria-hidden="true">→</span>
          </a>
          <p className="fine">{t.cardFine}</p>
        </div>
      </section>

      {/* ───────── FREE CLASS ───────── */}
      <section className="free" id="free-class">
        <button type="button" className="free-media" data-reveal onClick={() => freeRef.current?.focus()} aria-label={t.freeButton}>
          <img src="/Brand/work-2.jpg" alt="" loading="lazy" />
          <span className="play" aria-hidden="true" />
          <span className="free-tag">{t.freeTag}</span>
        </button>
        <div data-reveal style={delay(0.15)}>
          <span className="kicker">{t.freeKicker}</span>
          <h2 className="display sec-title">{t.freeTitle}</h2>
          <p className="sec-sub">{t.freeSub}</p>
          <form className="free-form" onSubmit={handleFreeClass}>
            <input ref={freeRef} type="email" required placeholder={t.freePlaceholder} aria-label={t.freePlaceholder}
              value={email} onChange={(e) => setEmail(e.target.value)} />
            <button type="submit" disabled={busy}>{busy ? '…' : t.freeButton}</button>
          </form>
          <p className="fine">{t.freeFine}</p>
        </div>
      </section>

      {/* ───────── FAQ ───────── */}
      <section className="faq">
        <div data-reveal>
          <span className="kicker">{t.faqKicker}</span>
          <h2 className="display sec-title">{t.faqTitle}</h2>
        </div>
        <div className="faq-list" data-reveal style={delay(0.1)}>
          {t.faq.map((f, i) => (
            <details key={`${lang}-${i}`}>
              <summary className="display">{f.q}</summary>
              <p className="ans">
                {f.a}
                {f.link && <> <a href="/tools.html">{t.toolsLink} →</a></>}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ───────── FINAL CTA ───────── */}
      <section className="final" ref={finalRef}>
        <h2 className="display" data-reveal>
          <span className="block">{t.final1}</span>
          <span className="block txt-stroke-w">{t.final2}</span>
        </h2>
        <p data-reveal style={delay(0.1)}>{t.finalSub(PRICE, NEXT_PRICE)}</p>
        <div data-reveal style={delay(0.2)}>
          <a className="btn btn-w" href={enrollUrl}>
            <span>{t.ctaMain}</span>
            <span className="btn-price">${PRICE}</span>
            <span className="arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      {/* ───────── MOBILE ENROLL BAR ───────── */}
      <div className={`sbar${showBar ? ' show' : ''}`} aria-hidden={!showBar}>
        <div>
          <span className="sbar-label">{t.barLabel}</span>
          <b>${PRICE}</b>
        </div>
        <a href={enrollUrl} tabIndex={showBar ? 0 : -1}>{t.barCta} →</a>
      </div>
    </div>
  );
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;500&display=swap');
.mba-home{--ink:#000;--paper:#fff;--panel:#F4F4F4;--line:#E6E6E6;--muted:#9A9A9A;--soft:#4F4F4F;--ease:cubic-bezier(.2,.8,.2,1);
  background:var(--paper);color:var(--ink);font-family:'Inter',Helvetica,Arial,sans-serif;font-weight:300;overflow-x:hidden;}
.mba-home *{box-sizing:border-box;}
.mba-home .display{font-family:'Anton',Impact,'Arial Narrow',sans-serif;font-weight:400;text-transform:uppercase;letter-spacing:0.01em;line-height:0.92;}
.mba-home .block{display:block;}
.mba-home .pitem h3,.mba-home .module h3,.mba-home .pclose,.mba-home .faq summary,.mba-home .viral h3{line-height:1.05;}
.mba-home .txt-stroke{color:transparent;-webkit-text-stroke:1.5px var(--ink);}
.mba-home .txt-stroke-w{color:transparent;-webkit-text-stroke:1.5px #fff;}
.mba-home .kicker{display:inline-flex;align-items:center;gap:12px;font-size:11px;font-weight:400;letter-spacing:.3em;text-transform:uppercase;color:var(--soft);}
.mba-home .kicker::before{content:'';width:28px;height:1px;background:currentColor;}
.mba-home .sec-title{font-size:clamp(42px,5.4vw,84px);margin:18px 0 0;}
.mba-home .sec-sub{font-size:16px;line-height:1.7;color:var(--soft);max-width:42ch;margin:22px 0 0;}

/* reveal */
.mba-home.anim [data-reveal]{opacity:0;transform:translateY(28px);transition:opacity .9s ease var(--d,0s),transform .9s var(--ease) var(--d,0s);}
.mba-home.anim [data-reveal][data-in]{opacity:1;transform:none;}

/* buttons */
.mba-home .btn{position:relative;overflow:hidden;display:inline-flex;align-items:center;gap:16px;background:var(--ink);color:#fff;padding:21px 30px;font-size:12px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;text-decoration:none;border:0;cursor:pointer;transition:transform .25s var(--ease);}
.mba-home .btn::after{content:'';position:absolute;top:0;bottom:0;width:40%;left:-60%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.28),transparent);animation:mbasheen 4.5s ease-in-out infinite;}
.mba-home .btn:hover{transform:translateY(-2px);}
.mba-home .btn .btn-price{padding-left:16px;border-left:1px solid rgba(255,255,255,.35);}
.mba-home .btn .arrow{transition:transform .25s var(--ease);}
.mba-home .btn:hover .arrow{transform:translateX(5px);}
.mba-home .btn-w{background:#fff;color:#000;}
.mba-home .btn-w::after{background:linear-gradient(100deg,transparent,rgba(0,0,0,.08),transparent);}
.mba-home .btn-w .btn-price{border-left-color:rgba(0,0,0,.25);}
.mba-home .text-link{background:none;border:0;padding:0 0 4px;border-bottom:1px solid var(--ink);font:inherit;font-size:12px;font-weight:400;letter-spacing:.18em;text-transform:uppercase;color:var(--ink);cursor:pointer;}
.mba-home .text-link:hover{opacity:.65;}

/* hero */
.mba-home .hero{display:grid;grid-template-columns:1.12fr .88fr;min-height:min(100vh,980px);padding-top:84px;}
.mba-home .hero-copy{padding:48px 56px 56px;display:flex;flex-direction:column;justify-content:center;}
.mba-home .hero-top{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:34px;flex-wrap:wrap;}
.mba-home .lang{display:inline-flex;border:1px solid var(--ink);}
.mba-home .lang button{background:transparent;border:0;padding:8px 13px;font:500 10px/1 'Inter',sans-serif;letter-spacing:.22em;color:var(--ink);cursor:pointer;}
.mba-home .lang button[aria-pressed="true"]{background:var(--ink);color:#fff;}
.mba-home .h-title{font-size:clamp(56px,7.4vw,124px);margin:0;}
.mba-home .h-line{display:block;overflow:hidden;padding:0 0 .05em;}
.mba-home .h-line>span{display:block;animation:mbarise 1.1s var(--ease) both;}
.mba-home .h-line:nth-child(2)>span{animation-delay:.14s;}
.mba-home .lede{font-size:17px;line-height:1.7;color:var(--soft);max-width:44ch;margin:28px 0 0;animation:mbafade 1s ease .35s both;}
.mba-home .cta-row{display:flex;flex-wrap:wrap;align-items:center;gap:22px 30px;margin-top:36px;animation:mbafade 1s ease .5s both;}
.mba-home .price-note{margin:16px 0 0;font-size:12px;letter-spacing:.04em;color:var(--muted);animation:mbafade 1s ease .6s both;}
.mba-home .stats{display:grid;grid-template-columns:repeat(3,1fr);margin-top:52px;border-top:1px solid var(--ink);animation:mbafade 1s ease .7s both;}
.mba-home .stat{padding:18px 14px 0 0;}
.mba-home .stat b{display:block;font-family:'Anton',Impact,sans-serif;font-weight:400;font-size:clamp(28px,2.8vw,42px);line-height:1;letter-spacing:.01em;}
.mba-home .stat .sl{display:block;margin-top:8px;font-size:11.5px;line-height:1.45;color:var(--soft);max-width:17ch;}
.mba-home .hero-visual{position:relative;background:var(--panel);overflow:hidden;display:flex;align-items:flex-end;justify-content:center;min-height:560px;}
.mba-home .bigword{position:absolute;top:6%;left:0;right:0;text-align:center;font-family:'Anton',Impact,sans-serif;font-size:clamp(180px,24vw,380px);line-height:.8;color:transparent;-webkit-text-stroke:1px #CFCFCF;letter-spacing:.02em;white-space:nowrap;user-select:none;animation:mbafade 1.6s ease .2s both;}
.mba-home .rays{position:absolute;left:50%;bottom:0;width:0;height:100%;}
.mba-home .rays i{position:absolute;bottom:0;left:0;width:1px;height:96%;background:linear-gradient(to top,rgba(0,0,0,.28),rgba(0,0,0,0));transform-origin:bottom center;animation:mbaray 1.6s var(--ease) both;}
.mba-home .rays i:nth-child(1){--r:-24deg;animation-delay:.5s;}
.mba-home .rays i:nth-child(2){--r:0deg;animation-delay:.65s;}
.mba-home .rays i:nth-child(3){--r:24deg;animation-delay:.8s;}
.mba-home .portrait{position:relative;z-index:1;height:88%;max-height:820px;width:auto;max-width:100%;object-fit:contain;object-position:bottom;display:block;animation:mbaportrait 1.4s var(--ease) .1s both;}
.mba-home .badge{position:absolute;z-index:2;display:flex;flex-direction:column;gap:4px;padding:13px 16px;font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;background:#fff;border:1px solid var(--ink);animation:mbafloat 6s ease-in-out infinite;}
.mba-home .badge b{font-family:'Anton',Impact,sans-serif;font-weight:400;font-size:22px;letter-spacing:.03em;line-height:1;}
.mba-home .badge-a{left:6%;bottom:14%;}
.mba-home .badge-b{right:6%;top:18%;background:var(--ink);color:#fff;animation-delay:-3s;}

/* marquee */
.mba-home .marquee{background:var(--ink);color:#fff;overflow:hidden;white-space:nowrap;padding:20px 0 16px;}
.mba-home .mq-row{overflow:hidden;}
.mba-home .mq-track{display:inline-block;white-space:nowrap;animation:mbascroll 36s linear infinite;}
.mba-home .mq-track span{font-family:'Anton',Impact,sans-serif;text-transform:uppercase;font-size:24px;letter-spacing:.08em;}
.mba-home .mq-track em{font-style:normal;color:#6f6f6f;}
.mba-home .mq-outline{margin-top:8px;}
.mba-home .mq-outline span{color:transparent;-webkit-text-stroke:1px #6a6a6a;font-size:40px;}
.mba-home .mq-reverse{animation-direction:reverse;animation-duration:48s;}
.mba-home .marquee:hover .mq-track{animation-play-state:paused;}

/* problem */
.mba-home .problem{background:var(--ink);color:#fff;padding:110px 56px 120px;}
.mba-home .problem .kicker{color:var(--muted);}
.mba-home .problem h2{font-size:clamp(40px,5.2vw,84px);margin:22px 0 0;max-width:18ch;}
.mba-home .pgrid{display:grid;grid-template-columns:repeat(3,1fr);margin-top:72px;border-top:1px solid #333;}
.mba-home .pitem{padding:28px 32px 0 0;}
.mba-home .pnum{font-family:'Anton',Impact,sans-serif;font-size:14px;letter-spacing:.24em;color:#6f6f6f;}
.mba-home .pitem h3{font-size:30px;margin:14px 0 12px;}
.mba-home .pitem p{margin:0;font-size:15px;line-height:1.7;color:#B5B5B5;max-width:32ch;}
.mba-home .pclose{margin:72px 0 0;font-size:clamp(24px,3vw,38px);}
.mba-home .pclose .down{display:inline-block;animation:mbabob 1.8s ease-in-out infinite;}

/* method */
.mba-home .method{display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:start;padding:120px 56px;}
.mba-home .modules{list-style:none;margin:44px 0 0;padding:0;border-top:1px solid var(--ink);}
.mba-home .module{display:grid;grid-template-columns:64px 1fr;gap:8px;padding:24px 0;border-bottom:1px solid var(--line);}
.mba-home .mn{font-size:30px;color:#C9C9C9;transition:color .3s;}
.mba-home .module:hover .mn{color:var(--ink);}
.mba-home .module h3{font-size:24px;margin:2px 0 8px;}
.mba-home .module p{margin:0;font-size:14.5px;line-height:1.65;color:var(--soft);max-width:48ch;}
.mba-home .method-visual{position:sticky;top:112px;}
.mba-home .map-fig{margin:0;background:var(--panel);padding:36px 28px 26px;}
.mba-home .mapsvg{width:100%;height:auto;display:block;overflow:visible;}
.mba-home .mapsvg .draw{fill:none;stroke-dasharray:1;stroke-dashoffset:0;}
.mba-home.anim .mapsvg .draw{stroke-dashoffset:1;transition:stroke-dashoffset 1.5s cubic-bezier(.65,0,.35,1) var(--d,0s),fill-opacity .9s ease calc(var(--d,0s) + 1.1s);}
.mba-home.anim [data-in] .mapsvg .draw{stroke-dashoffset:0;}
.mba-home .mapsvg .guide{stroke:#8F8F8F;stroke-width:1.2;}
.mba-home .mapsvg .center{fill:none;stroke:#BDBDBD;stroke-width:1;stroke-dasharray:4 6;}
.mba-home .mapsvg .eye{stroke:#BDBDBD;stroke-width:1.2;}
.mba-home .mapsvg .nose{stroke:#BDBDBD;stroke-width:1.2;}
.mba-home .mapsvg .iris{fill:#D4D4D4;}
.mba-home .mapsvg .dot{fill:var(--ink);}
.mba-home .mapsvg .brow{stroke:var(--ink);stroke-width:1.4;fill:var(--ink);fill-opacity:1;}
.mba-home.anim .mapsvg .brow{fill-opacity:0;}
.mba-home.anim [data-in] .mapsvg .brow{fill-opacity:1;}
.mba-home .mapsvg .lbl{font-family:'Inter',sans-serif;font-size:11px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;fill:var(--ink);}
.mba-home .map-legend{display:none;justify-content:center;gap:18px;margin:14px 0 0;font-size:10.5px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;}
.mba-home .map-fig figcaption{margin-top:18px;font-size:13px;line-height:1.6;color:var(--soft);text-align:center;}

/* proof */
.mba-home .proof{padding:110px 0 100px;border-top:1px solid var(--line);}
.mba-home .proof-head{display:flex;align-items:flex-end;justify-content:space-between;gap:40px;padding:0 56px;margin-bottom:48px;}
.mba-home .proof-head .sec-title{max-width:12ch;}
.mba-home .photo-row{overflow:hidden;}
.mba-home .photo-track{display:flex;width:max-content;animation:mbaphoto 60s linear infinite;padding-left:14px;}
.mba-home .photo-row:hover .photo-track{animation-play-state:paused;}
.mba-home .shot{flex:0 0 auto;width:310px;aspect-ratio:4/5;margin-right:14px;overflow:hidden;background:#f0f0f0;}
.mba-home .shot img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .8s var(--ease);}
.mba-home .shot:hover img{transform:scale(1.05);}
.mba-home .viral{display:grid;grid-template-columns:auto 1fr;gap:48px;align-items:center;padding:72px 56px 0;}
.mba-home .phone{width:260px;aspect-ratio:9/16;background:var(--ink);padding:10px;border-radius:28px;}
.mba-home .phone video{width:100%;height:100%;object-fit:cover;border-radius:20px;display:block;}
.mba-home .viral h3{font-size:clamp(34px,4vw,60px);margin:0;}
.mba-home .viral p{margin:16px 0 0;font-size:16px;color:var(--soft);}

/* reviews */
.mba-home .reviews{padding:110px 56px;background:var(--panel);}
.mba-home .rgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;margin-top:48px;}
.mba-home .rcard{margin:0;background:#fff;padding:32px;border-top:2px solid var(--ink);}
.mba-home .rcard blockquote{margin:0;font-size:17px;line-height:1.6;}
.mba-home .rcard figcaption{margin-top:20px;font-size:12px;color:var(--soft);}
.mba-home .rcard figcaption b{display:block;font-weight:500;color:var(--ink);letter-spacing:.06em;text-transform:uppercase;margin-bottom:4px;}

/* about */
.mba-home .about{display:grid;grid-template-columns:.9fr 1.1fr;gap:80px;align-items:center;padding:120px 56px;background:var(--panel);}
.mba-home .about-media{position:relative;height:580px;}
.mba-home .about-media img{position:absolute;width:64%;aspect-ratio:4/5;object-fit:cover;display:block;}
.mba-home .about-media .m1{left:0;top:0;}
.mba-home .about-media .m2{right:0;bottom:0;border:10px solid var(--panel);}
.mba-home .about-p{font-size:18px;line-height:1.75;color:#262626;max-width:44ch;margin:24px 0 0;}
.mba-home .sign{margin-top:34px;font-size:34px;}
.mba-home .sign span{display:block;margin-top:8px;font-family:'Inter',sans-serif;font-size:11px;font-weight:400;letter-spacing:.26em;color:var(--muted);}

/* offer */
.mba-home .offer{display:grid;grid-template-columns:1.2fr .8fr;gap:72px;align-items:center;padding:120px 56px;}
.mba-home .incl{list-style:none;margin:44px 0 0;padding:0;display:grid;grid-template-columns:1fr 1fr;column-gap:32px;border-top:1px solid var(--ink);}
.mba-home .incl li{display:flex;align-items:baseline;gap:14px;padding:20px 0;border-bottom:1px solid var(--line);font-size:15.5px;line-height:1.5;}
.mba-home .incl li::before{content:'';flex:0 0 16px;height:1px;background:var(--ink);transform:translateY(-4px);}
.mba-home .card{background:var(--ink);color:#fff;padding:52px 40px 40px;text-align:center;}
.mba-home .card .ck{font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:var(--muted);}
.mba-home .card .big{font-size:132px;line-height:1;margin:18px 0 10px;}
.mba-home .card .big sup{font-size:.34em;vertical-align:top;position:relative;top:.32em;margin-right:4px;}
.mba-home .card .note{margin:0 0 30px;font-size:13px;line-height:1.6;color:#BDBDBD;}
.mba-home .card .btn{width:100%;justify-content:center;}
.mba-home .card .fine{margin:18px 0 0;font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;color:#8A8A8A;}

/* free class */
.mba-home .free{display:grid;grid-template-columns:.9fr 1.1fr;gap:72px;align-items:center;padding:110px 56px;background:var(--ink);color:#fff;}
.mba-home .free .kicker{color:var(--muted);}
.mba-home .free .sec-sub{color:#B5B5B5;}
.mba-home .free-media{position:relative;display:block;width:100%;aspect-ratio:4/5;max-height:620px;padding:0;border:0;background:#111;overflow:hidden;cursor:pointer;}
.mba-home .free-media img{width:100%;height:100%;object-fit:cover;display:block;opacity:.72;transition:opacity .4s,transform .8s var(--ease);}
.mba-home .free-media:hover img{opacity:.9;transform:scale(1.03);}
.mba-home .play{position:absolute;top:50%;left:50%;width:92px;height:92px;margin:-46px 0 0 -46px;border-radius:50%;border:1px solid #fff;background:rgba(0,0,0,.35);}
.mba-home .play::before{content:'';position:absolute;top:50%;left:54%;transform:translate(-50%,-50%);border-style:solid;border-width:13px 0 13px 21px;border-color:transparent transparent transparent #fff;}
.mba-home .play::after{content:'';position:absolute;inset:-1px;border-radius:50%;border:1px solid #fff;animation:mbapulse 2.4s ease-out infinite;}
.mba-home .free-tag{position:absolute;left:20px;bottom:20px;background:#fff;color:#000;padding:10px 14px;font-size:10.5px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;}
.mba-home .free-form{display:flex;max-width:520px;margin-top:34px;border:1px solid #fff;}
.mba-home .free-form input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:#fff;padding:18px;font-family:inherit;font-size:16px;font-weight:300;}
.mba-home .free-form input::placeholder{color:#7A7A7A;}
.mba-home .free-form button{border:0;background:#fff;color:#000;padding:0 24px;font-family:inherit;font-size:11px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;cursor:pointer;white-space:nowrap;}
.mba-home .free-form button:hover{opacity:.85;}
.mba-home .free-form button:disabled{opacity:.5;cursor:default;}
.mba-home .free .fine{margin:14px 0 0;font-size:12px;color:#8A8A8A;}

/* faq */
.mba-home .faq{display:grid;grid-template-columns:.8fr 1.2fr;gap:72px;padding:120px 56px;}
.mba-home .faq-list{border-top:1px solid var(--ink);}
.mba-home .faq details{border-bottom:1px solid var(--line);}
.mba-home .faq summary{position:relative;list-style:none;cursor:pointer;padding:26px 48px 26px 0;font-size:22px;}
.mba-home .faq summary::-webkit-details-marker{display:none;}
.mba-home .faq summary::after{content:'+';position:absolute;right:4px;top:50%;transform:translateY(-50%);font-family:'Inter',sans-serif;font-weight:300;font-size:30px;line-height:1;transition:transform .3s var(--ease);}
.mba-home .faq details[open] summary::after{transform:translateY(-50%) rotate(45deg);}
.mba-home .faq .ans{margin:0;padding:0 0 26px;font-size:15.5px;line-height:1.75;color:var(--soft);max-width:62ch;}
.mba-home .faq .ans a{color:var(--ink);text-decoration:underline;text-underline-offset:3px;white-space:nowrap;}

/* final */
.mba-home .final{position:relative;padding:140px 56px;background:var(--ink);color:#fff;text-align:center;border-bottom:1px solid #1a1a1a;}
.mba-home .final h2{font-size:clamp(54px,9vw,156px);margin:0;}
.mba-home .final p{margin:30px auto 40px;max-width:52ch;font-size:14px;line-height:1.7;color:var(--muted);}

/* mobile enroll bar */
.mba-home .sbar{position:fixed;left:0;right:0;bottom:0;z-index:40;display:none;align-items:center;justify-content:space-between;gap:16px;padding:12px 16px calc(12px + env(safe-area-inset-bottom,0px));background:var(--ink);color:#fff;border-top:1px solid #222;transform:translateY(110%);visibility:hidden;transition:transform .35s var(--ease),visibility 0s linear .35s;}
.mba-home .sbar.show{transform:none;visibility:visible;transition:transform .35s var(--ease),visibility 0s;}
.mba-home .sbar-label{display:block;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);}
.mba-home .sbar b{font-family:'Anton',Impact,sans-serif;font-weight:400;font-size:22px;}
.mba-home .sbar a{background:#fff;color:#000;text-decoration:none;padding:14px 20px;font-size:11px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;}

/* keyframes */
@keyframes mbarise{from{transform:translateY(105%)}to{transform:none}}
@keyframes mbafade{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes mbaportrait{from{opacity:0;transform:translateY(30px) scale(.98)}to{opacity:1;transform:none}}
@keyframes mbaray{from{transform:rotate(var(--r)) scaleY(0)}to{transform:rotate(var(--r)) scaleY(1)}}
@keyframes mbafloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes mbasheen{0%,60%{left:-60%}100%{left:130%}}
@keyframes mbascroll{from{transform:translateX(0)}to{transform:translateX(-33.333%)}}
@keyframes mbaphoto{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes mbabob{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}
@keyframes mbapulse{from{transform:scale(1);opacity:.7}to{transform:scale(1.45);opacity:0}}

/* tablet */
@media (max-width:1080px){
  .mba-home .hero-copy{padding:40px 36px 48px;}
  .mba-home .method,.mba-home .offer,.mba-home .faq{gap:48px;}
}

/* phone */
@media (max-width:820px){
  .mba-home .hero{grid-template-columns:1fr;min-height:0;padding-top:66px;}
  .mba-home .hero-copy{padding:30px 22px 40px;}
  .mba-home .hero-top{margin-bottom:26px;}
  .mba-home .kicker{font-size:10px;letter-spacing:.24em;}
  .mba-home .h-title{font-size:clamp(50px,14.5vw,84px);}
  .mba-home .lede{font-size:16px;margin-top:22px;}
  .mba-home .cta-row{margin-top:28px;gap:20px;}
  .mba-home .cta-row .btn{width:100%;justify-content:center;padding:20px 18px;}
  .mba-home .stats{margin-top:40px;}
  .mba-home .hero-visual{min-height:440px;height:68vh;max-height:600px;}
  .mba-home .badge{padding:10px 12px;font-size:9px;}
  .mba-home .badge b{font-size:18px;}
  .mba-home .badge-a{left:4%;bottom:8%;}
  .mba-home .badge-b{right:4%;top:10%;}
  .mba-home .mq-track span{font-size:20px;}
  .mba-home .mq-outline span{font-size:30px;}
  .mba-home .problem,.mba-home .method,.mba-home .about,.mba-home .offer,.mba-home .free,.mba-home .faq,.mba-home .reviews{padding:80px 22px;}
  .mba-home .final{padding:100px 22px 120px;}
  .mba-home .pgrid{grid-template-columns:1fr;margin-top:48px;border-top:0;}
  .mba-home .pitem{padding:24px 0;border-top:1px solid #333;}
  .mba-home .pclose{margin-top:44px;}
  .mba-home .method,.mba-home .about,.mba-home .offer,.mba-home .free,.mba-home .faq{grid-template-columns:1fr;gap:44px;}
  .mba-home .method-visual{position:static;order:-1;}
  .mba-home .map-fig{padding:24px 12px 18px;}
  .mba-home .mapsvg .lbl{display:none;}
  .mba-home .map-legend{display:flex;}
  .mba-home .module{grid-template-columns:48px 1fr;}
  .mba-home .module h3{font-size:21px;}
  .mba-home .proof{padding:80px 0;}
  .mba-home .proof-head{display:block;padding:0 22px;margin-bottom:34px;}
  .mba-home .shot{width:220px;}
  .mba-home .viral{grid-template-columns:1fr;padding:56px 22px 0;justify-items:center;text-align:center;}
  .mba-home .about-media{height:400px;}
  .mba-home .about-p{font-size:16.5px;}
  .mba-home .incl{grid-template-columns:1fr;}
  .mba-home .card{padding:44px 26px 34px;}
  .mba-home .card .big{font-size:112px;}
  .mba-home .free-media{max-height:440px;}
  .mba-home .free-form{flex-direction:column;}
  .mba-home .free-form button{padding:18px;}
  .mba-home .faq summary{font-size:19px;padding:22px 44px 22px 0;}
  .mba-home .sbar{display:flex;}
}

/* motion off */
@media (prefers-reduced-motion:reduce){
  .mba-home *,.mba-home *::before,.mba-home *::after{animation:none!important;transition:none!important;}
  .mba-home .rays i{transform:rotate(var(--r));}
}
`;
