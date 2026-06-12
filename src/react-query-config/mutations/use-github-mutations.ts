import { useMutation } from "@tanstack/react-query";
import { githubService } from "@/services/github.service";

export const useDeployProject = () => {
  return useMutation({
    mutationFn: ({ projectId, isPrivate }: { projectId: string; isPrivate?: boolean }) =>
      githubService.deploy(projectId, isPrivate),
  });
};
