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

// Helper function to get slide index with wrapping
const getSlideIndex = (index: number) => {
  return ((index % heroSlides.length) + heroSlides.length) % heroSlides.length;
};

// ============ BLOG POSTS ============
const blogPosts = [
  {
    id: 1,
    title: "The Art of Minimalist Bedroom Design",
    description:
      "Learn how to transform your bedroom into a peaceful sanctuary using minimalist principles. We explore essential furniture, color palettes, and AI-powered layout suggestions to maximize space and comfort.",
    style: "Minimalist",
    roomType: "Bedroom",
    category: "Minimalist Design",
    imageUrl: "/HomePageImages/minimalist.jpg",
  },
  {
    id: 2,
    title: "Modern Living Rooms: AI-Enhanced Layouts",
    description:
      "Discover how artificial intelligence analyzes your living room dimensions and suggests modern furniture arrangements. From smart storage solutions to contemporary color schemes, transform your space effortlessly.",
    style: "Modern",
    roomType: "Living Room",
    category: "AI Design Tools",
    imageUrl: "/HomePageImages/modren.jpg",
  },
  {
    id: 3,
    title: "Scandinavian Kitchen Inspiration",
    description:
      "Nordic design principles meet functionality in the kitchen. Explore light woods, minimalist cabinetry, and timeless layouts that create a warm, inviting culinary space tailored by AI recommendations.",
    style: "Scandinavian",
    roomType: "Kitchen",
    category: "Scandinavian Style",
    imageUrl: "/HomePageImages/scandinavian.webp",
  },
  {
    id: 4,
    title: "Industrial Bedroom: Raw & Refined",
    description:
      "Combine exposed brick, metal accents, and modern comfort in your bedroom. Our AI identifies elements that work harmoniously to create an edgy yet comfortable sanctuary you'll love.",
    style: "Industrial",
    roomType: "Bedroom",
    category: "Industrial Design",
    imageUrl: "/HomePageImages/bedroom_modern_10.jpg",
  },
  {
    id: 5,
    title: "Bohemian Living Room: Express Your Style",
    description:
      "Layer textures, patterns, and eclectic furniture to create a bohemian living space. AI-powered color matching ensures your vibrant collections create harmony rather than chaos.",
    style: "Bohemian",
    roomType: "Living Room",
    category: "Bohemian Vibes",
    imageUrl: "/HomePageImages/bohemian.webp",
  },
  {
    id: 6,
    title: "Spa Bathroom Transformation Guide",
    description:
      "Turn your bathroom into a luxury spa retreat. Discover lighting, materials, and aromatherapy integration—all optimized by AI to create a rejuvenating daily experience.",
    style: "Spa",
    roomType: "Bathroom",
    category: "Wellness Design",
    imageUrl: "/HomePageImages/spa.jpg",
  },
  {
    id: 7,
    title: "Maximizing Space: AI Kitchen Solutions",
    description:
      "Small kitchens deserve smart design. Learn how AI-driven layout optimization reveals hidden storage potential and creates efficient workflows in compact culinary spaces.",
    style: "Modern",
    roomType: "Kitchen",
    category: "Space Optimization",
    imageUrl: "/HomePageImages/after.png",
  },
  {
    id: 8,
    title: "Decluttering Your Bedroom: Step-by-Step",
    description:
      "Our comprehensive guide combines decluttering psychology with AI design analysis. Discover which items to keep, how to organize, and how AI reimagines your newly liberated bedroom.",
    style: "Minimalist",
    roomType: "Bedroom",
    category: "Decluttering Tips",
    imageUrl: "/HomePageImages/bedroom_minimalist_23.jpg",
  },
  {
    id: 9,
    title: "Scandinavian Bathroom Elegance",
    description:
      "Bring Nordic warmth to your bathroom with natural materials and soft lighting. AI guides your selections to balance functionality with serene aesthetics.",
    style: "Scandinavian",
    roomType: "Bathroom",
    category: "Scandinavian Style",
    imageUrl: "/HomePageImages/bedroom_scandinavian_3.jpg",
  },
  {
    id: 10,
    title: "From Chaos to Zen: Living Room Transformation",
    description:
      "Witness real transformations as AI analyzes your current space and recommends furniture, layout, and styling changes. Discover the dramatic before-and-afters that inspire transformation.",
    style: "Minimalist",
    roomType: "Living Room",
    category: "Design Transformations",
    imageUrl: "/HomePageImages/collection.png",
  },
];

// ============ CATEGORIES ============
const categories = [
  "All",
  "Minimalist Design",
  "Modern Design",
  "Scandinavian Style",
  "Industrial Design",
  "Bohemian Vibes",
  "Wellness Design",
  "AI Design Tools",
  "Space Optimization",
  "Decluttering Tips",
  "Design Transformations",
];

