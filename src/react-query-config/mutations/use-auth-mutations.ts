import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { queryKeys } from "../query-keys";

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.me, user);
      const nextPath =
        typeof window === "undefined"
          ? null
          : new URLSearchParams(window.location.search).get("next");
      router.replace(nextPath || "/");
    },
  });
};

export const useRegister = () =>
  useMutation({
    mutationFn: (payload: {
      fullname: string;
      email: string;
      contact?: string;
      password: string;
    }) => authService.register(payload),
  });

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.clear();
      router.replace("/login");
    },
  });
};
