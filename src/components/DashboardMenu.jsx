import { LogOut, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BrandMark from "./BrandMark";

export default function DashboardMenu({ userName = "Usuario MIMEDICAPP", onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }

    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-10 border-b border-plum-200 bg-plum-600 text-white shadow-sm">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:flex lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div className="relative flex items-center justify-start">
          <BrandMark compact light />
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Cerrar sesion"
            className="absolute right-0 inline-flex h-12 w-12 items-center justify-center rounded-full bg-lotus-500 text-white transition hover:bg-lotus-400 lg:hidden"
          >
            <LogOut className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-white/12 px-4 py-3 text-center sm:text-left">
            <UserRound className="h-7 w-7 text-lotus-400" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-plum-100">Bienvenido(a)</p>
              <p className="text-lg font-black">{userName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="hidden min-h-12 items-center justify-center gap-2 rounded-full bg-lotus-500 px-5 text-base font-black text-white transition hover:bg-lotus-400 lg:inline-flex"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            Cerrar sesion
          </button>
        </div>
      </div>
    </header>
  );
}
