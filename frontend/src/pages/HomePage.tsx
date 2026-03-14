import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

function HomePage() {
  const navigate = useNavigate();
  const [slider1Position, setSlider1Position] = useState(50);
  const [slider2Position, setSlider2Position] = useState(50);
  const [isSlider1Active, setIsSlider1Active] = useState(false);
  const [isSlider2Active, setIsSlider2Active] = useState(false);
  const sliderContainerRef1 = useRef<HTMLDivElement>(null);
  const sliderContainerRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isSlider1Active && sliderContainerRef1.current) {
        const rect = sliderContainerRef1.current.getBoundingClientRect();
        const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
        setSlider1Position(Math.max(0, Math.min(100, newPosition)));
      }
      if (isSlider2Active && sliderContainerRef2.current) {
        const rect = sliderContainerRef2.current.getBoundingClientRect();
        const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
        setSlider2Position(Math.max(0, Math.min(100, newPosition)));
      }
    };

    const handleMouseUp = () => {
      setIsSlider1Active(false);
      setIsSlider2Active(false);
    };

    if (isSlider1Active || isSlider2Active) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isSlider1Active, isSlider2Active]);

  return (
    <div style={styles.container} className="home-container">
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(67, 132, 226, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(67, 132, 226, 0.8);
          }
        }
        
        .glow-button {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .glow-button:hover {
          box-shadow: 0 0 60px rgba(67, 132, 226, 1) !important;
          animation: none;
        }

        [data-theme="dark"] .style-block {
          background-color: #383838ff !important;
        }

        [data-theme="dark"] .home-container {
          background-color: #252525ff !important;
        }
      `}</style>
      <TopBar showSignIn={true} />
      <main style={styles.mainContent}>
        {/* Hero Section */}
        <div style={styles.heroSection}>
          {/* Title */}
          <h1 style={styles.heroTitle}>
            Redefining Interior Spaces with Artificial Intelligence
          </h1>

          {/* Images Container */}
          <div style={styles.imagesContainer}>
            <img
              src="public/HomePageImages/home page 1.png"
              alt="Home Page 1"
              style={styles.heroImage}
            />
            <img
              src="public\HomePageImages\home page 2.jpg"
              alt="Home Page 2"
              style={styles.heroImage}
            />
          </div>

          {/* Subtitle */}
          <h2 style={styles.heroSubtitle}>
            Where Artificial Intelligence Meets Aesthetic and Functional
            Interior Design
          </h2>

          {/* Start Generating Button */}
          <button
            className="glow-button"
            style={styles.generateButton}
            onClick={() => navigate("/generate")}
          >
            Start Generating
          </button>

          {/* Projects Section */}
          <div style={styles.projectsSection}>
            {/* Left Side */}
            <div style={styles.projectsLeft}>
              <div style={styles.projectsHeader}>
                <img
                  src="\public\HomePageImages\projects icon.png"
                  alt="Projects Icon"
                  style={styles.projectsIcon}
                />
                <h3 style={styles.projectsHeading}>Projects</h3>
              </div>
              <img
                src="public/HomePageImages/collection.png"
                alt="Collection"
                style={styles.collectionImage}
              />
            </div>

            {/* Right Side */}
            <div style={styles.projectsRight}>
              <h2 style={styles.projectsTitle}>A Collection of Spaces</h2>
              <p style={styles.projectsDescription}>
                Each project represents a structured collection of spaces within
                the same building. Designs are grouped intentionally, allowing
                consistency, comparison, and refinement.
              </p>
            </div>
          </div>

          {/* Transformation Section */}
          <div style={styles.transformationSection}>
            <h2 style={styles.transformationHeading}>
              Explore how intelligent design turns clutter into calm spaces.
            </h2>

            {/* Sliders Container */}
            <div style={styles.slidersContainer}>
              {/* Slider 1 */}
              <div ref={sliderContainerRef1} style={styles.sliderContainer}>
                <img
                  src="\public\HomePageImages\before.jpg"
                  alt="Slider 1 Before"
                  style={styles.sliderImageBefore}
                />
                <div
                  style={{
                    ...styles.sliderImageAfterContainer,
                    width: `${slider1Position}%`,
                  }}
                >
                  <img
                    src="\public\HomePageImages\after.png"
                    alt="Slider 1 After"
                    style={styles.sliderImageAfter}
                  />
                </div>
                <div
                  style={{
                    ...styles.sliderHandle,
                    left: `${slider1Position}%`,
                  }}
                  onMouseDown={() => setIsSlider1Active(true)}
                  onMouseUp={() => setIsSlider1Active(false)}
                  onTouchStart={() => setIsSlider1Active(true)}
                  onTouchEnd={() => setIsSlider1Active(false)}
                >
                  <img
                    src="/public/HomePageImages/left.png"
                    alt="Left"
                    style={styles.sliderArrowLeft}
                  />
                  <img
                    src="/public/HomePageImages/right.png"
                    alt="Right"
                    style={styles.sliderArrowRight}
                  />
                </div>
              </div>

              {/* Slider 2 */}
              <div ref={sliderContainerRef2} style={styles.sliderContainer}>
                <img
                  src="/public/HomePageImages/before 2.png"
                  alt="Slider 2 Before"
                  style={styles.sliderImageBefore}
                />
                <div
                  style={{
                    ...styles.sliderImageAfterContainer,
                    width: `${slider2Position}%`,
                  }}
                >
                  <img
                    src="/public/HomePageImages/after 2.png"
                    alt="Slider 2 After"
                    style={styles.sliderImageAfter}
                  />
                </div>
                <div
                  style={{
                    ...styles.sliderHandle,
                    left: `${slider2Position}%`,
                  }}
                  onMouseDown={() => setIsSlider2Active(true)}
                  onMouseUp={() => setIsSlider2Active(false)}
                  onTouchStart={() => setIsSlider2Active(true)}
                  onTouchEnd={() => setIsSlider2Active(false)}
                >
                  <img
                    src="/public/HomePageImages/left.png"
                    alt="Left"
                    style={styles.sliderArrowLeft}
                  />
                  <img
                    src="/public/HomePageImages/right.png"
                    alt="Right"
                    style={styles.sliderArrowRight}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Discover Design Styles Section */}
          <div style={styles.designStylesSection}>
            <h2 style={styles.designStylesTitle}>Discover Design Styles</h2>

            {/* Minimalist Style Block */}
            <div style={styles.styleBlock} className="style-block">
              <div style={styles.styleBlockContent}>
                {/* Left Side - Image */}
                <div style={styles.styleImageContainer}>
                  <img
                    src="/public/HomePageImages/minimalist.jpg"
                    alt="Minimalist Style"
                    style={styles.styleImage}
                  />
                </div>

                {/* Right Side - Text */}
                <div style={styles.styleTextContainer}>
                  <h3 style={styles.styleHeading}>Minimalist Style</h3>
                  <p style={styles.styleDescription}>
                    Minimalist design focuses on clarity, balance, and purpose.
                    It reduces visual noise by using clean lines, neutral tones,
                    and carefully selected elements. Each detail serves a
                    function, creating calm, open spaces that feel refined,
                    organized, and timeless while emphasizing simplicity, light,
                    and spatial harmony.
                  </p>
                </div>
              </div>
            </div>

            {/* Modern Style Block */}
            <div style={styles.styleBlock} className="style-block">
              <div style={styles.styleBlockContent}>
                {/* Left Side - Text */}
                <div style={styles.styleTextContainer}>
                  <h3 style={styles.styleHeading}>Modern Style</h3>
                  <p style={styles.styleDescription}>
                    Minimalist design focuses on clarity, balance, and purpose.
                    It reduces visual noise by using clean lines, neutral tones,
                    and carefully selected elements. Each detail serves a
                    function, creating calm, open spaces that feel refined,
                    organized, and timeless while emphasizing simplicity, light,
                    and spatial harmony.
                  </p>
                </div>

                {/* Right Side - Image */}
                <div style={styles.styleImageContainer}>
                  <img
                    src="/public/HomePageImages/modren.jpg"
                    alt="Modern Style"
                    style={styles.styleImage}
                  />
                </div>
              </div>
            </div>

            {/* Scandinavian Style Block */}
            <div style={styles.styleBlock} className="style-block">
              <div style={styles.styleBlockContent}>
                {/* Left Side - Image */}
                <div style={styles.styleImageContainer}>
                  <img
                    src="/public/HomePageImages/scandinavian.webp"
                    alt="Scandinavian Style"
                    style={styles.styleImage}
                  />
                </div>

                {/* Right Side - Text */}
                <div style={styles.styleTextContainer}>
                  <h3 style={styles.styleHeading}>Scandinavian Style</h3>
                  <p style={styles.styleDescription}>
                    Scandinavian design combines minimalism with functionality
                    and warmth. It emphasizes natural light, light wood tones,
                    and cozy elements that create inviting, livable spaces. This
                    style balances clean lines with comfortable furnishings,
                    using a neutral palette enhanced by subtle textures and
                    natural materials to achieve a perfect blend of beauty and
                    practicality.
                  </p>
                </div>
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
    justifyContent: "center",
    padding: "4rem 2rem",
  } as React.CSSProperties,
  heroSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "3rem",
    maxWidth: "1500px",
    width: "100%",
  } as React.CSSProperties,
  heroTitle: {
    fontSize: "3.0rem",
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginTop: "55px",
    lineHeight: "1.2",
  } as React.CSSProperties,
  imagesContainer: {
    display: "flex",
    gap: "2rem",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    flexWrap: "wrap",
  } as React.CSSProperties,
  heroImage: {
    width: "calc(50% - 1rem)",
    maxWidth: "600px",
    height: "500px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
    objectFit: "cover",
  } as React.CSSProperties,
  heroSubtitle: {
    fontSize: "1.5rem",
    color: "#666",
    textAlign: "center",
    maxWidth: "1000px",
    marginTop: "39px",
    fontWeight: "500",
  } as React.CSSProperties,
  generateButton: {
    padding: "16px 48px",
    fontSize: "1.1rem",
    fontWeight: "600",
    backgroundColor: "#82b6ffff",
    color: "#ffffffff",
    border: "none",
    borderRadius: "50px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 0 20px rgba(67, 132, 226, 0.5)",
  } as React.CSSProperties,
  projectsSection: {
    display: "flex",
    gap: "3rem",
    justifyContent: "center",
    alignItems: "flex-start",
    width: "100%",
    marginTop: "3rem",
    flexWrap: "wrap",
    padding: "2rem",
  } as React.CSSProperties,
  projectsLeft: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "1.5rem",
    flex: "1",
    minWidth: "280px",
    marginLeft: "119px",
  } as React.CSSProperties,
  projectsHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  } as React.CSSProperties,
  projectsIcon: {
    width: "40px",
    height: "40px",
  } as React.CSSProperties,
  projectsHeading: {
    fontSize: "1.8rem",
    fontWeight: "600",
    color: "#333",
    margin: "0",
  } as React.CSSProperties,
  collectionImage: {
    width: "100%",
    maxWidth: "330px",
    height: "330px",
    borderRadius: "0",
    objectFit: "cover",
  } as React.CSSProperties,
  projectsRight: {
    flex: "1",
    minWidth: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    marginLeft: "-500px",
    marginTop: "80px",
  } as React.CSSProperties,
  projectsTitle: {
    fontSize: "2.2rem",
    fontWeight: "700",
    color: "#333",
    margin: "0",
  } as React.CSSProperties,
  projectsDescription: {
    fontSize: "1.5rem",
    color: "#666",
    lineHeight: "1.6",
    maxWidth: "800px",
    margin: "0",
  } as React.CSSProperties,
  transformationSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "3rem",
    width: "100%",
    marginTop: "3rem",
  } as React.CSSProperties,
  transformationHeading: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    maxWidth: "900px",
    margin: "0",
  } as React.CSSProperties,
  slidersContainer: {
    display: "flex",
    gap: "2rem",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    flexWrap: "wrap",
    maxWidth: "1200px",
  } as React.CSSProperties,
  sliderContainer: {
    position: "relative",
    width: "calc(50% - 0.6rem)",
    maxWidth: "560px",
    height: "440px",
    overflow: "hidden",
    borderRadius: "8px",
    cursor: "col-resize",
    touchAction: "none",
  } as React.CSSProperties,
  sliderImageBefore: {
    position: "absolute",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    top: "0",
    left: "0",
  } as React.CSSProperties,
  sliderImageAfterContainer: {
    position: "absolute",
    height: "100%",
    overflow: "hidden",
    top: "0",
    left: "0",
  } as React.CSSProperties,
  sliderImageAfter: {
    width: "560px",
    height: "100%",
    objectFit: "cover",
  } as React.CSSProperties,
  sliderHandle: {
    position: "absolute",
    top: "50%",
    height: "50px",
    width: "50px",
    backgroundColor: "#d3e5fdff",
    borderRadius: "50%",
    cursor: "col-resize",
    transform: "translate(-50%, -50%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    userSelect: "none",
    WebkitUserSelect: "none",
  } as React.CSSProperties,
  sliderArrowLeft: {
    width: "15px",
    height: "24px",
    objectFit: "contain",
    userSelect: "none",
    pointerEvents: "none",
  } as React.CSSProperties,
  sliderArrowRight: {
    width: "15px",
    height: "24px",
    objectFit: "contain",
    userSelect: "none",
    pointerEvents: "none",
  } as React.CSSProperties,
  designStylesSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "3rem",
    width: "100%",
    marginTop: "5rem",
    padding: "2rem",
  } as React.CSSProperties,
  designStylesTitle: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    margin: "0",
  } as React.CSSProperties,
  styleBlock: {
    backgroundColor: "#f8f6f6ff",
    borderRadius: "16px",
    padding: "3rem",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "1200px",
  } as React.CSSProperties,
  styleBlockContent: {
    display: "flex",
    gap: "3rem",
    alignItems: "center",
    justifyContent: "space-between",
  } as React.CSSProperties,
  styleImageContainer: {
    flex: "1",
    minWidth: "300px",
  } as React.CSSProperties,
  styleImage: {
    width: "100%",
    height: "400px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
    objectFit: "cover",
  } as React.CSSProperties,
  styleTextContainer: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    minWidth: "300px",
  } as React.CSSProperties,
  styleHeading: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#333",
    margin: "0",
  } as React.CSSProperties,
  styleDescription: {
    fontSize: "1rem",
    color: "#666",
    lineHeight: "1.8",
    margin: "0",
  } as React.CSSProperties,
};

export default HomePage;
