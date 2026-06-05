import { useEffect, useRef, useState, type ReactNode } from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";

// TODO: drop each team member's photo URL or import path into the `photo`
// field below. The empty string keeps the slot rendered but visually blank.
const team = [
  {
    name: "Mohamed Elfaki",
    role: "AI",
    photo: "",
    body:
      "Mohamed works on the model. He's responsible for the system that looks at a photo of a room and figures out what each thing is, then puts the room back together without the parts that don't belong.",
  },
  {
    name: "Firas Nazar",
    role: "Backend",
    photo: "",
    body:
      "Firas wrote the API. He keeps the storage layer honest and the database from going sideways when twenty requests land at once.",
  },
  {
    name: "Saad Ahmed",
    role: "Frontend",
    photo: "",
    body:
      "Saad wrote almost every screen you can click. The motion, the spacing, and the way the before/after slider behaves are his.",
  },
  {
    name: "Ahmed Salmi",
    role: "Mobile and integration",
    photo: "",
    body:
      "Ahmed makes the pieces talk to each other. He owns the mobile build and the parts of the codebase nobody else wants to touch.",
  },
];

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible] as const;
}

function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const [ref, visible] = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`about-reveal${visible ? " visible" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function About() {
  return (
    <div className="about-page">
      <style>{`
        .about-page {
          font-family: 'Alata', sans-serif;
          background-color: var(--color-bg-base);
          color: var(--color-text-primary);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .about-main {
          flex: 1;
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          padding: 6rem 1.5rem 4rem;
        }
        .about-reveal {
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .about-reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .about-label {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--color-text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.18em;
          margin: 0 0 1.25rem;
        }
        .about-section {
          padding: 0 0 5.5rem;
        }
        .about-section:last-of-type {
          padding-bottom: 0;
        }
        .about-heading {
          font-size: 2.6rem;
          font-weight: 300;
          color: var(--color-text-primary);
          letter-spacing: -0.02em;
          line-height: 1.18;
          margin: 0 0 1.5rem;
          max-width: 720px;
        }
        .about-intro .about-heading {
          font-size: 3rem;
        }
        .about-heading .accent {
          color: var(--color-brand-primary);
        }
        .about-body {
          font-size: 1.05rem;
          color: var(--color-text-secondary);
          line-height: 1.75;
          margin: 0 0 1.15rem;
          max-width: 640px;
        }
        .about-body:last-of-type {
          margin-bottom: 0;
        }
        .about-divider {
          height: 1px;
          background-color: var(--color-border-subtle);
          width: 100%;
          margin: 0 0 5rem;
          opacity: 0.75;
        }
        .about-team-intro {
          margin-bottom: 2.75rem;
        }
        .about-team-row {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 3rem;
          align-items: center;
          padding: 2.5rem 0;
          border-top: 1px solid var(--color-border-subtle);
        }
        .about-team-row:last-of-type {
          border-bottom: 1px solid var(--color-border-subtle);
        }
        .about-team-row.reverse {
          grid-template-columns: 1fr 200px;
        }
        .about-team-row.reverse .about-team-portrait {
          order: 2;
        }
        .about-team-portrait {
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 14px;
          overflow: hidden;
          background-color: var(--color-bg-elevated);
          border: 1px solid var(--color-border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .about-team-portrait:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .about-team-portrait img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          /* keep the broken-image icon from showing while src is empty */
          color: transparent;
          font-size: 0;
        }
        .about-team-name {
          font-size: 1.5rem;
          font-weight: 500;
          color: var(--color-text-primary);
          letter-spacing: -0.01em;
          margin: 0 0 0.35rem;
        }
        .about-team-role {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--color-text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.16em;
          margin: 0 0 1rem;
        }
        .about-team-body {
          font-size: 1rem;
          color: var(--color-text-secondary);
          line-height: 1.7;
          margin: 0;
          max-width: 560px;
        }
        @media (max-width: 720px) {
          .about-main {
            padding: 4rem 1.25rem 3rem;
          }
          .about-intro .about-heading {
            font-size: 2.2rem;
          }
          .about-heading {
            font-size: 1.95rem;
          }
          .about-divider {
            margin-bottom: 3.5rem;
          }
          .about-section {
            padding-bottom: 3.5rem;
          }
          .about-team-row,
          .about-team-row.reverse {
            grid-template-columns: 1fr;
            gap: 1.25rem;
            padding: 2rem 0;
          }
          .about-team-row.reverse .about-team-portrait {
            order: 0;
          }
          .about-team-portrait {
            max-width: 180px;
          }
        }
      `}</style>

      <TopBar showSignIn={true} />

      <main className="about-main">
        {/* ── Intro ────────────────────────────────────────── */}
        <section className="about-section about-intro">
          <Reveal>
            <p className="about-label">DeClutter</p>
            <h1 className="about-heading">
              An AI tool that redesigns a room{" "}
              <span className="accent">from a single photo</span>. Built by
              four students as a capstone.
            </h1>
          </Reveal>
        </section>

        <div className="about-divider" />

        {/* ── Mission ──────────────────────────────────────── */}
        <section className="about-section">
          <Reveal>
            <p className="about-label">Mission</p>
            <h2 className="about-heading">The in-between question.</h2>
            <p className="about-body">
              Hiring an interior designer takes weeks. Modelling a room in 3D
              takes hours. Most people who are curious about how their space
              could look fall into the gap between those two options, and stay
              there.
            </p>
            <p className="about-body">
              DeClutter is for that question. You upload a photo, pick a style,
              and twenty seconds later you have a render of the same room with
              less in it, or in a different visual language entirely. The
              answer should not take a meeting.
            </p>
          </Reveal>
        </section>

        <div className="about-divider" />

        {/* ── Vision ───────────────────────────────────────── */}
        <section className="about-section">
          <Reveal>
            <p className="about-label">Vision</p>
            <h2 className="about-heading">
              What this looks like in a year.
            </h2>
            <p className="about-body">
              You stand in a room with your phone. The app shows you the same
              room three ways. As it is now, as it would be without the things
              you keep meaning to clear out, and in a different style entirely.
              You pick the version you want to live in, and the app tells you
              what to move, what to keep, and what to buy.
            </p>
            <p className="about-body">
              The model gets better every week. The catalogue of styles grows.
              The minimum spec for a usable redesign drops to a phone photo
              taken in bad lighting. That is the version we are building
              toward.
            </p>
          </Reveal>
        </section>

        <div className="about-divider" />

        {/* ── Team ─────────────────────────────────────────── */}
        <section className="about-section">
          <Reveal>
            <div className="about-team-intro">
              <p className="about-label">Team</p>
              <h2 className="about-heading">Four people, one capstone.</h2>
              <p className="about-body">
                Each of us owns a layer of the system. Roughly, this is what
                that means.
              </p>
            </div>
          </Reveal>

          {team.map((member, i) => (
            <Reveal key={member.name} delay={i * 70}>
              <article
                className={`about-team-row${i % 2 === 1 ? " reverse" : ""}`}
              >
                <div className="about-team-portrait">
                  {/* TODO: replace src with the photo for {member.name} */}
                  <img src={member.photo} alt={member.name} />
                </div>
                <div>
                  <h3 className="about-team-name">{member.name}</h3>
                  <p className="about-team-role">{member.role}</p>
                  <p className="about-team-body">{member.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default About;
