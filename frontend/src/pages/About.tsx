import TopBar from "../components/TopBar";
import Footer from "../components/Footer";

// SVG Icon Components
const CameraIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1a1a1a"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);

const LightbulbIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1a1a1a"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    <path d="M9 10h.01"></path>
    <path d="M15 10h.01"></path>
    <path d="M12 10h.01"></path>
  </svg>
);

const DollarIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1a1a1a"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const SearchIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1a1a1a"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

const PaletteIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1a1a1a"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="13.5" cy="6.5" r="1"></circle>
    <circle cx="17.5" cy="10.5" r="1"></circle>
    <circle cx="17.5" cy="14.5" r="1"></circle>
    <circle cx="13.5" cy="18.5" r="1"></circle>
    <circle cx="6.5" cy="12.5" r="1"></circle>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
  </svg>
);

const PeopleIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1a1a1a"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const CardIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1a1a1a"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
);

const TargetIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1a1a1a"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="12" cy="12" r="5"></circle>
    <circle cx="12" cy="12" r="9"></circle>
  </svg>
);

function About() {
  return (
    <div style={styles.container} className="about-container">
      <style>{`
        @media (max-width: 768px) {
          .feature-list {
            grid-template-columns: 1fr !important;
          }
          
          .objectives-grid {
            grid-template-columns: 1fr !important;
          }
        }
        
        .feature-item:hover {
          background-color: #ffffff;
          border-color: #d0d0d0;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        
        .objective-card:hover {
          background-color: #ffffff;
          border-color: #ccc;
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }
        
        @media (max-width: 768px) {
          .about-title {
            font-size: 36px !important;
          }
          
          .about-section-title {
            font-size: 24px !important;
          }
        }

        [data-theme="dark"] .about-title {
          color: #ffffff !important;
        }

        [data-theme="dark"] .about-section-title {
          color: #ffffff !important;
        }

        [data-theme="dark"] .about-section-text {
          color: #ffffff !important;
        }

        [data-theme="dark"] .about-intro-text {
          color: #ffffff !important;
        }

        [data-theme="dark"] .about-container {
          background-color: #252525ff !important;
        }

        [data-theme="dark"] .about-intro-section,
        [data-theme="dark"] .feature-item,
        [data-theme="dark"] .mission-card,
        [data-theme="dark"] .objective-card {
          background-color: #383838ff !important;
          border-color: #555 !important;
        }

        [data-theme="dark"] .about-intro-section,
        [data-theme="dark"] .feature-item,
        [data-theme="dark"] .mission-card,
        [data-theme="dark"] .objective-card {
          color: #ffffff !important;
        }

        [data-theme="dark"] .about-section-title {
          border-color: #555 !important;
        }

        [data-theme="dark"] .feature-item strong,
        [data-theme="dark"] .feature-item p,
        [data-theme="dark"] .mission-card p,
        [data-theme="dark"] .objective-card h3,
        [data-theme="dark"] .objective-card p {
          color: #ffffff !important;
        }

        [data-theme="dark"] svg {
          stroke: #ffffff !important;
        }
      `}</style>
      <TopBar showSignIn={true} />
      <main style={styles.mainContent}>
        <div style={styles.contentWrapper}>
          <h1 style={styles.title} className="about-title">
            About DeClutter
          </h1>

          <div style={styles.introSection} className="about-intro-section">
            <p style={styles.introText} className="about-intro-text">
              DeClutter is a web/mobile application that redesigns room
              interiors into a minimalist form.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle} className="about-section-title">
              How It Works
            </h2>
            <p style={styles.sectionText} className="about-section-text">
              Using computer vision and deep learning, our system analyzes room
              images and generates simplified photos with minimalist furniture
              designs and neutral colour palettes that are easy on the eye.
              Beyond minimalism, we also generate alternative design options for
              your space, giving you multiple possibilities to choose from.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle} className="about-section-title">
              Key Features
            </h2>
            <ul style={styles.featureList} className="feature-list">
              <li style={styles.featureItem} className="feature-item">
                <div style={styles.featureIcon}>
                  <CameraIcon />
                </div>
                <div>
                  <strong>AI-Powered Redesigns</strong>
                  <p>
                    Upload your room photos and receive AI-generated redesign
                    arrangements tailored to your space.
                  </p>
                </div>
              </li>
              <li style={styles.featureItem} className="feature-item">
                <div style={styles.featureIcon}>
                  <LightbulbIcon />
                </div>
                <div>
                  <strong>Multiple Design Options</strong>
                  <p>
                    Explore various design possibilities beyond minimalism to
                    find what suits you best.
                  </p>
                </div>
              </li>
              <li style={styles.featureItem} className="feature-item">
                <div style={styles.featureIcon}>
                  <DollarIcon />
                </div>
                <div>
                  <strong>Budget-Aware Recommendations</strong>
                  <p>
                    Get recommendations that fit your budget constraints and
                    financial considerations.
                  </p>
                </div>
              </li>
              <li style={styles.featureItem} className="feature-item">
                <div style={styles.featureIcon}>
                  <SearchIcon />
                </div>
                <div>
                  <strong>Room Analysis</strong>
                  <p>
                    Detailed analysis of your space to provide personalized
                    insights and suggestions.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle} className="about-section-title">
              Our Mission
            </h2>
            <div style={styles.missionCard} className="mission-card">
              <p style={styles.missionText}>
                The aim of this project is to design and develop an AI-powered
                web/mobile application that renovates interior spaces into their
                minimalistic form. It transforms living spaces into functional,
                clean, and visually balanced images through deep learning and
                computer vision.
              </p>
              <p style={styles.missionText}>
                DeClutter redesigns rooms for non-professionals by analysing
                their uploaded photos, giving personalized layout suggestions
                and budget-friendly recommendations that align with the user's
                needs and style, making interior redesign accessible and
                affordable enough for most users.
              </p>
            </div>

            <div style={styles.objectivesGrid} className="objectives-grid">
              <div style={styles.objectiveCard} className="objective-card">
                <div style={styles.objectiveIcon}>
                  <PaletteIcon />
                </div>
                <h3 style={styles.objectiveTitle}>Functional Design</h3>
                <p style={styles.objectiveText}>
                  Transform spaces into clean, visually balanced interiors that
                  are both beautiful and practical.
                </p>
              </div>
              <div style={styles.objectiveCard} className="objective-card">
                <div style={styles.objectiveIcon}>
                  <PeopleIcon />
                </div>
                <h3 style={styles.objectiveTitle}>For Everyone</h3>
                <p style={styles.objectiveText}>
                  Create tools that empower non-professionals to achieve
                  professional-quality interior designs.
                </p>
              </div>
              <div style={styles.objectiveCard} className="objective-card">
                <div style={styles.objectiveIcon}>
                  <CardIcon />
                </div>
                <h3 style={styles.objectiveTitle}>Budget Conscious</h3>
                <p style={styles.objectiveText}>
                  Provide affordable solutions that respect user budgets while
                  maintaining quality and style.
                </p>
              </div>
              <div style={styles.objectiveCard} className="objective-card">
                <div style={styles.objectiveIcon}>
                  <TargetIcon />
                </div>
                <h3 style={styles.objectiveTitle}>User-Centric</h3>
                <p style={styles.objectiveText}>
                  Deliver personalized recommendations aligned with individual
                  needs and style preferences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5ff",
  } as React.CSSProperties,
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "60px 20px",
    width: "100%",
    boxSizing: "border-box",
  } as React.CSSProperties,
  contentWrapper: {
    maxWidth: "1150px",
    width: "100%",
    boxSizing: "border-box",
  } as React.CSSProperties,
  title: {
    fontSize: "36px",
    fontWeight: 700,
    color: "#1a1a1a",
    margin: "0 0 40px 0",
    textAlign: "center",
    letterSpacing: "-0.5px",
  } as React.CSSProperties,
  introSection: {
    marginBottom: "60px",
    padding: "40px",
    backgroundColor: "#ffffffff",
    borderRadius: "12px",
    borderColor: "#e8e8e8",
  } as React.CSSProperties,
  introText: {
    fontSize: "20px",
    fontWeight: 600,
    color: "#1a1a1a",
    margin: 0,
    lineHeight: 1.6,
  } as React.CSSProperties,
  section: {
    marginBottom: "50px",
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#1a1a1a",
    margin: "0 0 20px 0",
    paddingBottom: "12px",
    borderBottom: "2px solid #e0e0e0",
  } as React.CSSProperties,
  sectionText: {
    fontSize: "16px",
    color: "#555",
    lineHeight: 1.8,
    margin: 0,
  } as React.CSSProperties,
  featureList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
  } as React.CSSProperties,
  featureItem: {
    display: "flex",
    gap: "16px",
    padding: "24px",
    backgroundColor: "#ffffffff",
    borderRadius: "8px",
    border: "1px solid s#e8e8e8",
    transition: "all 0.3s ease",
  } as React.CSSProperties,
  featureIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "40px",
    color: "#1a1a1a",
  } as React.CSSProperties,
  missionCard: {
    backgroundColor: "#ffffffff",
    padding: "30px",
    borderRadius: "8px",
    border: "1px solid #e8e8e8",
    marginBottom: "40px",
  } as React.CSSProperties,
  missionText: {
    fontSize: "16px",
    color: "#333",
    lineHeight: 1.8,
    margin: "0 0 20px 0",
  } as React.CSSProperties,
  objectivesGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginTop: "30px",
  } as React.CSSProperties,
  objectiveCard: {
    padding: "28px",
    backgroundColor: "#ffffffff",
    borderRadius: "10px",
    border: "1px solid #e8e8e8",
    textAlign: "center",
    transition: "all 0.3s ease",
    cursor: "pointer",
  } as React.CSSProperties,
  objectiveIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px",
    color: "#1a1a1a",
  } as React.CSSProperties,
  objectiveTitle: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#1a1a1a",
    margin: "0 0 10px 0",
  } as React.CSSProperties,
  objectiveText: {
    fontSize: "14px",
    color: "#666",
    margin: 0,
    lineHeight: 1.6,
  } as React.CSSProperties,
  description: {
    fontSize: "1.1rem",
    color: "#666",
    maxWidth: "600px",
    textAlign: "center",
    margin: "0",
  } as React.CSSProperties,
};

export default About;
