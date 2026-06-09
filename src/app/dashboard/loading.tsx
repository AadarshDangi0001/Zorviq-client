import Loader from "@/components/Loader";

export default function DashboardLoading() {
  return (
    <main style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608' }}>
      <Loader />
    </main>
  );
}
