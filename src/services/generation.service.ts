import { API_BASE_URL, apiClient } from "@/lib/http/axios";

export const generationService = {
  enqueue(projectId: string, prompt: string, opts?: { isSectionEdit?: boolean; sectionId?: string | null; sectionHtml?: string | null }) {
    return apiClient.post<{
      jobId: string;
      status: "queued" | "done";
      cached: boolean;
      code?: string;
      queuePosition?: number;
      estimatedWaitSeconds?: number;
    }>("/api/generate", { projectId, prompt, ...opts });
  },
  status(jobId: string) {
    return apiClient.get<{ status: string; output?: string | null }>(
      `/api/generate/status/${jobId}`,
    );
  },
  streamUrl(jobId: string) {
    return `${API_BASE_URL}/api/generate/stream/${jobId}`;
  },
};
