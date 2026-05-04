/**
 * API service for transformation requests
 * Handles communication with the backend transformation endpoint
 */

const API_BASE_URL = "http://localhost:8000/api"; // Update this to your backend URL

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
 * Send transformation request to backend
 * @param imageFile - The image file uploaded by user
 * @param roomType - Type of room (e.g., "bedroom", "living_room")
 * @param styleName - Style name (e.g., "modern", "minimalist")
 * @param projectId - Optional project ID
 * @returns Promise with transformation response containing output image URL
 */
export async function requestTransformation(
  imageFile: File,
  roomType: string,
  styleName: string,
  prompt?: string,
  projectId?: string,
): Promise<TransformationResponse> {
  const formData = new FormData();
  formData.append("image_file", imageFile);
  formData.append("room_type", roomType.toLowerCase());
  formData.append("style_name", styleName.toLowerCase());
  if (prompt && prompt.trim()) {
    formData.append("prompt", prompt.trim());
  }
  
  if (projectId) {
    formData.append("project_id", projectId);
  }

  const response = await fetch(`${API_BASE_URL}/transformations/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Transformation failed");
  }

  return response.json();
}
