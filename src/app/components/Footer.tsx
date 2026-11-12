// Site footer: same paper-and-ink look as the rest of Mariels Brow Academy
export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="mba-foot">
      <style>{`
        .mba-foot{background:#f5f4f1;border-top:1px solid #dedbd6;padding:28px 40px calc(28px + env(safe-area-inset-bottom,0px));display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px 28px;font-family:'Anonymous Pro','Courier New',monospace;color:#191a1e;}
        .mba-foot nav{display:flex;flex-wrap:wrap;gap:10px 22px;}
        .mba-foot a{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#5f5b55;text-decoration:none;border-bottom:1px solid transparent;padding-bottom:2px;}
        .mba-foot a:hover{color:#191a1e;border-color:#191a1e;}
        .mba-foot p{margin:0;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#847f76;}
        @media (max-width:640px){.mba-foot{padding:24px 16px calc(24px + env(safe-area-inset-bottom,0px));flex-direction:column;align-items:flex-start;}}
      `}</style>
      <nav aria-label="Footer">
        <a href="/courses">Courses</a>
        <a href="/free-class.html">Free class</a>
        <a href="/tools.html">Shop my tools</a>
        <a href="https://instagram.com/mariels.brows" target="_blank" rel="noopener noreferrer">Instagram</a>
      </nav>
      <p>© {year} Mariels Brow Academy</p>
    </footer>
  );
};
