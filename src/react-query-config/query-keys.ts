export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  projects: {
    list: () => ["projects", "list"] as const,
    detail: (id: string) => ["projects", "detail", id] as const,
  },
  github: {
    status: () => ["github", "status"] as const,
  },
};
