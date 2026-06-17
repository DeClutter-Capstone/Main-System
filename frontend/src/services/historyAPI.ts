import { authHeader } from "./auth";

export type HistoryItem = {
  id: string;
  image: string;
  title: string;
  date: string;
  style: string;
  room?: string;
  created_at?: string;
  project_id?: string | null;
};

export async function fetchHistory(params?: {
  style?: string;
  room?: string;
  sort?: "newest" | "oldest";
  limit?: number;
  offset?: number;
}): Promise<HistoryItem[]> {
  const backendBase =
    import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

  // Pass the page origin as the base so a relative backendBase (production,
  // same-origin) resolves correctly; an absolute backendBase ignores the base.
  const url = new URL(`${backendBase}/api/history/`, window.location.origin);

  if (params?.style && params.style !== "All Styles") {
    url.searchParams.set("style", params.style.toLowerCase());
  }

  if (params?.room && params.room !== "All Rooms") {
    url.searchParams.set(
      "room",
      params.room.toLowerCase().replaceAll(" ", "_"),
    );
  }

  if (params?.sort) url.searchParams.set("sort", params.sort);
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.offset) url.searchParams.set("offset", String(params.offset));

  const res = await fetch(url.toString(), { headers: await authHeader() });
  if (!res.ok) {
    throw new Error(`Failed to load history: ${res.status}`);
  }

  const data = (await res.json()) as HistoryItem[];

  return data.map((item) => ({
    ...item,
    image: item.image.startsWith("http") ? item.image : `${backendBase}${item.image}`,
  }));
}

export async function deleteHistoryItem(fileKey: string): Promise<void> {
  const backendBase =
    import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

  const res = await fetch(`${backendBase}/api/history/${fileKey}`, {
    method: "DELETE",
    headers: await authHeader(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to delete transformation");
  }
}


export async function renameHistoryItem(
  oldFileKey: string,
  newFileKey: string,
): Promise<void> {
  const backendBase =
    import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

  const res = await fetch(`${backendBase}/api/history/rename`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeader()),
    },
    body: JSON.stringify({
      old_file_key: oldFileKey,
      new_file_key: newFileKey,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to rename transformation");
  }
}