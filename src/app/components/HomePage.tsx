import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  problemKicker: 'Brow mapping on Instagram',
  problem1: '6 million views.',
  problem2: 'And counting.',
  reachSub: 'My brow mapping reels have been watched more than 6 million times. People don’t scroll past a map. They stop, they save it, and they book it.',
  reelsAlt: 'Five of Mariel’s most viewed brow mapping reels, including one with 1.7 million views',
  problemPoints: [
    { t: 'Clients ask for it by name', d: 'Brow mapping is one of the most requested brow services right now. Clients have already seen it online, and they’re looking for an artist who knows how to do it.' },
    { t: 'A skill that books clients', d: 'When you can show a client exactly why her brows will suit her face, you earn her trust, her rebooking and her referrals.' },
    { t: 'Content that markets you', d: 'Mapping is made for video. Every map you draw is a before and after your future clients can watch.' },
  ],
  problemClose: 'Learn the method behind the views.',
  methodKicker: 'Only at Mariels Brow Academy',
  method1: 'Don’t just watch.',
  method2: 'Map it yourself.',
  methodSub: 'Most brow courses are videos you sit and watch. Ours are interactive lessons you do: move the mapping string, place every point and fix a misplaced map with your own hands, on your phone, iPad or laptop. You won’t find lessons like these anywhere else.',
  phonesAlt: 'The interactive free class open on three phones: finding the points, mapping with the string and fixing the map',
  modules: [
    { t: 'Watch it', d: 'See the mapping string move across a face, one point at a time.' },
    { t: 'Map it', d: 'Drag the string yourself until every guideline lands where it belongs.' },
    { t: 'Fix it', d: 'Spot a misplaced point and correct it, the way you will on real clients.' },
  ],
  methodNote: 'The free class teaches the three key points. The full course takes you through the complete 11-line system, from your first line to your certification.',
  methodFull: 'Get the full course',
  mapLabels: ['Start', 'Arch', 'Tail'],
  mapCaption: 'Start, arch and tail, set before you touch a single hair.',
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
    '22 lessons across 5 modules',
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
  freeTitle: 'Learn the map. Free.',
  freeSub: 'An interactive class in 4 short lessons: find the three key points, place the mapping string yourself, and fix a misplaced map.',
  freeTag: '4 lessons · Free',
  freePlaceholder: 'your@email.com',
  freeButton: 'Start the class',
  freeFine: 'The class opens right away. No account needed.',
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
  problemKicker: 'El mapeo de cejas en Instagram',
  problem1: '6 millones de vistas.',
  problem2: 'Y contando.',
  reachSub: 'Mis reels de mapeo de cejas se han visto más de 6 millones de veces. Nadie pasa de largo un buen mapeo: se detienen, lo guardan y reservan su cita.',
  reelsAlt: 'Cinco de los reels de mapeo de cejas más vistos de Mariel, incluido uno con 1.7 millones de vistas',
  problemPoints: [
    { t: 'Las clientas lo piden por nombre', d: 'El mapeo de cejas es uno de los servicios de cejas más solicitados hoy. Las clientas ya lo vieron en redes y buscan una artista que sepa hacerlo.' },
    { t: 'Una habilidad que atrae clientas', d: 'Cuando puedes mostrarle a una clienta por qué ese diseño va con su rostro, ganas su confianza, que vuelva y que te recomiende.' },
    { t: 'Contenido que te promociona', d: 'El mapeo está hecho para video. Cada mapeo que trazas es un antes y después que tus futuras clientas pueden ver.' },
  ],
  problemClose: 'Aprende el método detrás de las vistas.',
  methodKicker: 'Solo en Mariels Brow Academy',
  method1: 'No solo mires.',
  method2: 'Mapea tú misma.',
  methodSub: 'La mayoría de los cursos de cejas son videos que solo miras. Los nuestros son lecciones interactivas que haces tú: mueves el hilo de mapeo, colocas cada punto y corriges un mapeo mal ubicado con tus propias manos, en tu celular, iPad o computadora. No vas a encontrar lecciones así en ningún otro lugar.',
  phonesAlt: 'La clase gratuita interactiva abierta en tres celulares: encontrar los puntos, mapear con el hilo y corregir el mapeo',
  modules: [
    { t: 'Obsérvalo', d: 'Mira cómo el hilo de mapeo recorre el rostro, punto por punto.' },
    { t: 'Mapéalo', d: 'Arrastra el hilo tú misma hasta que cada línea guía quede en su lugar.' },
    { t: 'Corrígelo', d: 'Detecta un punto mal ubicado y corrígelo, como lo harás con clientas reales.' },
  ],
  methodNote: 'La clase gratuita te enseña los tres puntos clave. El curso completo te lleva por todo el sistema de 11 líneas, desde tu primera línea hasta tu certificación.',
  methodFull: 'Obtener el curso completo',
  mapLabels: ['Inicio', 'Arco', 'Final'],
  mapCaption: 'Inicio, arco y final, definidos antes de tocar un solo vello.',
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
    '22 lecciones en 5 módulos',
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
  freeTitle: 'Aprende el mapeo. Gratis.',
  freeSub: 'Una clase interactiva en 4 lecciones cortas: encuentra los tres puntos clave, coloca el hilo de mapeo y corrige un mapeo mal ubicado.',
  freeTag: '4 lecciones · Gratis',
  freePlaceholder: 'tu@correo.com',
  freeButton: 'Empezar la clase',
  freeFine: 'La clase se abre al instante. No necesitas crear una cuenta.',
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

