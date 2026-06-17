import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "react-toastify";
import { requestTransformation } from "../services/transformationAPI";
import { type ProjectSummary } from "../services/projectsAPI";

// All generation state lives here, above the router, so an in-progress
// generation (upload, progress bar, result) survives navigating away from
// the Generate page and back. Local React state on the page itself would be
// destroyed the moment React Router unmounts the route.

type Quality = "v1.5" | "v2.0";
type ViewMode = "output" | "compare";

interface GenerationContextValue {
  // ── Form inputs ──
  roomType: string;
  setRoomType: (v: string) => void;
  customRoomType: string;
  setCustomRoomType: (v: string) => void;
  assignProject: string;
  setAssignProject: (v: string) => void;
  customPrompt: string;
  setCustomPrompt: (v: string) => void;
  selectedStyle: string;
  setSelectedStyle: (v: string) => void;
  quality: Quality;
  setQuality: (v: Quality) => void;

  // ── Upload ──
  uploadedImage: string | null;
  setUploadedImage: (v: string | null) => void;
  uploadedFile: File | null;
  setUploadedFile: (v: File | null) => void;
  processFile: (file: File) => void;
  removeImage: () => void;

  // ── Projects dropdown ──
  projects: ProjectSummary[];
  setProjects: (v: ProjectSummary[]) => void;

  // ── Progress ──
  isLoading: boolean;
  progress: number;
  stage: string;
  showProgress: boolean;
  isJumping: boolean;
  isFadingOut: boolean;

  // ── Result ──
  generatedImage: string | null;
  croppedInput: string | null;
  resultAspectRatio: number;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;

  // ── Actions ──
  handleGenerate: () => Promise<void>;
  handleIterate: () => Promise<void>;
}

const GenerationContext = createContext<GenerationContextValue | null>(null);

