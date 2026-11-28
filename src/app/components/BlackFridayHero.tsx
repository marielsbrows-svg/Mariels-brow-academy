import { useEffect, useState } from 'react';
import type { Ref } from 'react';

// Black Friday – Cyber Monday homepage hero.
// Turn it off in HomePage.tsx with SALE_ON = false.

type Lang = 'en' | 'es';

type Props = {
  lang: Lang;
  onLang: (l: Lang) => void;
  enrollUrl: string;
  price: number;
  regular: number;
  sectionRef?: Ref<HTMLElement>;
  videoRef?: Ref<HTMLVideoElement>;
};

const WORDS: [string, string][] = [['BLACK', 'FRIDAY'], ['CYBER', 'MONDAY']];

const COPY = {
  en: {
    course: 'Brow Mapping Mastery',
    regular: 'Reg.',
    until: 'Thru Cyber Monday',
    cta: 'Enroll now',
    ticker: ['Black Friday', 'Cyber Monday', '$27 through Monday', 'Lifetime access', 'English & Español'],
    videoLabel: 'Brow mapping demonstration and Black Friday receipt',
  },
  es: {
    course: 'Brow Mapping Mastery',
    regular: 'Antes',
    until: 'Hasta Cyber Monday',
    cta: 'Inscríbete',
    ticker: ['Black Friday', 'Cyber Monday', '$27 hasta el lunes', 'Acceso de por vida', 'English & Español'],
    videoLabel: 'Demostración de mapeo de cejas y recibo de Black Friday',
  },
};

export function BlackFridayHero({ lang, onLang, enrollUrl, price, regular, sectionRef, videoRef }: Props) {
  const t = COPY[lang];
  const [i, setI] = useState(0);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      setGlitch(true);
      window.setTimeout(() => setI((n) => (n + 1) % WORDS.length), 120);
      window.setTimeout(() => setGlitch(false), 360);
    }, 2700);
    return () => window.clearInterval(id);
  }, []);

  const [w1, w2] = WORDS[i];
  const tick = [...t.ticker, ...t.ticker, ...t.ticker, ...t.ticker];

  return (
    <section className="bfcm" ref={sectionRef} aria-label="Black Friday – Cyber Monday">
      <style>{BF_CSS}</style>

      <div className="bf-top">
        <span className="bf-kicker">Mariels Brow Academy · Sale</span>
        <div className="bf-lang" role="group" aria-label="Language">
          <button type="button" aria-pressed={lang === 'en'} onClick={() => onLang('en')}>EN</button>
          <button type="button" aria-pressed={lang === 'es'} onClick={() => onLang('es')}>ES</button>
        </div>
      </div>

      <div className="bf-stage">
        <video
          ref={videoRef}
          className="bf-video"
          src="/bfcm-hero.mp4"
          poster="/IMG_1508.webp"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-label={t.videoLabel}
        />

        <h1 className={`bf-words${glitch ? ' is-glitch' : ''}`} aria-label="Black Friday – Cyber Monday">
          <span className="bf-w bf-w1" data-text={w1}>{w1}</span>
          <span className="bf-w bf-w2" data-text={w2}>{w2}</span>
        </h1>

        <div className="bf-sub bf-sub-l">{t.course}</div>
        <div className="bf-sub bf-sub-r">
          <div>${price} · {t.regular} <s>${regular}</s></div>
          <div>{t.until}</div>
        </div>

        <a className="bf-btn" href={enrollUrl}>{t.cta} · ${price}</a>
      </div>

      <div className="bf-ticker" aria-hidden="true">
        <div className="bf-track">
          {tick.map((s, k) => <span key={k}>{s}<em> · </em></span>)}
        </div>
      </div>
    </section>
  );
}

