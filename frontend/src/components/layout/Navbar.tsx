import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const baseLinkClass = 'rounded-md px-3 py-2 text-sm font-medium transition-colors';

const getLinkClass = ({ isActive }: { isActive: boolean }): string => {
  if (isActive) {
    return `${baseLinkClass} bg-slate-900 text-white`;
  }

  return `${baseLinkClass} text-slate-700 hover:bg-slate-200`;
};

export const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <NavLink to={isAuthenticated ? '/new-plan' : '/login'} className="text-lg font-semibold text-slate-900">
          AI Training Planner
        </NavLink>

        <nav className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <NavLink to="/new-plan" className={getLinkClass}>
                Nowy plan
              </NavLink>
              <NavLink to="/my-plans" className={getLinkClass}>
                Moje plany
              </NavLink>
              <NavLink to="/progress" className={getLinkClass}>
                Śledzenie progresu
              </NavLink>
              <span className="hidden text-sm text-slate-500 md:inline">{user?.email}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Wyloguj
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={getLinkClass}>
                Logowanie
              </NavLink>
              <NavLink to="/register" className={getLinkClass}>
                Rejestracja
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
