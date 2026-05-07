import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";

// ============ HERO SLIDES ============
const heroSlides = [
  {
    id: 1,
    title: "Minimalist Living Redefined",
    subtitle:
      "Discover how AI transforms your spaces into serene, decluttered havens of tranquility",
    style: "Minimalist",
    imageUrl: "/HomePageImages/minimalist.jpg",
  },
  {
    id: 2,
    title: "Modern Design Meets AI Intelligence",
    subtitle:
      "Experience cutting-edge interior transformation powered by artificial intelligence",
    style: "Modern",
    imageUrl: "/HomePageImages/modren.jpg",
  },
  {
    id: 3,
    title: "Scandinavian Simplicity & Elegance",
    subtitle:
      "Create functional, beautiful spaces inspired by Nordic design principles",
    style: "Scandinavian",
    imageUrl: "/HomePageImages/scandinavian.webp",
  },
];

const getSlideIndex = (index: number) =>
  ((index % heroSlides.length) + heroSlides.length) % heroSlides.length;

// ============ BLOG POSTS ============
const blogPosts = [
  {
    id: 1,
    title: "AI Bedroom Design Ideas for Small Spaces",
    description:
      "Limited square footage doesn't mean limited style. Discover how AI analyses your bedroom dimensions and recommends space-saving furniture, strategic mirrors, and light palettes that make any small room feel open and luxurious.",
    tag: "AI Tools",
    roomType: "Bedroom",
    category: "AI Design Tools",
    readTime: "5 min read",
  },
  {
    id: 2,
    title: "Minimalist Living Room Trends in 2026",
    description:
      "Clean lines, intentional objects, and breathing room define 2026's living room aesthetic. We break down the key pieces, colour stories, and layout principles that define today's most serene interiors.",
    tag: "Minimalist",
    roomType: "Living Room",
    category: "Minimalist Design",
    readTime: "4 min read",
  },
  {
    id: 3,
    title: "Scandinavian Kitchen Designs That Feel Warm & Modern",
    description:
      "Nordic kitchens have mastered the art of warmth through restraint. Explore pale wood tones, integrated appliances, and simple hardware choices that make a Scandinavian kitchen both timeless and deeply inviting.",
    tag: "Scandinavian",
    roomType: "Kitchen",
    category: "Scandinavian Style",
    readTime: "6 min read",
  },
  {
    id: 4,
    title: "Spa-Inspired Bathroom Ideas Using AI",
    description:
      "Your bathroom can be a daily sanctuary. See how AI maps your existing layout and suggests stone textures, rainfall fixtures, and ambient lighting schemes that recreate a five-star spa experience at home.",
    tag: "Wellness",
    roomType: "Bathroom",
    category: "Wellness Design",
    readTime: "5 min read",
  },
  {
    id: 5,
    title: "How AI Can Transform Empty Rooms Into Luxury Spaces",
    description:
      "A blank room is a canvas. AI-powered rendering fills it with curated furniture clusters, art placement, and accent lighting before you spend a single dollar — eliminating costly trial and error.",
    tag: "AI Tools",
    roomType: "Living Room",
    category: "AI Design Tools",
    readTime: "7 min read",
  },
  {
    id: 6,
    title: "Best Color Palettes for Modern Interiors",
    description:
      "From warm greiges to deep forest greens, colour sets the emotional tone of every room. We share the palettes dominating modern interiors this year and explain how AI picks the right one for your light conditions.",
    tag: "Modern",
    roomType: "Living Room",
    category: "Modern Design",
    readTime: "4 min read",
  },
  {
    id: 7,
    title: "AI Furniture Placement Tips for Better Space Optimization",
    description:
      "Furniture arrangement is a science. AI calculates traffic flow, focal points, and natural light paths to suggest layouts that make rooms feel larger, more functional, and visually balanced.",
    tag: "AI Tools",
    roomType: "Living Room",
    category: "AI Design Tools",
    readTime: "6 min read",
  },
  {
    id: 8,
    title: "Bohemian Living Room Ideas With Natural Textures",
    description:
      "Rattan, jute, linen, and terracotta — bohemian design thrives on layered natural materials. Learn how to build an eclectic yet cohesive living room that feels well-travelled and deeply personal.",
    tag: "Bohemian",
    roomType: "Living Room",
    category: "Bohemian Vibes",
    readTime: "5 min read",
  },
  {
    id: 9,
    title: "Industrial Kitchen Designs With Modern Elegance",
    description:
      "Raw concrete, exposed steel, and warm Edison bulbs meet sleek cabinetry in the industrial-modern kitchen. Discover how to balance rugged character with refined finish for a space that's tough and beautiful.",
    tag: "Industrial",
    roomType: "Kitchen",
    category: "Industrial Design",
    readTime: "5 min read",
  },
  {
    id: 10,
    title: "Top Interior Design Mistakes AI Can Help Avoid",
    description:
      "From scale errors to lighting oversights, even experienced decorators make predictable mistakes. See the ten most common design pitfalls and how AI catches them before they become expensive regrets.",
    tag: "AI Tools",
    roomType: "Living Room",
    category: "AI Design Tools",
    readTime: "8 min read",
  },
];

