import GlobalSearch from "../../popups/GlobalSearchPopup";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <GlobalSearch />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-auto scroll-bar p-5 bg-[#f1f1f1]">
          <div className="w-full max-w-full overflow-x-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}