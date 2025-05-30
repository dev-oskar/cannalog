import { Outlet, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { ThemeToggle } from "../components/ThemeToggle";
import { LanguageSelector } from "../components/LanguageSelector";

export function AppLayout() {
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: t('navigation.dashboard'), icon: '📊' },
    { path: '/sessions', label: t('navigation.sessions'), icon: '📝' },
    { path: '/strains', label: t('navigation.strains'), icon: '🌿' },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background shadow-sm border-b border-primary/10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <Link to="/dashboard" className="text-xl font-bold text-primary hover:text-primary/80 transition-colors">
              {t("app.name")}
            </Link>

            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActivePath(item.path)
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-secondary hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button & Actions */}
            <div className="flex items-center gap-2">
              {/* Mobile Navigation */}
              <div className="md:hidden relative">
                <button className="p-2 text-secondary hover:text-primary transition-colors">
                  ☰
                </button>
                {/* TODO: Add mobile dropdown menu */}
              </div>

              <LanguageSelector />
              <ThemeToggle />
              <button
                onClick={signOut}
                className="bg-primary text-background px-4 py-2 rounded-md hover:bg-primary/80 hover:cursor-pointer transition-colors"
              >
                {t("auth.signOut")}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
