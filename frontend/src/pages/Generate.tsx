import Layout from "../components/Layout";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { requestTransformation } from "../services/transformationAPI";
import { listProjects, type ProjectSummary } from "../services/projectsAPI";
import { toast } from "react-toastify";

function Generate() {
  const location = useLocation();
  const [roomType, setRoomType] = useState("Bedroom");
  const [customRoomType, setCustomRoomType] = useState("");
  const [assignProject, setAssignProject] = useState("N/A");
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Minimalist");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("Analyzing your room...");
  const [showProgress, setShowProgress] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number | null>(null);
  const progressStartRef = useRef<number>(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const getStage = (p: number) => {
    if (p >= 100) return "Done!";
    if (p < 20) return "Analyzing your room...";
    if (p < 45) return "Detecting objects and clutter...";
    if (p < 65) return "Applying minimalist style...";
    return "Finalizing your design...";
  };

  const startProgressLoop = () => {
    setShowProgress(true);
    setIsFadingOut(false);
    setIsJumping(false);
    setProgress(0);
    setStage("Analyzing your room...");
    progressStartRef.current = performance.now();

    const tick = () => {
      const elapsed = (performance.now() - progressStartRef.current) / 1000;
      let p: number;
      if (elapsed < 13) {
        const t = elapsed / 13;
        p = 78 * (1 - Math.pow(1 - t, 3));
      } else {
        p = 78 + (1 - Math.exp(-(elapsed - 13) / 18));
      }
      p = Math.min(p, 79);
      setProgress(p);
      setStage(getStage(p));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const stopProgressLoop = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await listProjects();
        if (cancelled) return;
        setProjects(list);

        const state = location.state as {
          project?: { id?: string; project_id?: string };
          style?: string;
        } | null;

        const passedProject = state?.project;
        if (passedProject) {
          const passedId = passedProject.id ?? passedProject.project_id;
          if (passedId) setAssignProject(passedId);
        }

        if (state?.style) {
          const styleId =
            state.style.charAt(0).toUpperCase() + state.style.slice(1);
          setSelectedStyle(styleId);
        }
      } catch (error) {
        console.error("Error loading projects:", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location.state]);

  useEffect(() => {
    const regen = (
      location.state as {
        regenerateFrom?: { image?: string; roomType?: string };
      } | null
    )?.regenerateFrom;
    if (regen?.image) {
      if (regen.roomType) {
        const known = [
          "Bedroom",
          "Living Room",
          "Kitchen",
          "Bathroom",
          "Office",
        ];
        if (known.includes(regen.roomType)) {
          setRoomType(regen.roomType);
        } else {
          setRoomType("Other");
          setCustomRoomType(regen.roomType);
        }
      }
      setUploadedImage(regen.image);
      fetch(regen.image, { mode: "cors" })
        .then((r) =>
          r.ok ? r.blob() : Promise.reject(new Error("fetch failed")),
        )
        .then((blob) => {
          const type = blob.type || "image/png";
          const ext = type.split("/")[1] ?? "png";
          const file = new File([blob], `regenerate-source.${ext}`, { type });
          setUploadedFile(file);
        })
        .catch(() => {
          toast.error(
            "Could not load source image. Please re-upload manually.",
          );
        });
    }
  }, [location.state]);

  const all_styles_data = [
    {
      id: "Minimalist",
      name: "Minimalist",
      image: "/public/HomePageImages/minimalist.jpg",
    },
    {
      id: "Modern",
      name: "Modern",
      image: "/public/GenerateImages/Moderninterior.jpg",
    },
    {
      id: "Scandinavian",
      name: "Scandinavian",
      image: "/public/GenerateImages/Scandinavianinterior.webp",
    },
    {
      id: "Industrial",
      name: "Industrial",
      image: "/public/HomePageImages/industrial.jpg",
    },
    {
      id: "Bohemian",
      name: "Bohemian",
      image: "/public/GenerateImages/Bohemianinterior.jpg",
    },
    {
      id: "Spa",
      name: "Spa",
      image: "/public/GenerateImages/SpaInterior.webp",
    },
  ];

  const stylesHiddenByRoom: Record<string, string[]> = {
    Kitchen: ["Bohemian"],
    Bathroom: ["Industrial", "Bohemian", "Rustic"],
    Office: ["Bohemian", "Rustic"],
  };

  const isStyleVisible = (styleId: string, room: string): boolean => {
    return !stylesHiddenByRoom[room]?.includes(styleId);
  };

  useEffect(() => {
    if (!isStyleVisible(selectedStyle, roomType)) {
      setSelectedStyle("Minimalist");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomType]);

  const handleStyleCardClick = (styleId: string) => {
    setSelectedStyle(styleId);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const processFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a JPG, JPEG, or PNG image");
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    setGeneratedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerate = async () => {
    if (!uploadedFile) {
      toast.error("Please upload an image first");
      return;
    }

    setIsLoading(true);
    setGeneratedImage(null);
    startProgressLoop();

    try {
      const effectiveRoomType =
        roomType === "Other" ? customRoomType.trim() || "Other" : roomType;

      const projectIdToAssign =
        assignProject && assignProject !== "N/A" ? assignProject : undefined;

      const response = await requestTransformation(
        uploadedFile,
        effectiveRoomType,
        selectedStyle,
        customPrompt,
        projectIdToAssign,
      );

      const backendBase =
        import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

      const outputUrl = response.output_image_url?.startsWith("http")
        ? response.output_image_url
        : `${backendBase}${response.output_image_url}`;

      stopProgressLoop();
      setIsJumping(true);
      setProgress(100);
      setStage("Done!");
      await wait(600);
      setIsFadingOut(true);
      await wait(320);
      setShowProgress(false);
      setIsFadingOut(false);
      setIsJumping(false);
      setGeneratedImage(outputUrl);
      toast.success("Image generated successfully!");

      // Backend already persisted the transformation against the selected
      // project (if any). No client-side write needed.
    } catch (err) {
      stopProgressLoop();
      setShowProgress(false);
      setIsFadingOut(false);
      setIsJumping(false);
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      toast.error(errorMessage);
      setGeneratedImage(null);
      console.error("Transformation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; max-height: 0; transform: translateY(-4px); }
          to { opacity: 1; max-height: 400px; transform: translateY(0); }
        }
        .generate-container {
          animation: fadeInUp 0.3s ease;
        }
        .hero-upload {
          transition: all 0.2s ease !important;
        }
        .hero-upload:hover {
          border-color: var(--color-brand-primary) !important;
          background-color: var(--color-brand-soft) !important;
        }
        .hero-upload.dragging {
          border-color: var(--color-brand-primary) !important;
          background-color: var(--color-brand-soft) !important;
        }
        .hero-upload.dragging .hero-upload-icon {
          transform: scale(1.1);
        }
        .hero-upload-icon {
          transition: transform 0.2s ease;
        }
        .dark-mode-select,
        .dark-mode-textarea {
          transition: border-color 0.15s ease, box-shadow 0.15s ease !important;
        }
        .dark-mode-select:focus,
        .dark-mode-textarea:focus {
          outline: none;
          border-color: var(--color-brand-primary) !important;
          box-shadow: 0 0 0 3px var(--color-focus-ring);
        }
        .hero-style-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease !important;
        }
        .hero-style-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px rgba(0, 0, 0, 0.08) !important;
        }
        .style-card-small {
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background-color 0.18s ease, opacity 0.2s ease, flex-basis 0.2s ease, min-width 0.2s ease, padding 0.2s ease, margin 0.2s ease, border-width 0.2s ease !important;
        }
        .style-card-small:not(.hidden):hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08) !important;
        }
        .style-card-small.hidden {
          opacity: 0;
          pointer-events: none;
          flex: 0 0 0 !important;
          min-width: 0 !important;
          padding: 0 !important;
          border-width: 0 !important;
          margin-left: -0.375rem !important;
          margin-right: -0.375rem !important;
          overflow: hidden;
        }
        .custom-room-input {
          animation: fadeInUp 0.22s ease;
        }
        .custom-room-input:focus {
          outline: none;
          border-color: var(--color-brand-primary) !important;
          box-shadow: 0 0 0 3px var(--color-focus-ring);
        }
        textarea::placeholder,
        input::placeholder {
          color: var(--color-text-tertiary);
        }
        .advanced-toggle {
          transition: all 0.15s ease !important;
        }
        .advanced-toggle:hover {
          border-color: var(--color-brand-primary) !important;
          background-color: var(--color-brand-soft) !important;
        }
        .advanced-content {
          animation: slideDown 0.25s ease;
          overflow: hidden;
        }
        .generate-btn {
          transition: all 0.15s ease !important;
        }
        .generate-btn:hover:not(:disabled) {
          background-color: var(--color-brand-dark) !important;
          transform: translateY(-1px);
          box-shadow: 0 12px 28px rgba(67, 132, 226, 0.35);
        }
        .generate-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 4px 12px rgba(67, 132, 226, 0.25);
        }
        .remove-btn {
          transition: all 0.15s ease !important;
        }
        .remove-btn:hover {
          background-color: rgba(0, 0, 0, 0.8) !important;
          transform: scale(1.05);
        }
      `}</style>
      <div style={styles.container} className="generate-container">
        {/* HERO UPLOAD ZONE */}
        <section style={styles.heroSection}>
          <h1 style={styles.heroTitle}>Upload your room</h1>
          <p style={styles.heroSubtitle}>
            Drop a photo of the space you want to redesign
          </p>
          <div
            style={{
              ...styles.heroUploadBox,
              padding: uploadedImage ? "0" : "2rem",
            }}
            className={`hero-upload${isDragging ? " dragging" : ""}`}
            onClick={!uploadedImage ? handleUploadClick : undefined}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {uploadedImage ? (
              <>
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  style={styles.heroUploadedPreview}
                />
                <button
                  style={styles.removeButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  type="button"
                  title="Remove image"
                  className="remove-btn"
                >
                  ✕
                </button>
              </>
            ) : (
              <div style={styles.heroUploadContent}>
                <img
                  src="/public/upload icon.png"
                  alt="upload"
                  style={styles.heroUploadIcon}
                  className="hero-upload-icon"
                />
                <div style={styles.heroUploadHeading}>
                  Click to upload or drag & drop
                </div>
                <div style={styles.supportedFormats}>
                  JPG, JPEG, PNG • up to 5MB
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>
        </section>

        {/* SETTINGS ROW */}
        <section style={styles.settingsRow}>
          <div style={styles.settingField}>
            <label style={styles.settingLabel}>Room Type</label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              style={styles.selectInline}
              className="dark-mode-select"
            >
              <option value="Bedroom">Bedroom</option>
              <option value="Living Room">Living Room</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Bathroom">Bathroom</option>
              <option value="Office">Office</option>
              <option value="Other">Other</option>
            </select>
            {roomType === "Other" && (
              <input
                type="text"
                value={customRoomType}
                onChange={(e) => setCustomRoomType(e.target.value)}
                placeholder="Describe your room type..."
                style={styles.customRoomInput}
                className="dark-mode-select custom-room-input"
              />
            )}
          </div>
          <div style={styles.settingField}>
            <label style={styles.settingLabel}>Assign Project</label>
            <select
              value={assignProject}
              onChange={(e) => setAssignProject(e.target.value)}
              style={styles.selectInline}
              className="dark-mode-select"
            >
              <option value="N/A">N/A</option>
              {projects.map((project) => (
                <option key={project.project_id} value={project.project_id}>
                  {project.project_name}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* STYLE SELECTOR */}
        <section style={styles.styleSection}>
          <h2 style={styles.styleTitle}>Choose a style</h2>

          {/* Hero — Minimalist */}
          {(() => {
            const hero = all_styles_data[0];
            const isSelected = selectedStyle === hero.id;
            return (
              <div
                onClick={() => handleStyleCardClick(hero.id)}
                className="hero-style-card"
                style={{
                  ...styles.heroStyleCard,
                  borderColor: isSelected
                    ? "var(--color-brand-primary)"
                    : "transparent",
                  boxShadow: isSelected
                    ? "0 12px 32px rgba(67, 132, 226, 0.16)"
                    : "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div style={styles.heroStyleImageWrapper}>
                  <img
                    src={hero.image}
                    alt={hero.name}
                    style={styles.heroStyleImage}
                  />
                </div>
                <div
                  style={{
                    ...styles.heroStyleInfo,
                    backgroundColor: isSelected
                      ? "var(--color-brand-soft)"
                      : "transparent",
                  }}
                  className="hero-style-info"
                >
                  <div style={styles.heroStyleTag}>Default style</div>
                  <div style={styles.heroStyleName}>{hero.name}</div>
                  <div style={styles.heroStyleDescription}>
                    Clean, clutter-free spaces with neutral tones and only
                    essential furniture
                  </div>
                  <div style={styles.heroStyleSelectedRow}>
                    {isSelected ? (
                      <>
                        <span style={styles.heroSelectedBadge}>✓</span>
                        <span style={styles.heroSelectedText}>Selected</span>
                      </>
                    ) : (
                      <span style={styles.heroSelectedTextMuted}>
                        Tap to select
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Other styles divider */}
          <div style={styles.otherStylesLabel}>Other styles</div>

          {/* Secondary cards */}
          <div style={styles.smallStyleRow}>
            {all_styles_data.slice(1).map((style) => {
              const isSelected = selectedStyle === style.id;
              const visible = isStyleVisible(style.id, roomType);
              return (
                <div
                  key={style.id}
                  onClick={() => visible && handleStyleCardClick(style.id)}
                  className={`style-card-small${visible ? "" : " hidden"}`}
                  aria-hidden={!visible}
                  style={{
                    ...styles.smallStyleCard,
                    borderColor: isSelected
                      ? "var(--color-brand-primary)"
                      : "transparent",
                    backgroundColor: isSelected
                      ? "var(--color-brand-soft)"
                      : "var(--color-card)",
                    boxShadow: isSelected
                      ? "0 8px 20px rgba(67, 132, 226, 0.18)"
                      : "0 1px 3px rgba(0, 0, 0, 0.06)",
                  }}
                >
                  <div style={styles.smallStyleImageWrapper}>
                    <img
                      src={style.image}
                      alt={style.name}
                      style={styles.smallStyleImage}
                    />
                    {isSelected && (
                      <div style={styles.smallSelectedBadge}>✓</div>
                    )}
                  </div>
                  <div
                    style={styles.smallStyleName}
                    className="style-card-name"
                  >
                    {style.name}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ADVANCED OPTIONS (collapsible) */}
        <section style={styles.advancedSection}>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={styles.advancedToggle}
            className="advanced-toggle"
            aria-expanded={showAdvanced}
          >
            <span>Advanced options</span>
            <span
              style={{
                ...styles.advancedChevron,
                transform: showAdvanced ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              ⌄
            </span>
          </button>
          {showAdvanced && (
            <div style={styles.advancedContent} className="advanced-content">
              <label style={styles.label}>Custom prompt (optional)</label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                style={styles.textarea}
                className="dark-mode-textarea"
                placeholder="Describe your design preferences..."
              />
            </div>
          )}
        </section>

        {/* STICKY GENERATE BUTTON */}
        <div style={styles.stickyFooter} className="sticky-footer">
          <button
            style={{
              ...styles.generateButton,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
            onClick={handleGenerate}
            disabled={isLoading}
            className="generate-btn"
          >
            {isLoading ? (
              <>
                <span style={styles.btnSpinner} className="btn-spinner" />
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </button>
        </div>

        {/* Progress Experience */}
        {showProgress && (
          <div
            style={{
              ...styles.progressCard,
              opacity: isFadingOut ? 0 : 1,
              transform: isFadingOut ? "translateY(-4px)" : "translateY(0)",
            }}
            className="progress-card"
            role="status"
            aria-live="polite"
          >
            {(() => {
              const displayProgress = Math.round(progress);
              return (
                <>
                  <div style={styles.progressTrack}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${displayProgress}%`,
                        transition: isJumping
                          ? "width 0.55s cubic-bezier(0.16, 1, 0.3, 1)"
                          : "width 0.12s linear",
                      }}
                    />
                  </div>
                  <div style={styles.progressMetaRow}>
                    <span style={styles.progressStage}>{stage}</span>
                    <span style={styles.progressPercent}>
                      {displayProgress}%
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Result */}
        {generatedImage && !isLoading && (
          <section style={styles.resultSection}>
            <div style={styles.resultLabel}>Result</div>
            <h2 style={styles.resultHeading}>Your {selectedStyle} Room</h2>
            <div style={styles.resultImageWrapper}>
              <img
                src={generatedImage}
                alt={`Your ${selectedStyle} room`}
                style={styles.resultImage}
              />
            </div>
            <button
              style={styles.downloadButton}
              className="generate-btn"
              onClick={() => {
                const link = document.createElement("a");
                link.href = generatedImage;
                link.download = `declutter-${selectedStyle.toLowerCase()}-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              Download image
            </button>
          </section>
        )}
      </div>
    </Layout>
  );
}

const chevronBg =
  'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%239aa0a6%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e")';

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "2.5rem",
    padding: "2rem",
    maxWidth: "1200px",
    margin: "0 auto",
    marginTop: "1rem",
    paddingBottom: "2rem",
  } as React.CSSProperties,

  // ---- HERO UPLOAD ----
  heroSection: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    width: "100%",
  } as React.CSSProperties,
  heroTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "var(--color-text-primary)",
    margin: 0,
    letterSpacing: "-0.02em",
  } as React.CSSProperties,
  heroSubtitle: {
    fontSize: "1rem",
    color: "var(--color-text-secondary)",
    margin: "0 0 1rem 0",
  } as React.CSSProperties,
  heroUploadBox: {
    border: "2px dashed var(--color-border-subtle)",
    borderRadius: "16px",
    backgroundColor: "var(--color-card)",
    cursor: "pointer",
    width: "100%",
    minHeight: "360px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
  } as React.CSSProperties,
  heroUploadContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.75rem",
    padding: "2rem",
    textAlign: "center",
  } as React.CSSProperties,
  heroUploadIcon: {
    width: "56px",
    height: "56px",
    objectFit: "contain",
    opacity: 0.75,
    marginBottom: "0.25rem",
  } as React.CSSProperties,
  heroUploadHeading: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "var(--color-text-primary)",
  } as React.CSSProperties,
  supportedFormats: {
    fontSize: "0.9rem",
    color: "var(--color-text-tertiary)",
    fontWeight: "500",
  } as React.CSSProperties,
  heroUploadedPreview: {
    width: "100%",
    height: "100%",
    minHeight: "360px",
    objectFit: "cover",
    display: "block",
  } as React.CSSProperties,
  removeButton: {
    position: "absolute",
    top: "16px",
    right: "16px",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    color: "#ffffff",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  } as React.CSSProperties,

  // ---- SETTINGS ROW ----
  settingsRow: {
    display: "flex",
    flexDirection: "row",
    gap: "1rem",
    width: "100%",
    flexWrap: "wrap",
  } as React.CSSProperties,
  settingField: {
    flex: "1 1 240px",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    minWidth: "200px",
  } as React.CSSProperties,
  settingLabel: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "var(--color-text-primary)",
  } as React.CSSProperties,
  selectInline: {
    height: "44px",
    padding: "0 14px",
    fontSize: "0.95rem",
    borderRadius: "10px",
    border: "1px solid var(--color-border-subtle)",
    backgroundColor: "var(--color-card)",
    color: "var(--color-text-primary)",
    cursor: "pointer",
    appearance: "none",
    width: "100%",
    backgroundImage: chevronBg,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    backgroundSize: "18px",
    paddingRight: "36px",
    boxSizing: "border-box",
  } as React.CSSProperties,
  customRoomInput: {
    height: "44px",
    padding: "0 14px",
    fontSize: "0.95rem",
    borderRadius: "10px",
    border: "1px solid var(--color-border-subtle)",
    backgroundColor: "var(--color-card)",
    color: "var(--color-text-primary)",
    width: "100%",
    marginTop: "0.5rem",
    fontFamily: "inherit",
    boxSizing: "border-box",
  } as React.CSSProperties,

  // ---- STYLE SELECTOR ----
  styleSection: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  } as React.CSSProperties,
  styleTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "var(--color-text-primary)",
    margin: "0 0 1rem 0",
  } as React.CSSProperties,
  heroStyleCard: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    minHeight: "200px",
    borderRadius: "16px",
    border: "2px solid transparent",
    cursor: "pointer",
    backgroundColor: "var(--color-card)",
    overflow: "hidden",
    boxSizing: "border-box",
    marginBottom: "1.75rem",
  } as React.CSSProperties,
  heroStyleImageWrapper: {
    width: "42%",
    minWidth: "240px",
    maxWidth: "340px",
    position: "relative",
    overflow: "hidden",
    backgroundColor: "var(--color-bg-elevated)",
  } as React.CSSProperties,
  heroStyleImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  } as React.CSSProperties,
  heroStyleInfo: {
    flex: 1,
    padding: "1.5rem 1.75rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "0.5rem",
    transition: "background-color 0.2s ease",
  } as React.CSSProperties,
  heroStyleTag: {
    fontSize: "0.7rem",
    fontWeight: "600",
    color: "var(--color-brand-primary)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  } as React.CSSProperties,
  heroStyleName: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "var(--color-text-primary)",
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
  } as React.CSSProperties,
  heroStyleDescription: {
    fontSize: "0.95rem",
    color: "var(--color-text-secondary)",
    lineHeight: 1.5,
    marginTop: "0.25rem",
    marginBottom: "0.4rem",
    maxWidth: "420px",
  } as React.CSSProperties,
  heroStyleSelectedRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginTop: "0.25rem",
  } as React.CSSProperties,
  heroSelectedBadge: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    backgroundColor: "var(--color-brand-primary)",
    color: "var(--color-text-inverse)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "700",
    boxShadow: "0 2px 6px rgba(67, 132, 226, 0.35)",
  } as React.CSSProperties,
  heroSelectedText: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "var(--color-brand-primary)",
  } as React.CSSProperties,
  heroSelectedTextMuted: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "var(--color-text-tertiary)",
  } as React.CSSProperties,
  otherStylesLabel: {
    fontSize: "0.7rem",
    fontWeight: "600",
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "0.875rem",
  } as React.CSSProperties,
  smallStyleRow: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  } as React.CSSProperties,
  smallStyleCard: {
    flex: "1 1 120px",
    minWidth: "110px",
    display: "flex",
    flexDirection: "column",
    padding: "6px",
    borderRadius: "12px",
    border: "2px solid transparent",
    cursor: "pointer",
    backgroundColor: "var(--color-card)",
    willChange: "transform",
    boxSizing: "border-box",
  } as React.CSSProperties,
  smallStyleImageWrapper: {
    width: "100%",
    height: "110px",
    borderRadius: "8px",
    overflow: "hidden",
    position: "relative",
  } as React.CSSProperties,
  smallStyleImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  } as React.CSSProperties,
  smallSelectedBadge: {
    position: "absolute",
    top: "6px",
    right: "6px",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "var(--color-brand-primary)",
    color: "var(--color-text-inverse)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "700",
    boxShadow: "0 2px 6px rgba(67, 132, 226, 0.4)",
  } as React.CSSProperties,
  smallStyleName: {
    fontSize: "0.8125rem",
    fontWeight: "600",
    color: "var(--color-text-primary)",
    textAlign: "center",
    marginTop: "0.5rem",
    marginBottom: "0.125rem",
  } as React.CSSProperties,

  // ---- ADVANCED OPTIONS ----
  advancedSection: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: "1rem",
  } as React.CSSProperties,
  advancedToggle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "12px 16px",
    backgroundColor: "var(--color-card)",
    border: "1px solid var(--color-border-subtle)",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "var(--color-text-primary)",
    fontFamily: "inherit",
  } as React.CSSProperties,
  advancedChevron: {
    transition: "transform 0.2s ease",
    fontSize: "1.4rem",
    color: "var(--color-text-secondary)",
    lineHeight: 1,
    display: "inline-block",
  } as React.CSSProperties,
  advancedContent: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  } as React.CSSProperties,
  label: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "var(--color-text-primary)",
  } as React.CSSProperties,
  textarea: {
    padding: "12px 14px",
    fontSize: "0.95rem",
    borderRadius: "10px",
    border: "1px solid var(--color-border-subtle)",
    backgroundColor: "var(--color-card)",
    color: "var(--color-text-primary)",
    fontFamily: "inherit",
    resize: "vertical",
    minHeight: "110px",
    boxSizing: "border-box",
    width: "100%",
  } as React.CSSProperties,

  // ---- STICKY GENERATE ----
  stickyFooter: {
    position: "sticky",
    bottom: "1rem",
    width: "100%",
    zIndex: 20,
    paddingTop: "1rem",
    background:
      "linear-gradient(to top, var(--color-bg-base) 60%, transparent)",
  } as React.CSSProperties,
  generateButton: {
    width: "100%",
    height: "56px",
    fontSize: "1.1rem",
    fontWeight: "600",
    backgroundColor: "var(--color-brand-primary)",
    color: "var(--color-text-inverse)",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(67, 132, 226, 0.28)",
    letterSpacing: "0.01em",
  } as React.CSSProperties,

  // ---- PROGRESS ----
  btnSpinner: {
    width: "18px",
    height: "18px",
    border: "2px solid rgba(255, 255, 255, 0.35)",
    borderTopColor: "#ffffff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    display: "inline-block",
    marginRight: "10px",
    verticalAlign: "middle",
    boxSizing: "border-box",
  } as React.CSSProperties,
  progressCard: {
    marginTop: "0.5rem",
    padding: "1.5rem 1.5rem 1.25rem",
    backgroundColor: "var(--color-card)",
    border: "1px solid var(--color-border-subtle)",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
    transition: "opacity 0.32s ease, transform 0.32s ease",
    display: "flex",
    flexDirection: "column",
    gap: "0.875rem",
  } as React.CSSProperties,
  progressTrack: {
    width: "100%",
    height: "14px",
    backgroundColor: "var(--color-bg-elevated)",
    borderRadius: "999px",
    overflow: "hidden",
  } as React.CSSProperties,
  progressFill: {
    height: "100%",
    backgroundColor: "var(--color-brand-primary)",
    borderRadius: "999px",
    willChange: "width",
  } as React.CSSProperties,
  progressMetaRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: "1rem",
  } as React.CSSProperties,
  progressStage: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "var(--color-text-primary)",
    letterSpacing: "-0.005em",
    transition: "color 0.2s ease",
  } as React.CSSProperties,
  progressPercent: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "var(--color-brand-primary)",
    letterSpacing: "-0.01em",
    fontVariantNumeric: "tabular-nums",
  } as React.CSSProperties,

  // ---- RESULT ----
  resultSection: {
    marginTop: "2rem",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: "1.75rem",
    paddingTop: "1rem",
  } as React.CSSProperties,
  resultLabel: {
    fontSize: "0.7rem",
    fontWeight: "500",
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    marginBottom: "-0.75rem",
  } as React.CSSProperties,
  resultHeading: {
    fontSize: "2.5rem",
    fontWeight: 300,
    color: "var(--color-text-primary)",
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
    margin: 0,
  } as React.CSSProperties,
  resultImageWrapper: {
    width: "100%",
    borderRadius: "16px",
    border: "1px solid var(--color-border-subtle)",
    backgroundColor: "var(--color-bg-elevated)",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties,
  resultImage: {
    width: "100%",
    height: "auto",
    maxHeight: "75vh",
    objectFit: "contain",
    display: "block",
  } as React.CSSProperties,
  downloadButton: {
    alignSelf: "center",
    minWidth: "260px",
    padding: "0 32px",
    height: "56px",
    fontSize: "1.1rem",
    fontWeight: "600",
    backgroundColor: "var(--color-brand-primary)",
    color: "var(--color-text-inverse)",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(67, 132, 226, 0.28)",
    letterSpacing: "0.01em",
    marginTop: "0.5rem",
  } as React.CSSProperties,
};

export default Generate;
