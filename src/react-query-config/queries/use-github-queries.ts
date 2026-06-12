import { useQuery } from "@tanstack/react-query";
import { githubService } from "@/services/github.service";
import { queryKeys } from "../query-keys";

export const useGitHubStatus = () =>
  useQuery({
    queryKey: queryKeys.github.status(),
    queryFn: githubService.getStatus,
    staleTime: 60_000,
  });
