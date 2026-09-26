export const Footer = () => {
  return (
    <footer style={{
      background: '#000',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '20px 40px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
    }}>
      <a href="/tools.html" style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.5rem',
        fontWeight: 300,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.55)',
        textDecoration: 'none',
      }}>
        Shop My Tools
      </a>
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.48rem',
        fontWeight: 200,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.25)',
        margin: 0,
      }}>
        © 2026 Mariels Brow Academy. All rights reserved.
      </p>
    </footer>
  );
};
