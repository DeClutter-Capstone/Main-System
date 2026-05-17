import { useState, type CSSProperties } from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";

function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  // ── styles ──────────────────────────────────────────────────────────────────

  const accentBar = (color: string): CSSProperties => ({
    width: "4px", borderRadius: "4px", alignSelf: "stretch",
    backgroundColor: color, flexShrink: 0, minHeight: "44px",
  });

  const infoLabel = (color: string): CSSProperties => ({
    fontSize: "0.75rem", fontWeight: 600, color,
    textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px",
  });

  const s: Record<string, CSSProperties> = {
    page: {
      display: "flex", flexDirection: "column", minHeight: "100vh",
      backgroundColor: "var(--color-bg-base)", transition: "background-color 0.3s ease",
      fontFamily: "'Alata', sans-serif",
    },
    hero: {
      position: "relative", overflow: "hidden", textAlign: "center",
      padding: "80px 24px 90px",
      background: "var(--color-bg-surface)",
      borderBottom: "1px solid var(--color-border-subtle)",
    },
    blobTR: {
      position: "absolute", top: "-60px", right: "-60px",
      width: "360px", height: "360px", borderRadius: "50%",
      background: "radial-gradient(circle, rgba(83, 141, 239, 0.08) 0%, transparent 70%)",
      pointerEvents: "none",
    },
    blobBL: {
      position: "absolute", bottom: "-40px", left: "-40px",
      width: "260px", height: "260px", borderRadius: "50%",
      background: "radial-gradient(circle, rgba(124, 110, 245, 0.06) 0%, transparent 70%)",
      pointerEvents: "none",
    },
    heroInner: { position: "relative", maxWidth: "600px", margin: "0 auto" },
    badge: {
      display: "inline-block", padding: "4px 14px", borderRadius: "999px",
      background: "var(--color-brand-soft)", color: "var(--color-brand-primary)",
      fontSize: "0.78rem", fontWeight: 600, letterSpacing: "1.5px",
      textTransform: "uppercase", marginBottom: "16px",
    },
    heroTitle: {
      fontSize: "2.8rem", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.15,
      color: "var(--color-text-primary)", margin: "0 0 16px",
    },
    heroSub: {
      fontSize: "1.05rem", lineHeight: 1.7, margin: 0,
      color: "var(--color-text-secondary)",
    },
    main: { flex: 1, padding: "70px 24px", background: "var(--color-bg-base)" },
    grid: {
      maxWidth: "1050px", margin: "0 auto",
      display: "grid", gridTemplateColumns: "1fr 1.6fr",
      gap: "40px", alignItems: "start",
    },
    infoCol: { display: "flex", flexDirection: "column", gap: "16px" },
    infoCard: {
      background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)",
      borderRadius: "14px", padding: "22px 20px",
      display: "flex", gap: "16px", alignItems: "flex-start",
    },
    infoValue: { fontWeight: 700, color: "var(--color-text-primary)", fontSize: "0.95rem", marginBottom: "2px" },
    infoSub: { fontSize: "0.82rem", color: "var(--color-text-secondary)" },
    blurb: {
      background: "var(--color-card)",
      border: "1px solid var(--color-border-subtle)", borderRadius: "14px",
      padding: "22px 20px", marginTop: "4px",
    },
    blurbText: { fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: 1.7 },
    formCard: {
      background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)",
      borderRadius: "20px", padding: "40px 36px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
    },
    successBox: { textAlign: "center", padding: "40px 0" },
    successIcon: {
      width: "64px", height: "64px", borderRadius: "50%",
      background: "var(--color-brand-soft)", display: "flex",
      alignItems: "center", justifyContent: "center",
      margin: "0 auto 20px", fontSize: "1.8rem", color: "var(--color-brand-primary)",
    },
    successTitle: { fontSize: "1.4rem", fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 10px" },
    successText: { fontSize: "0.95rem", color: "var(--color-text-secondary)", margin: "0 0 28px", lineHeight: 1.6 },
    resetBtn: {
      padding: "10px 28px", borderRadius: "999px",
      border: "1px solid var(--color-border-subtle)", background: "transparent",
      color: "var(--color-text-primary)", fontFamily: "'Alata', sans-serif",
      fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s ease",
    },
    form: { display: "flex", flexDirection: "column", gap: "18px" },
    formHeading: { fontSize: "1.4rem", fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 6px" },
    formSub: { fontSize: "0.85rem", color: "var(--color-text-secondary)", margin: 0 },
    nameEmailRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
    label: {
      display: "block", fontSize: "0.8rem", fontWeight: 600,
      color: "var(--color-text-secondary)", marginBottom: "6px",
      textTransform: "uppercase", letterSpacing: "0.5px",
    },
    input: {
      width: "100%", padding: "12px 16px", borderRadius: "10px",
      border: "1px solid var(--color-border-subtle)", background: "var(--color-bg-surface)",
      color: "var(--color-text-primary)", fontSize: "0.95rem", fontFamily: "'Alata', sans-serif",
      outline: "none", boxSizing: "border-box",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    },
    textarea: {
      width: "100%", padding: "12px 16px", borderRadius: "10px",
      border: "1px solid var(--color-border-subtle)", background: "var(--color-bg-surface)",
      color: "var(--color-text-primary)", fontSize: "0.95rem", fontFamily: "'Alata', sans-serif",
      outline: "none", boxSizing: "border-box", resize: "vertical", minHeight: "120px",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    },
    submitBtn: {
      width: "100%", padding: "14px", borderRadius: "10px", border: "none",
      background: "var(--color-brand-primary)",
      color: "#fff", fontSize: "1rem", fontWeight: 700,
      fontFamily: "'Alata', sans-serif", cursor: "pointer",
      boxShadow: "0 4px 12px rgba(67, 132, 226, 0.25)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    },
  };

  const infoCards = [
    { color: "#5B8DEF", label: "Email",    value: "hello@declutter.app",   sub: "We reply within 24 hours" },
    { color: "#7c6ef5", label: "Location", value: "Eastern Mediterranean University", sub: "Famagusta, Cyprus" },
    { color: "#2ec4b6", label: "Project",  value: "Capstone 2026",          sub: "AI-Powered Interior Design" },
  ];

  return (
    <div style={s.page}>
      {/* pseudo-selectors and media queries must stay in <style> */}
      <style>{`
        .c-input { background-color: var(--color-bg-surface); color: var(--color-text-primary); border: 1px solid var(--color-border-subtle); }
        .c-input:focus { border-color: var(--color-brand-primary) !important; box-shadow: 0 0 0 3px var(--color-focus-ring) !important; }
        .c-input::placeholder { color: var(--color-text-secondary); }
        .c-submit { background-color: var(--color-brand-primary); }
        .c-submit:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(67, 132, 226, 0.35) !important; }
        .c-submit:active { transform: translateY(0) !important; }
        @media (max-width: 768px) {
          .c-grid  { grid-template-columns: 1fr !important; }
          .c-title { font-size: 2rem !important; }
          .c-name-row { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <TopBar showSignIn={true} />

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.blobTR} />
        <div style={s.blobBL} />
        <div style={s.heroInner}>
          <span style={s.badge}>Get in touch</span>
          <h1 style={s.heroTitle} className="c-title">We'd love to hear from you</h1>
          <p style={s.heroSub}>
            Have a question, suggestion, or just want to say hi? Drop us a message and we'll get back to you.
          </p>
        </div>
      </section>

      {/* Main */}
      <section style={s.main}>
        <div style={s.grid} className="c-grid">

          {/* Info cards */}
          <div style={s.infoCol}>
            {infoCards.map(({ color, label, value, sub }) => (
              <div key={label} style={s.infoCard}>
                <div style={accentBar(color)} />
                <div>
                  <div style={infoLabel(color)}>{label}</div>
                  <div style={s.infoValue}>{value}</div>
                  <div style={s.infoSub}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Form card */}
          <div style={s.formCard}>
            {submitted ? (
              <div style={s.successBox}>
                <div style={s.successIcon}>✓</div>
                <h3 style={s.successTitle}>Message sent!</h3>
                <p style={s.successText}>Thanks for reaching out. We'll get back to you within 24 hours.</p>
                <button
                  style={s.resetBtn}
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={s.form}>
                <div>
                  <h2 style={s.formHeading}>Send a message</h2>
                  <p style={s.formSub}>Fill in the form and we'll get back to you shortly.</p>
                </div>

                <div style={s.nameEmailRow} className="c-name-row">
                  <div>
                    <label style={s.label}>Name</label>
                    <input className="c-input" style={s.input} name="name" value={form.name} onChange={handleChange} placeholder="Your name" required />
                  </div>
                  <div>
                    <label style={s.label}>Email</label>
                    <input className="c-input" style={s.input} name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@email.com" required />
                  </div>
                </div>

                <div>
                  <label style={s.label}>Subject</label>
                  <select className="c-input" style={s.input} name="subject" value={form.subject} onChange={handleChange} required>
                    <option value="" disabled>Select a subject</option>
                    <option value="general">General enquiry</option>
                    <option value="bug">Bug report</option>
                    <option value="feature">Feature request</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={s.label}>Message</label>
                  <textarea className="c-input" style={s.textarea} name="message" value={form.message} onChange={handleChange} placeholder="Tell us what's on your mind..." rows={5} required />
                </div>

                <button type="submit" className="c-submit" style={s.submitBtn}>Send message →</button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ContactUs;
