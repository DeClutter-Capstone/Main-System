function Footer() {
  return (
    <footer style={styles.footer}>
      <style>{`
        a:hover {
          text-decoration: underline;
        }
      `}</style>
      <div style={styles.container}>
        {/* Company Column */}
        <div style={styles.column}>
          <h3 style={styles.columnTitle}>Company</h3>
          <nav style={styles.linksList}>
            <a href="#about" style={styles.link}>
              About Us
            </a>
            <a href="#privacy" style={styles.link}>
              Privacy Policy
            </a>
            <a href="#terms" style={styles.link}>
              Terms of Service
            </a>
            <a href="#blog" style={styles.link}>
              Blog
            </a>
          </nav>
        </div>

        {/* Product Column */}
        <div style={styles.column}>
          <h3 style={styles.columnTitle}>Product</h3>
          <nav style={styles.linksList}>
            <a href="#api" style={styles.link}>
              API
            </a>
          </nav>
        </div>

        {/* Contact Column */}
        <div style={styles.column}>
          <h3 style={styles.columnTitle}>Contact</h3>
          <nav style={styles.linksList}>
            <a href="#contact" style={styles.link}>
              Contact Us
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: "#ebeaeaff",
    padding: "2rem 0",
    marginTop: "auto",
    fontFamily: "'Alata', sans-serif",
    borderTop: "1px solid black",
  } as React.CSSProperties,
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 2rem 0 calc(2rem)",
    flexWrap: "wrap",
    gap: "5rem",
  } as React.CSSProperties,
  column: {
    flex: "0 0 auto",
    minWidth: "auto",
  } as React.CSSProperties,
  columnTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#333",
    marginBottom: "1rem",
    fontFamily: "'Alata', sans-serif",
  } as React.CSSProperties,
  linksList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  } as React.CSSProperties,
  link: {
    color: "#888888",
    textDecoration: "none",
    fontSize: "0.95rem",
    fontFamily: "'Alata', sans-serif",
    cursor: "pointer",
  } as React.CSSProperties,
};

export default Footer;
