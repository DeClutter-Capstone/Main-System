import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import React from "react";

// ============ HERO SLIDES ============
const heroSlides = [
  {
    id: 1,
    title: "Minimalist Living Redefined",
    subtitle: "Discover how AI transforms your spaces into serene, decluttered havens of tranquility",
    style: "Minimalist",
    imageUrl: "/HomePageImages/minimalist.jpg",
    accent: "#a8d8ea",
  },
  {
    id: 2,
    title: "Modern Design Meets AI Intelligence",
    subtitle: "Experience cutting-edge interior transformation powered by artificial intelligence",
    style: "Modern",
    imageUrl: "/HomePageImages/modren.jpg",
    accent: "#4790fd",
  },
  {
    id: 3,
    title: "Scandinavian Simplicity & Elegance",
    subtitle: "Create functional, beautiful spaces inspired by Nordic design principles",
    style: "Scandinavian",
    imageUrl: "/HomePageImages/scandinavian.webp",
    accent: "#b8d8c8",
  },
  {
    id: 4,
    title: "Industrial Design, Raw & Unapologetic",
    subtitle: "Exposed brick, steel, and weathered wood turn every imperfection into a bold statement",
    style: "Industrial",
    imageUrl: "/HomePageImages/industrial.jpg",
    accent: "#c8a882",
  },
  {
    id: 5,
    title: "Bohemian Spirit, Layered & Alive",
    subtitle: "Rich colours, global patterns, and handcrafted pieces that tell your unique story",
    style: "Bohemian",
    imageUrl: "/HomePageImages/bohemian.webp",
    accent: "#e8a87c",
  },
  {
    id: 6,
    title: "Spa Serenity, Your Personal Sanctuary",
    subtitle: "Soft earthy tones and natural materials that bring the healing energy of nature indoors",
    style: "Spa",
    imageUrl: "/HomePageImages/spa.jpg",
    accent: "#8fcfcf",
  },
];

const designStyles = [
  {
    key: "minimalist",
    label: "Minimalist",
    image: "/HomePageImages/minimalist.jpg",
    heading: "Minimalist Style",
    description: "Minimalist design focuses on clarity, balance, and purpose. It reduces visual noise by using clean lines, neutral tones, and carefully selected elements. Each detail serves a function, creating calm, open spaces that feel refined, organized, and timeless.",
    color: "#a8d8ea",
  },
  {
    key: "modern",
    label: "Modern",
    image: "/HomePageImages/modren.jpg",
    heading: "Modern Style",
    description: "Modern design harnesses bold geometry, open floor plans, and a curated mix of materials. Sleek surfaces meet warm accents to create spaces that feel effortlessly current and luxuriously liveable.",
    color: "#4790fd",
  },
  {
    key: "scandinavian",
    label: "Scandinavian",
    image: "/HomePageImages/scandinavian.webp",
    heading: "Scandinavian Style",
    description: "Scandinavian design combines minimalism with functionality and warmth. It emphasises natural light, light wood tones, and cozy elements that create inviting, liveable spaces with a perfect blend of beauty and practicality.",
    color: "#b8d8c8",
  },
  {
    key: "industrial",
    label: "Industrial",
    image: "/HomePageImages/industrial.jpg",
    heading: "Industrial Style",
    description: "Industrial design draws inspiration from warehouses and urban lofts, celebrating raw, unfinished materials such as exposed brick, concrete, and steel — turning every imperfection into a design statement.",
    color: "#c8a882",
  },
  {
    key: "bohemian",
    label: "Bohemian",
    image: "/HomePageImages/bohemian.webp",
    heading: "Bohemian Style",
    description: "Bohemian design embraces a free-spirited, eclectic aesthetic that layers rich colours, global patterns, and mixed textures to create deeply personal and expressive spaces full of character.",
    color: "#e8a87c",
  },
  {
    key: "spa",
    label: "Spa",
    image: "/HomePageImages/spa.jpg",
    heading: "Spa Style",
    description: "Spa design transforms living spaces into sanctuaries of calm and restoration. Soft earthy tones, natural stone, bamboo, and gentle lighting create an atmosphere of pure tranquility.",
    color: "#8fcfcf",
  },
];

const getSlideIndex = (index: number) =>
  ((index % heroSlides.length) + heroSlides.length) % heroSlides.length;

