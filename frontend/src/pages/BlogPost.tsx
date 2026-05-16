import type { CSSProperties } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { blogPosts } from "../data/blogData";


function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const post = blogPosts.find((p) => p.id === Number(id));

  if (!post) {
    return (
      <div style={styles.container} className="blogpost-container">
        <TopBar showSignIn={true} />
        <main style={styles.notFound}>
          <p style={styles.notFoundText}>Article not found.</p>
          <button style={styles.backBtn} onClick={() => navigate("/blog")}>
            ← Back to Blog
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={styles.container} className="blogpost-container">
      <style>{`
        [data-theme="dark"] .blogpost-container {
          background-color: #252525 !important;
        }
        [data-theme="dark"] .bp-back-btn {
          color: #c9a882 !important;
          border-color: #4a4a4a !important;
        }
        [data-theme="dark"] .bp-back-btn:hover {
          background-color: #333 !important;
        }
        [data-theme="dark"] .bp-tag {
          background-color: #383838 !important;
          color: #c9a882 !important;
          border-color: #4a4a4a !important;
        }
        [data-theme="dark"] .bp-room {
          color: #c9a882 !important;
        }
        [data-theme="dark"] .bp-title {
          color: #ffffff !important;
        }
        [data-theme="dark"] .bp-desc {
          color: #bbb !important;
        }
        [data-theme="dark"] .bp-divider {
          border-color: #3a3a3a !important;
        }
        [data-theme="dark"] .bp-section-heading {
          color: #f0f0f0 !important;
        }
        [data-theme="dark"] .bp-section-body {
          color: #aaa !important;
        }
        [data-theme="dark"] .bp-nav-footer {
          border-color: #3a3a3a !important;
        }
        [data-theme="dark"] .bp-nav-btn {
          background-color: #383838 !important;
          color: #f0f0f0 !important;
          border-color: #4a4a4a !important;
        }
        [data-theme="dark"] .bp-nav-btn:hover {
          background-color: #444 !important;
        }
        [data-theme="dark"] .bp-nav-label {
          color: #888 !important;
        }
        [data-theme="dark"] .bp-nav-title {
          color: #ddd !important;
        }
        [data-theme="dark"] .bp-icon-placeholder {
          background-color: #2e2e2e !important;
        }
      `}</style>
      <TopBar showSignIn={true} />

      <main style={styles.main}>
        {/* Back button */}
        <div style={styles.backRow}>
          <button
            style={styles.backBtn}
            className="bp-back-btn"
            onClick={() => navigate("/blog")}
          >
            ← Back to Blog
          </button>
        </div>

        <article style={styles.article}>
          {/* Hero image */}
          <div style={styles.heroImage}>
            <img
              src={post.imageUrl}
              alt={post.title}
              style={styles.heroImg}
            />
          </div>

          {/* Meta */}
          <div style={styles.meta}>
            <span style={styles.tag} className="bp-tag">{post.tag}</span>
            <span style={styles.room} className="bp-room">{post.roomType}</span>
          </div>

          {/* Title */}
          <h1 style={styles.title} className="bp-title">{post.title}</h1>

          {/* Description / lead */}
          <p style={styles.description} className="bp-desc">{post.description}</p>

          <hr style={styles.divider} className="bp-divider" />

          {/* Sections */}
          {post.sections.map((section, i) => (
            <section key={i} style={styles.section}>
              <h2 style={styles.sectionHeading} className="bp-section-heading">
                {section.heading}
              </h2>
              {section.body.split("\n\n").map((para, j) => (
                <p key={j} style={styles.sectionBody} className="bp-section-body">
                  {para}
                </p>
              ))}
            </section>
          ))}

          {/* Prev / Next navigation */}
          <div style={styles.navFooter} className="bp-nav-footer">
            {post.id > 1 && (() => {
              const prev = blogPosts.find((p) => p.id === post.id - 1)!;
              return (
                <button
                  style={styles.navBtn}
                  className="bp-nav-btn"
                  onClick={() => navigate(`/blog/${prev.id}`)}
                >
                  <span style={styles.navLabel} className="bp-nav-label">← Previous</span>
                  <span style={styles.navTitle} className="bp-nav-title">{prev.title}</span>
                </button>
              );
            })()}
            <div style={{ flex: 1 }} />
            {post.id < blogPosts.length && (() => {
              const next = blogPosts.find((p) => p.id === post.id + 1)!;
              return (
                <button
                  style={{ ...styles.navBtn, textAlign: "right" }}
                  className="bp-nav-btn"
                  onClick={() => navigate(`/blog/${next.id}`)}
                >
                  <span style={styles.navLabel} className="bp-nav-label">Next →</span>
                  <span style={styles.navTitle} className="bp-nav-title">{next.title}</span>
                </button>
              );
            })()}
          </div>
        </article>
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

  main: {
    flex: 1,
    maxWidth: "1200px",
    width: "100%",
    margin: "0 auto",
    padding: "2rem 2rem 5rem",
  } as CSSProperties,

  notFound: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1.5rem",
    padding: "4rem 2rem",
  } as CSSProperties,

  notFoundText: {
    fontSize: "1.2rem",
    color: "#999",
  } as CSSProperties,

  backRow: {
    marginBottom: "2rem",
  } as CSSProperties,

  backBtn: {
    backgroundColor: "transparent",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "0.5rem 1.1rem",
    fontSize: "0.88rem",
    fontWeight: "600",
    color: "#555",
    cursor: "pointer",
    transition: "all 0.2s ease",
  } as CSSProperties,

  article: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  } as CSSProperties,

  heroImage: {
    width: "100%",
    height: "560px",
    borderRadius: "20px",
    overflow: "hidden",
  } as CSSProperties,

  heroImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  } as CSSProperties,

  meta: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginTop: "0.5rem",
  } as CSSProperties,

  tag: {
    fontSize: "0.72rem",
    fontWeight: "700",
    letterSpacing: "1px",
    textTransform: "uppercase" as const,
    border: "1px solid #ddd",
    borderRadius: "999px",
    padding: "0.3rem 0.9rem",
    backgroundColor: "#fff",
    color: "#555",
  } as CSSProperties,

  room: {
    fontSize: "0.78rem",
    fontWeight: "600",
    color: "#a0856c",
    textTransform: "uppercase" as const,
    letterSpacing: "0.8px",
  } as CSSProperties,

  title: {
    fontSize: "2.4rem",
    fontWeight: "800",
    color: "#1e1e1e",
    lineHeight: "1.2",
    margin: "0",
  } as CSSProperties,

  description: {
    fontSize: "1.1rem",
    color: "#666",
    lineHeight: "1.75",
    margin: "0",
    fontStyle: "italic",
    borderLeft: "3px solid #c9a882",
    paddingLeft: "1.2rem",
  } as CSSProperties,

  divider: {
    border: "none",
    borderTop: "1px solid #ede9e3",
    margin: "0.5rem 0",
  } as CSSProperties,

  section: {
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem",
  } as CSSProperties,

  sectionHeading: {
    fontSize: "1.35rem",
    fontWeight: "700",
    color: "#1e1e1e",
    margin: "0",
    lineHeight: "1.3",
  } as CSSProperties,

  sectionBody: {
    fontSize: "1rem",
    color: "#555",
    lineHeight: "1.85",
    margin: "0",
  } as CSSProperties,

  navFooter: {
    display: "flex",
    alignItems: "stretch",
    gap: "1rem",
    borderTop: "1px solid #ede9e3",
    paddingTop: "2rem",
    marginTop: "1rem",
  } as CSSProperties,

  navBtn: {
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
    maxWidth: "300px",
    backgroundColor: "#fff",
    border: "1px solid #e8e3dc",
    borderRadius: "12px",
    padding: "1rem 1.2rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "left" as const,
  } as CSSProperties,

  navLabel: {
    fontSize: "0.75rem",
    fontWeight: "700",
    letterSpacing: "1px",
    textTransform: "uppercase" as const,
    color: "#aaa",
  } as CSSProperties,

  navTitle: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#333",
    lineHeight: "1.35",
  } as CSSProperties,
};

export default BlogPost;
