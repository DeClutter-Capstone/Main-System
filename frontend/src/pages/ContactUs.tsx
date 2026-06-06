import { useState, type CSSProperties } from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";

function ContactUs() {
  const [form, setForm] = useState({ fullName: "", company: "", email: "", phone: "", address: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const s: Record<string, CSSProperties> = {
    page: {
      display: "flex", flexDirection: "column", minHeight: "100vh",
      backgroundColor: "var(--color-bg-base)",
      fontFamily: "'Alata', sans-serif",
    },
    main: {
      flex: 1,
      display: "flex", alignItems: "stretch",
      padding: "60px 24px",
      background: "var(--color-bg-base)",
    },
    wrapper: {
      maxWidth: "1050px", width: "100%", margin: "0 auto",
      display: "grid", gridTemplateColumns: "1fr 1.55fr",
      borderRadius: "20px", overflow: "hidden",
      boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
    },
    left: {
      background: "linear-gradient(135deg, #1a3a6f 0%, #0d2040 50%, #1a1a3e 100%)",
      padding: "52px 44px",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      position: "relative", overflow: "hidden",
    },
    leftContent: { position: "relative", zIndex: 1 },
    ring1: {
      position: "absolute", top: "-40px", right: "-40px",
      width: "200px", height: "200px", borderRadius: "50%",
      border: "1px solid rgba(255,255,255,0.12)", pointerEvents: "none",
    },
    ring2: {
      position: "absolute", top: "-70px", right: "-70px",
      width: "280px", height: "280px", borderRadius: "50%",
      border: "1px solid rgba(255,255,255,0.07)", pointerEvents: "none",
    },
    ring3: {
      position: "absolute", top: "-100px", right: "-100px",
      width: "360px", height: "360px", borderRadius: "50%",
      border: "1px solid rgba(255,255,255,0.04)", pointerEvents: "none",
    },
    leftTitle: {
      fontSize: "2.2rem", fontWeight: 800, color: "#fff",
      margin: "0 0 20px", lineHeight: 1.25,
    },
    leftDesc: {
      fontSize: "0.92rem", color: "rgba(255,255,255,0.65)",
      lineHeight: 1.75, margin: "0 0 36px",
    },
    contactRow: {
      display: "flex", alignItems: "center", gap: "12px",
      marginBottom: "16px",
    },
    contactIcon: {
      width: "36px", height: "36px", borderRadius: "50%",
      background: "rgba(255,255,255,0.12)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    },
    contactText: { color: "rgba(255,255,255,0.85)", fontSize: "0.9rem" },
    right: {
      background: "var(--color-bg-surface)",
      padding: "52px 44px",
    },
    rightTitle: {
      fontSize: "1.55rem", fontWeight: 800,
      color: "var(--color-text-primary)", margin: "0 0 28px", lineHeight: 1.3,
    },
    row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" },
    fieldWrap: { display: "flex", flexDirection: "column", marginBottom: "16px" },
    label: {
      fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text-secondary)",
      marginBottom: "6px", letterSpacing: "0.2px",
    },
    input: {
      padding: "11px 14px", borderRadius: "8px",
      border: "1px solid var(--color-border-subtle)", background: "var(--color-bg-base)",
      color: "var(--color-text-primary)", fontSize: "0.93rem",
      fontFamily: "'Alata', sans-serif", outline: "none",
      boxSizing: "border-box" as const,
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    },
    textarea: {
      padding: "11px 14px", borderRadius: "8px",
      border: "1px solid var(--color-border-subtle)", background: "var(--color-bg-base)",
      color: "var(--color-text-primary)", fontSize: "0.93rem",
      fontFamily: "'Alata', sans-serif", outline: "none",
      boxSizing: "border-box" as const, resize: "vertical", minHeight: "110px",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    },
    submitBtn: {
      padding: "13px 32px", borderRadius: "8px", border: "none",
      background: "#4790fd", color: "#fff",
      fontSize: "0.97rem", fontWeight: 700,
      fontFamily: "'Alata', sans-serif", cursor: "pointer",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    },
    successBox: { textAlign: "center", padding: "60px 0" },
    successIcon: {
      width: "64px", height: "64px", borderRadius: "50%",
      background: "rgba(71,144,253,0.1)", display: "flex",
      alignItems: "center", justifyContent: "center",
      margin: "0 auto 20px", fontSize: "1.6rem", color: "#4790fd",
    },
    successTitle: { fontSize: "1.4rem", fontWeight: 800, color: "#1a1a1a", margin: "0 0 10px" },
    successText: { fontSize: "0.95rem", color: "#666", margin: "0 0 28px", lineHeight: 1.6 },
    resetBtn: {
      padding: "11px 30px", borderRadius: "8px",
      border: "1px solid #ddd", background: "transparent",
      color: "#1a1a1a", fontFamily: "'Alata', sans-serif",
      fontSize: "0.9rem", cursor: "pointer",
    },
  };

  return (
    <div style={s.page}>
      <style>{`
        .cu-input:focus { border-color: #4790fd !important; box-shadow: 0 0 0 3px rgba(71,144,253,0.15) !important; }
        .cu-input::placeholder { color: #aaa; }
        .cu-submit:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(61,44,110,0.35) !important; }
        .cu-submit:active { transform: translateY(0) !important; }
        [data-theme="dark"] .cu-right { background: #1e1e1e !important; }
        [data-theme="dark"] .cu-right h2 { color: #fff !important; }
        [data-theme="dark"] .cu-label { color: #aaa !important; }
        [data-theme="dark"] .cu-input { background: #2a2a2a !important; border-color: #444 !important; color: #fff !important; }
        [data-theme="dark"] .cu-input::placeholder { color: #666 !important; }
        @media (max-width: 768px) {
          .cu-wrapper { grid-template-columns: 1fr !important; }
          .cu-row { grid-template-columns: 1fr !important; }
          .cu-left { padding: 36px 28px !important; }
          .cu-right { padding: 36px 28px !important; }
        }
      `}</style>

      <TopBar showSignIn={true} />

      <section style={s.main}>
        <div style={s.wrapper} className="cu-wrapper">

          {/* Left — dark panel */}
          <div style={s.left} className="cu-left">
            <div style={s.ring1} />
            <div style={s.ring2} />
            <div style={s.ring3} />
            <div style={s.leftContent}>
              <h2 style={s.leftTitle}>Contact Us</h2>
              <p style={s.leftDesc}>
                Not sure what you need? The team at DeClutter will be happy to listen to you and suggest design ideas you hadn't considered.
              </p>

              <div style={s.contactRow}>
                <div style={s.contactIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <span style={s.contactText}>hello@declutter.app</span>
              </div>

              <div style={s.contactRow}>
                <div style={s.contactIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <span style={s.contactText}>Support: +1 (555) 000-0000</span>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div style={s.right} className="cu-right">
            {submitted ? (
              <div style={s.successBox}>
                <div style={s.successIcon}>✓</div>
                <h3 style={s.successTitle}>Message sent!</h3>
                <p style={s.successText}>Thanks for reaching out. We'll get back to you within 24 hours.</p>
                <button
                  style={s.resetBtn}
                  onClick={() => { setSubmitted(false); setForm({ fullName: "", company: "", email: "", phone: "", address: "", message: "" }); }}
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 style={s.rightTitle} className="cu-right">
                  We'd love to hear from you!<br />Let's get in touch
                </h2>

                <div style={s.row} className="cu-row">
                  <div style={s.fieldWrap}>
                    <label style={s.label} className="cu-label">Full Name</label>
                    <input className="cu-input" style={s.input} name="fullName" value={form.fullName} onChange={handleChange} placeholder="" required />
                  </div>
                  <div style={s.fieldWrap}>
                    <label style={s.label} className="cu-label">Company</label>
                    <input className="cu-input" style={s.input} name="company" value={form.company} onChange={handleChange} placeholder="" />
                  </div>
                </div>

                <div style={s.row} className="cu-row">
                  <div style={s.fieldWrap}>
                    <label style={s.label} className="cu-label">Email</label>
                    <input className="cu-input" style={s.input} name="email" type="email" value={form.email} onChange={handleChange} placeholder="olivia@untitledui.com" required />
                  </div>
                  <div style={s.fieldWrap}>
                    <label style={s.label} className="cu-label">Phone number</label>
                    <input className="cu-input" style={s.input} name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
                  </div>
                </div>

                <div style={s.fieldWrap}>
                  <label style={s.label} className="cu-label">Address</label>
                  <input className="cu-input" style={s.input} name="address" value={form.address} onChange={handleChange} placeholder="" />
                </div>

                <div style={s.fieldWrap}>
                  <label style={s.label} className="cu-label">Your Message</label>
                  <textarea className="cu-input" style={s.textarea} name="message" value={form.message} onChange={handleChange} placeholder="Type your message here" rows={4} required />
                </div>

                <button type="submit" className="cu-submit" style={s.submitBtn}>Send Message</button>
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