function useReveal(): [React.RefObject<HTMLDivElement | null>, boolean] {
  const revealRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = revealRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
      },
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [revealRef, visible];
}

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [counterRef, visible] = useReveal();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(target / 60);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(id); }
      else setCount(start);
    }, 16);
    return () => clearInterval(id);
  }, [visible, target]);
  return <span ref={counterRef}>{count.toLocaleString()}{suffix}</span>;
}

function HomePage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [slider1Position, setSlider1Position] = useState(50);
  const [slider2Position, setSlider2Position] = useState(50);
  const [isSlider1Active, setIsSlider1Active] = useState(false);
  const [isSlider2Active, setIsSlider2Active] = useState(false);
  const [activeStyle, setActiveStyle] = useState(0);
  const [styleTransitioning, setStyleTransitioning] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<number | null>(null);

  const sliderContainerRef1 = useRef<HTMLDivElement>(null);
  const sliderContainerRef2 = useRef<HTMLDivElement>(null);

  const [statsRef, statsVisible] = useReveal();
  const [projectsRef, projectsVisible] = useReveal();
  const [sliderRef, sliderVisible] = useReveal();
  const [stylesRef, stylesVisible] = useReveal();
  const [ctaRef, ctaVisible] = useReveal();

  useEffect(() => {
    if (isHovering) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHovering]);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const goPrev = () => setCurrentSlide(getSlideIndex(currentSlide - 1));
  const goNext = () => setCurrentSlide(getSlideIndex(currentSlide + 1));

  const switchStyle = useCallback((index: number) => {
    if (index === activeStyle) return;
    setStyleTransitioning(true);
    setTimeout(() => { setActiveStyle(index); setStyleTransitioning(false); }, 280);
  }, [activeStyle]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isSlider1Active && sliderContainerRef1.current) {
        const rect = sliderContainerRef1.current.getBoundingClientRect();
        setSlider1Position(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
      }
      if (isSlider2Active && sliderContainerRef2.current) {
        const rect = sliderContainerRef2.current.getBoundingClientRect();
        setSlider2Position(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
      }
    };
    const handleMouseUp = () => { setIsSlider1Active(false); setIsSlider2Active(false); };
    if (isSlider1Active || isSlider2Active) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => { document.removeEventListener("mousemove", handleMouseMove); document.removeEventListener("mouseup", handleMouseUp); };
    }
  }, [isSlider1Active, isSlider2Active]);

  const current = designStyles[activeStyle];

  return (
    <div style={containerStyle} className="home-container">
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(71,144,253,0.5); }
          50% { box-shadow: 0 0 45px rgba(71,144,253,0.9); }
        }
        @keyframes float-smooth {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(1deg); }
        }
        @keyframes orb-drift-1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(60px,-40px) scale(1.15); }
          66% { transform: translate(-40px,30px) scale(0.9); }
        }
        @keyframes orb-drift-2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(-70px,50px) scale(1.1); }
          66% { transform: translate(50px,-30px) scale(0.85); }
        }
        @keyframes orb-drift-3 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(30px,60px) scale(1.2); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-left {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .glow-button {
          animation: pulse-glow 2.5s ease-in-out infinite;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .glow-button:hover {
          transform: translateY(-3px) scale(1.04);
          box-shadow: 0 0 70px rgba(71,144,253,1) !important;
          animation: none;
        }
        .glow-button:active { transform: translateY(0) scale(0.98); }
        .collection-image-animated {
          animation: float-smooth 5s cubic-bezier(0.45,0.05,0.55,0.95) infinite;
        }
        .slider-container-wrapper { user-select: none; -webkit-user-select: none; }
        .slider-container-wrapper img { -webkit-user-drag: none; user-drag: none; }
        .style-tab {
          position: relative;
          padding: 0.65rem 1.4rem;
          border-radius: 50px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.25s ease;
          white-space: nowrap;
          letter-spacing: 0.3px;
          background: rgba(0,0,0,0.04);
          color: #555;
        }
        .style-tab:hover { transform: translateY(-2px); }
        .stat-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .stat-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(0,0,0,0.15) !important; }
        .slider-handle-inner { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .slider-handle-inner:hover { transform: translate(-50%,-50%) scale(1.15); box-shadow: 0 0 20px rgba(71,144,253,0.6); }
        .reveal-fade-up:not(.visible) { opacity: 0; transform: translateY(40px); }
        .reveal-fade-up.visible { animation: fade-up 0.7s cubic-bezier(0.34,1.1,0.64,1) forwards; }
        .reveal-fade-left:not(.visible) { opacity: 0; transform: translateX(-50px); }
        .reveal-fade-left.visible { animation: fade-left 0.7s cubic-bezier(0.34,1.1,0.64,1) forwards; }
        .reveal-fade-right:not(.visible) { opacity: 0; transform: translateX(50px); }
        .reveal-fade-right.visible { animation: fade-right 0.7s cubic-bezier(0.34,1.1,0.64,1) 0.15s forwards; }
        .reveal-scale:not(.visible) { opacity: 0; transform: scale(0.85); }
        .reveal-scale.visible { animation: scale-in 0.6s cubic-bezier(0.34,1.1,0.64,1) forwards; }
        .grid-icon-dark { display: none; }

        /* ── Dark mode overrides ── */
        [data-theme="dark"] .home-container { background-color: #252525 !important; }
        [data-theme="dark"] .home-container h1,
        [data-theme="dark"] .home-container h2,
        [data-theme="dark"] .home-container h3,
        [data-theme="dark"] .home-container p { color: #ffffff !important; }
        [data-theme="dark"] .home-container .projects-label { color: #ffffff !important; }
        [data-theme="dark"] .stat-card-inner { background: #2a2a2a !important; border-color: #3a3a3a !important; }
        [data-theme="dark"] .stat-label { color: #aaa !important; }
        [data-theme="dark"] .stat-number { color: #4790fd !important; }
        [data-theme="dark"] .style-tab { background: rgba(255,255,255,0.06); color: #ccc; }
        [data-theme="dark"] .style-showcase-bg { background: #222 !important; }
        [data-theme="dark"] .style-text-area { background: #2a2a2a !important; }
        [data-theme="dark"] .cta-section { background: linear-gradient(135deg, #1e3a5f 0%, #0d2137 50%, #1a1a2e 100%) !important; }
        [data-theme="dark"] .grid-icon-light { display: none; }
        [data-theme="dark"] .grid-icon-dark { display: inline; }
      `}</style>

      <TopBar showSignIn={true} />

      {/* ═══════════════ HERO CAROUSEL ═══════════════ */}
      <section style={heroSectionStyle}>
        <div
          style={carouselWrapStyle}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Animated orbs */}
          <div style={orbsContainerStyle}>
            <div style={{ ...orbBaseStyle, width: "500px", height: "500px", top: "-100px", right: "-100px", background: `radial-gradient(circle, ${heroSlides[currentSlide].accent}55 0%, transparent 70%)`, animation: "orb-drift-1 12s ease-in-out infinite", transition: "background 1.2s ease" }} />
            <div style={{ ...orbBaseStyle, width: "350px", height: "350px", bottom: "50px", left: "5%", background: `radial-gradient(circle, ${heroSlides[currentSlide].accent}33 0%, transparent 70%)`, animation: "orb-drift-2 9s ease-in-out infinite", transition: "background 1.2s ease" }} />
            <div style={{ ...orbBaseStyle, width: "200px", height: "200px", top: "30%", left: "40%", background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)", animation: "orb-drift-3 15s ease-in-out infinite" }} />
          </div>

          {/* Slides */}
          {heroSlides.map((slide, index) => (
            <div key={slide.id} style={{ ...slideStyle, opacity: index === currentSlide ? 1 : 0, backgroundImage: `url(${slide.imageUrl})`, transform: index === currentSlide ? "scale(1)" : "scale(1.03)" }} />
          ))}

          <div style={overlayStyle} />

          {/* Content */}
          <div style={slideContentStyle}>
            <span key={`style-${currentSlide}`} style={{ ...heroBadgeStyle, color: heroSlides[currentSlide].accent, border: `1px solid ${heroSlides[currentSlide].accent}88` }}>
              {heroSlides[currentSlide].style}
            </span>
            <h1 key={`title-${currentSlide}`} style={heroTitleStyle}>
              {heroSlides[currentSlide].title}
            </h1>
            <p key={`sub-${currentSlide}`} style={heroSubtitleStyle}>
              {heroSlides[currentSlide].subtitle}
            </p>
            <button
              className="glow-button"
              style={heroButtonStyle}
              onClick={() => navigate(localStorage.getItem("authToken") ? "/generate" : "/login")}
            >
              Start Generating →
            </button>
          </div>

          {/* Arrows */}
          {[{ side: "left", label: "‹", onClick: goPrev }, { side: "right", label: "›", onClick: goNext }].map(({ side, label, onClick }) => (
            <button
              key={side}
              style={{ ...arrowButtonStyle, [side]: "24px" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.28)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.12)"; }}
              onClick={onClick}
              aria-label={`${side === "left" ? "Previous" : "Next"} slide`}
            >
              {label}
            </button>
          ))}

          {/* Dots */}
          <div style={dotsContainerStyle}>
            {heroSlides.map((_, index) => (
              <button
                key={index}
                style={{ ...dotStyle, width: index === currentSlide ? "28px" : "8px", borderRadius: index === currentSlide ? "4px" : "50%", backgroundColor: index === currentSlide ? heroSlides[currentSlide].accent : "rgba(255,255,255,0.4)" }}
                onClick={() => goToSlide(index)}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <main style={mainStyle}>

        {/* ═══════════════ STATS BAR ═══════════════ */}
        <div ref={statsRef} style={statsRowStyle}>
          {[
            { value: 6, suffix: "", label: "Design Styles" },
            { value: 98, suffix: "%", label: "Satisfaction Rate" },
            { value: 1, suffix: "min", label: "Average Render Time" },
          ].map((stat, i) => (
            <div
              key={i}
              className={`stat-card reveal-fade-up${statsVisible ? " visible" : ""}`}
              style={{ ...statCardWrapStyle, animationDelay: `${i * 0.12}s` }}
            >
              <div className="stat-card-inner" style={statCardInnerStyle}>
                <div className="stat-number" style={statNumberStyle}>
                  <Counter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="stat-label" style={statLabelStyle}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ═══════════════ PROJECTS SECTION ═══════════════ */}
        <div ref={projectsRef} style={projectsSectionStyle}>
          {/* Left: card */}
          <div className={`reveal-fade-left${projectsVisible ? " visible" : ""}`} style={projectsLeftStyle}>
            <div style={projectsHeaderStyle}>
              <img src="/HomePageImages/griddark.png" alt="" className="grid-icon-light" style={gridIconStyle} />
              <img src="/HomePageImages/gridlight.png" alt="" className="grid-icon-dark" style={gridIconStyle} />
              <span className="projects-label" style={projectsLabelStyle}>Projects</span>
            </div>
            <img src="/HomePageImages/collection.png" alt="Collection" className="collection-image-animated" style={collectionImageStyle} />
          </div>

          {/* Right: text */}
          <div className={`reveal-fade-right${projectsVisible ? " visible" : ""}`} style={projectsRightStyle}>
            <h2 style={projectsTitleStyle}>A Collection of Spaces</h2>
            <p style={projectsDescStyle}>
              Each project represents a structured collection of spaces within the same building. Designs are grouped intentionally, allowing consistency, comparison, and refinement across every room.
            </p>
          </div>
        </div>

        {/* ═══════════════ BEFORE / AFTER SLIDERS ═══════════════ */}
        <div ref={sliderRef} className={`reveal-fade-up${sliderVisible ? " visible" : ""}`} style={slidersSectionStyle}>
          <div style={sliderHeaderStyle}>
            <div style={sectionBadgeStyle}>See the Difference</div>
            <h2 style={sliderTitleStyle}>Intelligent design turns clutter into calm spaces</h2>
            <p style={sliderSubtitleStyle}>Drag the handle to reveal the transformation</p>
          </div>

          <div style={slidersRowStyle} className="slider-container-wrapper">
            {[
              { ref: sliderContainerRef1, pos: slider1Position, before: "\\public\\HomePageImages\\before.jpg", after: "\\public\\HomePageImages\\after.png", onDown: () => setIsSlider1Active(true), onUp: () => setIsSlider1Active(false) },
              { ref: sliderContainerRef2, pos: slider2Position, before: "/public/HomePageImages/before 2.png", after: "/public/HomePageImages/after 2.png", onDown: () => setIsSlider2Active(true), onUp: () => setIsSlider2Active(false) },
            ].map((s, i) => (
              <div key={i} ref={s.ref} style={sliderContainerStyle}>
                <img src={s.before} alt="Before" style={sliderImgBaseStyle} />
                <div style={{ ...sliderAfterContainerStyle, width: `${s.pos}%` }}>
                  <img src={s.after} alt="After" style={sliderAfterImgStyle} />
                </div>
                <span style={{ ...sliderLabelStyle, left: "14px", opacity: s.pos > 15 ? 1 : 0 }}>After</span>
                <span style={{ ...sliderLabelStyle, right: "14px", left: "auto", opacity: s.pos < 85 ? 1 : 0 }}>Before</span>
                <div style={{ ...sliderDividerStyle, left: `${s.pos}%` }} />
                <div className="slider-handle-inner" style={{ ...sliderHandleStyle, left: `${s.pos}%` }} onMouseDown={s.onDown} onMouseUp={s.onUp} onTouchStart={s.onDown} onTouchEnd={s.onUp}>
                  <img src="/public/HomePageImages/left.png" alt="" style={sliderArrowStyle} />
                  <img src="/public/HomePageImages/right.png" alt="" style={sliderArrowStyle} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════ DESIGN STYLES ═══════════════ */}
        <div ref={stylesRef} className={`reveal-fade-up${stylesVisible ? " visible" : ""}`} style={stylesSectionStyle}>
          <div style={stylesHeaderStyle}>
            <div style={sectionBadgeStyle}>Explore</div>
            <h2 style={stylesTitleStyle}>Discover Design Styles</h2>
          </div>

          {/* Tabs */}
          <div style={tabsRowStyle}>
            {designStyles.map((s, i) => {
              const isActive = activeStyle === i;
              const isHovered = hoveredTab === i;
              return (
                <button
                  key={s.key}
                  className="style-tab"
                  onClick={() => switchStyle(i)}
                  onMouseEnter={() => setHoveredTab(i)}
                  onMouseLeave={() => setHoveredTab(null)}
                  style={
                    isActive
                      ? { background: s.color, color: "#fff", borderColor: s.color, boxShadow: `0 4px 20px ${s.color}66` }
                      : isHovered
                        ? { background: s.color, color: "#fff", borderColor: s.color, transform: "translateY(-2px)" }
                        : {}
                  }
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Showcase */}
          <div className="style-showcase-bg" style={showcasePanelStyle}>
            <div style={showcaseImageSideStyle}>
              <img key={current.key} src={current.image} alt={current.heading} style={{ ...showcaseImgStyle, opacity: styleTransitioning ? 0 : 1 }} />
              <div style={{ ...showcaseTintStyle, background: `linear-gradient(135deg, ${current.color}22 0%, transparent 60%)` }} />
            </div>
            <div className="style-text-area" style={showcaseTextSideStyle}>
              <div style={{ ...styleColorBadgeStyle, color: current.color, background: `${current.color}20`, border: `1px solid ${current.color}44` }}>
                {current.label}
              </div>
              <h3 key={`h-${current.key}`} style={{ ...showcaseHeadingStyle, opacity: styleTransitioning ? 0 : 1, transform: styleTransitioning ? "translateY(12px)" : "translateY(0)" }}>
                {current.heading}
              </h3>
              <p key={`p-${current.key}`} style={{ ...showcaseDescStyle, opacity: styleTransitioning ? 0 : 1 }}>
                {current.description}
              </p>
              <button
                style={{ ...showcaseButtonStyle, backgroundColor: current.color, boxShadow: `0 8px 24px ${current.color}55` }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
                onClick={() => navigate(localStorage.getItem("authToken") ? "/generate" : "/login")}
              >
                Try This Style →
              </button>
            </div>
          </div>
        </div>

        {/* ═══════════════ FINAL CTA ═══════════════ */}
        <div ref={ctaRef} className={`cta-section reveal-scale${ctaVisible ? " visible" : ""}`} style={ctaSectionStyle}>
          <div style={ctaOrb1Style} />
          <div style={ctaOrb2Style} />
          <div style={ctaContentStyle}>
            <div style={ctaBadgeStyle}>AI-Powered Design</div>
            <h2 style={ctaTitleStyle}>Ready to transform your space?</h2>
            <p style={ctaDescStyle}>Upload a photo and watch AI redesign your room in any style — in under 2 minutes.</p>
            <button
              className="glow-button"
              style={ctaButtonStyle}
              onClick={() => navigate(localStorage.getItem("authToken") ? "/generate" : "/login")}
            >
              Start for Free →
            </button>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}

// ─── Style objects ────────────────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  backgroundColor: "#f9f7f4",
};

const heroSectionStyle: React.CSSProperties = { width: "100%" };

const carouselWrapStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: "630px",
  overflow: "hidden",
};

const orbsContainerStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  overflow: "hidden",
};

const orbBaseStyle: React.CSSProperties = {
  position: "absolute",
  borderRadius: "50%",
};

const slideStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundSize: "cover",
  backgroundPosition: "center",
  transition: "opacity 1s ease",
};

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.6) 100%)",
  zIndex: 1,
};

const slideContentStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 2,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "1.2rem",
  padding: "0 6rem",
  textAlign: "center",
};

const heroBadgeStyle: React.CSSProperties = {
  display: "inline-block",
  fontSize: "0.72rem",
  fontWeight: "700",
  letterSpacing: "4px",
  textTransform: "uppercase",
  backgroundColor: "rgba(255,255,255,0.1)",
  padding: "0.45rem 1.3rem",
  borderRadius: "20px",
  animation: "slide-down 0.5s ease forwards",
  backdropFilter: "blur(8px)",
};

const heroTitleStyle: React.CSSProperties = {
  fontSize: "3.6rem",
  fontWeight: "900",
  margin: "0",
  lineHeight: "1.1",
  color: "#ffffff",
  maxWidth: "820px",
  textShadow: "0 4px 20px rgba(0,0,0,0.4)",
  animation: "fade-up 0.6s cubic-bezier(0.34,1.1,0.64,1) forwards",
};

const heroSubtitleStyle: React.CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: "300",
  margin: "0",
  maxWidth: "560px",
  color: "rgba(255,255,255,0.85)",
  lineHeight: "1.7",
  animation: "fade-up 0.6s cubic-bezier(0.34,1.1,0.64,1) 0.1s both",
};

const heroButtonStyle: React.CSSProperties = {
  marginTop: "0.5rem",
  padding: "14px 44px",
  fontSize: "1rem",
  fontWeight: "700",
  backgroundColor: "#4790fd",
  color: "#fff",
  border: "none",
  borderRadius: "50px",
  cursor: "pointer",
  letterSpacing: "0.5px",
  animation: "fade-up 0.6s cubic-bezier(0.34,1.1,0.64,1) 0.2s both",
};

const arrowButtonStyle: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  backgroundColor: "rgba(255,255,255,0.12)",
  backdropFilter: "blur(8px)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.25)",
  fontSize: "2rem",
  width: "50px",
  height: "50px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  zIndex: 10,
  borderRadius: "50%",
  transition: "all 0.25s ease",
};

const dotsContainerStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "28px",
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: "0.6rem",
  zIndex: 10,
  alignItems: "center",
};

const dotStyle: React.CSSProperties = {
  height: "8px",
  border: "none",
  cursor: "pointer",
  transition: "all 0.35s ease",
  padding: 0,
};

const mainStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "0 2rem",
};

const statsRowStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "1100px",
  display: "flex",
  gap: "1.5rem",
  justifyContent: "center",
  flexWrap: "wrap",
  margin: "5rem auto 0",
};

const statCardWrapStyle: React.CSSProperties = {
  flex: "1",
  minWidth: "200px",
  maxWidth: "240px",
};

const statCardInnerStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "20px",
  padding: "2rem 1.5rem",
  textAlign: "center",
  border: "1px solid #eee",
  boxShadow: "0 8px 30px rgba(0,0,0,0.07)",
};

const statNumberStyle: React.CSSProperties = {
  fontSize: "2.8rem",
  fontWeight: "900",
  color: "#4790fd",
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums",
};

const statLabelStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "#888",
  marginTop: "0.5rem",
  fontWeight: "500",
  letterSpacing: "0.5px",
};

const projectsSectionStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "2.6rem",
  width: "100%",
  maxWidth: "1100px",
  marginTop: "6rem",
  padding: "0 1rem",
  flexWrap: "wrap",
};

const projectsLeftStyle: React.CSSProperties = { flexShrink: 0 };

const projectsHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  marginBottom: "2rem",
};

const gridIconStyle: React.CSSProperties = { width: "24px", height: "24px" };

const projectsLabelStyle: React.CSSProperties = {
  fontWeight: "700",
  fontSize: "1rem",
  color: "#333",
};

const collectionImageStyle: React.CSSProperties = {
  width: "200px",
  height: "auto",
  display: "block",
  borderRadius: "15px",
};

const projectsRightStyle: React.CSSProperties = {
  flexShrink: 0,
  maxWidth: "560px",
};

const projectsTitleStyle: React.CSSProperties = {
  fontSize: "2.4rem",
  fontWeight: "800",
  color: "#1a1a1a",
  margin: "0 0 1rem",
  lineHeight: 1.2,
};

const projectsDescStyle: React.CSSProperties = {
  fontSize: "1.4rem",
  color: "#666",
  lineHeight: "1.85",
  margin: 0,
};

const slidersSectionStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "1200px",
  marginTop: "7rem",
};

const sliderHeaderStyle: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "3rem",
};

const sectionBadgeStyle: React.CSSProperties = {
  display: "inline-block",
  fontSize: "0.72rem",
  fontWeight: "700",
  letterSpacing: "4px",
  textTransform: "uppercase",
  color: "#4790fd",
  marginBottom: "0.8rem",
  background: "rgba(71,144,253,0.1)",
  padding: "0.3rem 0.9rem",
  borderRadius: "20px",
  border: "1px solid rgba(71,144,253,0.2)",
};

const sliderTitleStyle: React.CSSProperties = {
  fontSize: "2.4rem",
  fontWeight: "900",
  color: "#1a1a1a",
  margin: "0 auto",
  maxWidth: "700px",
  lineHeight: 1.2,
};

const sliderSubtitleStyle: React.CSSProperties = {
  color: "#888",
  marginTop: "0.75rem",
  fontSize: "1rem",
};

const slidersRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "2rem",
  justifyContent: "center",
  flexWrap: "wrap",
};

const sliderContainerStyle: React.CSSProperties = {
  position: "relative",
  width: "calc(50% - 1rem)",
  maxWidth: "560px",
  height: "420px",
  overflow: "hidden",
  borderRadius: "16px",
  cursor: "col-resize",
  touchAction: "none",
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
};

const sliderImgBaseStyle: React.CSSProperties = {
  position: "absolute",
  width: "100%",
  height: "100%",
  objectFit: "cover",
  top: 0,
  left: 0,
  userSelect: "none",
};

const sliderAfterContainerStyle: React.CSSProperties = {
  position: "absolute",
  height: "100%",
  overflow: "hidden",
  top: 0,
  left: 0,
};

const sliderAfterImgStyle: React.CSSProperties = {
  width: "560px",
  height: "100%",
  objectFit: "cover",
  userSelect: "none",
};

const sliderLabelStyle: React.CSSProperties = {
  position: "absolute",
  top: "14px",
  zIndex: 5,
  background: "rgba(0,0,0,0.55)",
  backdropFilter: "blur(4px)",
  color: "#fff",
  fontSize: "0.7rem",
  fontWeight: "700",
  letterSpacing: "2px",
  padding: "4px 10px",
  borderRadius: "20px",
  textTransform: "uppercase",
  pointerEvents: "none",
  transition: "opacity 0.3s",
};

const sliderDividerStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  bottom: 0,
  width: "2px",
  background: "rgba(255,255,255,0.8)",
  transform: "translateX(-50%)",
  zIndex: 3,
  pointerEvents: "none",
};

const sliderHandleStyle: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  width: "46px",
  height: "46px",
  backgroundColor: "#d3e5fd",
  borderRadius: "50%",
  cursor: "col-resize",
  transform: "translate(-50%, -50%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.4rem",
  zIndex: 4,
  boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
};

const sliderArrowStyle: React.CSSProperties = {
  width: "14px",
  height: "22px",
  objectFit: "contain",
  pointerEvents: "none",
};

const stylesSectionStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "1200px",
  marginTop: "8rem",
};

const stylesHeaderStyle: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "2.5rem",
};

const stylesTitleStyle: React.CSSProperties = {
  fontSize: "2.6rem",
  fontWeight: "900",
  color: "#1a1a1a",
  margin: 0,
};

const tabsRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "0.6rem",
  justifyContent: "center",
  flexWrap: "wrap",
  marginBottom: "2.5rem",
};

const showcasePanelStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "24px",
  overflow: "hidden",
  boxShadow: "0 24px 80px rgba(0,0,0,0.14)",
  display: "flex",
  minHeight: "460px",
};

const showcaseImageSideStyle: React.CSSProperties = {
  flex: "1.1",
  position: "relative",
  overflow: "hidden",
  minHeight: "400px",
};

const showcaseImgStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
  transition: "opacity 0.3s ease",
  minHeight: "400px",
};

const showcaseTintStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  transition: "background 0.4s ease",
};

const showcaseTextSideStyle: React.CSSProperties = {
  flex: "1",
  background: "#fafafa",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: "3.5rem",
  gap: "1.5rem",
};

const styleColorBadgeStyle: React.CSSProperties = {
  display: "inline-block",
  width: "fit-content",
  fontSize: "0.72rem",
  fontWeight: "700",
  letterSpacing: "3px",
  textTransform: "uppercase",
  padding: "0.35rem 0.9rem",
  borderRadius: "20px",
  transition: "all 0.3s ease",
};

const showcaseHeadingStyle: React.CSSProperties = {
  fontSize: "2rem",
  fontWeight: "800",
  color: "#1a1a1a",
  margin: 0,
  lineHeight: 1.2,
  transition: "opacity 0.3s ease, transform 0.3s ease",
};

const showcaseDescStyle: React.CSSProperties = {
  fontSize: "1rem",
  color: "#666",
  lineHeight: "1.85",
  margin: 0,
  transition: "opacity 0.35s ease 0.05s",
};

const showcaseButtonStyle: React.CSSProperties = {
  width: "fit-content",
  padding: "12px 28px",
  fontSize: "0.9rem",
  fontWeight: "600",
  color: "#fff",
  border: "none",
  borderRadius: "50px",
  cursor: "pointer",
  transition: "all 0.25s ease",
  letterSpacing: "0.3px",
};

const ctaSectionStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "1100px",
  margin: "7rem 0 5rem",
  borderRadius: "28px",
  background: "linear-gradient(135deg, #1a3a6f 0%, #0d2040 50%, #1a1a3e 100%)",
  padding: "5rem 3rem",
  textAlign: "center",
  boxShadow: "0 30px 90px rgba(71,144,253,0.25)",
  position: "relative",
  overflow: "hidden",
};

const ctaOrb1Style: React.CSSProperties = {
  position: "absolute",
  width: "300px",
  height: "300px",
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(71,144,253,0.25) 0%, transparent 70%)",
  top: "-80px",
  right: "-60px",
  pointerEvents: "none",
};

const ctaOrb2Style: React.CSSProperties = {
  position: "absolute",
  width: "200px",
  height: "200px",
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(138,180,255,0.15) 0%, transparent 70%)",
  bottom: "-50px",
  left: "5%",
  pointerEvents: "none",
};

const ctaContentStyle: React.CSSProperties = { position: "relative", zIndex: 1 };

const ctaBadgeStyle: React.CSSProperties = {
  display: "inline-block",
  fontSize: "0.72rem",
  fontWeight: "700",
  letterSpacing: "4px",
  textTransform: "uppercase",
  color: "#7ab4ff",
  marginBottom: "1.2rem",
  background: "rgba(71,144,253,0.15)",
  padding: "0.35rem 1rem",
  borderRadius: "20px",
  border: "1px solid rgba(71,144,253,0.3)",
};

const ctaTitleStyle: React.CSSProperties = {
  fontSize: "3rem",
  fontWeight: "900",
  color: "#fff",
  margin: "0 0 1rem",
  lineHeight: 1.15,
  maxWidth: "700px",
  marginLeft: "auto",
  marginRight: "auto",
};

const ctaDescStyle: React.CSSProperties = {
  fontSize: "1.1rem",
  color: "rgba(255,255,255,0.7)",
  maxWidth: "520px",
  margin: "0 auto 2.5rem",
  lineHeight: 1.7,
};

const ctaButtonStyle: React.CSSProperties = {
  padding: "16px 52px",
  fontSize: "1.1rem",
  fontWeight: "700",
  backgroundColor: "#4790fd",
  color: "#fff",
  border: "none",
  borderRadius: "50px",
  cursor: "pointer",
  letterSpacing: "0.5px",
};

export default HomePage;
