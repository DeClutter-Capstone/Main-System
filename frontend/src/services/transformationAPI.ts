import { authHeader } from "./auth";

const API_BASE_URL =
  (import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000") + "/api";

export interface TransformationResponse {
  transformation_id: string;
  room_type: string;
  style_name: string;
  project_id: string | null;
  input_image_id: string | null;
  prompt: string | null;
  output_image_url: string;
}

/**
 * Send a transformation request to the backend.
 *
 * `roomType` is passed verbatim so free-text values (entered when the user
 * selected "Other") survive end-to-end into the DB and the AI prompt.
 */
export async function requestTransformation(
  imageFile: File,
  roomType: string,
  styleName: string,
  prompt?: string,
  projectId?: string,
  quality?: string,
  declutterLevel?: string,
): Promise<TransformationResponse> {
  const formData = new FormData();
  formData.append("image_file", imageFile);
  formData.append("room_type", roomType);
  formData.append("style_name", styleName);
  if (prompt && prompt.trim()) {
    formData.append("prompt", prompt.trim());
  }
  if (projectId) {
    formData.append("project_id", projectId);
  }
  if (quality) {
    formData.append("quality", quality);
  }
  if (declutterLevel) {
    formData.append("declutter_level", declutterLevel);
  }

  const auth = await authHeader();
  const response = await fetch(`${API_BASE_URL}/transformations/`, {
    method: "POST",
    body: formData,
    headers: { ...auth },
  });

  if (!response.ok) {
    let detail = "Transformation failed";
    try {
      const error = await response.json();
      detail = error.detail ?? detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }

  return response.json();
}
