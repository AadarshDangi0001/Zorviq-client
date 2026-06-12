import { apiClient } from "@/lib/http/axios";

export type GitHubStatus = {
  githubConnected: boolean;
  githubUsername?: string;
  githubAvatar?: string;
};

export type DeployResponse = {
  repositoryUrl: string;
  repositoryName: string;
};

export const githubService = {
  getStatus() {
    return apiClient.get<GitHubStatus>("/api/github/status");
  },
  deploy(projectId: string, isPrivate: boolean = false) {
    return apiClient.post<DeployResponse>(`/api/github/repos/${projectId}`, {
      private: isPrivate,
    });
  },
};