const BF_CSS = `
.bfcm{--bf-ink:#0a0a0a;--bf-white:#f5f5f5;--bf-gray:#c8c8c8;
  --display:'Horizon','Arial Black',Arial,sans-serif;--mono:'Anonymous Pro','Courier New',monospace;
  position:relative;background:var(--bf-ink);color:var(--bf-white);padding-top:77px;overflow:hidden;}
.bfcm *{box-sizing:border-box;}
.bfcm .bf-top{display:flex;justify-content:space-between;align-items:center;padding:18px 40px 0;position:relative;z-index:3;}
.bfcm .bf-kicker{font:11px/1.5 var(--mono);letter-spacing:.18em;text-transform:uppercase;color:#9a9a9a;}
.bfcm .bf-lang{display:flex;gap:4px;}
.bfcm .bf-lang button{font:11px/1 var(--mono);letter-spacing:.12em;padding:7px 10px;background:transparent;color:#9a9a9a;border:1px solid #3a3a3a;cursor:pointer;}
.bfcm .bf-lang button[aria-pressed="true"]{color:var(--bf-ink);background:var(--bf-white);border-color:var(--bf-white);}

.bfcm .bf-stage{position:relative;height:min(calc(100vh - 77px - 56px - 44px), 860px);min-height:560px;}
.bfcm .bf-video{position:absolute;left:50%;top:0;height:100%;width:auto;aspect-ratio:720/1048;transform:translateX(-50%);object-fit:cover;display:block;background:var(--bf-ink);z-index:1;pointer-events:none;}
.bfcm .bf-video::-webkit-media-controls,.bfcm .bf-video::-webkit-media-controls-start-playback-button{display:none!important;-webkit-appearance:none;}

.bfcm .bf-words{position:absolute;left:0;right:0;top:44%;transform:translateY(-50%);margin:0;padding:0 40px;display:flex;justify-content:space-between;z-index:2;pointer-events:none;
  font-family:var(--display);font-weight:400;font-size:clamp(44px,5.6vw,112px);line-height:.9;letter-spacing:0;color:var(--bf-white);text-shadow:0 4px 40px rgba(0,0,0,.45);}
.bfcm .bf-w{position:relative;display:block;}
.bfcm .bf-w::before,.bfcm .bf-w::after{content:attr(data-text);position:absolute;inset:0;opacity:0;}
.bfcm .is-glitch .bf-w{animation:bfjit .36s steps(2) both;}
.bfcm .is-glitch .bf-w::before{opacity:.85;color:#9a9a9a;animation:bfsliceA .36s steps(3) both;}
.bfcm .is-glitch .bf-w::after{opacity:.85;color:#ffffff;animation:bfsliceB .36s steps(3) both;}
@keyframes bfjit{0%{transform:translateX(0)}25%{transform:translateX(-6px)}50%{transform:translateX(5px)}75%{transform:translateX(-3px)}100%{transform:translateX(0)}}
@keyframes bfsliceA{0%{clip-path:inset(10% 0 70% 0);transform:translateX(-14px)}33%{clip-path:inset(55% 0 20% 0);transform:translateX(12px)}66%{clip-path:inset(30% 0 45% 0);transform:translateX(-8px)}100%{clip-path:inset(80% 0 5% 0);transform:translateX(0);opacity:0}}
@keyframes bfsliceB{0%{clip-path:inset(65% 0 10% 0);transform:translateX(12px)}33%{clip-path:inset(15% 0 65% 0);transform:translateX(-10px)}66%{clip-path:inset(45% 0 30% 0);transform:translateX(7px)}100%{clip-path:inset(5% 0 85% 0);transform:translateX(0);opacity:0}}

.bfcm .bf-sub{position:absolute;top:calc(44% + clamp(36px,3.8vw,72px));z-index:2;font:clamp(12px,1.15vw,17px)/1.6 var(--mono);font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--bf-gray);text-shadow:0 1px 12px rgba(0,0,0,.8);}
.bfcm .bf-sub-l{left:44px;}
.bfcm .bf-sub-r{right:44px;text-align:right;}
.bfcm .bf-sub s{text-decoration-thickness:2px;}

.bfcm .bf-btn{position:absolute;left:50%;bottom:34px;transform:translateX(-50%);z-index:2;display:inline-block;padding:18px 40px;border:2px solid var(--bf-white);color:var(--bf-white);background:rgba(10,10,10,.35);
  font:700 13px/1 var(--mono);letter-spacing:.22em;text-transform:uppercase;text-decoration:none;white-space:nowrap;transition:background .2s,color .2s;}
.bfcm .bf-btn:hover{background:var(--bf-white);color:var(--bf-ink);}

.bfcm .bf-ticker{background:#efefef;color:var(--bf-ink);overflow:hidden;height:44px;display:flex;align-items:center;border-top:1px solid #2a2a2a;}
.bfcm .bf-track{display:flex;white-space:nowrap;animation:bfmq 38s linear infinite;}
.bfcm .bf-track span{font:700 13px/1 var(--mono);letter-spacing:.14em;text-transform:uppercase;padding-left:14px;}
.bfcm .bf-track em{font-style:normal;padding-left:14px;}
@keyframes bfmq{from{transform:translateX(0)}to{transform:translateX(-50%)}}

@media (max-width: 900px){
  .bfcm .bf-words{flex-direction:column;align-items:center;justify-content:center;gap:2px;top:42%;font-size:clamp(40px,12.5vw,96px);text-align:center;}
  .bfcm .bf-stage::after{content:'';position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(10,10,10,.15) 0%,rgba(10,10,10,.35) 45%,rgba(10,10,10,.8) 100%);pointer-events:none;}
  .bfcm .bf-sub{top:auto;bottom:108px;left:0;right:0;text-align:center;font-size:12px;}
  .bfcm .bf-sub-l{bottom:150px;}
  .bfcm .bf-sub-r{bottom:96px;}
  .bfcm .bf-btn{bottom:28px;}
  .bfcm .bf-stage{height:calc(100svh - 77px - 44px - 40px);min-height:600px;}
  .bfcm .bf-video{height:100%;width:100%;aspect-ratio:auto;object-fit:cover;object-position:center 30%;}
}
@media (max-width: 640px){
  .bfcm{padding-top:63px;}
  .bfcm .bf-top{padding:14px 16px 0;}
  .bfcm .bf-stage{height:calc(100svh - 63px - 44px - 36px);min-height:560px;}
}
@media (prefers-reduced-motion: reduce){
  .bfcm .bf-track{animation:none;}
}
`;
