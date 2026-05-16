import { useState } from "react";
import Layout from "../components/Layout";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

const faqSections: FAQSection[] = [
  {
    title: "About DeClutter",
    items: [
      {
        id: "what-is",
        question: "What is DeClutter?",
        answer:
          "DeClutter is an AI-powered interior redesign platform. Upload a photo of any room and receive a redesigned version in your chosen style — minimalist, modern, Scandinavian, and more.",
      },
      {
        id: "room-types",
        question: "What room types are supported?",
        answer:
          "Bedroom, Living Room, Kitchen, Bathroom, Office, and a custom option where you can describe your own room type.",
      },
      {
        id: "is-free",
        question: "Is DeClutter free?",
        answer:
          "Yes, DeClutter is completely free with no subscription or plans required.",
      },
      {
        id: "gen-limit",
        question: "Is there a limit to how many rooms I can generate?",
        answer: "No limit — generate as many as you like.",
      },
    ],
  },
  {
    title: "Using the app",
    items: [
      {
        id: "gen-time",
        question: "How long does generation take?",
        answer:
          "Typically around 20 seconds, but can take up to 40 seconds for complex photos, custom prompts, or certain styles.",
      },
      {
        id: "regen-style",
        question: "Can I regenerate with a different style?",
        answer:
          "Not directly on the Generate page, but this is supported in Projects — you can group generations together and try different styles for the same room within a project.",
      },
      {
        id: "image-formats",
        question: "What image formats are supported?",
        answer: "JPG, JPEG, and PNG are all supported.",
      },
      {
        id: "photos-stored",
        question: "Will my photos be stored?",
        answer:
          "Yes — all your generated images are stored in our database and accessible anytime through your Generation History.",
      },
    ],
  },
  {
    title: "Results & styles",
    items: [
      {
        id: "minimalist",
        question: "What is the minimalist style?",
        answer:
          "Minimalist redesigns remove clutter, decorative items, and excess furniture — leaving only essential pieces with neutral tones and clean lines. It's our flagship style and the core purpose of DeClutter.",
      },
      {
        id: "style-compat",
        question: "Which styles work with which rooms?",
        answer:
          "Minimalist, Modern, and Scandinavian work with all room types. Industrial is not recommended for bathrooms. Bohemian works best in bedrooms and living rooms. Rustic suits bedrooms, living rooms, and kitchens.",
      },
      {
        id: "can-download",
        question: "Can I download my result?",
        answer:
          "Yes — a download button appears directly below your generated image after every generation.",
      },
    ],
  },
  {
    title: "Projects & History",
    items: [
      {
        id: "history-vs-projects",
        question: "What is the difference between History and Projects?",
        answer:
          "History shows all your past generations in chronological order. Projects let you group generations together — useful when redesigning multiple rooms for the same home or comparing different styles.",
      },
      {
        id: "history-retention",
        question: "How long is my history kept?",
        answer:
          "Your generation history is stored in our database and remains accessible as long as your account is active.",
      },
    ],
  },
];