// ============ BLOG COMPONENT ============
function Blog() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isHovering, setIsHovering] = useState(false);

  // Auto-slide effect
  useEffect(() => {
    if (isHovering) return; // Pause on hover

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000); // 4 seconds per slide

    return () => clearInterval(interval);
  }, [isHovering]);

  const filteredPosts =
    selectedCategory === "All"
      ? blogPosts
      : blogPosts.filter((post) => post.category === selectedCategory);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Get the three slides to display: previous, current, next
  const prevSlideIndex = getSlideIndex(currentSlide - 1);
  const nextSlideIndex = getSlideIndex(currentSlide + 1);

  return (
    <div style={styles.container}>
      <TopBar showSignIn={true} />

      <main style={styles.mainContent}>
        {/* HERO CAROUSEL SLIDER */}
        <section style={styles.heroSection}>
          <div
            style={styles.carouselContainer}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Carousel wrapper with peek effect */}
            <div style={styles.carouselWrapper}>
              {/* Left slide (half visible) */}
              <div
                style={{
                  ...styles.carouselSlide,
                  ...styles.sideSlide,
                  backgroundImage: `url(${heroSlides[prevSlideIndex].imageUrl})`,
                }}
              >
                <div style={styles.overlay}></div>
              </div>

              {/* Center slide (full visible) */}
              <div
                style={{
                  ...styles.carouselSlide,
                  ...styles.centerSlide,
                  backgroundImage: `url(${heroSlides[currentSlide].imageUrl})`,
                }}
              >
                <div style={styles.overlay}></div>
                {/* Content - only show on center slide */}
                <div style={styles.slideContent}>
                  <h1 style={styles.heroTitle}>
                    {heroSlides[currentSlide].title}
                  </h1>
                  <p style={styles.heroSubtitle}>
                    {heroSlides[currentSlide].subtitle}
                  </p>
                  <span style={styles.heroStyle}>
                    {heroSlides[currentSlide].style}
                  </span>
                </div>
              </div>

              {/* Right slide (half visible) */}
              <div
                style={{
                  ...styles.carouselSlide,
                  ...styles.sideSlide,
                  backgroundImage: `url(${heroSlides[nextSlideIndex].imageUrl})`,
                }}
              >
                <div style={styles.overlay}></div>
              </div>
            </div>

            {/* Dot Indicators */}
            <div style={styles.dotsContainer}>
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  style={{
                    ...styles.dot,
                    opacity: index === currentSlide ? 1 : 0.5,
                    backgroundColor:
                      index === currentSlide ? "#fff" : "rgba(255,255,255,0.6)",
                  }}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* BLOG HEADER */}
        <section style={styles.blogHeader}>
          <h2 style={styles.blogTitle}>AI Interior Design Insights</h2>
          <p style={styles.blogSubtitle}>
            Explore curated content on modern design, minimalism, and AI-powered
            transformations
          </p>
        </section>

        {/* CATEGORY FILTER */}
        <section style={styles.categorySection}>
          <div style={styles.categoryContainer}>
            {categories.map((category) => (
              <button
                key={category}
                style={{
                  ...styles.categoryButton,
                  backgroundColor:
                    selectedCategory === category ? "#333" : "#f0f0f0",
                  color: selectedCategory === category ? "#fff" : "#333",
                }}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* BLOG POSTS GRID */}
        <section style={styles.postsSection}>
          <div style={styles.postsGrid}>
            {filteredPosts.map((post) => (
              <article key={post.id} style={styles.postCard}>
                <div style={styles.postImageWrapper}>
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    style={styles.postImage}
                  />
                  <span style={styles.styleBadge}>{post.style}</span>
                  <span style={styles.roomBadge}>{post.roomType}</span>
                </div>
                <div style={styles.postContent}>
                  <p style={styles.postCategory}>{post.category}</p>
                  <h3 style={styles.postTitle}>{post.title}</h3>
                  <p style={styles.postDescription}>{post.description}</p>
                  <button style={styles.readMoreButton}>Read More →</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* EMPTY STATE */}
        {filteredPosts.length === 0 && (
          <div style={styles.emptyState}>
            <p>No posts found in this category. Try selecting another one!</p>
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
    backgroundColor: "#fafafa",
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
    marginBottom: "2rem",
  } as CSSProperties,
  carouselContainer: {
    position: "relative",
    width: "100%",
    height: "500px",
    overflow: "hidden",
  } as CSSProperties,
  carouselWrapper: {
    display: "flex",
    width: "100%",
    height: "100%",
  } as CSSProperties,
  carouselSlide: {
    position: "relative",
    height: "100%",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  } as CSSProperties,
  sideSlide: {
    width: "25%",
    opacity: 0.7,
  } as CSSProperties,
  centerSlide: {
    width: "50%",
    opacity: 1,
  } as CSSProperties,
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 1,
  } as CSSProperties,
  slideContent: {
    position: "relative",
    zIndex: 2,
    padding: "2rem",
    maxWidth: "90%",
  } as CSSProperties,
  heroTitle: {
    fontSize: "2.8rem",
    fontWeight: "bold",
    margin: "0 0 1rem 0",
    lineHeight: "1.2",
    color: "#ffffff",
  } as CSSProperties,
  heroSubtitle: {
    fontSize: "1.1rem",
    fontWeight: "300",
    margin: "0 0 1.5rem 0",
    maxWidth: "100%",
    opacity: 0.95,
    color: "#ffffff",
    lineHeight: "1.6",
  } as CSSProperties,
  heroStyle: {
    display: "inline-block",
    marginTop: "0.5rem",
    fontSize: "0.85rem",
    fontWeight: "600",
    letterSpacing: "2px",
    textTransform: "uppercase",
    opacity: 0.9,
    color: "#ffffff",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
  } as CSSProperties,
  arrowButton: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "#fff",
    border: "none",
    fontSize: "2.5rem",
    padding: "0.8rem 1.2rem",
    cursor: "pointer",
    zIndex: 10,
    transition: "background-color 0.3s ease, transform 0.2s ease",
    borderRadius: "4px",
    left: "20px",
    lineHeight: "1",
  } as CSSProperties,
  dotsContainer: {
    position: "absolute",
    bottom: "25px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "0.8rem",
    zIndex: 10,
  } as CSSProperties,
  dot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
  } as CSSProperties,

  // BLOG HEADER
  blogHeader: {
    textAlign: "center",
    paddingTop: "3rem",
    paddingBottom: "2rem",
    paddingLeft: "2rem",
    paddingRight: "2rem",
  } as CSSProperties,
  blogTitle: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#333",
    margin: "0 0 1rem 0",
  } as CSSProperties,
  blogSubtitle: {
    fontSize: "1.1rem",
    color: "#666",
    maxWidth: "600px",
    margin: "0 auto",
    lineHeight: "1.6",
  } as CSSProperties,

  // CATEGORY FILTER
  categorySection: {
    padding: "2rem",
    backgroundColor: "#fff",
    borderTop: "1px solid #eee",
    borderBottom: "1px solid #eee",
  } as CSSProperties,
  categoryContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "1rem",
    maxWidth: "1200px",
    margin: "0 auto",
  } as CSSProperties,
  categoryButton: {
    padding: "0.6rem 1.2rem",
    border: "1px solid #ddd",
    borderRadius: "20px",
    fontSize: "0.95rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
  } as CSSProperties,

  // BLOG POSTS
  postsSection: {
    padding: "3rem 2rem",
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
  } as CSSProperties,
  postsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "2rem",
  } as CSSProperties,
  postCard: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    display: "flex",
    flexDirection: "column",
  } as CSSProperties,
  postImageWrapper: {
    position: "relative",
    width: "100%",
    height: "200px",
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  } as CSSProperties,
  postImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s ease",
  } as CSSProperties,
  styleBadge: {
    position: "absolute",
    top: "10px",
    left: "10px",
    backgroundColor: "#333",
    color: "#fff",
    padding: "0.4rem 0.8rem",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: "600",
    textTransform: "uppercase",
  } as CSSProperties,
  roomBadge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    color: "#333",
    padding: "0.4rem 0.8rem",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: "600",
  } as CSSProperties,
  postContent: {
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
    flex: 1,
  } as CSSProperties,
  postCategory: {
    fontSize: "0.85rem",
    color: "#999",
    margin: "0",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "1px",
  } as CSSProperties,
  postTitle: {
    fontSize: "1.3rem",
    fontWeight: "bold",
    color: "#333",
    margin: "0",
    lineHeight: "1.4",
  } as CSSProperties,
  postDescription: {
    fontSize: "0.95rem",
    color: "#666",
    margin: "0",
    lineHeight: "1.6",
    flex: 1,
  } as CSSProperties,
  readMoreButton: {
    alignSelf: "flex-start",
    backgroundColor: "transparent",
    border: "none",
    color: "#333",
    fontWeight: "600",
    fontSize: "0.95rem",
    cursor: "pointer",
    transition: "color 0.3s ease",
    marginTop: "0.5rem",
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