export function GenerationProvider({ children }: { children: ReactNode }) {
  const [roomType, setRoomType] = useState("Bedroom");
  const [customRoomType, setCustomRoomType] = useState("");
  const [assignProject, setAssignProject] = useState("N/A");
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Minimalist");
  const [quality, setQuality] = useState<Quality>("v1.5");

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [croppedInput, setCroppedInput] = useState<string | null>(null);
  const [resultAspectRatio, setResultAspectRatio] = useState<number>(1);
  const [viewMode, setViewMode] = useState<ViewMode>("output");

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("Analyzing your room...");
  const [showProgress, setShowProgress] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const rafRef = useRef<number | null>(null);
  const progressStartRef = useRef<number>(0);

  // The provider stays mounted for the app's lifetime; only cancel the RAF
  // when the whole app unmounts.
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

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

  const removeImage = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    setGeneratedImage(null);
  };

  const getStage = (p: number) => {
    if (p >= 100) return "Done!";
    if (p < 25) return "Analyzing your room...";
    if (p < 50) return "Removing clutter and simplifying...";
    if (p < 72) return "Applying minimalist style...";
    return "Finalizing your design...";
  };

  const startProgressLoop = () => {
    setShowProgress(true);
    setIsFadingOut(false);
    setIsJumping(false);
    setProgress(0);
    setStage("Analyzing your room...");
    progressStartRef.current = performance.now();

    // Timeline (real generation averages ~23s):
    //   0–5s   : 0 → 30%   (ease-out, feels like it kicked off)
    //   5–18s  : 30 → 75%  (linear crawl, the bulk of the work)
    //   18s+   : 75 → 82%  (asymptotic, never quite reaches 82)
    // The bar holds < 82% until the real API response triggers the jump.
    const tick = () => {
      const elapsed = (performance.now() - progressStartRef.current) / 1000;
      let p: number;
      if (elapsed < 5) {
        const t = elapsed / 5;
        p = 30 * (1 - Math.pow(1 - t, 2)); // ease-out quad
      } else if (elapsed < 18) {
        const t = (elapsed - 5) / 13;
        p = 30 + 45 * t; // linear 30 → 75
      } else {
        p = 75 + 7 * (1 - Math.exp(-(elapsed - 18) / 14));
      }
      p = Math.min(p, 81.9);
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

  // Center-crop `inputSrc` to match the output's natural dimensions so the
  // Before/After slider lines up pixel-for-pixel.
  const cropInputToOutput = async (
    inputSrc: string,
    outputSrc: string,
  ): Promise<{ croppedDataUrl: string; width: number; height: number }> => {
    const loadImg = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load ${src}`));
        img.src = src;
      });

    const [inputImg, outputImg] = await Promise.all([
      loadImg(inputSrc),
      loadImg(outputSrc),
    ]);

    const W = outputImg.naturalWidth;
    const H = outputImg.naturalHeight;
    const inW = inputImg.naturalWidth;
    const inH = inputImg.naturalHeight;
    const targetRatio = W / H;
    const inRatio = inW / inH;

    let sx: number;
    let sy: number;
    let sw: number;
    let sh: number;
    if (inRatio > targetRatio) {
      sh = inH;
      sw = sh * targetRatio;
      sx = (inW - sw) / 2;
      sy = 0;
    } else {
      sw = inW;
      sh = sw / targetRatio;
      sx = 0;
      sy = (inH - sh) / 2;
    }

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.drawImage(inputImg, sx, sy, sw, sh, 0, 0, W, H);
    return {
      croppedDataUrl: canvas.toDataURL("image/png"),
      width: W,
      height: H,
    };
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
        quality,
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

      const cropPromise = uploadedImage
        ? cropInputToOutput(uploadedImage, outputUrl).catch((err) => {
            console.error("Input crop failed:", err);
            return null;
          })
        : Promise.resolve(null);

      await wait(600);
      setIsFadingOut(true);
      await wait(320);
      setShowProgress(false);
      setIsFadingOut(false);
      setIsJumping(false);

      const cropped = await cropPromise;
      if (cropped) {
        setCroppedInput(cropped.croppedDataUrl);
        setResultAspectRatio(cropped.width / cropped.height);
      } else {
        setCroppedInput(null);
        setResultAspectRatio(1);
      }
      setViewMode("output");
      setGeneratedImage(outputUrl);
      toast.success("Image generated successfully!");
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

  // Feed the freshly generated result back in as the next input.
  const handleIterate = async () => {
    if (!generatedImage) return;
    try {
      const res = await fetch(generatedImage, {
        mode: "cors",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const blob = await res.blob();
      const type = blob.type || "image/png";
      const ext = type.split("/")[1] ?? "png";
      const file = new File([blob], `iteration-source.${ext}`, { type });
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(blob);
      });
      setUploadedFile(file);
      setUploadedImage(dataUrl);
      setGeneratedImage(null);
      setCroppedInput(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.success(
        "This design is now your room photo — pick a style and go again",
      );
    } catch (err) {
      console.error("Iterate error:", err);
      toast.error("Could not load the result as input");
    }
  };

  const value: GenerationContextValue = {
    roomType,
    setRoomType,
    customRoomType,
    setCustomRoomType,
    assignProject,
    setAssignProject,
    customPrompt,
    setCustomPrompt,
    selectedStyle,
    setSelectedStyle,
    quality,
    setQuality,
    uploadedImage,
    setUploadedImage,
    uploadedFile,
    setUploadedFile,
    processFile,
    removeImage,
    projects,
    setProjects,
    isLoading,
    progress,
    stage,
    showProgress,
    isJumping,
    isFadingOut,
    generatedImage,
    croppedInput,
    resultAspectRatio,
    viewMode,
    setViewMode,
    handleGenerate,
    handleIterate,
  };

  return (
    <GenerationContext.Provider value={value}>
      {children}
    </GenerationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGeneration() {
  const ctx = useContext(GenerationContext);
  if (!ctx) {
    throw new Error("useGeneration must be used within a GenerationProvider");
  }
  return ctx;
}
