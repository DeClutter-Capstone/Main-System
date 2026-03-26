import Layout from "../components/Layout";
import { useState, useRef } from "react";
import { requestTransformation } from "../services/transformationAPI";

function Generate() {
  const [roomType, setRoomType] = useState("Bedroom");
  const [assignProject, setAssignProject] = useState("N/A");
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Minimalist");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const styles_data = [
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
  ];

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
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerate = async () => {
    // Validate that user has uploaded an image
    if (!uploadedFile) {
      setError("Please upload an image first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call the backend API
      const response = await requestTransformation(
        uploadedFile,
        roomType,
        selectedStyle,
      );

      // Set the generated image from the response
      setGeneratedImage(response.output_image_url);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      setGeneratedImage(null);
      console.error("Transformation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <style>{`
        [data-theme="dark"] select,
        [data-theme="dark"] textarea,
        [data-theme="dark"] .style-card,
        [data-theme="dark"] .uploadBox {
          background-color: #383838ff !important;
          color: #ffffff !important;
          border-color: #555 !important;
        }
        [data-theme="dark"] .dark-mode-select,
        [data-theme="dark"] .dark-mode-textarea {
          background-color: #383838ff !important;
          color: #ffffff !important;
        }
        [data-theme="dark"] textarea::placeholder {
          color: #ffffffff !important;
      
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
            <a style={styles.moreLink}>More &gt;</a>
          </div>
          <div style={styles.styleCardsContainer}>
            {styles_data.map((style) => (
              <div
                key={style.id}
                onClick={() => handleStyleCardClick(style.id)}
                className="style-card"
                style={{
                  ...styles.styleCard,
                  borderColor: selectedStyle === style.id ? "#4384E2" : "#ddd",
                  backgroundColor:
                    selectedStyle === style.id ? "#f0f4ff" : "white",
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
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorMessage}>
            <p>{error}</p>
          </div>
        )}

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

        {/* Generated Image Display */}
        {generatedImage && (
          <div style={styles.generatedImageSection}>
            <h2 style={styles.generatedImageTitle}>Generated Image</h2>
            <div style={styles.generatedImageContainer}>
              <img
                src={generatedImage}
                alt="Generated"
                style={styles.generatedImageDisplay}
              />
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
};

export default Generate;