function FAQ() {
  const [expandedId, setExpandedId] = useState<string>("what-is");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const term = searchTerm.trim().toLowerCase();

  const filteredSections: FAQSection[] = term
    ? faqSections
        .map((section) => ({
          ...section,
          items: section.items.filter(
            (item) =>
              item.question.toLowerCase().includes(term) ||
              item.answer.toLowerCase().includes(term),
          ),
        }))
        .filter((section) => section.items.length > 0)
    : faqSections;

  const toggleAccordion = (id: string) => {
    setExpandedId(expandedId === id ? "" : id);
  };

  return (
    <Layout>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; max-height: 0; padding-bottom: 0; }
          to   { opacity: 1; max-height: 500px; padding-bottom: 24px; }
        }
        .faq-search:focus {
          outline: none;
          border-color: var(--color-brand-primary);
          box-shadow: 0 0 0 3px var(--color-focus-ring);
        }
        .faq-question {
          transition: background-color 0.15s ease, color 0.15s ease;
        }
        .faq-question:hover {
          background-color: var(--color-bg-elevated);
        }
        .faq-icon {
          transition: transform 0.2s ease;
        }
        @media (max-width: 768px) {
          .faq-container { padding: 40px 16px !important; }
          .faq-heading { font-size: 32px !important; margin-bottom: 32px !important; }
          .faq-question-btn { padding: 18px 16px !important; font-size: 15px !important; }
          .faq-answer { padding: 0 16px 20px 16px !important; }
        }
        @media (max-width: 480px) {
          .faq-container { padding: 32px 12px !important; }
          .faq-heading { font-size: 26px !important; }
        }
      `}</style>

      <div style={styles.container} className="faq-container">
        <h1 style={styles.heading} className="faq-heading">
          Frequently Asked Questions
        </h1>

        {/* Search */}
        <div style={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search questions..."
            style={styles.searchInput}
            className="faq-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            style={styles.searchIcon}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        {filteredSections.length === 0 ? (
          <div style={styles.empty}>
            No questions match your search.
          </div>
        ) : (
          filteredSections.map((section) => (
            <section key={section.title} style={styles.section}>
              <h2 style={styles.sectionTitle}>{section.title}</h2>
              <div style={styles.accordion}>
                {section.items.map((item, index) => {
                  const isExpanded = expandedId === item.id;
                  return (
                    <div
                      key={item.id}
                      style={{
                        ...styles.item,
                        borderBottom:
                          index === section.items.length - 1
                            ? "none"
                            : "1px solid var(--color-border-subtle)",
                      }}
                    >
                      <button
                        style={styles.question}
                        onClick={() => toggleAccordion(item.id)}
                        className="faq-question faq-question-btn"
                        aria-expanded={isExpanded}
                      >
                        <span style={styles.questionText}>{item.question}</span>
                        <span
                          className="faq-icon"
                          style={{
                            ...styles.icon,
                            transform: isExpanded
                              ? "rotate(45deg)"
                              : "rotate(0deg)",
                          }}
                        >
                          +
                        </span>
                      </button>
                      {isExpanded && (
                        <div style={styles.answer} className="faq-answer">
                          <p style={styles.answerText}>{item.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </Layout>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "60px 24px",
    fontFamily: "'Alata', sans-serif",
    color: "var(--color-text-primary)",
  } as React.CSSProperties,

  heading: {
    fontSize: "40px",
    fontWeight: 700,
    textAlign: "center",
    color: "var(--color-text-primary)",
    marginBottom: "40px",
    letterSpacing: "-0.5px",
    margin: "0 0 40px 0",
  } as React.CSSProperties,

  searchWrapper: {
    position: "relative",
    marginBottom: "48px",
  } as React.CSSProperties,

  searchInput: {
    width: "100%",
    padding: "14px 44px 14px 18px",
    fontSize: "15px",
    border: "1px solid var(--color-border-subtle)",
    borderRadius: "12px",
    backgroundColor: "var(--color-card)",
    color: "var(--color-text-primary)",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    boxSizing: "border-box",
    fontFamily: "inherit",
  } as React.CSSProperties,

  searchIcon: {
    position: "absolute",
    right: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--color-text-tertiary)",
    pointerEvents: "none",
  } as React.CSSProperties,

  section: {
    marginBottom: "32px",
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    margin: "0 0 12px 4px",
  } as React.CSSProperties,

  accordion: {
    backgroundColor: "var(--color-card)",
    borderRadius: "12px",
    border: "1px solid var(--color-border-subtle)",
    overflow: "hidden",
  } as React.CSSProperties,

  item: {
    borderBottom: "1px solid var(--color-border-subtle)",
  } as React.CSSProperties,

  question: {
    width: "100%",
    padding: "20px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 500,
    color: "var(--color-text-primary)",
    textAlign: "left",
    fontFamily: "inherit",
    gap: "16px",
  } as React.CSSProperties,

  questionText: {
    flex: 1,
  } as React.CSSProperties,

  icon: {
    fontSize: "22px",
    color: "var(--color-text-secondary)",
    fontWeight: 300,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    flexShrink: 0,
    lineHeight: 1,
  } as React.CSSProperties,

  answer: {
    padding: "0 20px 24px 20px",
    animation: "slideDown 0.25s ease-out",
  } as React.CSSProperties,

  answerText: {
    fontSize: "15px",
    lineHeight: 1.6,
    color: "var(--color-text-secondary)",
    margin: 0,
  } as React.CSSProperties,

  empty: {
    textAlign: "center",
    padding: "48px 16px",
    color: "var(--color-text-tertiary)",
    fontSize: "15px",
    backgroundColor: "var(--color-card)",
    border: "1px solid var(--color-border-subtle)",
    borderRadius: "12px",
  } as React.CSSProperties,
};

export default FAQ;