// ============ ROOM TYPES ============
const roomTypes = [
  {
    id: 1,
    label: "Bedroom",
    icon: "🛏",
    description:
      "Your personal retreat. Explore layouts, lighting, and style guides to craft a bedroom that restores and inspires.",
    postCount: 3,
    imageUrl: "/BlogPageImages/bedrom.jpg",
  },
  {
    id: 2,
    label: "Living Room",
    icon: "🛋",
    description:
      "The heart of the home. Discover furniture arrangements, colour palettes, and AI-driven ideas to elevate every gathering.",
    postCount: 3,
    imageUrl: "/BlogPageImages/livingroom.jpg",
  },
  {
    id: 3,
    label: "Kitchen",
    icon: "🍳",
    description:
      "Where function meets beauty. Unlock smart storage, layout optimisation, and Nordic-inspired culinary spaces.",
    postCount: 2,
    imageUrl: "/BlogPageImages/kitchen.jpg",
  },
  {
    id: 4,
    label: "Bathroom",
    icon: "🚿",
    description:
      "Turn your daily routine into a spa ritual. Browse calming materials, soft lighting, and wellness-first design.",
    postCount: 2,
    imageUrl: "/BlogPageImages/bathroom.jpg",
  },
];

// ============ CATEGORIES ============
const categories = [
  "All",
  "AI Design Tools",
  "Minimalist Design",
  "Modern Design",
  "Scandinavian Style",
  "Industrial Design",
  "Bohemian Vibes",
  "Wellness Design",
];

