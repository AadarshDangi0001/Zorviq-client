import { ZorviqLoadingBar } from "@/shared/components/zorviq-loading-bar";

export default function DashboardLoading() {
  return (
    <main>
      <ZorviqLoadingBar
        variant="page"
        label="Loading dashboard"
        detail="Fetching your projects and workspace"
      />
    </main>
  );
}
