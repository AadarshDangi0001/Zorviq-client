import { ZorviqLoadingBar } from "@/shared/components/zorviq-loading-bar";

export default function ChatLoading() {
  return (
    <main>
      <ZorviqLoadingBar
        variant="page"
        label="Loading chat"
        detail="Opening your AI website editor"
      />
    </main>
  );
}