// ============ BLOG COMPONENT ============
function Blog() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isHovering, setIsHovering] = useState(false);

  // Auto-slide effect
  useEffect(() => {
    if (isHovering) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isHovering]);

  const filteredPosts =
    selectedCategory === "All"
      ? blogPosts
      : blogPosts.filter((post) => post.category === selectedCategory);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const goPrev = () => setCurrentSlide(getSlideIndex(currentSlide - 1));
  const goNext = () => setCurrentSlide(getSlideIndex(currentSlide + 1));

  return (
    <div style={styles.container} className="blog-container">
      <style>{`
        /* ── DARK MODE ── */
        [data-theme="dark"] .blog-container {
          background-color: #252525 !important;
        }

        /* Separators */
        .blog-separator {
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #c9a882, #e8d5c0);
          border-radius: 999px;
          margin: 0 auto;
          opacity: 0.7;
        }
        [data-theme="dark"] .blog-separator {
          background: linear-gradient(90deg, #c9a882, #8a6a4e) !important;
          opacity: 0.5 !important;
        }

        /* Room types section */
        [data-theme="dark"] .blog-room-section {
          background-color: transparent !important;
        }
        [data-theme="dark"] .blog-room-eyebrow {
          color: #c9a882 !important;
        }
        [data-theme="dark"] .blog-room-title,
        [data-theme="dark"] .blog-room-subtitle {
          color: #f0f0f0 !important;
        }
        [data-theme="dark"] .room-card {
          background-color: #383838 !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.35) !important;
        }
        [data-theme="dark"] .room-card-title {
          color: #ffffff !important;
        }
        [data-theme="dark"] .room-card-desc {
          color: #aaa !important;
        }
        [data-theme="dark"] .room-card-footer {
          border-color: #4a4a4a !important;
        }
        [data-theme="dark"] .room-card-count,
        [data-theme="dark"] .room-card-arrow {
          color: #c9a882 !important;
        }

        /* Blog header */
        [data-theme="dark"] .blog-header-section {
          background-color: transparent !important;
        }
        [data-theme="dark"] .blog-eyebrow {
          color: #c9a882 !important;
        }
        [data-theme="dark"] .blog-heading {
          color: #ffffff !important;
        }
        [data-theme="dark"] .blog-subheading {
          color: #aaa !important;
        }

        /* Category filter */
        [data-theme="dark"] .blog-category-section {
          background-color: transparent !important;
        }
        [data-theme="dark"] .blog-cat-btn {
          border-color: #4a4a4a !important;
          color: #bbb !important;
          background-color: transparent !important;
        }
        [data-theme="dark"] .blog-cat-btn.active {
          background-color: #f0f0f0 !important;
          color: #1e1e1e !important;
          border-color: #f0f0f0 !important;
        }

        /* Posts section */
        [data-theme="dark"] .blog-posts-section {
          background-color: transparent !important;
        }
        [data-theme="dark"] .blog-post-card {
          background-color: #383838 !important;
          box-shadow: 0 2px 12px rgba(0,0,0,0.4) !important;
        }

        /* Placeholder image area — keep it darker in dark mode,
           icon stays semi-transparent, tag badge white text on dark bg */
        [data-theme="dark"] .post-img-placeholder {
          background-color: #2e2e2e !important;
        }
        /* Tag badge: dark bg in light mode → keep white text always */

        /* Post body text */
        [data-theme="dark"] .post-room-type {
          color: #c9a882 !important;
        }
        [data-theme="dark"] .post-dot {
          color: #555 !important;
        }
        [data-theme="dark"] .post-read-time {
          color: #888 !important;
        }
        [data-theme="dark"] .post-title-text {
          color: #ffffff !important;
        }
        [data-theme="dark"] .post-desc-text {
          color: #aaa !important;
        }
        [data-theme="dark"] .post-read-more {
          color: #f0f0f0 !important;
        }

        /* Empty state */
        [data-theme="dark"] .blog-empty-state {
          color: #777 !important;
        }
      `}</style>
      <TopBar showSignIn={true} />

      <main style={styles.mainContent}>
        {/* HERO CAROUSEL */}
        <section style={styles.heroSection}>
          <div
            style={styles.carouselContainer}
            data-hero-carousel
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Stacked slides — fade via opacity */}
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${slide.imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: index === currentSlide ? 1 : 0,
                  transition: "opacity 0.9s ease",
                }}
              />
            ))}

            {/* Gradient overlay */}
            <div style={styles.overlay} />

            {/* Slide content */}
            <div style={styles.slideContent}>
              <span style={styles.heroStyle}>
                {heroSlides[currentSlide].style}
              </span>
              <h1 style={styles.heroTitle}>{heroSlides[currentSlide].title}</h1>
              <p style={styles.heroSubtitle}>
                {heroSlides[currentSlide].subtitle}
              </p>
            </div>

            {/* Prev arrow */}
            <button
              style={{ ...styles.arrowButton, left: "24px" }}
              onClick={goPrev}
              aria-label="Previous slide"
            >
              ‹
            </button>

            {/* Next arrow */}
            <button
              style={{ ...styles.arrowButton, right: "24px" }}
              onClick={goNext}
              aria-label="Next slide"
            >
              ›
            </button>

            {/* Dot indicators */}
            <div style={styles.dotsContainer}>
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  style={{
                    ...styles.dot,
                    width: index === currentSlide ? "28px" : "10px",
                    borderRadius: index === currentSlide ? "5px" : "50%",
                    backgroundColor:
                      index === currentSlide ? "#fff" : "rgba(255,255,255,0.5)",
                  }}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* SEPARATOR */}
        <div className="blog-separator" />

        {/* ROOM TYPES SECTION */}
        <section style={styles.roomTypesSection} className="blog-room-section">
          <div style={styles.roomTypesHeader}>
            <p style={styles.roomTypesEyebrow} className="blog-room-eyebrow">Explore by Space</p>
            <h2 style={styles.roomTypesTitle} className="blog-room-title">Every Room, Reimagined</h2>
            <p style={styles.roomTypesSubtitle} className="blog-room-subtitle">
              Pick a room type to discover tailored design ideas, AI
              transformations, and expert tips curated just for that space.
            </p>
          </div>
          <div style={styles.roomTypesGrid}>
            {roomTypes.map((room) => (
              <div
                key={room.id}
                style={styles.roomCard}
                className="room-card"
                onMouseEnter={(e) => {
                  const card = e.currentTarget;
                  card.style.transform = "translateY(-8px)";
                  card.style.boxShadow = "0 20px 48px rgba(0,0,0,0.28)";
                }}
                onMouseLeave={(e) => {
                  const card = e.currentTarget;
                  card.style.transform = "translateY(0)";
                  card.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
                }}
              >
                <div
                  style={{
                    ...styles.roomCardImage,
                    backgroundImage: `url(${room.imageUrl})`,
                  }}
                >
                  <div style={styles.roomCardOverlay} />
                  <span style={styles.roomCardIcon}>{room.icon}</span>
                </div>
                <div style={styles.roomCardBody}>
                  <h3 style={styles.roomCardTitle} className="room-card-title">{room.label}</h3>
                  <p style={styles.roomCardDesc} className="room-card-desc">{room.description}</p>
                  <div style={styles.roomCardFooter} className="room-card-footer">
                    <span style={styles.roomCardCount} className="room-card-count">
                      {room.postCount} articles
                    </span>
                    <span style={styles.roomCardArrow} className="room-card-arrow">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SEPARATOR */}
        <div className="blog-separator" />

        {/* BLOG HEADER */}
        <section style={styles.blogHeader} className="blog-header-section">
          <p style={styles.blogEyebrow} className="blog-eyebrow">From Our Journal</p>
          <h2 style={styles.blogTitle} className="blog-heading">AI Interior Design Insights</h2>
          <p style={styles.blogSubtitle} className="blog-subheading">
            Curated articles on modern design, minimalism, and the AI tools
            reshaping how we think about our homes.
          </p>
        </section>

        {/* CATEGORY FILTER */}
        <section style={styles.categorySection} className="blog-category-section" data-static-colors>
          <div style={styles.categoryContainer}>
            {categories.map((category) => (
              <button
                key={category}
                className={`blog-cat-btn${selectedCategory === category ? " active" : ""}`}
                style={{
                  ...styles.categoryButton,
                  backgroundColor:
                    selectedCategory === category ? "#1e1e1e" : "transparent",
                  color: selectedCategory === category ? "#fff" : "#555",
                  borderColor:
                    selectedCategory === category ? "#1e1e1e" : "#ddd",
                }}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* BLOG POSTS GRID */}
        <section style={styles.postsSection} className="blog-posts-section" data-static-colors>
          <div style={styles.postsGrid}>
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                style={styles.postCard}
                className="blog-post-card"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 40px rgba(0,0,0,0.25)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)";
                }}
              >
                {/* Placeholder image area */}
                <div style={styles.postImageWrapper}>
                  <div style={styles.postImagePlaceholder} className="post-img-placeholder">
                    <span style={styles.postImageIcon}>
                      {post.roomType === "Bedroom" ? "🛏" :
                       post.roomType === "Living Room" ? "🛋" :
                       post.roomType === "Kitchen" ? "🍳" :
                       post.roomType === "Bathroom" ? "🚿" : "🏠"}
                    </span>
                  </div>
                  <span style={styles.tagBadge}>{post.tag}</span>
                </div>

                <div style={styles.postContent}>
                  <div style={styles.postMeta}>
                    <span style={styles.postRoomType} className="post-room-type">{post.roomType}</span>
                    <span style={styles.postDot} className="post-dot">·</span>
                    <span style={styles.postReadTime} className="post-read-time">{post.readTime}</span>
                  </div>
                  <h3 style={styles.postTitle} className="post-title-text">{post.title}</h3>
                  <p style={styles.postDescription} className="post-desc-text">{post.description}</p>
                  <button style={styles.readMoreButton} className="post-read-more">
                    Read Article <span style={styles.readMoreArrow}>→</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* EMPTY STATE */}
        {filteredPosts.length === 0 && (
          <div style={styles.emptyState} className="blog-empty-state">
            <p>No articles in this category yet. Try another filter.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

// ============ STYLES ============
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#f9f7f4",
  } as CSSProperties,
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "3rem",
    padding: "0",
  } as CSSProperties,

  // HERO SECTION
  heroSection: {
    width: "100%",
  } as CSSProperties,
  carouselContainer: {
    position: "relative",
    width: "100%",
    height: "580px",
    overflow: "hidden",
  } as CSSProperties,
  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.1) 100%)",
    zIndex: 1,
  } as CSSProperties,
  slideContent: {
    position: "absolute",
    top: "0",
    bottom: "0",
    left: "0",
    right: "0",
    zIndex: 2,
    padding: "0 6rem",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
  } as CSSProperties,
  heroStyle: {
    display: "inline-block",
    fontSize: "0.75rem",
    fontWeight: "700",
    letterSpacing: "3px",
    textTransform: "uppercase",
    color: "#ffffff",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    border: "1px solid rgba(255,255,255,0.35)",
    padding: "0.4rem 1.1rem",
    borderRadius: "20px",
  } as CSSProperties,
  heroTitle: {
    fontSize: "3.4rem",
    fontWeight: "800",
    margin: "0",
    lineHeight: "1.15",
    color: "#ffffff",
    maxWidth: "800px",
    textShadow: "0 2px 12px rgba(0,0,0,0.3)",
  } as CSSProperties,
  heroSubtitle: {
    fontSize: "1.1rem",
    fontWeight: "300",
    margin: "0",
    maxWidth: "580px",
    color: "rgba(255,255,255,0.88)",
    lineHeight: "1.65",
  } as CSSProperties,
  arrowButton: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(6px)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.25)",
    fontSize: "2rem",
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 10,
    borderRadius: "50%",
    lineHeight: "1",
    transition: "background-color 0.25s ease",
  } as CSSProperties,
  dotsContainer: {
    position: "absolute",
    bottom: "28px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "0.6rem",
    zIndex: 10,
    alignItems: "center",
  } as CSSProperties,
  dot: {
    height: "10px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.35s ease",
  } as CSSProperties,

  // BLOG HEADER
  blogHeader: {
    textAlign: "center",
    padding: "5rem 2rem 3rem",
    backgroundColor: "transparent",
  } as CSSProperties,
  blogEyebrow: {
    fontSize: "0.75rem",
    fontWeight: "700",
    letterSpacing: "3px",
    textTransform: "uppercase",
    color: "#a0856c",
    margin: "0 0 0.75rem",
  } as CSSProperties,
  blogTitle: {
    fontSize: "2.4rem",
    fontWeight: "800",
    color: "#1e1e1e",
    margin: "0 0 1rem",
    lineHeight: "1.2",
  } as CSSProperties,
  blogSubtitle: {
    fontSize: "1.05rem",
    color: "#666",
    maxWidth: "560px",
    margin: "0 auto",
    lineHeight: "1.7",
  } as CSSProperties,

  // CATEGORY FILTER
  categorySection: {
    padding: "0 2rem 2.5rem",
    backgroundColor: "transparent",
  } as CSSProperties,
  categoryContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "0.6rem",
    maxWidth: "1200px",
    margin: "0 auto",
  } as CSSProperties,
  categoryButton: {
    padding: "0.55rem 1.2rem",
    border: "1px solid #ddd",
    borderRadius: "999px",
    fontSize: "0.88rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.25s ease",
    letterSpacing: "0.2px",
  } as CSSProperties,

  // BLOG POSTS
  postsSection: {
    padding: "0 2rem 5rem",
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
  } as CSSProperties,
  postsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "2rem",
  } as CSSProperties,
  postCard: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
  } as CSSProperties,
  postImageWrapper: {
    position: "relative",
    width: "100%",
    height: "200px",
    overflow: "hidden",
  } as CSSProperties,
  postImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0ede8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as CSSProperties,
  postImageIcon: {
    fontSize: "3.5rem",
    opacity: 0.5,
  } as CSSProperties,
  postImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s ease",
  } as CSSProperties,
  tagBadge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    backgroundColor: "#1e1e1e",
    color: "#fff",
    padding: "0.35rem 0.85rem",
    borderRadius: "999px",
    fontSize: "0.72rem",
    fontWeight: "700",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
  } as CSSProperties,
  postContent: {
    padding: "1.6rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.7rem",
    flex: 1,
  } as CSSProperties,
  postMeta: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
  } as CSSProperties,
  postRoomType: {
    fontSize: "0.78rem",
    fontWeight: "600",
    color: "#a0856c",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  } as CSSProperties,
  postDot: {
    fontSize: "0.78rem",
    color: "#ccc",
  } as CSSProperties,
  postReadTime: {
    fontSize: "0.78rem",
    color: "#aaa",
    fontWeight: "400",
  } as CSSProperties,
  postTitle: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#1e1e1e",
    margin: "0",
    lineHeight: "1.4",
  } as CSSProperties,
  postDescription: {
    fontSize: "0.9rem",
    color: "#777",
    margin: "0",
    lineHeight: "1.65",
    flex: 1,
  } as CSSProperties,
  readMoreButton: {
    alignSelf: "flex-start",
    backgroundColor: "transparent",
    border: "none",
    color: "#1e1e1e",
    fontWeight: "600",
    fontSize: "0.88rem",
    cursor: "pointer",
    padding: "0",
    marginTop: "0.4rem",
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
    transition: "color 0.2s ease",
  } as CSSProperties,
  readMoreArrow: {
    fontSize: "1rem",
    transition: "transform 0.2s ease",
  } as CSSProperties,

  // ROOM TYPES SECTION
  roomTypesSection: {
    backgroundColor: "transparent",
    padding: "5rem 2rem",
  } as CSSProperties,
  roomTypesHeader: {
    textAlign: "center",
    maxWidth: "620px",
    margin: "0 auto 3.5rem",
  } as CSSProperties,
  roomTypesEyebrow: {
    fontSize: "0.75rem",
    fontWeight: "700",
    letterSpacing: "3px",
    textTransform: "uppercase",
    color: "#a0856c",
    margin: "0 0 0.75rem",
  } as CSSProperties,
  roomTypesTitle: {
    fontSize: "2.4rem",
    fontWeight: "800",
    color: "#1e1e1e",
    margin: "0 0 1rem",
    lineHeight: "1.2",
  } as CSSProperties,
  roomTypesSubtitle: {
    fontSize: "1.05rem",
    color: "#666",
    lineHeight: "1.7",
    margin: "0",
  } as CSSProperties,
  roomTypesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1.5rem",
    maxWidth: "1200px",
    margin: "0 auto",
  } as CSSProperties,
  roomCard: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    display: "flex",
    flexDirection: "column",
  } as CSSProperties,
  roomCardImage: {
    position: "relative",
    height: "200px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "flex-start",
  } as CSSProperties,
  roomCardOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 60%)",
    borderRadius: "0",
  } as CSSProperties,
  roomCardIcon: {
    position: "relative",
    zIndex: 1,
    fontSize: "2rem",
    padding: "0.8rem 1rem",
    lineHeight: "1",
  } as CSSProperties,
  roomCardBody: {
    padding: "1.4rem 1.4rem 1.6rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
    flex: 1,
  } as CSSProperties,
  roomCardTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#1e1e1e",
    margin: "0",
  } as CSSProperties,
  roomCardDesc: {
    fontSize: "0.88rem",
    color: "#777",
    lineHeight: "1.65",
    margin: "0",
    flex: 1,
  } as CSSProperties,
  roomCardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "0.8rem",
    paddingTop: "0.8rem",
    borderTop: "1px solid #f0ede8",
  } as CSSProperties,
  roomCardCount: {
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#a0856c",
    letterSpacing: "0.5px",
  } as CSSProperties,
  roomCardArrow: {
    fontSize: "1.1rem",
    color: "#a0856c",
    fontWeight: "700",
    transition: "transform 0.2s ease",
  } as CSSProperties,

  // EMPTY STATE
  emptyState: {
    textAlign: "center",
    padding: "3rem 2rem",
    color: "#999",
    fontSize: "1.1rem",
  } as CSSProperties,
};

export default Blog;
