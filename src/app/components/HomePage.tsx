import { useState } from 'react';
import { supabase } from '../../lib/supabase';

// ============================================================
//  PASTE YOUR BOOKING LINK HERE (e.g. your Square booking URL)
const BOOKING_URL = 'https://square.site/book/7Z5H2G6FRKT6H/mariels-brows';
// ============================================================

const TICKER = ['Online', 'Brow Mapping Mastery', 'Get Certified', 'En Español'];
const WORK = [1, 2, 3, 4, 5, 6, 7];

export const HomePage = () => {
  const [bookingEmail, setBookingEmail] = useState('');
  const [waitEmail, setWaitEmail] = useState('');
  const [bookingBusy, setBookingBusy] = useState(false);
  const [waitBusy, setWaitBusy] = useState(false);
  const [waitDone, setWaitDone] = useState(false);

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    const email = bookingEmail.trim().toLowerCase();
    if (!email) return;
    setBookingBusy(true);
    try {
      const { error } = await supabase.from('waitlist').insert({ email, source: 'booking' });
      if (error && error.code !== '23505') console.error('Booking capture failed:', error.message);
    } catch (err) {
      console.error('Booking capture error:', err);
    } finally {
      window.location.href = BOOKING_URL;
    }
  }

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    const email = waitEmail.trim().toLowerCase();
    if (!email) return;
    setWaitBusy(true);
    try {
      const { error } = await supabase.from('waitlist').insert({ email, source: 'homepage' });
      if (error && error.code !== '23505') console.error('Waitlist signup failed:', error.message);
      setWaitDone(true);
    } catch (err) {
      console.error('Waitlist signup error:', err);
      setWaitDone(true);
    } finally {
      setWaitBusy(false);
    }
  }

  return (
    <div className="mba-home">
      <style>{CSS}</style>

      {/* HERO */}
      <section className="hero">
        <div className="hero-img">
          <img className="portrait" src="/Brand/portrait.png" alt="Mariel, founder of Mariels Brow Academy" />
        </div>
        <div className="hero-copy">
          <div className="action">
            <div className="display title">Book<br />here</div>
            <p className="lede">Enter your email and I'll send you the booking link.</p>
            <form className="form" onSubmit={handleBooking}>
              <input type="email" placeholder="your@email.com" aria-label="Email for booking link"
                value={bookingEmail} onChange={(e) => setBookingEmail(e.target.value)} required />
              <button type="submit" disabled={bookingBusy}>{bookingBusy ? '…' : 'Get the link'}</button>
            </form>
          </div>

          <div className="rule" />

          <div className="action">
            <div className="display title">Brow mapping<br />mastery</div>
            <p className="lede">Join the waitlist for early access and founding-member pricing.</p>
            {waitDone ? (
              <div className="form"><span className="done">Thank you — check your inbox.</span></div>
            ) : (
              <form className="form" onSubmit={handleWaitlist}>
                <input type="email" placeholder="your@email.com" aria-label="Email for waitlist"
                  value={waitEmail} onChange={(e) => setWaitEmail(e.target.value)} required />
                <button type="submit" disabled={waitBusy}>{waitBusy ? '…' : 'Join the waitlist'}</button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* TEXT MARQUEE */}
      <section className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...TICKER, ...TICKER, ...TICKER].map((t, i) => (
            <span key={i}>{t}<span className="dot"> • </span></span>
          ))}
        </div>
      </section>

      {/* WORK MARQUEE */}
      <section className="work" aria-label="Client transformations">
        <div className="photo-track">
          {[...WORK, ...WORK].map((n, i) => (
            <div className="shot" key={i}>
              <img src={`/Brand/work-${n}.jpg`} alt="Brow transformation by Mariel" loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* MAP */}
      <section className="map">
        <h2 className="display">It starts with the map</h2>
        <p className="intro">Before the wax, the tint, or the tweezers, the brow is won or lost in the mapping. Get it right and everything after falls into place. That's where the Academy begins.</p>
        <div className="points">
          <div className="point">
            <div className="pt-label">The start</div>
            <p>Where the brow begins, placed to the face — not guessed by eye.</p>
          </div>
          <div className="point">
            <div className="pt-label">The arch</div>
            <p>The peak set with intention, the same way on every client.</p>
          </div>
          <div className="point">
            <div className="pt-label">The tail</div>
            <p>A clean finish that balances the shape instead of fighting it.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;500&display=swap');
.mba-home{--white:#fff;--panel:#F4F4F4;--line:#E6E6E6;--muted:#9A9A9A;--soft:#4F4F4F;background:#fff;color:#000;font-family:'Inter',Helvetica,Arial,sans-serif;font-weight:300;}
.mba-home *{box-sizing:border-box;}
.mba-home .display{font-family:'Anton',Impact,'Arial Narrow',sans-serif;font-weight:400;text-transform:uppercase;letter-spacing:0.01em;line-height:0.92;}
.mba-home .hero{display:grid;grid-template-columns:0.9fr 1.1fr;gap:0;min-height:82vh;align-items:stretch;padding-top:88px;}
.mba-home .hero-img{position:relative;background:#fff;border-right:1px solid var(--line);display:flex;align-items:flex-end;justify-content:center;overflow:hidden;}
.mba-home .portrait{width:100%;height:100%;object-fit:contain;object-position:center bottom;max-height:76vh;display:block;}
.mba-home .hero-copy{padding:40px 56px 64px;display:flex;flex-direction:column;justify-content:center;gap:44px;}
.mba-home .action .title{font-size:64px;}
.mba-home .action .lede{margin:14px 0 20px;font-size:15px;color:var(--soft);max-width:34ch;line-height:1.6;}
.mba-home .form{display:flex;border:1px solid #000;background:#fff;max-width:440px;}
.mba-home .form input{flex:1;border:0;outline:0;padding:15px 16px;font-family:inherit;font-size:16px;background:transparent;color:#000;}
.mba-home .form input::placeholder{color:#B4AEA3;}
.mba-home .form button{border:0;background:#000;color:#fff;padding:0 22px;font-size:11px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;font-weight:500;}
.mba-home .form button:hover{opacity:.82;}
.mba-home .form button:disabled{opacity:.5;cursor:default;}
.mba-home .form .done{padding:15px 16px;font-size:13px;color:var(--soft);}
.mba-home .rule{height:1px;background:var(--line);max-width:440px;}
.mba-home .marquee{background:#000;color:#fff;overflow:hidden;white-space:nowrap;padding:22px 0;}
.mba-home .marquee-track{display:inline-block;white-space:nowrap;animation:mbascroll 32s linear infinite;}
.mba-home .marquee-track span{font-family:'Anton',sans-serif;text-transform:uppercase;font-size:22px;letter-spacing:2px;}
.mba-home .marquee-track .dot{color:#6f6f6f;}
.mba-home .marquee:hover .marquee-track{animation-play-state:paused;}
@keyframes mbascroll{from{transform:translateX(0)}to{transform:translateX(-33.33%)}}
.mba-home .work{padding:56px 0;border-top:1px solid var(--line);background:#fff;overflow:hidden;}
.mba-home .photo-track{display:flex;width:max-content;animation:mbaphoto 55s linear infinite;padding-left:14px;}
.mba-home .work:hover .photo-track{animation-play-state:paused;}
.mba-home .shot{flex:0 0 auto;width:270px;aspect-ratio:4/5;margin-right:14px;overflow:hidden;background:#f0f0f0;}
.mba-home .shot img{width:100%;height:100%;object-fit:cover;display:block;}
@keyframes mbaphoto{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.mba-home .map{padding:88px 56px;border-top:1px solid var(--line);background:var(--panel);}
.mba-home .map h2{font-size:58px;margin:0 0 20px;max-width:14ch;}
.mba-home .map .intro{font-size:16px;line-height:1.75;color:var(--soft);max-width:56ch;margin:0 0 48px;}
.mba-home .points{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border-top:1px solid #000;}
.mba-home .point{padding:26px 26px 30px 0;border-right:1px solid var(--line);}
.mba-home .point:last-child{border-right:0;padding-right:0;}
.mba-home .point .pt-label{font-family:'Anton',sans-serif;font-size:19px;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;}
.mba-home .point p{font-size:14px;line-height:1.65;color:var(--soft);margin:0;}
@media (max-width:820px){
  .mba-home .hero{grid-template-columns:1fr;padding-top:70px;}
  .mba-home .hero-img{border-right:0;border-bottom:1px solid var(--line);min-height:320px;}
  .mba-home .hero-copy{padding:44px 24px;gap:36px;}
  .mba-home .action .title{font-size:46px;}
  .mba-home .work{padding:40px 0;}
  .mba-home .shot{width:190px;}
  .mba-home .map{padding:56px 24px;}
  .mba-home .map h2{font-size:42px;}
  .mba-home .points{grid-template-columns:1fr;border-top:0;}
  .mba-home .point{border-right:0;border-top:1px solid var(--line);padding:22px 0;}
}
@media (prefers-reduced-motion:reduce){.mba-home .marquee-track,.mba-home .photo-track{animation:none!important;}}
`;
