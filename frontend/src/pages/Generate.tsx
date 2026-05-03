import Layout from "../components/Layout";
import { useState, useRef } from "react";
import { requestTransformation } from "../services/transformationAPI";
import { toast } from "react-toastify";

function Generate() {
  const [roomType, setRoomType] = useState("Bedroom");
  const [assignProject, setAssignProject] = useState("N/A");
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Minimalist");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showMoreStyles, setShowMoreStyles] = useState(false);

  const all_styles_data = [
    {
      id: "Minimalist",
      name: "Minimalist",
      image: "/public/HomePageImages/minimalist.jpg",
    },
    {
      id: "Modern",
      name: "Modern",
      image: "/public/HomePageImages/modren.jpg",
    },
    {
      id: "Scandinavian",
      name: "Scandinavian",
      image: "/public/HomePageImages/scandinavian.webp",
    },
    {
      id: "Industrial",
      name: "Industrial",
      image: "/public/HomePageImages/industrial.jpg",
    },
    {
      id: "Bohemian",
      name: "Bohemian",
      image: "/public/HomePageImages/bohemian.webp",
    },
    {
      id: "Rustic",
      name: "Rustic",
      image: "/public/HomePageImages/rustic.jpg",
    },
    {
      id: "Spa",
      name: "Spa",
      image: "/public/HomePageImages/spa.jpg",
    },
  ];

  // Display only first 3 styles by default
  const styles_data = all_styles_data.slice(0, 3);

  // For "More" section - display remaining styles (Industrial, Bohemian, Rustic, Spa)
  const moreStyles = all_styles_data.slice(3);

  const handleStyleCardClick = (styleId: string) => {
    setSelectedStyle(styleId);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        alert("Please upload a JPG, JPEG, or PNG image");
        return;
      }

      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("File size must be less than 5MB");
        return;
      }

      // Store the file for later use
      setUploadedFile(file);

      // Read and set the preview image
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    // Validate that user has uploaded an image
    if (!uploadedFile) {
      toast.error("Please upload an image first");
      return;
    }

    setIsLoading(true);

    try {
      // Call the backend API
      const response = await requestTransformation(
        uploadedFile,
        roomType,
        selectedStyle,
      );

      const backendBase =
        import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

      const outputUrl = response.output_image_url?.startsWith("http")
        ? response.output_image_url
        : `${backendBase}${response.output_image_url}`;

      // Set the generated image from the response
      setGeneratedImage(outputUrl);
      toast.success("Image generated successfully!");
    } catch (err) {
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
        [data-theme="dark"] select,
        [data-theme="dark"] textarea,
        [data-theme="dark"] .uploadBox {
          background-color: #383838ff !important;
          color: #ffffff !important;
          border-color: #555 !important;
        }
        [data-theme="dark"] .style-card {
          background-color: #383838ff !important;
          color: #ffffff !important;
        }
        [data-theme="dark"] .style-card > div {
          color: #ffffff !important;
        }
        [data-theme="dark"] .dark-mode-select,
        [data-theme="dark"] .dark-mode-textarea {
          background-color: #383838ff !important;
          color: #ffffff !important;
        }
        [data-theme="dark"] textarea::placeholder {
          color: #ffffffff !important;
        }
        [data-theme="dark"] .images-container-box {
          background-color: #3838389a !important;
        }
      
      `}</style>
      <div style={styles.container}>
        {/* Top Section - Upload & Options */}
        <div style={styles.topSection}>
          {/* Left - Upload Box */}
          <div style={styles.uploadColumn}>
            <h2 style={styles.uploadTitle}>Upload image</h2>
            <div
              style={{
                ...styles.uploadBox,
                padding: uploadedImage ? "0" : "4.5rem 2rem",
                height: "300px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: uploadedImage ? "center" : "flex-start",
              }}
              className="uploadBox"
            >
              {uploadedImage ? (
                <>
                  <div style={styles.imageContainer}>
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      style={styles.uploadedPreview}
                    />
                  </div>
                  <button
                    style={styles.removeButton}
                    onClick={handleRemoveImage}
                    type="button"
                    title="Remove image"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <div style={styles.uploadContentWrapper}>
                  <button
                    style={styles.uploadButton}
                    onClick={handleUploadClick}
                    type="button"
                  >
                    <img
                      src="/public/upload icon.png"
                      alt="upload"
                      style={styles.uploadIconImg}
                    />
                    Upload
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <div style={styles.uploadText}>
                    Or drag & drop your media here
                  </div>
                  <div style={styles.supportedFormats}>
                    JPG, JPEG, PNG all supported
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right - Options */}
          <div style={styles.optionsColumn}>
            {/* Select Room Type */}
            <div style={styles.formGroupRow}>
              <label style={styles.labelInline}>Select Room Type</label>
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
              </select>
            </div>

            {/* Assign Project */}
            <div style={styles.formGroupRow}>
              <label style={styles.labelInline}>Assign Project</label>
              <select
                value={assignProject}
                onChange={(e) => setAssignProject(e.target.value)}
                style={styles.selectInline}
                className="dark-mode-select"
              >
                <option value="N/A">N/A</option>
                <option value="Project 1">Project 1</option>
                <option value="Project 2">Project 2</option>
                <option value="Project 3">Project 3</option>
              </select>
            </div>

            {/* Custom Prompt */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Enter Custom Prompt (optional) :
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                style={styles.textarea}
                className="dark-mode-textarea"
                placeholder="Describe your design preferences..."
              />
            </div>
          </div>
        </div>

        {/* Style Selection Section */}
        <div style={styles.styleSection}>
          <div style={styles.styleSectionHeader}>
            <h2 style={styles.styleTitle}>Select Style:</h2>
            <div style={styles.paginationContainer}>
              <div
                style={{
                  ...styles.paginationCircle,
                  backgroundColor: !showMoreStyles ? "#4384E2" : "#ddd",
                  cursor: "pointer",
                }}
                onClick={() => setShowMoreStyles(false)}
                title="Page 1"
              />
              <div
                style={{
                  ...styles.paginationCircle,
                  backgroundColor: showMoreStyles ? "#4384E2" : "#ddd",
                  cursor: "pointer",
                }}
                onClick={() => setShowMoreStyles(true)}
                title="Page 2"
              />
              <a
                style={{ ...styles.moreLink, cursor: "pointer" }}
                onClick={() => setShowMoreStyles(!showMoreStyles)}
              >
                {showMoreStyles ? "< Back" : "More >"}
              </a>
            </div>
          </div>

          {!showMoreStyles ? (
            <div style={styles.styleCardsContainer}>
              {styles_data.map((style) => {
                const isDarkMode =
                  document.documentElement.getAttribute("data-theme") ===
                  "dark";
                return (
                  <div
                    key={style.id}
                    onClick={() => handleStyleCardClick(style.id)}
                    className="style-card"
                    style={{
                      ...styles.styleCard,
                      borderColor:
                        selectedStyle === style.id
                          ? "#4384E2"
                          : isDarkMode
                            ? "#555"
                            : "#ddd",
                      backgroundColor:
                        selectedStyle === style.id
                          ? isDarkMode
                            ? "#4384E2"
                            : "#f0f4ff"
                          : isDarkMode
                            ? "#383838ff"
                            : "white",
                      boxShadow:
                        selectedStyle === style.id
                          ? "0 4px 12px rgba(67, 132, 226, 0.15)"
                          : "none",
                    }}
                  >
                    <img
                      src={style.image}
                      alt={style.name}
                      style={styles.styleCardImage}
                    />
                    <div style={styles.styleCardName}>{style.name}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={styles.styleCardsContainer}>
              {moreStyles.map((style) => {
                const isDarkMode =
                  document.documentElement.getAttribute("data-theme") ===
                  "dark";
                return (
                  <div
                    key={style.id}
                    onClick={() => handleStyleCardClick(style.id)}
                    className="style-card"
                    style={{
                      ...styles.styleCard,
                      borderColor:
                        selectedStyle === style.id
                          ? "#4384E2"
                          : isDarkMode
                            ? "#555"
                            : "#ddd",
                      backgroundColor:
                        selectedStyle === style.id
                          ? isDarkMode
                            ? "#4384E2"
                            : "#f0f4ff"
                          : isDarkMode
                            ? "#383838ff"
                            : "white",
                      boxShadow:
                        selectedStyle === style.id
                          ? "0 4px 12px rgba(67, 132, 226, 0.15)"
                          : "none",
                    }}
                  >
                    <img
                      src={style.image}
                      alt={style.name}
                      style={styles.styleCardImage}
                    />
                    <div style={styles.styleCardName}>{style.name}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Generate Button */}
        <button
          style={{
            ...styles.generateButton,
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
          onClick={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? "Generating..." : "Generate"}
        </button>

        {/* Loading State */}
        {isLoading && (
          <div style={styles.loadingSection}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Processing your image...</p>
          </div>
        )}

        {/* Before & After Comparison */}
        {generatedImage && !isLoading && (
          <div style={styles.comparisonSection}>
            <h2 style={styles.comparisonTitle}>Transformation Result</h2>

            <div
              style={styles.imagesContainerBox}
              className="images-container-box"
            >
              <div style={styles.beforeAfterContainer}>
                {/* Before Image */}
                <div style={styles.imageSection}>
                  <div style={styles.imageLabel}>Before</div>
                  <div style={styles.imageWrapper}>
                    <img
                      src={uploadedImage || ""}
                      alt="Before"
                      style={styles.comparisonImage}
                    />
                  </div>
                </div>

                {/* After Image */}
                <div style={styles.imageSection}>
                  <div style={styles.imageLabel}>After</div>
                  <div style={styles.imageWrapper}>
                    <img
                      src={generatedImage}
                      alt="After"
                      style={styles.comparisonImage}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={styles.actionButtonsContainer}>
              <button
                style={styles.actionButton}
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = generatedImage;
                  link.download = `transformed-${selectedStyle}-${Date.now()}.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                Download Transformation
              </button>
              <button
                style={styles.actionButton}
                onClick={() => {
                  const reportContent = `
Transformation Report
====================
Date: ${new Date().toLocaleString()}
Room Type: ${roomType}
Style: ${selectedStyle}
${customPrompt ? `Custom Prompt: ${customPrompt}` : ""}

Transformation completed successfully!
                  `;
                  const element = document.createElement("a");
                  element.setAttribute(
                    "href",
                    "data:text/plain;charset=utf-8," +
                      encodeURIComponent(reportContent),
                  );
                  element.setAttribute(
                    "download",
                    `transformation-report-${Date.now()}.txt`,
                  );
                  element.style.display = "none";
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                  toast.success("Report downloaded successfully!");
                }}
              >
                Generate Report
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    padding: "2rem",
    maxWidth: "1260px",
    margin: "0 auto",
    marginTop: "4rem",
  } as React.CSSProperties,
  topSection: {
    display: "flex",
    gap: "3rem",
    justifyContent: "space-between",
    alignItems: "flex-start",
  } as React.CSSProperties,
  uploadColumn: {
    flex: 1,
    minWidth: "400px",
  } as React.CSSProperties,
  uploadTitle: {
    fontSize: "1.3rem",
    fontWeight: "600",
    color: "#333",
    margin: "0 0 1rem 0",
  } as React.CSSProperties,
  uploadBox: {
    border: "2px solid #e2e2e2ff",
    borderRadius: "12px",
    padding: "4.5rem 2rem",
    textAlign: "center",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    transition: "all 0.3s ease",
    height: "300px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties,
  uploadIcon: {
    fontSize: "2.5rem",
    marginBottom: "1rem",
    color: "#4384E2",
  } as React.CSSProperties,
  uploadButton: {
    padding: "16px 94px",
    fontSize: "1rem",
    fontWeight: "600",
    backgroundColor: "#c2d7f5ff",
    color: "#474747ff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "0.5rem",
    transition: "background-color 0.3s ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  } as React.CSSProperties,
  uploadIconImg: {
    width: "20px",
    height: "20px",
    objectFit: "contain",
  } as React.CSSProperties,
  uploadText: {
    fontSize: "0.9rem",
    color: "#666",
    marginTop: "0.5rem",
    marginBottom: "1rem",
  } as React.CSSProperties,
  supportedFormats: {
    fontSize: "0.85rem",
    color: "#999999ff",
    fontWeight: "500",
  } as React.CSSProperties,
  optionsColumn: {
    flex: 1,
    minWidth: "400px",
    display: "flex",
    flexDirection: "column",
    marginTop: "2.4rem",
    gap: "2rem",
  } as React.CSSProperties,
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: ".5rem",
  } as React.CSSProperties,
  formGroupRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "1rem",
  } as React.CSSProperties,
  label: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#333",
  } as React.CSSProperties,
  labelInline: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#333",
    minWidth: "140px",
    whiteSpace: "nowrap",
  } as React.CSSProperties,
  select: {
    padding: "10px 14px",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "white",
    cursor: "pointer",
    transition: "border-color 0.3s ease",
    appearance: "none",
    backgroundImage:
      'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23666%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e")',
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    backgroundSize: "20px",
    paddingRight: "36px",
  } as React.CSSProperties,
  selectInline: {
    padding: "10px 14px",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "white",
    cursor: "pointer",
    transition: "border-color 0.3s ease",
    appearance: "none",
    flex: 1,
    backgroundImage:
      'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23666%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e")',
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    backgroundSize: "20px",
    paddingRight: "36px",
  } as React.CSSProperties,
  textarea: {
    padding: "12px 14px",
    fontSize: "0.95rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontFamily: "inherit",
    resize: "vertical",
    minHeight: "133px",
    transition: "border-color 0.3s ease",
  } as React.CSSProperties,
  styleSection: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  } as React.CSSProperties,
  styleSectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  } as React.CSSProperties,
  styleTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#333",
    margin: "0",
  } as React.CSSProperties,
  moreLink: {
    fontSize: "0.95rem",
    color: "#4384E2",
    textDecoration: "none",
    fontWeight: "600",
    cursor: "pointer",
    transition: "color 0.3s ease",
  } as React.CSSProperties,
  styleCardsContainer: {
    display: "flex",
    gap: "1.5rem",
    justifyContent: "space-between",
    flexWrap: "wrap",
  } as React.CSSProperties,
  styleCard: {
    flex: "1",
    minWidth: "220px",
    display: "flex",
    gap: "0",
    padding: "0",
    borderRadius: "12px",
    border: "2px solid #ddd",
    cursor: "pointer",
    transition: "all 0.3s ease",
    backgroundColor: "white",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  } as React.CSSProperties,
  styleCardImage: {
    width: "100px",
    height: "90px",
    borderRadius: "0px 12px 12px 0px",
    objectFit: "cover",
    flexShrink: 0,
  } as React.CSSProperties,
  styleCardName: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#333",
  } as React.CSSProperties,
  generateButton: {
    padding: "14px 40px",
    fontSize: "1.5rem",
    fontWeight: "600",
    backgroundColor: "#c2d7f5ff",
    color: "#5a5a5aff",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    width: "100%",
    maxWidth: "1300px",
    margin: "2rem auto",
    transition: "background-color 0.3s ease",
  } as React.CSSProperties,
  uploadedPreview: {
    width: "100%",
    height: "100%",
    borderRadius: "12px",
    objectFit: "cover",
    padding: "3px",
    boxSizing: "border-box",
  } as React.CSSProperties,
  uploadedText: {
    fontSize: "0.9rem",
    color: "#4384E2",
    fontWeight: "600",
    textAlign: "center",
  } as React.CSSProperties,
  imageContainer: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    overflow: "hidden",
  } as React.CSSProperties,
  removeButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    color: "#ffffff",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    zIndex: 10,
  } as React.CSSProperties,
  uploadContentWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
    width: "100%",
    marginTop: "20px",
  } as React.CSSProperties,
  errorMessage: {
    padding: "12px 16px",
    backgroundColor: "#ffebee",
    color: "#c62828",
    borderRadius: "8px",
    marginTop: "1rem",
    border: "1px solid #ef5350",
    fontSize: "0.95rem",
  } as React.CSSProperties,
  generatedImageSection: {
    marginTop: "3rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  } as React.CSSProperties,
  generatedImageTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#333",
    margin: "0",
  } as React.CSSProperties,
  generatedImageContainer: {
    width: "100%",
    maxWidth: "800px",
    margin: "0 auto",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  } as React.CSSProperties,
  generatedImageDisplay: {
    width: "100%",
    height: "auto",
    display: "block",
  } as React.CSSProperties,
  pageIndicator: {
    textAlign: "center",
    fontSize: "0.9rem",
    color: "#666",
    marginTop: "1rem",
    fontWeight: "500",
  } as React.CSSProperties,
  paginationContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  } as React.CSSProperties,
  paginationCircle: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    transition: "all 0.3s ease",
  } as React.CSSProperties,
  loadingSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1.5rem",
    padding: "3rem 2rem",
    marginTop: "2rem",
  } as React.CSSProperties,
  spinner: {
    width: "50px",
    height: "50px",
    border: "4px solid #e0e0e0",
    borderTop: "4px solid #4384E2",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  } as React.CSSProperties,
  loadingText: {
    fontSize: "1.1rem",
    color: "#666",
    fontWeight: "500",
  } as React.CSSProperties,
  comparisonSection: {
    marginTop: "0rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  } as React.CSSProperties,
  comparisonTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#333",
    marginBottom: ".3rem",
    textAlign: "center",
  } as React.CSSProperties,
  imagesContainerBox: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "1rem",
    boxShadow: "none",
    margin: "1rem 0",
    display: "flex",
    justifyContent: "center",
  } as React.CSSProperties,
  beforeAfterContainer: {
    display: "flex",
    gap: "3rem",
    justifyContent: "center",
    alignItems: "flex-start",
    flexWrap: "wrap",
    width: "100%",
  } as React.CSSProperties,
  imageSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
    flex: "1",
    minWidth: "40px",
    maxWidth: "650px",
  } as React.CSSProperties,
  imageLabel: {
    fontSize: "1.3rem",
    fontWeight: "700",
    color: "#a1c8ffff",
    textTransform: "uppercase",
    letterSpacing: "1px",
  } as React.CSSProperties,
  imageWrapper: {
    width: "100%",
    aspectRatio: "1",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "none",
    backgroundColor: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties,
  comparisonImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  } as React.CSSProperties,
  actionButtonsContainer: {
    display: "flex",
    gap: "2rem",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: ".5rem",
    width: "100%",
  } as React.CSSProperties,
  actionButton: {
    padding: "14px 32px",
    fontSize: "1rem",
    fontWeight: "600",
    backgroundColor: "#c2d7f5ff",
    color: "#5a5a5aff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(195, 215, 245, 0.3)",
    flex: 1,
    minWidth: "240px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties,
};

export default Generate;
