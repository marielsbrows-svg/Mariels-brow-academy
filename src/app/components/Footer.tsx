export const Footer = () => {
  return (
    <footer style={{
      background: '#000',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '20px 40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.48rem',
        fontWeight: 200,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.25)',
        margin: 0,
      }}>
        © 2026 Mariel Brows Academy. All rights reserved.
      </p>
    </footer>
  );
};
