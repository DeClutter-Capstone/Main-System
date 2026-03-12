import { useState } from "react";
import Layout from "../components/Layout";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

function FAQ() {
  const [expandedId, setExpandedId] = useState<string>("about");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const faqItems: FAQItem[] = [
    {
      id: "about",
      question: "About DeClutter",
      answer:
        "DeClutter is an AI-powered interior designing platform that allows users to upload pictures of their rooms and receive regenerated versions based on the style of their choosing.",
    },
    {
      id: "styles",
      question: "Styles",
      answer:
        "Explore a wide variety of interior design styles including modern, minimalist, industrial, bohemian, scandinavian, and more. Customize your space with AI-powered recommendations tailored to your preferences.",
    },
    {
      id: "how-to-use",
      question: "How to use",
      answer:
        "Simply upload a photo of your room, select your preferred design style, and let our AI transform your space. The process is simple: upload, choose a style, and download your redesigned room in seconds.",
    },
    {
      id: "help",
      question: "Help",
      answer:
        "Need assistance? Check our comprehensive documentation, contact our support team, or explore our community forum for tips and tricks. We're here to help you create your dream space.",
    },
  ];

  const filteredItems = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAccordion = (id: string) => {
    setExpandedId(expandedId === id ? "" : id);
  };

  const handleSearchInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#4a4a4a";
    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.08)";
  };

  const handleSearchInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#e0e0e0";
    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.04)";
  };

  return (
    <Layout>
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            padding-bottom: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
            padding-bottom: 24px;
          }
        }
        
        @media (max-width: 768px) {
          .faq-container {
            padding: 40px 16px !important;
          }
          .faq-heading {
            font-size: 36px !important;
            margin-bottom: 40px !important;
          }
          .faq-search-wrapper {
            margin-bottom: 40px !important;
          }
          .faq-question {
            padding: 20px 16px !important;
            font-size: 15px !important;
          }
          .faq-answer {
            padding: 0 16px 20px 16px !important;
          }
          .faq-answer p {
            font-size: 14px !important;
          }
        }
        
        @media (max-width: 480px) {
          .faq-container {
            padding: 32px 12px !important;
          }
          .faq-heading {
            font-size: 28px !important;
            margin-bottom: 32px !important;
          }
          .faq-search-wrapper {
            margin-bottom: 32px !important;
          }
          .faq-question {
            padding: 16px 12px !important;
            gap: 12px !important;
          }
          .faq-icon {
            width: 28px !important;
            height: 28px !important;
            font-size: 20px !important;
          }
          .faq-answer {
            padding: 0 12px 16px 12px !important;
          }
        }
      `}</style>

      <div style={styles.container} className="faq-container">
        <h1 style={styles.heading}>Frequently Asked Questions</h1>

        {/* Search Bar */}
        <div style={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search question here"
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleSearchInputFocus}
            onBlur={handleSearchInputBlur}
          />
          <svg
            style={styles.searchIcon}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </div>

        {/* Accordion List */}
        <div style={styles.accordion}>
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              style={{
                ...styles.item,
                borderBottom:
                  index === filteredItems.length - 1
                    ? "none"
                    : "1px solid #f0f0f0",
              }}
              className="faq-item"
            >
              <button
                style={styles.question}
                onClick={() => toggleAccordion(item.id)}
                className="faq-question"
              >
                <span style={styles.questionText}>{item.question}</span>
                <span
                  style={
                    expandedId === item.id
                      ? styles.iconExpanded
                      : styles.icon
                  }
                  className="faq-icon"
                >
                  {expandedId === item.id ? "−" : "+"}
                </span>
              </button>

              {expandedId === item.id && (
                <div style={styles.answer} className="faq-answer">
                  <p style={styles.answerText}>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "60px 24px",
    minHeight: "100vh",
    background: "#ffffff",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
  } as React.CSSProperties,

  heading: {
    fontSize: "40px",
    fontWeight: 700,
    textAlign: "center",
    color: "#1a1a1a",
    marginBottom: "60px",
    letterSpacing: "-0.5px",
    margin: "0 0 60px 0",
  } as React.CSSProperties,

  searchWrapper: {
    position: "relative",
    marginBottom: "50px",
  } as React.CSSProperties,

  searchInput: {
    width: "100%",
    padding: "16px 48px 16px 20px",
    fontSize: "16px",
    border: "1px solid #e0e0e0",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    transition: "all 0.3s ease",
    color: "#1a1a1a",
    boxSizing: "border-box",
  } as React.CSSProperties,

  searchIcon: {
    position: "absolute",
    right: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#666666",
    pointerEvents: "none",
  } as React.CSSProperties,

  accordion: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
    overflow: "hidden",
  } as React.CSSProperties,

  item: {
    borderBottom: "1px solid #f0f0f0",
    transition: "background-color 0.2s ease",
  } as React.CSSProperties,

  question: {
    width: "100%",
    padding: "24px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: 600,
    color: "#1a1a1a",
    textAlign: "left",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    gap: "16px",
  } as React.CSSProperties,

  questionText: {
    flex: 1,
  } as React.CSSProperties,

  icon: {
    fontSize: "24px",
    color: "#666666",
    fontWeight: 300,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    transition: "all 0.3s ease",
    flexShrink: 0,
  } as React.CSSProperties,

  iconExpanded: {
    fontSize: "24px",
    color: "#1a1a1a",
    fontWeight: 300,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    transition: "all 0.3s ease",
    flexShrink: 0,
  } as React.CSSProperties,

  answer: {
    padding: "0 20px 24px 20px",
    animation: "slideDown 0.3s ease-out forwards",
  } as React.CSSProperties,

  answerText: {
    fontSize: "15px",
    lineHeight: 1.6,
    color: "#666666",
    margin: 0,
  } as React.CSSProperties,
};

export default FAQ;
