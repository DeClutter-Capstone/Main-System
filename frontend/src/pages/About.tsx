import { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";

const team = [
  {
    name: "Mohamed Elfaki",
    role: "AI / ML",
    description: "Trains and fine-tunes the vision models behind every room transformation.",
    initials: "ME",
    color: "#4790fd",
  },
  {
    name: "Firas Nazar",
    role: "Backend",
    description: "Architects the FastAPI services, database layer, and Replicate integration.",
    initials: "FN",
    color: "#7c6ef5",
  },
  {
    name: "Saad Ahmed",
    role: "Frontend",
    description: "Crafts the React UI and makes sure every pixel feels intentional.",
    initials: "SA",
    color: "#2ec4b6",
  },
  {
    name: "Ahmed Salmi",
    role: "Mobile & Integration",
    description: "Bridges web and mobile, keeping both experiences in sync.",
    initials: "AS",
    color: "#f97316",
  },
];

const steps = [
  {
    number: "01",
    title: "Upload",
    body: "Snap a photo of any room and upload it directly in your browser.",
  },
  {
    number: "02",
    title: "Choose a style",
    body: "Pick from Modern, Minimalist, Scandinavian, Industrial, Bohemian, or Spa.",
  },
  {
    number: "03",
    title: "Transform",
    body: "Our AI model analyses the space and renders a full redesign in seconds.",
  },
  {
    number: "04",
    title: "Compare & Save",
    body: "Slide between before and after, then save the result to your projects.",
  },
];

function About() {
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const bg = isDark ? "#1e1e1e" : "#f7f7f7";
  const surface = isDark ? "#2a2a2a" : "#ffffff";
const text = isDark ? "#f0f0f0" : "#1a1a1a";
  const muted = isDark ? "#9a9a9a" : "#666666";
  const border = isDark ? "#3a3a3a" : "#e4e4e4";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: bg, transition: "background-color 0.3s ease", fontFamily: "'Alata', sans-serif" }}>
      <style>{`
        .about-stat-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .about-stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(71,144,253,0.18) !important; }
        .about-step-card { transition: transform 0.25s ease; }
        .about-step-card:hover { transform: translateY(-3px); }
        .about-team-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .about-team-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(0,0,0,0.15) !important; }
        @media (max-width: 768px) {
          .about-hero-grid { grid-template-columns: 1fr !important; }
          .about-stats-row { grid-template-columns: 1fr 1fr !important; }
          .about-steps-grid { grid-template-columns: 1fr !important; }
          .about-team-grid { grid-template-columns: 1fr 1fr !important; }
          .about-hero-title { font-size: 2.4rem !important; }
        }
        @media (max-width: 480px) {
          .about-stats-row { grid-template-columns: 1fr !important; }
          .about-team-grid { grid-template-columns: 1fr !important; }
          .about-hero-title { font-size: 1.9rem !important; }
        }
      `}</style>

      <TopBar showSignIn={true} />

      {/* ── HERO ── */}
      <section style={{ position: "relative", overflow: "hidden", background: isDark ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" : "linear-gradient(135deg, #e8f0fe 0%, #dce8ff 50%, #c8d9ff 100%)", padding: "90px 24px 100px" }}>
        {/* decorative blobs */}
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "420px", height: "420px", borderRadius: "50%", background: "radial-gradient(circle, rgba(71,144,253,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,110,245,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center" }} className="about-hero-grid">
          <div>
            <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: "999px", background: "rgba(71,144,253,0.15)", color: "#4790fd", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "20px" }}>
              Our Story
            </span>
            <h1 className="about-hero-title" style={{ fontSize: "3.2rem", fontWeight: 800, color: isDark ? "#ffffff" : "#0d1b3e", lineHeight: 1.15, margin: "0 0 20px", letterSpacing: "-1px" }}>
              We make great spaces{" "}
              <span style={{ color: "#4790fd", fontStyle: "italic" }}>accessible</span>{" "}
              to everyone.
            </h1>
            <p style={{ fontSize: "1.1rem", color: isDark ? "#c0c0c0" : "#4a5568", lineHeight: 1.8, margin: "0 0 32px", maxWidth: "480px" }}>
              DeClutter is a capstone project that uses AI and computer vision to turn any uploaded room photo into a professionally styled interior — no design degree required.
            </p>
            <div style={{ display: "flex", gap: "40px" }}>
              {[["6+", "Design styles"], ["4", "Team members"], ["AI", "Powered core"]].map(([val, label]) => (
                <div key={label}>
                  <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#4790fd", lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: "0.8rem", color: muted, marginTop: "4px" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* right side — stacked tags */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", alignItems: "flex-start" }}>
            {[
              { tag: "Modern", color: "#4790fd" },
              { tag: "Minimalist", color: "#7c6ef5" },
              { tag: "Scandinavian", color: "#2ec4b6" },
              { tag: "Industrial", color: "#64748b" },
              { tag: "Bohemian", color: "#f97316" },
              { tag: "Spa", color: "#10b981" },
            ].map(({ tag, color }, i) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 20px",
                  borderRadius: "12px",
                  background: surface,
                  border: `1px solid ${border}`,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  transform: `translateX(${i % 2 === 0 ? "0" : "28px"})`,
                  minWidth: "220px",
                }}
              >
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
                <span style={{ fontSize: "0.95rem", fontWeight: 600, color: text }}>{tag}</span>
                <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: muted }}>style</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section style={{ background: isDark ? "#141414" : "#ffffff", padding: "50px 24px", borderBottom: `1px solid ${border}` }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }} className="about-stats-row">
          {[
            { value: "7", label: "Room types supported", suffix: "" },
            { value: "6", label: "Interior styles", suffix: "+" },
            { value: "100", label: "Transformations ready", suffix: "%" },
            { value: "0", label: "Design experience needed", suffix: "" },
          ].map(({ value, label, suffix }) => (
            <div key={label} className="about-stat-card" style={{ background: surface, border: `1px solid ${border}`, borderRadius: "16px", padding: "28px 24px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: "2.8rem", fontWeight: 800, color: "#4790fd", lineHeight: 1 }}>
                {value}<span style={{ fontSize: "1.6rem" }}>{suffix}</span>
              </div>
              <div style={{ fontSize: "0.85rem", color: muted, marginTop: "8px", lineHeight: 1.4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "90px 24px", background: bg }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: "999px", background: "rgba(71,144,253,0.12)", color: "#4790fd", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "14px" }}>
              Process
            </span>
            <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: text, margin: 0, letterSpacing: "-0.5px" }}>How it works</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }} className="about-steps-grid">
            {steps.map((step, i) => (
              <div key={step.number} className="about-step-card" style={{ background: surface, border: `1px solid ${border}`, borderRadius: "16px", padding: "32px 24px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "-10px", right: "-4px", fontSize: "5rem", fontWeight: 900, color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", lineHeight: 1, userSelect: "none" }}>{step.number}</div>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `rgba(71,144,253,${0.1 + i * 0.06})`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  <span style={{ fontSize: "1rem", fontWeight: 800, color: "#4790fd" }}>{step.number}</span>
                </div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: text, margin: "0 0 10px" }}>{step.title}</h3>
                <p style={{ fontSize: "0.88rem", color: muted, margin: 0, lineHeight: 1.7 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section style={{ padding: "90px 24px", background: isDark ? "#141414" : "#ffffff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }} className="about-hero-grid">
          <div>
            <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: "999px", background: "rgba(71,144,253,0.12)", color: "#4790fd", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "14px" }}>
              Mission
            </span>
            <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: text, margin: "0 0 20px", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
              Interior design shouldn't be a luxury.
            </h2>
            <p style={{ fontSize: "1rem", color: muted, lineHeight: 1.8, margin: "0 0 20px" }}>
              Professional interior designers charge thousands. We built DeClutter so anyone — renting their first apartment, redecorating a family home, or just curious — can visualise a redesigned space instantly and for free.
            </p>
            <p style={{ fontSize: "1rem", color: muted, lineHeight: 1.8, margin: 0 }}>
              Our AI analyses your photo, understands the geometry of the room, and generates a result that respects your space rather than ignoring it.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { color: "#4790fd", title: "Functional beauty", body: "Clean, visually balanced interiors that are both liveable and beautiful." },
              { color: "#7c6ef5", title: "No expertise needed", body: "Built for people who know what they like but not how to achieve it." },
              { color: "#2ec4b6", title: "Budget-conscious", body: "Design recommendations that respect real-world financial constraints." },
              { color: "#f97316", title: "Personalised", body: "Results tailored to your room dimensions, existing furniture, and chosen style." },
            ].map(({ color, title, body }) => (
              <div key={title} style={{ display: "flex", gap: "16px", alignItems: "flex-start", background: surface, border: `1px solid ${border}`, borderRadius: "12px", padding: "18px 20px" }}>
                <div style={{ width: "4px", borderRadius: "4px", alignSelf: "stretch", backgroundColor: color, flexShrink: 0, minHeight: "40px" }} />
                <div>
                  <div style={{ fontWeight: 700, color: text, fontSize: "0.95rem", marginBottom: "4px" }}>{title}</div>
                  <div style={{ fontSize: "0.85rem", color: muted, lineHeight: 1.6 }}>{body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section style={{ padding: "90px 24px", background: bg }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: "999px", background: "rgba(71,144,253,0.12)", color: "#4790fd", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "14px" }}>
              The Team
            </span>
            <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: text, margin: "0 0 12px", letterSpacing: "-0.5px" }}>
              Built by four students
            </h2>
            <p style={{ fontSize: "1rem", color: muted, maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>
              A capstone project that started as a challenge to make AI-powered design real, practical, and usable.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }} className="about-team-grid">
            {team.map(({ name, role, description, initials, color }) => (
              <div key={name} className="about-team-card" style={{ background: surface, border: `1px solid ${border}`, borderRadius: "20px", padding: "32px 24px", textAlign: "center", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
                <div style={{ width: "68px", height: "68px", borderRadius: "50%", background: `linear-gradient(135deg, ${color}33 0%, ${color}66 100%)`, border: `2px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "1.3rem", fontWeight: 800, color: color }}>
                  {initials}
                </div>
                <div style={{ fontWeight: 700, color: text, fontSize: "1rem", marginBottom: "4px" }}>{name}</div>
                <div style={{ fontSize: "0.78rem", fontWeight: 600, color: color, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>{role}</div>
                <p style={{ fontSize: "0.85rem", color: muted, margin: 0, lineHeight: 1.6 }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: isDark ? "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)" : "linear-gradient(135deg, #dce8ff 0%, #c8d9ff 100%)", padding: "80px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 800, color: isDark ? "#ffffff" : "#0d1b3e", margin: "0 0 14px", letterSpacing: "-0.5px" }}>
          Ready to transform your space?
        </h2>
        <p style={{ fontSize: "1rem", color: isDark ? "#c0c0c0" : "#4a5568", margin: "0 0 32px" }}>
          Upload a photo and see the difference AI makes in seconds.
        </p>
        <a href="/login" style={{ display: "inline-block", padding: "14px 36px", background: "linear-gradient(135deg, #4790fd 0%, #7c6ef5 100%)", color: "#fff", borderRadius: "999px", fontWeight: 700, fontSize: "1rem", textDecoration: "none", boxShadow: "0 4px 20px rgba(71,144,253,0.4)", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 28px rgba(71,144,253,0.5)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = ""; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 20px rgba(71,144,253,0.4)"; }}
        >
          Try it free →
        </a>
      </section>

      <Footer />
    </div>
  );
}

export default About;