export const HomePage = () => {
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
    window.location.href = lang === 'es' ? '/free-class-es.html' : '/free-class.html';
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
            <div className="stat"><b><CountUp to={22} /></b><span className="sl">{t.statLessons}</span></div>
            <div className="stat"><b>EN·ES</b><span className="sl">{t.statLangs}</span></div>
          </div>
        </div>

        <div className="bigword" aria-hidden="true">MAP</div>
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

      {/* ───────── REACH: viral reels ───────── */}
      <section className="problem">
        <div className="reach-head">
          <div data-reveal>
            <span className="kicker">{t.problemKicker}</span>
            <h2 className="display">
              <span className="block">{t.problem1}</span>
              <span className="block txt-stroke-w">{t.problem2}</span>
            </h2>
          </div>
          <p className="sec-sub" data-reveal style={delay(0.1)}>{t.reachSub}</p>
        </div>
        <figure className="reels" data-reveal>
          <img src="/IMG_1423.webp" alt={t.reelsAlt} loading="lazy" />
        </figure>
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

      {/* ───────── INTERACTIVE LESSONS ───────── */}
      <section className="method">
        <div className="method-head">
          <div data-reveal>
            <span className="kicker">{t.methodKicker}</span>
            <h2 className="display sec-title">{t.method1}<br /><span className="txt-stroke">{t.method2}</span></h2>
          </div>
          <p className="sec-sub" data-reveal style={delay(0.1)}>{t.methodSub}</p>
        </div>
        <figure className="phones" data-reveal>
          <img src="/IMG_1424.webp" alt={t.phonesAlt} loading="lazy" />
        </figure>
        <ol className="steps">
          {t.modules.map((m, i) => (
            <li className="pitem" key={i} data-reveal style={delay(0.1 * i)}>
              <span className="pnum">0{i + 1}</span>
              <h3 className="display">{m.t}</h3>
              <p>{m.d}</p>
            </li>
          ))}
        </ol>
        <div className="method-foot" data-reveal>
          <p className="method-note">{t.methodNote}</p>
          <div className="cta-row">
            <a className="btn" href={enrollUrl}>
              <span>{t.methodFull}</span>
              <span className="btn-price">${PRICE}</span>
              <span className="arrow" aria-hidden="true">→</span>
            </a>
            <button type="button" className="text-link" onClick={goToFreeClass}>{t.ctaFree}</button>
          </div>
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
        <div className="about-media" data-reveal>
          <img className="headshot" src="/IMG_1422.webp" alt="Mariel, founder of Mariels Brow Academy" loading="lazy" />
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
          <img src="/IMG_1425.webp" alt="" loading="lazy" />
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
.mba-home{--ink:#191a1e;--paper:#f5f4f1;--card:#fff;--panel:#eae7e1;--line:#dedbd6;--line2:#cfcac2;--muted:#847f76;--soft:#5f5b55;--ease:cubic-bezier(.2,.8,.2,1);
  --display:'Horizon','Arial Black',Arial,sans-serif;--mono:'Anonymous Pro','Courier New',monospace;
  background:var(--paper);color:var(--ink);font-family:var(--mono);font-weight:400;overflow-x:hidden;-webkit-font-smoothing:antialiased;}
.mba-home *{box-sizing:border-box;}
.mba-home .display{font-family:var(--display);font-weight:400;text-transform:uppercase;letter-spacing:0;line-height:1.08;}
.mba-home .block{display:block;}
.mba-home .txt-stroke{color:inherit;}
.mba-home .txt-stroke-w{color:inherit;}
.mba-home .kicker{display:inline-block;font:11px/1.5 var(--mono);letter-spacing:.18em;text-transform:uppercase;color:var(--muted);}
.mba-home .sec-title{font-size:clamp(24px,2.9vw,40px);margin:12px 0 0;}
.mba-home .sec-sub{font-size:14px;line-height:1.75;color:var(--soft);max-width:52ch;margin:16px 0 0;}

/* reveal */
.mba-home.anim [data-reveal]{opacity:0;transform:translateY(18px);transition:opacity .8s ease var(--d,0s),transform .8s var(--ease) var(--d,0s);}
.mba-home.anim [data-reveal][data-in]{opacity:1;transform:none;}

/* buttons */
.mba-home .btn{display:inline-flex;align-items:center;justify-content:center;gap:14px;min-height:54px;padding:16px 22px;background:var(--ink);color:#fff;border:1px solid var(--ink);border-radius:2px;font:700 12px/1.3 var(--mono);letter-spacing:.06em;text-transform:uppercase;text-decoration:none;cursor:pointer;transition:transform .2s var(--ease),filter .2s;}
.mba-home .btn:hover{filter:brightness(1.25);transform:translateY(-1px);}
.mba-home .btn .btn-price{padding-left:14px;border-left:1px solid rgba(255,255,255,.35);}
.mba-home .btn .arrow{transition:transform .2s var(--ease);}
.mba-home .btn:hover .arrow{transform:translateX(4px);}
.mba-home .btn-w{background:#f7f4ec;color:var(--ink);border-color:#f7f4ec;}
.mba-home .btn-w:hover{background:#fff;filter:none;}
.mba-home .btn-w .btn-price{border-left-color:rgba(0,0,0,.25);}
.mba-home .text-link{background:none;border:0;padding:0 0 3px;border-bottom:1px solid #bbb5ac;font:12px/1.4 var(--mono);letter-spacing:.09em;text-transform:uppercase;color:#4f4b46;cursor:pointer;}
.mba-home .text-link:hover{color:var(--ink);border-color:var(--ink);}
.mba-home a:focus-visible,.mba-home button:focus-visible,.mba-home summary:focus-visible,.mba-home input:focus-visible{outline:2px solid var(--ink);outline-offset:3px;}

/* hero */
.mba-home .hero{position:relative;overflow:hidden;display:block;padding:clamp(130px,14vw,170px) 40px clamp(56px,6vw,84px);border-bottom:1px solid var(--line);}
.mba-home .hero-copy{position:relative;z-index:1;max-width:760px;}
@media (max-width:1100px){.mba-home .bigword{display:none;}}
.mba-home .hero-copy{padding:20px 0;display:flex;flex-direction:column;justify-content:center;}
.mba-home .hero-top{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:22px;flex-wrap:wrap;}
.mba-home .lang{display:inline-flex;border:1px solid var(--line2);background:var(--card);}
.mba-home .lang button{background:transparent;border:0;padding:8px 12px;font:700 11px/1 var(--mono);letter-spacing:.12em;color:var(--ink);cursor:pointer;}
.mba-home .lang button[aria-pressed="true"]{background:var(--ink);color:#fff;}
.mba-home .h-title{font-size:clamp(30px,4.4vw,60px);margin:0;}
.mba-home .h-line{display:block;overflow:hidden;padding:0 0 .04em;}
.mba-home .h-line>span{display:block;animation:mbarise 1s var(--ease) both;}
.mba-home .h-line:nth-child(2)>span{animation-delay:.12s;}
.mba-home .lede{font-size:15px;line-height:1.75;color:var(--soft);max-width:52ch;margin:22px 0 0;animation:mbafade .9s ease .3s both;}
.mba-home .cta-row{display:flex;flex-wrap:wrap;align-items:center;gap:18px 26px;margin-top:30px;animation:mbafade .9s ease .45s both;}
.mba-home .price-note{margin:14px 0 0;font-size:12px;color:var(--muted);animation:mbafade .9s ease .55s both;}
.mba-home .stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:40px;animation:mbafade .9s ease .65s both;}
.mba-home .stat{background:var(--card);border:1px solid var(--line);padding:14px 14px 16px;}
.mba-home .stat b{display:block;font-family:var(--display);font-weight:400;font-size:clamp(20px,2vw,28px);line-height:1;}
.mba-home .stat .sl{display:block;margin-top:8px;font-size:11px;line-height:1.45;color:var(--muted);}
.mba-home .hero-visual{position:relative;background:var(--panel);border:1px solid #e0dad0;overflow:hidden;display:flex;align-items:flex-end;justify-content:center;min-height:540px;}
.mba-home .bigword{position:absolute;right:clamp(16px,3vw,48px);top:50%;transform:translateY(-38%);font-family:var(--display);font-size:clamp(110px,12.5vw,230px);line-height:.85;color:transparent;-webkit-text-stroke:1px #d3cdc3;white-space:nowrap;user-select:none;pointer-events:none;animation:mbafade 1.4s ease .2s both;}
.mba-home .rays{position:absolute;left:50%;bottom:0;width:0;height:100%;}
.mba-home .rays i{position:absolute;bottom:0;left:0;width:1px;height:96%;background:linear-gradient(to top,rgba(25,26,30,.3),rgba(25,26,30,0));transform-origin:bottom center;animation:mbaray 1.5s var(--ease) both;}
.mba-home .rays i:nth-child(1){--r:-24deg;animation-delay:.5s;}
.mba-home .rays i:nth-child(2){--r:0deg;animation-delay:.65s;}
.mba-home .rays i:nth-child(3){--r:24deg;animation-delay:.8s;}
.mba-home .portrait{position:relative;z-index:1;height:90%;max-height:780px;width:auto;max-width:100%;object-fit:contain;object-position:bottom;display:block;animation:mbaportrait 1.3s var(--ease) .1s both;}
.mba-home .badge{position:absolute;z-index:2;display:flex;flex-direction:column;gap:5px;padding:10px 12px;font:10px/1.4 var(--mono);letter-spacing:.12em;text-transform:uppercase;background:#f9f8f2;color:var(--ink);border:1px solid var(--line2);}
.mba-home .badge b{font-family:var(--display);font-weight:400;font-size:16px;letter-spacing:0;line-height:1;}
.mba-home .badge-a{left:14px;bottom:14px;}
.mba-home .badge-b{right:14px;top:14px;background:var(--ink);color:#fff;border-color:var(--ink);}

/* marquee */
.mba-home .marquee{background:var(--ink);color:#fff;overflow:hidden;white-space:nowrap;padding:14px 0;}
.mba-home .mq-row{overflow:hidden;}
.mba-home .mq-track{display:inline-block;white-space:nowrap;animation:mbascroll 40s linear infinite;}
.mba-home .mq-track span{font-family:var(--display);text-transform:uppercase;font-size:15px;letter-spacing:.04em;}
.mba-home .mq-track em{font-style:normal;color:#77736e;padding:0 6px;}
.mba-home .mq-outline{display:none;}
.mba-home .marquee:hover .mq-track{animation-play-state:paused;}

/* problem */
.mba-home .problem{padding:84px 40px 90px;border-bottom:1px solid var(--line);}
.mba-home .reach-head{display:grid;grid-template-columns:1fr 1fr;gap:clamp(20px,4vw,56px);align-items:end;}
.mba-home .problem h2{font-size:clamp(28px,3.6vw,50px);margin:14px 0 0;}
.mba-home .reach-head .sec-sub{margin:0;}
.mba-home .reels{margin:40px 0 0;background:#ebebf0;border:1px solid var(--line);overflow:hidden;}
.mba-home .reels img{display:block;width:100%;height:auto;}
.mba-home .problem h2 .txt-stroke-w{color:var(--muted);}
.mba-home .pgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:44px;}
.mba-home .pitem{background:var(--card);border:1px solid var(--line);border-left:3px solid var(--ink);padding:24px 24px 26px;}
.mba-home .pnum{font:11px var(--mono);letter-spacing:.18em;color:var(--muted);}
.mba-home .pitem h3{font-size:17px;margin:12px 0 10px;}
.mba-home .pitem p{margin:0;font-size:13.5px;line-height:1.7;color:var(--soft);}
.mba-home .pclose{margin:44px 0 0;font-size:clamp(16px,1.8vw,22px);}
.mba-home .pclose .down{display:inline-block;animation:mbabob 1.8s ease-in-out infinite;}

/* interactive lessons */
.mba-home .method{padding:90px 40px;}
.mba-home .method-head{display:grid;grid-template-columns:1fr 1fr;gap:clamp(20px,4vw,56px);align-items:end;}
.mba-home .method-head .sec-sub{margin:0;}
.mba-home .method .sec-title .txt-stroke{color:var(--muted);}
.mba-home .phones{margin:40px 0 0;background:#f9f8f4;border:1px solid var(--line);padding:clamp(20px,4vw,48px) clamp(12px,3vw,40px);}
.mba-home .phones img{display:block;width:100%;max-width:900px;height:auto;margin:0 auto;}
.mba-home .steps{list-style:none;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:12px 0 0;}
.mba-home .method-foot{display:flex;align-items:center;justify-content:space-between;gap:20px 40px;flex-wrap:wrap;margin-top:36px;padding-top:28px;border-top:1px solid var(--line2);}
.mba-home .method-note{margin:0;max-width:58ch;font-size:14px;line-height:1.75;color:var(--soft);}
.mba-home .method-foot .cta-row{margin-top:0;animation:none;}

/* proof */
.mba-home .proof{padding:84px 0 84px;border-top:1px solid var(--line);}
.mba-home .proof-head{display:flex;align-items:flex-end;justify-content:space-between;gap:40px;padding:0 40px;margin-bottom:36px;}
.mba-home .proof-head .sec-title{max-width:16ch;}
.mba-home .photo-row{overflow:hidden;}
.mba-home .photo-track{display:flex;width:max-content;animation:mbaphoto 60s linear infinite;padding-left:12px;}
.mba-home .photo-row:hover .photo-track{animation-play-state:paused;}
.mba-home .shot{flex:0 0 auto;width:280px;aspect-ratio:4/5;margin-right:12px;overflow:hidden;background:var(--panel);border:1px solid var(--line);}
.mba-home .shot img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .8s var(--ease);}
.mba-home .shot:hover img{transform:scale(1.04);}
.mba-home .viral{display:grid;grid-template-columns:auto 1fr;gap:44px;align-items:center;padding:64px 40px 0;}
.mba-home .phone{width:250px;aspect-ratio:9/16;background:var(--ink);padding:9px;border-radius:26px;}
.mba-home .phone video{width:100%;height:100%;object-fit:cover;border-radius:19px;display:block;}
.mba-home .viral h3{font-size:clamp(22px,2.6vw,36px);margin:0;}

/* reviews */
.mba-home .reviews{padding:84px 40px;background:var(--panel);border-top:1px solid var(--line);}
.mba-home .rgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:36px;}
.mba-home .rcard{margin:0;background:var(--card);padding:26px;border:1px solid var(--line);border-left:3px solid var(--ink);}
.mba-home .rcard blockquote{margin:0;font-size:15px;line-height:1.65;}
.mba-home .rcard figcaption{margin-top:18px;font-size:12px;color:var(--muted);}
.mba-home .rcard figcaption b{display:block;font-weight:700;color:var(--ink);letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px;}

/* about */
.mba-home .about{display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(28px,6vw,80px);align-items:center;padding:90px 40px;background:var(--panel);border-top:1px solid var(--line);border-bottom:1px solid var(--line);}
.mba-home .about-media{position:relative;aspect-ratio:4/5;max-height:620px;width:100%;background:#f9f8f4;border:1px solid var(--line);overflow:hidden;display:flex;align-items:flex-end;justify-content:center;}
.mba-home .about-media .headshot{display:block;width:90%;height:auto;max-height:92%;object-fit:contain;object-position:bottom;}
.mba-home .about-p{font-size:15px;line-height:1.8;color:#3d3a36;max-width:54ch;margin:20px 0 0;}
.mba-home .sign{margin-top:30px;font-size:24px;}
.mba-home .sign span{display:block;margin-top:8px;font:11px var(--mono);letter-spacing:.18em;color:var(--muted);}

/* offer */
.mba-home .offer{display:grid;grid-template-columns:1.15fr .85fr;gap:clamp(28px,5vw,70px);align-items:center;padding:90px 40px;}
.mba-home .incl{list-style:none;margin:34px 0 0;padding:0;display:grid;grid-template-columns:1fr 1fr;column-gap:28px;border-top:1px solid var(--line2);}
.mba-home .incl li{display:flex;align-items:baseline;gap:12px;padding:16px 0;border-bottom:1px solid var(--line2);font-size:13.5px;line-height:1.5;}
.mba-home .incl li::before{content:'✓';font-weight:700;}
.mba-home .card{background:var(--ink);color:#fff;padding:clamp(26px,4vw,40px);border-radius:2px;box-shadow:0 15px 45px #21170c18;}
.mba-home .card .ck{font:11px var(--mono);letter-spacing:.18em;text-transform:uppercase;color:#bdb7ad;}
.mba-home .card .big{font-size:clamp(48px,5vw,68px);line-height:1;margin:16px 0 12px;}
.mba-home .card .big sup{font-size:.4em;vertical-align:top;position:relative;top:.2em;margin-right:4px;}
.mba-home .card .note{margin:0 0 24px;font-size:13px;line-height:1.6;color:#e5ded6;}
.mba-home .card .btn{width:100%;}
.mba-home .card .fine{margin:16px 0 0;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#a29c94;}

/* free class */
.mba-home .free{display:grid;grid-template-columns:.85fr 1.15fr;gap:clamp(28px,5vw,70px);align-items:center;padding:90px 40px;background:var(--panel);border-top:1px solid var(--line);border-bottom:1px solid var(--line);}
.mba-home .free-media{position:relative;display:block;width:100%;padding:58px clamp(16px,3vw,32px) clamp(20px,3vw,34px);border:1px solid #e0dad0;background:#f9f8f4;overflow:hidden;cursor:pointer;}
.mba-home .free-media img{width:100%;height:auto;display:block;transition:transform .8s var(--ease);}
.mba-home .free-media:hover img{transform:scale(1.02);}
.mba-home .play{position:absolute;top:50%;left:50%;width:78px;height:78px;margin:-39px 0 0 -39px;border-radius:50%;background:rgba(25,26,30,.82);}
.mba-home .play::before{content:'';position:absolute;top:50%;left:54%;transform:translate(-50%,-50%);border-style:solid;border-width:11px 0 11px 18px;border-color:transparent transparent transparent #fff;}
.mba-home .free-tag{position:absolute;left:13px;top:13px;background:#131313da;color:#fff;padding:10px 12px;font:11px var(--mono);letter-spacing:.08em;text-transform:uppercase;}
.mba-home .free > div{background:var(--card);border:1px solid var(--line);border-left:3px solid var(--ink);padding:clamp(24px,3.4vw,44px);}
.mba-home .free-form{display:flex;max-width:560px;margin-top:28px;border:1px solid var(--ink);background:var(--card);}
.mba-home .free-form input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:var(--ink);padding:16px;font:15px var(--mono);}
.mba-home .free-form input::placeholder{color:#9a958d;}
.mba-home .free-form button{border:0;background:var(--ink);color:#fff;padding:0 22px;font:700 12px var(--mono);letter-spacing:.06em;text-transform:uppercase;cursor:pointer;white-space:nowrap;}
.mba-home .free-form button:hover{filter:brightness(1.25);}
.mba-home .free-form button:disabled{opacity:.5;cursor:default;}
.mba-home .free .fine{margin:12px 0 0;font-size:12px;color:var(--muted);}

/* faq */
.mba-home .faq{display:grid;grid-template-columns:.8fr 1.2fr;gap:clamp(24px,5vw,70px);padding:90px 40px;}
.mba-home .faq-list{border-top:1px solid var(--line);}
.mba-home .faq details{border-bottom:1px solid var(--line);}
.mba-home .faq summary{position:relative;list-style:none;cursor:pointer;padding:18px 44px 18px 0;font:700 15px/1.45 var(--mono)!important;text-transform:none!important;letter-spacing:0!important;}
.mba-home .faq summary::-webkit-details-marker{display:none;}
.mba-home .faq summary::after{content:'+';position:absolute;right:4px;top:50%;width:26px;height:26px;margin-top:-13px;display:grid;place-items:center;border:1px solid var(--line2);background:var(--card);font:16px/1 var(--mono);}
.mba-home .faq details[open] summary::after{content:'−';background:var(--ink);color:#fff;border-color:var(--ink);}
.mba-home .faq .ans{margin:0;padding:0 0 20px;font-size:14px;line-height:1.75;color:var(--soft);max-width:66ch;}
.mba-home .faq .ans a{color:var(--ink);text-decoration:underline;text-underline-offset:3px;white-space:nowrap;}

/* final */
.mba-home .final{padding:96px 40px 104px;background:var(--ink);color:#fff;text-align:center;}
.mba-home .final h2{font-size:clamp(28px,4.4vw,60px);margin:0;}
.mba-home .final h2 .txt-stroke-w{color:#bdb7ad;}
.mba-home .final p{margin:22px auto 32px;max-width:56ch;font-size:13px;line-height:1.7;color:#bdb7ad;}

/* mobile enroll bar */
.mba-home .sbar{position:fixed;left:0;right:0;bottom:0;z-index:40;display:none;align-items:center;justify-content:space-between;gap:16px;padding:12px 16px calc(12px + env(safe-area-inset-bottom,0px));background:var(--ink);color:#fff;transform:translateY(110%);visibility:hidden;transition:transform .35s var(--ease),visibility 0s linear .35s;}
.mba-home .sbar.show{transform:none;visibility:visible;transition:transform .35s var(--ease),visibility 0s;}
.mba-home .sbar-label{display:block;font:10px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:#bdb7ad;}
.mba-home .sbar b{font-family:var(--display);font-weight:400;font-size:20px;}
.mba-home .sbar a{background:#f7f4ec;color:var(--ink);text-decoration:none;padding:14px 18px;font:700 12px var(--mono);letter-spacing:.06em;text-transform:uppercase;border-radius:2px;}

/* keyframes */
@keyframes mbarise{from{transform:translateY(105%)}to{transform:none}}
@keyframes mbafade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes mbaportrait{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
@keyframes mbaray{from{transform:rotate(var(--r)) scaleY(0)}to{transform:rotate(var(--r)) scaleY(1)}}
@keyframes mbascroll{from{transform:translateX(0)}to{transform:translateX(-33.333%)}}
@keyframes mbaphoto{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes mbabob{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}

/* tablet */
@media (max-width:1080px){
  .mba-home .hero{padding:124px 28px 56px;}
  .mba-home .problem,.mba-home .method,.mba-home .about,.mba-home .offer,.mba-home .free,.mba-home .faq,.mba-home .reviews{padding-left:28px;padding-right:28px;}
  .mba-home .proof-head{padding:0 28px;}
}

/* phone */
@media (max-width:820px){
  .mba-home .hero{padding:96px 16px 36px;}
  .mba-home .bigword{display:none;}
  .mba-home .hero-copy{padding:8px 0 4px;}
  .mba-home .h-title{font-size:clamp(26px,8.2vw,42px);}
  .mba-home .lede{font-size:14px;}
  .mba-home .cta-row .btn{width:100%;}
  .mba-home .stats{margin-top:28px;gap:6px;}
  .mba-home .stat{padding:12px 10px;}
  .mba-home .hero-visual{min-height:420px;height:62vh;max-height:560px;}
  .mba-home .problem,.mba-home .method,.mba-home .about,.mba-home .offer,.mba-home .free,.mba-home .faq,.mba-home .reviews{padding:60px 16px;}
  .mba-home .final{padding:72px 18px 96px;}
  .mba-home .pgrid{grid-template-columns:1fr;margin-top:32px;}
  .mba-home .about,.mba-home .offer,.mba-home .free,.mba-home .faq{grid-template-columns:1fr;gap:32px;}
  .mba-home .reach-head,.mba-home .method-head{grid-template-columns:1fr;gap:16px;}
  .mba-home .reels{margin-top:28px;margin-left:-16px;margin-right:-16px;border-left:0;border-right:0;}
  .mba-home .phones{margin-top:28px;}
  .mba-home .steps{grid-template-columns:1fr;}
  .mba-home .method-foot .cta-row{width:100%;}
  .mba-home .proof{padding:60px 0;}
  .mba-home .proof-head{display:block;padding:0 16px;margin-bottom:26px;}
  .mba-home .shot{width:210px;}
  .mba-home .viral{grid-template-columns:1fr;padding:48px 16px 0;justify-items:center;text-align:center;}
  .mba-home .about-media{max-height:520px;}
  .mba-home .incl{grid-template-columns:1fr;}
  .mba-home .free-media{padding-top:52px;}
  .mba-home .free-form{flex-direction:column;}
  .mba-home .free-form button{padding:16px;}
  .mba-home .sbar{display:flex;}
}

/* motion off */
@media (prefers-reduced-motion:reduce){
  .mba-home *,.mba-home *::before,.mba-home *::after{animation:none!important;transition:none!important;}
  .mba-home .rays i{transform:rotate(var(--r));}
}
`;
