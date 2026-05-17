import { authHeader } from "./auth";

const BACKEND_BASE =
  import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

export interface ProjectSummary {
  project_id: string;
  project_name: string;
  project_description: string | null;
  project_creation_time: string;
  project_last_updated: string;
  generation_count: number;
  latest_output_image: string | null;
  shared_style: string | null;
}

export interface GenerationDTO {
  transformation_id: string;
  project_id: string | null;
  group_id: string | null;
  room_type: string;
  style_name: string;
  prompt: string | null;
  output_image_path: string | null;
  input_image_path: string | null;
  created_at: string;
}

export interface GroupDTO {
  group_id: string;
  group_name: string;
  created_at: string;
}

export interface ProjectDetail {
  project_id: string;
  project_name: string;
  project_description: string | null;
  project_creation_time: string;
  project_last_updated: string;
  generations: GenerationDTO[];
  groups: GroupDTO[];
}

function absolute(path: string | null | undefined): string | null {
  if (!path) return null;
  return path.startsWith("http") ? path : `${BACKEND_BASE}${path}`;
}

async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const auth = await authHeader();
  const headers = new Headers(init.headers ?? {});
  Object.entries(auth).forEach(([k, v]) => headers.set(k, v));
  return fetch(input, { ...init, headers });
}

async function jsonOrThrow<T>(res: Response, fallbackMsg: string): Promise<T> {
  if (!res.ok) {
    let detail = fallbackMsg;
    try {
      const body = await res.json();
      detail = body.detail ?? fallbackMsg;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

// ─── Projects ─────────────────────────────────────────────────────────────

export async function listProjects(): Promise<ProjectSummary[]> {
  const res = await authedFetch(`${BACKEND_BASE}/api/projects/`);
  const data = await jsonOrThrow<ProjectSummary[]>(res, "Failed to load projects");
  return data.map((p) => ({
    ...p,
    latest_output_image: absolute(p.latest_output_image),
  }));
}

export async function createProject(payload: {
  project_name: string;
  project_description?: string;
}): Promise<ProjectSummary> {
  const res = await authedFetch(`${BACKEND_BASE}/api/projects/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await jsonOrThrow<ProjectSummary>(res, "Failed to create project");
  return { ...data, latest_output_image: absolute(data.latest_output_image) };
}

export async function getProject(projectId: string): Promise<ProjectDetail> {
  const res = await authedFetch(`${BACKEND_BASE}/api/projects/${projectId}`);
  const data = await jsonOrThrow<ProjectDetail>(res, "Failed to load project");
  return {
    ...data,
    generations: data.generations.map((g) => ({
      ...g,
      output_image_path: absolute(g.output_image_path),
      input_image_path: absolute(g.input_image_path),
    })),
  };
}

export async function updateProject(
  projectId: string,
  payload: { project_name?: string; project_description?: string },
): Promise<ProjectSummary> {
  const res = await authedFetch(`${BACKEND_BASE}/api/projects/${projectId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await jsonOrThrow<ProjectSummary>(res, "Failed to update project");
  return { ...data, latest_output_image: absolute(data.latest_output_image) };
}

export async function deleteProject(projectId: string): Promise<void> {
  const res = await authedFetch(`${BACKEND_BASE}/api/projects/${projectId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    let detail = "Failed to delete project";
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }
}

// ─── Groups ────────────────────────────────────────────────────────────────

export async function createGroup(projectId: string, name: string): Promise<GroupDTO> {
  const res = await authedFetch(
    `${BACKEND_BASE}/api/projects/${projectId}/groups`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group_name: name }),
    },
  );
  return jsonOrThrow<GroupDTO>(res, "Failed to create group");
}

export async function renameGroup(
  projectId: string,
  groupId: string,
  name: string,
): Promise<GroupDTO> {
  const res = await authedFetch(
    `${BACKEND_BASE}/api/projects/${projectId}/groups/${groupId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group_name: name }),
    },
  );
  return jsonOrThrow<GroupDTO>(res, "Failed to rename group");
}

export async function deleteGroup(projectId: string, groupId: string): Promise<void> {
  const res = await authedFetch(
    `${BACKEND_BASE}/api/projects/${projectId}/groups/${groupId}`,
    { method: "DELETE" },
  );
  if (!res.ok) {
    let detail = "Failed to delete group";
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }
}

// ─── Generation assignment ────────────────────────────────────────────────

export async function assignGeneration(
  generationId: string,
  payload: { project_id?: string | null; group_id?: string | null },
): Promise<GenerationDTO> {
  const res = await authedFetch(
    `${BACKEND_BASE}/api/generations/${generationId}/assign`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  const data = await jsonOrThrow<GenerationDTO>(res, "Failed to assign generation");
  return {
    ...data,
    output_image_path: absolute(data.output_image_path),
    input_image_path: absolute(data.input_image_path),
  };
}

// ─── Generation delete ────────────────────────────────────────────────────

export async function deleteGeneration(generationId: string): Promise<void> {
  const res = await authedFetch(
    `${BACKEND_BASE}/api/generations/${generationId}`,
    { method: "DELETE" },
  );
  if (!res.ok) {
    let detail = "Failed to delete generation";
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }
}
