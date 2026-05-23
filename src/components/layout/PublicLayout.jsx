import { Outlet } from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-neutral-0">
      <main>
        <Outlet />
      </main>
    </div>
  );
}
